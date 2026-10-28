import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AICTE_APH_NORMS, buildCopilotSystemPrompt } from "@/lib/knowledge/aicteAphNorms";

interface CopilotRequestBody {
  message: string;
  history?: Array<{ role: "user" | "model" | "assistant"; content: string }>;
  institutionContext?: {
    institution?: {
      name?: string;
      aictePermanentId?: string;
      academicYear?: string;
      sanctionedIntake?: number;
      builtUpAreaSqm?: number;
    };
    stats?: {
      overallScore?: number;
      eoaReadinessScore?: number;
      facultyStudentRatio?: number;
      cleanDataPercentage?: number;
      criticalIssuesCount?: number;
      warningIssuesCount?: number;
      totalRegularFaculty?: number;
      requiredFaculty?: number;
      cadreRatio?: {
        professors: number;
        associates: number;
        assistants: number;
        requiredProfessors: number;
        requiredAssociates: number;
        requiredAssistants: number;
      };
    };
    issues?: Array<{
      id: string;
      severity: string;
      category: string;
      recordReference: string;
      description: string;
      aicteNormReference: string;
      suggestedFix: string;
      isResolved: boolean;
    }>;
  };
}

/**
 * Dynamic deterministic response generator when GEMINI_API_KEY is not configured or in offline demo mode.
 */
