"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  InstitutionProfile,
  FacultyRecord,
  InfrastructureRecord,
  ComplianceIssue,
  ComplianceStats,
  ComplianceContextType,
} from "@/types/compliance";
import { validateAicteCompliance } from "@/lib/validators/aicteRules";

export const DEMO_INSTITUTION: InstitutionProfile = {
  id: "inst-demo-01",
  name: "United Institute of Technology - Demo",
  aictePermanentId: "1-43289012",
  academicYear: "2024-25",
  sanctionedIntake: 600,
  builtUpAreaSqm: 18500,
};

export const DEMO_FACULTY: FacultyRecord[] = [
  // CSE Department (8 faculty)
  {
    id: "fac-01",
    fullName: "Dr. Rajesh Sharma",
    panNumber: "ABCPS1234D", // INTENTIONAL DUPLICATE with fac-04
    aicteFacultyId: "1-1029384751",
    designation: "Professor",
    highestDegree: "PhD",
    department: "Computer Science & Engineering",
    joiningDate: "2015-07-15",
    isRegular: true,
  },
  {
    id: "fac-02",
    fullName: "Prof. Suresh Verma",
    panNumber: "BKLPV4521M",
    aicteFacultyId: "1-1029384752",
    designation: "Associate Professor",
    highestDegree: "Masters", // INTENTIONAL: Assoc Prof without PhD
    department: "Computer Science & Engineering",
    joiningDate: "2018-08-01",
    isRegular: true,
  },
  {
    id: "fac-03",
    fullName: "Dr. Kavita Nair",
    panNumber: "CKLPN8901R",
    aicteFacultyId: "", // INTENTIONAL: Missing AICTE ID
    designation: "Associate Professor",
    highestDegree: "PhD",
    department: "Computer Science & Engineering",
    joiningDate: "2019-01-10",
    isRegular: true,
  },
  {
    id: "fac-04",
    fullName: "Prof. Anita Sharma",
    panNumber: "ABCPS1234D", // INTENTIONAL DUPLICATE with fac-01
    aicteFacultyId: "1-1029384754",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Computer Science & Engineering",
    joiningDate: "2021-03-15",
    isRegular: true,
  },
  {
    id: "fac-05",
    fullName: "Prof. Amit Sengupta",
    panNumber: "DFGTY5678Q",
    aicteFacultyId: "1-1029384755",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Computer Science & Engineering",
    joiningDate: "2022-07-20",
    isRegular: true,
  },
  {
    id: "fac-06",
    fullName: "Prof. Sneha Deshmukh",
    panNumber: "GHKLP2345T",
    aicteFacultyId: "", // INTENTIONAL: Missing AICTE ID
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Computer Science & Engineering",
    joiningDate: "2022-09-01",
    isRegular: true,
  },
  {
    id: "fac-07",
    fullName: "Prof. Rohan Banerjee",
    panNumber: "HJKTR7890W",
    aicteFacultyId: "1-1029384757",
    designation: "Assistant Professor",
    highestDegree: "Bachelors",
    department: "Computer Science & Engineering",
    joiningDate: "2023-01-12",
    isRegular: false, // Adjunct
  },
  {
    id: "fac-08",
    fullName: "Prof. Priya Srinivasan",
    panNumber: "QWERT1234Y",
    aicteFacultyId: "1-1029384758",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Computer Science & Engineering",
    joiningDate: "2023-08-16",
    isRegular: true,
  },

  // ECE Department (7 faculty)
  {
    id: "fac-09",
    fullName: "Dr. Meenakshi Sundaram",
    panNumber: "XYZPK9876E", // INTENTIONAL DUPLICATE with fac-13
    aicteFacultyId: "1-1029384759",
    designation: "Associate Professor",
    highestDegree: "PhD",
    department: "Electronics & Communication",
    joiningDate: "2016-11-01",
    isRegular: true,
  },
  {
    id: "fac-10",
    fullName: "Prof. Tarun Kulkarni",
    panNumber: "PLKOM6543N",
    aicteFacultyId: "1-1029384760",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Electronics & Communication",
    joiningDate: "2019-06-15",
    isRegular: true,
  },
  {
    id: "fac-11",
    fullName: "Prof. Divya Radhakrishnan",
    panNumber: "ZXCVB9012U",
    aicteFacultyId: "", // INTENTIONAL: Missing AICTE ID
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Electronics & Communication",
    joiningDate: "2020-02-10",
    isRegular: true,
  },
  {
    id: "fac-12",
    fullName: "Prof. Sandeep Joshi",
    panNumber: "MNBVC3456I",
    aicteFacultyId: "1-1029384762",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Electronics & Communication",
    joiningDate: "2021-08-01",
    isRegular: true,
  },
  {
    id: "fac-13",
    fullName: "Prof. Vikram Patil",
    panNumber: "XYZPK9876E", // INTENTIONAL DUPLICATE with fac-09
    aicteFacultyId: "1-1029384763",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Electronics & Communication",
    joiningDate: "2022-01-20",
    isRegular: true,
  },
  {
    id: "fac-14",
    fullName: "Prof. Deepa Reddy",
    panNumber: "ASDFG4567H",
    aicteFacultyId: "1-1029384764",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Electronics & Communication",
    joiningDate: "2022-11-15",
    isRegular: true,
  },
  {
    id: "fac-15",
    fullName: "Prof. Manish Tiwari",
    panNumber: "POIUY9876O",
    aicteFacultyId: "1-1029384765",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Electronics & Communication",
    joiningDate: "2023-07-01",
    isRegular: false, // Adjunct
  },

  // Mechanical Engineering (6 faculty)
  {
    id: "fac-16",
    fullName: "Prof. Anant Rao",
    panNumber: "LKJHG3456P",
    aicteFacultyId: "1-1029384766",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Mechanical Engineering",
    joiningDate: "2017-09-12",
    isRegular: true,
  },
  {
    id: "fac-17",
    fullName: "Prof. Harish Bhat",
    panNumber: "TREWQ7654A",
    aicteFacultyId: "1-1029384767",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Mechanical Engineering",
    joiningDate: "2019-03-01",
    isRegular: true,
  },
  {
    id: "fac-18",
    fullName: "Prof. Pradeep Chauhan",
    panNumber: "YUIOP8765S",
    aicteFacultyId: "", // INTENTIONAL: Missing AICTE ID
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Mechanical Engineering",
    joiningDate: "2020-10-15",
    isRegular: true,
  },
  {
    id: "fac-19",
    fullName: "Prof. Sunil Kumar",
    panNumber: "NBVCS1234D",
    aicteFacultyId: "1-1029384769",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Mechanical Engineering",
    joiningDate: "2021-12-01",
    isRegular: true,
  },
  {
    id: "fac-20",
    fullName: "Prof. Chetan Pandey",
    panNumber: "JHGFD5678F",
    aicteFacultyId: "1-1029384770",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Mechanical Engineering",
    joiningDate: "2022-04-18",
    isRegular: true,
  },
  {
    id: "fac-21",
    fullName: "Prof. Vinay Agarwal",
    panNumber: "XCVBN8765G",
    aicteFacultyId: "1-1029384771",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Mechanical Engineering",
    joiningDate: "2023-09-01",
    isRegular: true,
  },

  // Civil Engineering (4 faculty)
  {
    id: "fac-22",
    fullName: "Prof. Neeraj Mishra",
    panNumber: "GHJKL4321H",
    aicteFacultyId: "1-1029384772",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Civil Engineering",
    joiningDate: "2018-02-14",
    isRegular: true,
  },
  {
    id: "fac-23",
    fullName: "Prof. Shalini Gupta",
    panNumber: "QAZWS6789J",
    aicteFacultyId: "1-1029384773",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Civil Engineering",
    joiningDate: "2020-07-22",
    isRegular: true,
  },
  {
    id: "fac-24",
    fullName: "Prof. Bhupendra Singh",
    panNumber: "EDCRF1234K",
    aicteFacultyId: "1-1029384774",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Civil Engineering",
    joiningDate: "2021-10-10",
    isRegular: true,
  },
  {
    id: "fac-25",
    fullName: "Prof. Pallavi Shinde",
    panNumber: "TGBYH5678L",
    aicteFacultyId: "1-1029384775",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Civil Engineering",
    joiningDate: "2023-02-01",
    isRegular: true,
  },

  // Applied Sciences & Humanities (3 faculty)
  {
    id: "fac-26",
    fullName: "Dr. Archana Saxena",
    panNumber: "UJMIK9012Z",
    aicteFacultyId: "1-1029384776",
    designation: "Assistant Professor",
    highestDegree: "PhD",
    department: "Applied Sciences & Humanities",
    joiningDate: "2017-08-10",
    isRegular: true,
  },
  {
    id: "fac-27",
    fullName: "Prof. Rakesh Jha",
    panNumber: "OLKJH3456X",
    aicteFacultyId: "1-1029384777",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Applied Sciences & Humanities",
    joiningDate: "2019-11-20",
    isRegular: true,
  },
  {
    id: "fac-28",
    fullName: "Prof. Swati Ganguly",
    panNumber: "MNBVC7890C",
    aicteFacultyId: "1-1029384778",
    designation: "Assistant Professor",
    highestDegree: "Masters",
    department: "Applied Sciences & Humanities",
    joiningDate: "2022-03-05",
    isRegular: true,
  },
];

