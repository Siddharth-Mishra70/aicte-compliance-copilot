import {
  InstitutionProfile,
  FacultyRecord,
  InfrastructureRecord,
  ComplianceIssue,
  ValidationResult,
  ValidationMetrics,
  CadreBreakdown,
} from "@/types/compliance";

// Indian PAN regex: 5 uppercase letters, 4 digits, 1 uppercase letter
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function validateAicteCompliance(
  institution: InstitutionProfile,
  faculty: FacultyRecord[],
  infrastructure: InfrastructureRecord[]
): ValidationResult {
  const issues: ComplianceIssue[] = [];
  const flaggedFacultyIds = new Set<string>();

  // =========================================================================
  // LAYER A: DATA QUALITY CHECKS
  // =========================================================================

  // 1. Missing PAN & AICTE Faculty ID Checks
  faculty.forEach((fac) => {
    const trimmedPan = (fac.panNumber || "").trim().toUpperCase();
    const trimmedAicteId = (fac.aicteFacultyId || "").trim();

    // Missing PAN Number
    if (!trimmedPan) {
      flaggedFacultyIds.add(fac.id);
      issues.push({
        id: `dq-pan-missing-${fac.id}`,
        category: "Data Quality",
        severity: "Critical",
        entityType: "Faculty",
        recordReference: `Faculty: ${fac.fullName || "Unnamed"} (${fac.department || "No Dept"})`,
        description: `Missing PAN Number for faculty member '${fac.fullName}'. A valid PAN is mandatory for identity verification.`,
        aicteNormReference: "AICTE APH Chapter VII: Mandatory Identity Verification Norms",
        suggestedFix: "Obtain and enter the permanent PAN number for this faculty record.",
        isResolved: false,
      });
    } else if (!PAN_REGEX.test(trimmedPan)) {
      // Invalid PAN format
      flaggedFacultyIds.add(fac.id);
      issues.push({
        id: `dq-pan-format-${fac.id}`,
        category: "Data Quality",
        severity: "Warning",
        entityType: "Faculty",
        recordReference: `Faculty: ${fac.fullName} | PAN: '${trimmedPan}'`,
        description: `Invalid PAN format '${trimmedPan}'. Indian PAN must strictly adhere to 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F).`,
        aicteNormReference: "Income Tax Department & AICTE Portal Data Formatting Guidelines",
        suggestedFix: "Review and correct the PAN string to match the required 10-character alphanumeric pattern.",
        isResolved: false,
      });
    }

    // Missing AICTE Faculty ID
    if (!trimmedAicteId) {
      flaggedFacultyIds.add(fac.id);
      issues.push({
        id: `dq-aicte-id-missing-${fac.id}`,
        category: "Data Quality",
        severity: "Critical",
        entityType: "Faculty",
        recordReference: `Faculty: ${fac.fullName} (${fac.department})`,
        description: `Missing AICTE Permanent Faculty ID for '${fac.fullName}'. Unregistered faculty cannot be counted in official Extension of Approval calculations.`,
        aicteNormReference: "AICTE APH Clause 2.14: Mandatory Faculty Registration on AICTE Web Portal",
        suggestedFix: "Instruct the faculty member to register on the AICTE Portal and record their allotted Permanent ID.",
        isResolved: false,
      });
    }
  });

  // 2. Duplicate PAN Numbers
  const panMap = new Map<string, FacultyRecord[]>();
  faculty.forEach((fac) => {
    const trimmedPan = (fac.panNumber || "").trim().toUpperCase();
    if (trimmedPan && PAN_REGEX.test(trimmedPan)) {
      if (!panMap.has(trimmedPan)) {
        panMap.set(trimmedPan, []);
      }
      panMap.get(trimmedPan)!.push(fac);
    }
  });

  panMap.forEach((duplicates, pan) => {
    if (duplicates.length > 1) {
      duplicates.forEach((d) => flaggedFacultyIds.add(d.id));
      const facultyNames = duplicates.map((d) => `'${d.fullName}' (${d.department})`).join(", ");
      issues.push({
        id: `dq-dup-pan-${pan}`,
        category: "Data Quality",
        severity: "Critical",
        entityType: "Faculty",
        recordReference: `Duplicate PAN: ${pan}`,
        description: `Duplicate PAN detected across multiple faculty entries: ${facultyNames}. High risk of ghost faculty penalty.`,
        aicteNormReference: "AICTE APH Chapter VII: Duplicate/Fake Faculty Penalty",
        suggestedFix: "Perform biometrics/original card verification immediately and remove or correct the spurious entry.",
        isResolved: false,
      });
    }
  });

  // 3. Duplicate AICTE Faculty IDs
  const aicteIdMap = new Map<string, FacultyRecord[]>();
  faculty.forEach((fac) => {
    const trimmedId = (fac.aicteFacultyId || "").trim();
    if (trimmedId) {
      if (!aicteIdMap.has(trimmedId)) {
        aicteIdMap.set(trimmedId, []);
      }
      aicteIdMap.get(trimmedId)!.push(fac);
    }
  });

  aicteIdMap.forEach((duplicates, aicteId) => {
    if (duplicates.length > 1) {
      duplicates.forEach((d) => flaggedFacultyIds.add(d.id));
      const facultyNames = duplicates.map((d) => `'${d.fullName}' (${d.department})`).join(", ");
      issues.push({
        id: `dq-dup-aicte-${aicteId}`,
        category: "Data Quality",
        severity: "Critical",
        entityType: "Faculty",
        recordReference: `AICTE ID: ${aicteId}`,
        description: `Duplicate AICTE Faculty ID '${aicteId}' assigned to multiple individuals: ${facultyNames}.`,
        aicteNormReference: "AICTE APH Chapter VII: Duplicate/Fake Faculty Penalty",
        suggestedFix: "Re-verify individual AICTE portal profiles to assign the correct unique identifier to each person.",
        isResolved: false,
      });
    }
  });

  // =========================================================================
  // LAYER B: AICTE APH NORM CHECKS
  // =========================================================================

  const sanctionedIntake = Math.max(0, institution.sanctionedIntake || 0);
  const regularFaculty = faculty.filter((f) => f.isRegular);
  const totalRegularCount = regularFaculty.length;
  // Norm: 1:20 faculty-to-student ratio
  const requiredFaculty = Math.ceil(sanctionedIntake / 20);

  // 1. Faculty-to-Student Ratio (FSR) Check
  if (totalRegularCount < requiredFaculty && sanctionedIntake > 0) {
    const missingCount = requiredFaculty - totalRegularCount;
    const currentRatioStr = totalRegularCount > 0 ? (sanctionedIntake / totalRegularCount).toFixed(1) : "N/A";

    issues.push({
      id: "norm-fsr-deficit",
      category: "AICTE Norm Deficit",
      severity: "Critical",
      entityType: "Faculty",
      recordReference: `Sanctioned Intake: ${sanctionedIntake} | Regular Faculty: ${totalRegularCount}`,
      description: `Faculty-Student Ratio is 1:${currentRatioStr}, failing the mandated 1:20 norm. Exact deficit of ${missingCount} regular faculty member(s).`,
      aicteNormReference: "AICTE APH Chapter VII, Table 7.1: Norms for Faculty Requirements (1:20 Ratio)",
      suggestedFix: `Recruit at least ${missingCount} qualified full-time regular faculty to meet the 1:20 ratio before EoA scrutiny.`,
      isResolved: false,
    });
  }

  // 2. Cadre Ratio Check (1 : 2 : 6 for Professor : Assoc. Prof : Asst. Prof)
  // Base cadre on requiredFaculty
  const reqProfessors = Math.max(1, Math.floor(requiredFaculty / 9));
  const reqAssociates = Math.max(1, Math.floor((requiredFaculty * 2) / 9));
  const reqAssistants = Math.max(1, Math.ceil((requiredFaculty * 6) / 9));

  const actualProfessors = regularFaculty.filter((f) => f.designation === "Professor").length;
  const actualAssociates = regularFaculty.filter((f) => f.designation === "Associate Professor").length;
  const actualAssistants = regularFaculty.filter((f) => f.designation === "Assistant Professor").length;

  const cadreBreakdown: CadreBreakdown = {
    professors: {
      actual: actualProfessors,
      required: reqProfessors,
      deficit: Math.max(0, reqProfessors - actualProfessors),
    },
    associates: {
      actual: actualAssociates,
      required: reqAssociates,
      deficit: Math.max(0, reqAssociates - actualAssociates),
    },
    assistants: {
      actual: actualAssistants,
      required: reqAssistants,
      deficit: Math.max(0, reqAssistants - actualAssistants),
    },
  };

  if (cadreBreakdown.professors.deficit > 0) {
    issues.push({
      id: "norm-cadre-prof",
      category: "AICTE Norm Deficit",
      severity: "Warning",
      entityType: "Faculty",
      recordReference: `Professors: ${actualProfessors} / ${reqProfessors} required`,
      description: `Cadre ratio shortfall: ${actualProfessors} Professor(s) vs ${reqProfessors} required under the 1:2:6 cadre structure (deficit of ${cadreBreakdown.professors.deficit}).`,
      aicteNormReference: "AICTE APH Clause 7.2: Cadre Ratio (1:2:6 Distribution)",
      suggestedFix: `Promote or hire ${cadreBreakdown.professors.deficit} eligible candidate(s) to Professor cadre.`,
      isResolved: false,
    });
  }

  if (cadreBreakdown.associates.deficit > 0) {
    issues.push({
      id: "norm-cadre-assoc",
      category: "AICTE Norm Deficit",
      severity: "Warning",
      entityType: "Faculty",
      recordReference: `Associate Professors: ${actualAssociates} / ${reqAssociates} required`,
      description: `Cadre ratio shortfall: ${actualAssociates} Associate Professor(s) vs ${reqAssociates} required under the 1:2:6 cadre structure (deficit of ${cadreBreakdown.associates.deficit}).`,
      aicteNormReference: "AICTE APH Clause 7.2: Cadre Ratio (1:2:6 Distribution)",
      suggestedFix: `Recruit or advance ${cadreBreakdown.associates.deficit} eligible PhD faculty to Associate Professor.`,
      isResolved: false,
    });
  }

  // 3. PhD Qualification Norm for Senior Cadres
  faculty.forEach((fac) => {
    if (fac.designation === "Professor" || fac.designation === "Associate Professor") {
      if (fac.highestDegree !== "PhD") {
        flaggedFacultyIds.add(fac.id);
        issues.push({
          id: `norm-phd-${fac.id}`,
          category: "AICTE Norm Deficit",
          severity: "Critical",
          entityType: "Faculty",
          recordReference: `${fac.designation}: ${fac.fullName} (${fac.department})`,
          description: `Mandatory PhD Norm Violation: ${fac.designation} '${fac.fullName}' does not hold a PhD degree (current: ${fac.highestDegree}).`,
          aicteNormReference: "AICTE Regulations on Minimum Qualifications for Appointment of Teachers (Gazette Notification 2019)",
          suggestedFix: "Re-designate faculty as Assistant Professor until PhD is awarded, or provide AICTE-approved equivalent doctoral qualification.",
          isResolved: false,
        });
      }
    }
  });

  // 4. Infrastructure Norm: Classrooms & Laboratories >= 66 sqm
  infrastructure.forEach((room) => {
    if (room.roomType === "Classroom" || room.roomType === "Laboratory") {
      if (room.areaSqm < 66) {
        issues.push({
          id: `norm-infra-area-${room.id}`,
          category: "AICTE Norm Deficit",
          severity: "Warning",
          entityType: "Infrastructure",
          recordReference: `${room.roomType}: Room ${room.roomNumber} (${room.areaSqm} sqm)`,
          description: `Undersized ${room.roomType}: Room '${room.roomNumber}' carpet area is ${room.areaSqm} sqm, which is below the AICTE prescribed minimum of 66 sqm.`,
          aicteNormReference: "AICTE APH Norm: Minimum 66 sqm required (Appendix 4: Infrastructure Carpet Area)",
          suggestedFix: "Reconfigure or expand room dimensions to achieve at least 66 sqm of carpet area.",
          isResolved: false,
        });
      }
    }
  });

  // =========================================================================
  // METRICS & SCORE COMPUTATION
  // =========================================================================

  const currentFSR = totalRegularCount > 0
    ? Number((sanctionedIntake / totalRegularCount).toFixed(1))
    : sanctionedIntake > 0 ? 999 : 0;

  // Clean data percentage: percentage of faculty rows with zero DQ flags
  const totalFacultyCount = faculty.length;
  const cleanFacultyCount = Math.max(0, totalFacultyCount - flaggedFacultyIds.size);
  const cleanDataPercentage = totalFacultyCount > 0
    ? Math.round((cleanFacultyCount / totalFacultyCount) * 100)
    : 100;

  // EoA Readiness Score (0 - 100%)
  const criticalCount = issues.filter((i) => i.severity === "Critical" && !i.isResolved).length;
  const warningCount = issues.filter((i) => i.severity === "Warning" && !i.isResolved).length;
  const infoCount = issues.filter((i) => i.severity === "Info" && !i.isResolved).length;

  let score = 100;
  score -= criticalCount * 14;
  score -= warningCount * 4;
  score -= infoCount * 1;
  // Penalty for FSR above 20
  if (currentFSR > 20) {
    const fsrExcess = currentFSR - 20;
    score -= Math.min(25, Math.round(fsrExcess * 5));
  }
  const eoaReadinessScore = Math.max(0, Math.min(100, Math.round(score)));

  const metrics: ValidationMetrics = {
    eoaReadinessScore,
    currentFSR,
    cleanDataPercentage,
    totalRegularFaculty: totalRegularCount,
    requiredFaculty,
    cadreBreakdown,
  };

  return { issues, metrics };
}