function generateContextualFallback(
  userQuery: string,
  context: NonNullable<CopilotRequestBody["institutionContext"]>
): string {
  const q = userQuery.toLowerCase();
  const inst = context.institution || {
    name: "United Institute of Technology - Demo",
    aictePermanentId: "1-43289012",
    academicYear: "2024-25",
    sanctionedIntake: 600,
  };
  const stats = context.stats || {
    overallScore: 68,
    facultyStudentRatio: 21.4,
    cleanDataPercentage: 78,
    criticalIssuesCount: 4,
    warningIssuesCount: 4,
    totalRegularFaculty: 28,
    requiredFaculty: 30,
    cadreRatio: {
      professors: 1,
      associates: 3,
      assistants: 24,
      requiredProfessors: 3,
      requiredAssociates: 6,
      requiredAssistants: 20,
    },
  };
  const intake = inst.sanctionedIntake || 600;
  const regularFac = stats.totalRegularFaculty || 28;
  const reqFaculty = Math.ceil(intake / 20);
  const facultyDeficit = Math.max(0, reqFaculty - regularFac);

  const reqProf = Math.max(1, Math.floor(reqFaculty / 9));
  const reqAssoc = Math.max(1, Math.floor((reqFaculty * 2) / 9));
  const reqAsst = Math.max(1, Math.ceil((reqFaculty * 6) / 9));

  const actualProf = stats.cadreRatio?.professors ?? 1;
  const actualAssoc = stats.cadreRatio?.associates ?? 3;
  const actualAsst = stats.cadreRatio?.assistants ?? 24;

  const profShortfall = Math.max(0, reqProf - actualProf);
  const assocShortfall = Math.max(0, reqAssoc - actualAssoc);

  // 1. Faculty Hiring & Cadre Calculation Query
  if (
    q.includes("faculty") ||
    q.includes("hiring") ||
    q.includes("fsr") ||
    q.includes("ratio") ||
    q.includes("cadre") ||
    q.includes("1:20") ||
    q.includes("1:2:6")
  ) {
    return `### AICTE Faculty Hiring & Cadre Realignment Audit

**Institution:** ${inst.name} | **Sanctioned Intake:** ${intake} Students | **Mandate:** AICTE APH 2024-25 Table 7.1

#### 1. Faculty-to-Student Ratio (FSR) Requirement
- **Mandated Ratio:** **1 : 20** for Undergraduate Engineering & Technology programs.
- **Minimum Required Regular Faculty:** **${reqFaculty} Regular Teachers** (\`${intake} / 20\`).
- **Current Regular Faculty on Roll:** **${regularFac} Faculty Members**.
- **Net Headcount Deficit:** **${facultyDeficit > 0 ? `${facultyDeficit} Faculty Members` : "No deficit (FSR Met)"}**.
- **Current Operational FSR:** **1 : ${stats.facultyStudentRatio || (intake / regularFac).toFixed(1)}** *(Statutory Violation: Chapter VII Section 7.1)*.

#### 2. Cadre Distribution Breakdown (1 : 2 : 6 Structure)
Under **AICTE APH Clause 7.2**, faculty must follow the **1 Professor : 2 Associate Professors : 6 Assistant Professors** distribution based on the ${reqFaculty} required headcount:

| Cadre Level | AICTE Formula | Required Count | Actual on Roll | Status / Deficit | Minimum Qualification |
|---|---|:---:|:---:|:---:|---|
| **Professor** | \`N / 9\` | **${reqProf}** | ${actualProf} | **${profShortfall > 0 ? `Deficit of ${profShortfall}` : "Compliant"}** | Ph.D. + 10 yrs exp (3 yrs as Assoc Prof) + 6 SCI papers |
| **Associate Professor** | \`(2 × N) / 9\` | **${reqAssoc}** | ${actualAssoc} | **${assocShortfall > 0 ? `Deficit of ${assocShortfall}` : "Compliant"}** | Ph.D. + 8 yrs post-qual exp + 2 SCI papers |
| **Assistant Professor** | \`(6 × N) / 9\` | **${reqAsst}** | ${actualAsst} | **${actualAsst >= reqAsst ? "Adequate (+4)" : "Deficit"}** | M.Tech / M.E. First Class |
| **Total** | — | **${reqFaculty}** | **${regularFac}** | **Net Deficit: ${facultyDeficit}** | **Minimum 80% Regular Full-Time** |

#### 3. Immediate Recommended Remediation Plan
1. **Recruitment Drive:** Publish open notifications in national dailies for **${profShortfall} Professor(s)** and **${assocShortfall} Associate Professor(s)** in CSE and ECE.
2. **Internal Promotion:** Initiate CAS (Career Advancement Scheme) screening for eligible Assistant Professors holding doctoral degrees with 8+ years of verified service.
3. **AICTE Portal Sync:** Upload appointment orders, biometric enrollment IDs, and joining reports within 30 days of appointment to avert Chapter VII intake reductions.`;
  }

  // 2. Formal Deficiency Undertaking Letter Query
  if (
    q.includes("undertaking") ||
    q.includes("letter") ||
    q.includes("draft") ||
    q.includes("scrutiny") ||
    q.includes("affidavit")
  ) {
    const activeCritical = (context.issues || []).filter((i) => i.severity === "Critical" && !i.isResolved);
    const criticalList =
      activeCritical.length > 0
        ? activeCritical
            .map(
              (c, idx) =>
                `   ${idx + 1}. **${c.recordReference}**: ${c.description} *(Ref: ${c.aicteNormReference})*`
            )
            .join("\n")
        : `   1. **Cadre Ratio & FSR**: Hiring in progress for ${facultyDeficit} regular faculty positions to satisfy Table 7.1.\n   2. **Infrastructure**: Reconfiguration of Laboratory space to meet 66 sq.m minimum carpet area norm.`;

    return `### Formal Deficiency Compliance Undertaking (For AICTE Scrutiny Committee)

*(To be printed on Institution Letterhead and attested by the Principal / Director / Chairman)*

---

**To:**  
The Member Secretary / Chairman, Scrutiny Committee  
All India Council for Technical Education (AICTE)  
Nelson Mandela Marg, Vasant Kunj, New Delhi – 110070  

**Subject:** Undertaking regarding Compliance of Scrutiny Deficiencies for Extension of Approval (EoA) – Academic Year **${inst.academicYear || "2024-25"}**  
**Institution:** **${inst.name}**  
**AICTE Permanent Institute ID:** **${inst.aictePermanentId}**  

Respected Sir / Madam,

With reference to the preliminary scrutiny findings and AICTE portal communication regarding our application for Extension of Approval (EoA) for the Academic Year **${inst.academicYear || "2024-25"}**, we hereby submit our solemn undertaking in respect of the following noted deficiencies:

#### Identified Deficiencies under Scrutiny:
${criticalList}

#### Institution's Affirmation & Action Plan:
1. **Cadre & FSR Realignment:** In compliance with **AICTE APH Chapter VII, Table 7.1**, the Governing Body of ${inst.name} in its resolution dated *(insert date)* has sanctioned recruitment of the required senior cadre faculty. Advertisements have been released, and interviews are scheduled to conclude prior to the commencement of the academic term.
2. **De-duplication of Identifiers:** We have conducted 100% physical biometric and original document verification for all faculty members. Any erroneous PAN / AICTE ID mapping in the portal database has been expunged.
3. **Instructional Infrastructure Compliance:** All instructional laboratories have been verified by our certified architect to ensure unencumbered carpet area exceeding the **66 sq.m** statutory threshold as per **AICTE Appendix 4**.
4. **Legal Undertaking:** We undertake that if any statement made herein is found false, misleading, or unsubstantiated during physical Expert Visit Committee (EVC) verification, the Council shall have full right under **Chapter VII Penal Measures** to reduce sanctioned intake by 50% or withdraw Approval without further notice.

Yours faithfully,

<br/>

_____________________________  
**Prof. / Dr. (Principal / Director)**  
${inst.name}  
*Seal of the Institution*  

---
*Generated by AICTE Compliance Copilot. Ready to be copied and formatted for official submission.*`;
  }

  // 3. EVC Inspection Readiness Checklist Query
  if (
    q.includes("evc") ||
    q.includes("checklist") ||
    q.includes("inspection") ||
    q.includes("visit") ||
    q.includes("scrutiny committee")
  ) {
    return `### Expert Visit Committee (EVC) Physical Audit Readiness Checklist

**Target:** Extension of Approval (EoA) & Surprise Scrutiny Inspection  
**Institution:** ${inst.name} (AICTE ID: ${inst.aictePermanentId})  
**Applicable Norm:** AICTE APH Chapter I Section 1.5 & Appendix 16  

#### Pillar 1: Statutory NOCs & Governance (Keep in Chairman / Principal Office)
- [ ] **Fire Safety NOC:** Current valid Fire Safety Certificate issued by State Fire Services / Municipal Corporation covering all active blocks.
- [ ] **Structural Stability Certificate:** Issued by a certified Government Structural Engineer for all instructional blocks (Blocks A, B, C, D).
- [ ] **Land Title & Building Plan:** Certified approved municipal building drawings clearly marking room numbers and carpet areas (matching uploaded CSV).
- [ ] **Affiliation Letter:** Latest affiliation order from the State Technical University for the current intake.

#### Pillar 2: Faculty Dossiers & Biometrics (Scrutiny Room 1)
- [ ] **Original Qualification Folders:** Indexed files for every faculty member containing 10th, 12th, B.Tech, M.Tech, and Ph.D. degree certificates with original PAN and Aadhaar copies.
- [ ] **Bank & PFMS Salary Statements:** Bank-attested statement of the preceding 12 months proving direct salary credit as per 7th Central Pay Commission scales.
- [ ] **Biometric Attendance Logs:** Exported daily punch-in/out records from biometric attendance machines for the last 180 days.
- [ ] **AICTE Portal IDs:** Attested list of active AICTE Permanent IDs for all 28 regular faculty members.

#### Pillar 3: Instructional Space Verification (Physical Walkthrough)
- [ ] **Classrooms (CR-101 to CR-202):** Minimum 66 sq.m carpet area verified with laser distance meter; acoustics, whiteboard, and digital projector operational.
- [ ] **Engineering Laboratories:** Ensure Chemistry Lab (LAB-102) and Electronics Devices Lab (LAB-204) carpet area is certified $\\ge 66\\text{ sq.m}$. Lab registers, equipment stock registers, and safety equipment (fire extinguishers, eye-wash stations) accessible.
- [ ] **Seminar Halls:** Minimum 132 sq.m with working sound console, stage, and interactive display.

#### Pillar 4: Campus Facilities & Mandatory Committees
- [ ] **Barrier-Free Environment (PwD Act 2016):** Ramps with 1:12 slope at all ground floor entrances, elevator operational with braille signage, and dedicated disabled-friendly washrooms on each floor.
- [ ] **Mandatory Committees Gazetted:** Display boards at main reception displaying names and phone numbers of:
  - Anti-Ragging Committee (with local police inspector contact)
  - Internal Complaints Committee (ICC for women safety)
  - SC / ST Vigilance Cell
  - Student Grievance Redressal Committee (SGRC) with Ombudsman details.
- [ ] **Website Public Disclosure:** Live URL on home page displaying mandatory 18-point AICTE disclosure.`;
  }

  // 4. Chapter VII Penalties Query
  if (
    q.includes("penalty") ||
    q.includes("penalties") ||
    q.includes("chapter vii") ||
    q.includes("duplicate pan") ||
    q.includes("fake") ||
    q.includes("ghost") ||
    q.includes("phd")
  ) {
    return `### AICTE Chapter VII Penal Measures & Statutory Consequences

**Reference:** AICTE Approval Process Handbook (2024-25), Chapter VII: *“Norms for Action in Case of Non-Compliance / Violations of Regulations”*

#### 1. Duplicate PAN / Ghost Faculty Penalty
- **Statutory Classification:** Entering duplicate PAN cards, duplicate Aadhaar numbers, or false AICTE Faculty IDs constitutes deliberate misrepresentation and academic fraud under **IPC Sections 420 and 468**.
- **Financial Penalty:** Imposition of a mandatory fine of **₹5,00,000 (Five Lakh Rupees)** per duplicate faculty record on the institution.
- **Faculty Debarment:** The faculty member's permanent AICTE ID is blacklisted across India for a minimum period of **3 academic years**.
- **Institutional Action:** Immediate 25% to 50% reduction in sanctioned intake for the relevant department, along with potential criminal FIR filed by the AICTE Regional Officer.

#### 2. Non-PhD Senior Cadre Violations
- **AICTE Pay Regulations 2019 Notification:** Ph.D. is the mandatory minimum entry qualification for Professor and Associate Professor cadres.
- **Scrutiny Committee Action:** Any faculty designated as "Professor" or "Associate Professor" without a Ph.D. is **summarily disqualified** from the senior cadre during EoA verification.
- **Consequence:** They are counted only as Assistant Professors (if holding an M.Tech), instantly triggering an **AICTE Cadre Ratio Shortfall Warning** and penalizing the institution's EoA Readiness Score.

#### 3. Deficit in Faculty-Student Ratio (FSR)
- **FSR > 1:20 and ≤ 1:25:** Automatic reduction in sanctioned intake by **25%** for the following academic year.
- **FSR > 1:25:** Reduction in sanctioned intake by **50%** or placing the institution under the **"No Admission"** category.
- **Persistent Shortfall (2 Consecutive Cycles):** Total withdrawal of AICTE Approval and de-affiliation notice issued to the affiliating state technical university.

#### 4. Safe Remediation Checklist
1. Immediately remove or re-verify duplicate PAN entries (**ABCPS1234D** and **XYZPK9876E** in current state).
2. Re-designate non-PhD senior faculty as Assistant Professor (Senior Scale) pending doctorate award.
3. Submit an official compliance rectification before the portal freeze date.`;
  }

  // 5. General Fallback
  return `### AICTE Compliance Copilot Analysis

**Institution:** ${inst.name} (AICTE Permanent ID: ${inst.aictePermanentId})  
**Current Audit Score:** **${stats.overallScore}%** | **FSR:** **1:${stats.facultyStudentRatio}** | **Active Critical Issues:** **${stats.criticalIssuesCount}**

Based on the **AICTE Approval Process Handbook (2024-25)**:

1. **Overall Compliance Health:** Your institution currently satisfies **${stats.cleanDataPercentage}%** of data quality requirements. However, **${stats.criticalIssuesCount} Critical Deficits** must be resolved prior to the upcoming Extension of Approval (EoA) scrutiny deadline.
2. **Faculty Cadre Balance:** For ${intake} sanctioned seats, the mandated 1:20 ratio requires **${reqFaculty} regular faculty members**. Your current regular faculty count is **${regularFac}**, leaving a net shortfall of **${facultyDeficit} faculty member(s)**. Furthermore, the 1:2:6 cadre ratio requires at least **${reqProf} Professors** and **${reqAssoc} Associate Professors**.
3. **Recommended Immediate Action:**
   - Go to **Data Ingestion** or the **Audit Engine** to correct duplicate PANs and missing AICTE IDs.
   - For physical spaces, ensure all laboratories have a carpet area of at least **66 sq.m** as required by AICTE Appendix 4.
   - Generate and download the formal Scrutiny Committee Undertaking to provisionally protect your sanctioned intake.

Would you like me to calculate detailed recruitment headcount, draft a formal undertaking letter, or outline the EVC physical inspection checklist?`;
}