export const DEMO_INFRASTRUCTURE: InfrastructureRecord[] = [
  // Classrooms
  {
    id: "infra-01",
    roomNumber: "CR-101",
    roomType: "Classroom",
    areaSqm: 72,
    seatingCapacity: 66,
    hasSmartBoard: true,
  },
  {
    id: "infra-02",
    roomNumber: "CR-102",
    roomType: "Classroom",
    areaSqm: 68,
    seatingCapacity: 60,
    hasSmartBoard: true,
  },
  {
    id: "infra-03",
    roomNumber: "CR-201",
    roomType: "Classroom",
    areaSqm: 70,
    seatingCapacity: 60,
    hasSmartBoard: false,
  },
  {
    id: "infra-04",
    roomNumber: "CR-202",
    roomType: "Classroom",
    areaSqm: 66,
    seatingCapacity: 60,
    hasSmartBoard: false,
  },

  // Laboratories (4 total, including 2 INTENTIONALLY UNDERSIZED: <66 sqm norm)
  {
    id: "infra-05",
    roomNumber: "LAB-101",
    roomType: "Laboratory",
    areaSqm: 75,
    seatingCapacity: 35,
    hasSmartBoard: false,
  },
  {
    id: "infra-06",
    roomNumber: "LAB-102",
    roomType: "Laboratory",
    areaSqm: 48, // INTENTIONAL DEFICIT: Norm >= 66 sqm
    seatingCapacity: 24,
    hasSmartBoard: false,
  },
  {
    id: "infra-07",
    roomNumber: "LAB-201",
    roomType: "Laboratory",
    areaSqm: 82,
    seatingCapacity: 40,
    hasSmartBoard: true,
  },
  {
    id: "infra-08",
    roomNumber: "LAB-204",
    roomType: "Laboratory",
    areaSqm: 52, // INTENTIONAL DEFICIT: Norm >= 66 sqm
    seatingCapacity: 25,
    hasSmartBoard: false,
  },

  // Tutorial Rooms
  {
    id: "infra-09",
    roomNumber: "TR-301",
    roomType: "Tutorial",
    areaSqm: 36,
    seatingCapacity: 35,
    hasSmartBoard: false,
  },
  {
    id: "infra-10",
    roomNumber: "TR-302",
    roomType: "Tutorial",
    areaSqm: 35,
    seatingCapacity: 35,
    hasSmartBoard: false,
  },

  // Seminar Halls
  {
    id: "infra-11",
    roomNumber: "SH-01",
    roomType: "Seminar Hall",
    areaSqm: 180,
    seatingCapacity: 150,
    hasSmartBoard: true,
  },
  {
    id: "infra-12",
    roomNumber: "SH-02",
    roomType: "Seminar Hall",
    areaSqm: 140,
    seatingCapacity: 120,
    hasSmartBoard: false,
  },
];

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