export async function POST(req: NextRequest) {
  try {
    const body: CopilotRequestBody = await req.json();
    const { message, history = [], institutionContext = {} } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "A valid message string is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if real Gemini API key is available and valid
    if (apiKey && apiKey.length > 10 && !apiKey.includes("your-gemini-api-key")) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-2.5-flash as default, with system instructions
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: buildCopilotSystemPrompt(institutionContext),
        });

        // Format history for Google Generative AI
        const formattedHistory = history.map((item) => ({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.content }],
        }));

        const chat = model.startChat({
          history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const replyText = result.response.text();

        return NextResponse.json({
          response: replyText,
          source: "gemini-2.5-flash",
          timestamp: new Date().toISOString(),
        });
      } catch (geminiError) {
        console.warn("[Copilot API] Gemini call failed, gracefully falling back to deterministic knowledge engine:", geminiError);
        // Fall through to deterministic fallback
      }
    }

    // Graceful fallback: Deterministic AICTE APH Expert Engine
    const fallbackResponse = generateContextualFallback(message, institutionContext);

    return NextResponse.json({
      response: fallbackResponse,
      source: "aicte-aph-knowledge-engine",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Copilot API] Unhandled server error:", error);
    return NextResponse.json(
      {
        response:
          "An error occurred while evaluating your AICTE compliance query. Please verify that your institution parameters in the dashboard are configured properly.",
        source: "error-fallback",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