export function ComplianceProvider({ children }: { children: React.ReactNode }) {
  const [institution, setInstitution] = useState<InstitutionProfile>(DEMO_INSTITUTION);
  const [faculty, setFaculty] = useState<FacultyRecord[]>(DEMO_FACULTY);
  const [infrastructure, setInfrastructure] = useState<InfrastructureRecord[]>(DEMO_INFRASTRUCTURE);
  const [resolvedIssueIds, setResolvedIssueIds] = useState<Set<string>>(new Set());
  const [lastAuditTimestamp, setLastAuditTimestamp] = useState<string>("Live");

  useEffect(() => {
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  // Automatically execute the deterministic AICTE validation rule engine
  const { rawIssues, metrics } = useMemo(() => {
    const res = validateAicteCompliance(institution, faculty, infrastructure);
    return { rawIssues: res.issues, metrics: res.metrics };
  }, [institution, faculty, infrastructure]);

  // Synchronize resolved statuses with generated issues
  const issues = useMemo(() => {
    return rawIssues.map((iss) => ({
      ...iss,
      isResolved: resolvedIssueIds.has(iss.id),
    }));
  }, [rawIssues, resolvedIssueIds]);

  // Compute live reactive stats
  const stats: ComplianceStats = useMemo(() => {
    const activeIssues = issues.filter((iss) => !iss.isResolved);
    const criticalCount = activeIssues.filter((i) => i.severity === "Critical").length;
    const warningCount = activeIssues.filter((i) => i.severity === "Warning").length;
    const infoCount = activeIssues.filter((i) => i.severity === "Info").length;

    let eoaReadiness: "Ready" | "Deficient" | "Critical Issues Pending" = "Ready";
    if (criticalCount > 0) {
      eoaReadiness = "Critical Issues Pending";
    } else if (warningCount > 2 || metrics.currentFSR > 20) {
      eoaReadiness = "Deficient";
    }

    let liveScore = 100;
    liveScore -= criticalCount * 14;
    liveScore -= warningCount * 4;
    liveScore -= infoCount * 1;
    if (metrics.currentFSR > 20) {
      const fsrExcess = metrics.currentFSR - 20;
      liveScore -= Math.min(25, Math.round(fsrExcess * 5));
    }
    const computedEoaScore = Math.max(0, Math.min(100, Math.round(liveScore)));

    return {
      overallScore: computedEoaScore,
      eoaReadinessScore: computedEoaScore,
      cleanDataPercentage: metrics.cleanDataPercentage,
      criticalIssuesCount: criticalCount,
      warningIssuesCount: warningCount,
      infoIssuesCount: infoCount,
      facultyStudentRatio: metrics.currentFSR,
      totalRegularFaculty: metrics.totalRegularFaculty,
      requiredFaculty: metrics.requiredFaculty,
      cadreRatio: {
        professors: metrics.cadreBreakdown.professors.actual,
        associates: metrics.cadreBreakdown.associates.actual,
        assistants: metrics.cadreBreakdown.assistants.actual,
        requiredProfessors: metrics.cadreBreakdown.professors.required,
        requiredAssociates: metrics.cadreBreakdown.associates.required,
        requiredAssistants: metrics.cadreBreakdown.assistants.required,
      },
      eoaReadiness,
    };
  }, [issues, metrics]);

  const updateInstitution = useCallback((profile: Partial<InstitutionProfile>) => {
    setInstitution((prev) => ({ ...prev, ...profile }));
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  const setFacultyRecords = useCallback((records: FacultyRecord[]) => {
    setFaculty(records);
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  const addFaculty = useCallback((record: Omit<FacultyRecord, "id">) => {
    const newRecord: FacultyRecord = {
      ...record,
      id: `fac-${Date.now()}`,
    };
    setFaculty((prev) => [newRecord, ...prev]);
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  const updateFaculty = useCallback((id: string, record: Partial<FacultyRecord>) => {
    setFaculty((prev) => prev.map((f) => (f.id === id ? { ...f, ...record } : f)));
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  const deleteFaculty = useCallback((id: string) => {
    setFaculty((prev) => prev.filter((f) => f.id !== id));
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  const setInfrastructureRecords = useCallback((records: InfrastructureRecord[]) => {
    setInfrastructure(records);
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  const addInfrastructure = useCallback((record: Omit<InfrastructureRecord, "id">) => {
    const newRecord: InfrastructureRecord = {
      ...record,
      id: `infra-${Date.now()}`,
    };
    setInfrastructure((prev) => [newRecord, ...prev]);
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  const updateInfrastructure = useCallback((id: string, record: Partial<InfrastructureRecord>) => {
    setInfrastructure((prev) => prev.map((i) => (i.id === id ? { ...i, ...record } : i)));
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  const deleteInfrastructure = useCallback((id: string) => {
    setInfrastructure((prev) => prev.filter((i) => i.id !== id));
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  const resolveIssue = useCallback((issueId: string) => {
    setResolvedIssueIds((prev) => {
      const next = new Set(prev);
      if (next.has(issueId)) {
        next.delete(issueId);
      } else {
        next.add(issueId);
      }
      return next;
    });
  }, []);

  const recalculateCompliance = useCallback(() => {
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  const loadDemoData = useCallback(() => {
    setInstitution(DEMO_INSTITUTION);
    setFaculty(DEMO_FACULTY);
    setInfrastructure(DEMO_INFRASTRUCTURE);
    setResolvedIssueIds(new Set());
    setLastAuditTimestamp(new Date().toLocaleTimeString());
  }, []);

  return (
    <ComplianceContext.Provider
      value={{
        institution,
        faculty,
        infrastructure,
        issues,
        stats,
        lastAuditTimestamp,
        updateInstitution,
        setFacultyRecords,
        addFaculty,
        updateFaculty,
        deleteFaculty,
        setInfrastructureRecords,
        addInfrastructure,
        updateInfrastructure,
        deleteInfrastructure,
        resolveIssue,
        recalculateCompliance,
        loadDemoData,
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
}

export function useCompliance() {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error("useCompliance must be used within a ComplianceProvider");
  }
  return context;
}
