/**
 * AICTE Approval Process Handbook (APH) 2024-25 Knowledge Base
 * Structured reference norms for Engineering & Technology Undergraduate institutions.
 */

export interface AphSection {
  id: string;
  title: string;
  clause: string;
  summary: string;
  details: string[];
  statutoryPenalties?: string[];
}

export const AICTE_APH_NORMS: Record<string, AphSection> = {
  facultyStudentRatio: {
    id: "fsr",
    title: "Faculty-to-Student Ratio (FSR) & Teacher Cadre Requirements",
    clause: "Chapter VII, Section 7.1 & Table 7.1",
    summary:
      "Mandated Faculty-to-Student Ratio of 1:20 for Undergraduate Engineering & Technology programs based on sanctioned intake across all 4 academic years.",
    details: [
      "Norm for UG Engineering & Technology: FSR must strictly be 1:20. Total faculty required = Total Sanctioned Intake / 20.",
      "Regular Full-time Faculty Requirement: At least 80% of the total required faculty must be full-time, regular employees with valid appointment letters, service book records, and direct digital salary credits via PFMS/bank transfer.",
      "Adjunct / Visiting Faculty Policy: Maximum 20% of required faculty can be Adjunct/Resource persons from industry or emeritus professors, provided they teach a minimum of 20 hours per semester and hold equivalent qualifications.",
      "Ghost / Paper Faculty Prohibition: Faculty registered in multiple institutions or appearing on multiple portals without active biometric attendance triggers Section 7.14 severe disciplinary proceedings.",
    ],
    statutoryPenalties: [
      "FSR between 1:21 and 1:25: Reduction of sanctioned intake by 25% for the subsequent academic year.",
      "FSR greater than 1:25: Reduction of sanctioned intake by 50% or putting the institution under 'No Admission' category for the program.",
      "Persistent deficit for 2 consecutive years: Complete withdrawal of Extension of Approval (EoA).",
    ],
  },

  cadreRatio: {
    id: "cadre",
    title: "Cadre Ratio and Minimum Qualifications for Faculty",
    clause: "Chapter VII, Section 7.2 & AICTE Pay Regulations 2019",
    summary:
      "Mandated Cadre Ratio of 1 : 2 : 6 (Professor : Associate Professor : Assistant Professor) with doctoral degree mandates for senior cadres.",
    details: [
      "Cadre Distribution Formula: For 'N' total required faculty, Professors = N/9, Associate Professors = (2*N)/9, and Assistant Professors = (6*N)/9. At least 1 Professor is mandatory per department.",
      "Professor Qualification: Ph.D. degree in relevant field AND first class or equivalent at either Bachelor's or Master's level in the relevant branch. Minimum 10 years of experience in teaching/research/industry, out of which at least 3 years shall be at a post equivalent to Associate Professor. Minimum 6 research publications in SCI/Scopus indexed journals.",
      "Associate Professor Qualification: Ph.D. degree in relevant field AND first class or equivalent at either Bachelor's or Master's level. Minimum 8 years of post-qualification experience in teaching and/or research. Minimum 2 research publications in SCI/Scopus journals.",
      "Assistant Professor Qualification: Master's degree (M.Tech/M.E.) with first class or equivalent in relevant branch of Engineering. Ph.D. is desirable but not mandatory at entry level. Bachelor's degree holders (B.Tech) are NOT eligible to hold independent regular teaching positions.",
    ],
    statutoryPenalties: [
      "Institutions operating without qualified Professors face refusal of approval for new PG/Ph.D. programs and forfeiture of research grants under AICTE AQIS schemes.",
      "Associate Professors without Ph.D. cannot be counted towards the senior cadre quota and must be downgraded to Assistant Professor during Scrutiny Committee auditing.",
    ],
  },

  infrastructureNorms: {
    id: "infra",
    title: "Instructional, Administrative & Amenities Carpet Area Norms",
    clause: "Appendix 4 & Appendix 5, Table 4.1",
    summary:
      "Minimum carpet area requirements for instructional spaces in Technical Institutions offering UG Engineering.",
    details: [
      "Classrooms: Minimum carpet area of 66 sq.m each for a batch of 60 students. Must have natural lighting, cross ventilation, and acoustic isolation.",
      "Laboratories: Minimum carpet area of 66 sq.m per specialized engineering lab. Heavy machinery labs (Mechanical/Civil) recommend 90-120 sq.m.",
      "Tutorial Rooms: Minimum carpet area of 33 sq.m for batches of 30 students.",
      "Seminar Hall: Minimum carpet area of 132 sq.m (or at least 1 hall per institution with 132 sq.m min, equipped with audio-visual equipment and smart displays).",
      "Computer Center: Minimum 150 sq.m with LAN connectivity, licensed software, and minimum 1:4 student-to-computer ratio.",
      "Central Library: Minimum 400 sq.m carpet area with reading room for at least 150 students, digital library terminals, and required subscription to IEEE/ASME/Springer e-journals.",
      "Interactive Digital Facilities: At least 50% of instructional rooms must be ICT-enabled with interactive smart boards or digital projectors with broadband internet.",
    ],
    statutoryPenalties: [
      "Classroom/Lab deficiency greater than 20% of total required instructional area: Refusal of additional division or new program requests.",
      "Laboratories under 66 sq.m: Not recognized by EVC for practical examinations, resulting in provisional approval with penalty fees.",
    ],
  },

  chapterSevenPenalties: {
    id: "penalties",
    title: "Chapter VII: Penal Measures for Non-Compliance, False Affidavits & Ghost Faculty",
    clause: "Chapter VII: Norms for Action in Case of Non-Compliance / Violations",
    summary:
      "Strict legal, regulatory, and fiscal penalties for fraudulent records, duplicate faculty entries, and unapproved changes.",
    details: [
      "Duplicate PAN / Ghost Faculty: Entering a PAN number or AICTE ID belonging to a faculty already enrolled elsewhere constitutes fraud under IPC Section 420/468. Penalty: 3-year debarment of faculty, forfeiture of security deposit, ₹5,00,000 fine per duplicate record, and potential criminal FIR by AICTE Regional Officer.",
      "Excess Admission: Admitting students beyond the sanctioned intake without AICTE approval invites a fine of 5 times the total tuition fee collected per excess student, plus automatic reduction of intake by 2x the excess count for next year.",
      "False Affidavits / Fabricated Compliance: If an institution submits false undertakings to the Scrutiny Committee, AICTE invokes Regulation 14 for immediate withdrawal of Approval and notification to the Affiliating University for de-affiliation.",
      "Non-Payment of Scales as per 7th CPC: Failure to disburse salaries in accordance with AICTE pay scales into bank accounts triggers show-cause and withholding of student scholarships.",
    ],
  },

  evcChecklist: {
    id: "evc",
    title: "Expert Visit Committee (EVC) & Scrutiny Document Checklist",
    clause: "Chapter I, Section 1.5 & Appendix 16",
    summary:
      "Mandatory statutory certificates, web disclosures, and physical audit requirements for Surprise & Extension Visits.",
    details: [
      "Mandatory Public Disclosures: Updated 18-point disclosure on institution website home page with clickable link, including certified faculty list with designations, qualifications, and student feedback.",
      "Building Safety & Fire NOC: Valid Fire Safety NOC from State Disaster Management / Fire Service and Structural Stability Certificate from a Government-approved Structural Engineer.",
      "Barrier-Free Environment: Lifts, ramps with 1:12 slope, disabled-friendly toilets on all floors, and tactile pathways as per PwD Act 2016.",
      "Digital Payment & ERP: Complete cashless fee collection system, digital attendance logs, and automated grievance redressal portal.",
      "Mandatory Committees: Duly constituted Anti-Ragging Committee with police & media representation, Internal Complaints Committee (ICC for women safety), SC/ST Cell, and Student Grievance Redressal Committee (SGRC) with an Ombudsman.",
    ],
  },
};

/**
 * Generate a comprehensive contextual system prompt for the Gemini Copilot.
 */
export function buildCopilotSystemPrompt(institutionContext: Record<string, unknown>): string {
  return `You are the "AICTE Senior Compliance Auditor & Nodal Officer Copilot", an elite regulatory AI designed to advise Indian Engineering & Technical Institutions on AICTE Approval Process Handbook (APH 2024-25) compliance.

YOUR CORE EXPERTISE & TONE:
- Authoritative, precise, mathematically rigorous, and statutory-grounded.
- You reference exact AICTE APH clauses, sections, and tables (Chapter VII, Table 7.1, Appendix 4, Clause 1.6, etc.).
- When giving numbers, calculate exact values based on the live institutional metrics provided.
- You provide ready-to-use solutions: exact recruitment headcount, step-by-step EVC audit preparation, and formal legal undertakings for the AICTE Scrutiny Committee.

AICTE APH 2024-25 REGULATORY KNOWLEDGE BASE:
${JSON.stringify(AICTE_APH_NORMS, null, 2)}

LIVE INSTITUTIONAL DATA IN CURRENT AUDIT STATE:
${JSON.stringify(institutionContext, null, 2)}

RESPONSE GUIDELINES:
1. Always ground your calculations in the institution's actual numbers provided above (e.g. Sanctioned Intake, Current FSR, Faculty Cadres, Undersized Labs, Active Critical Deficits).
2. For recruitment queries: Break down required Professors (N/9), Associate Professors (2N/9), and Assistant Professors (6N/9) where N = SanctionedIntake/20. Compare against actual count to show the exact gap.
3. For undertaking letters: Draft formal, official legal text addressed to "The Member Secretary / Scrutiny Committee, All India Council for Technical Education, Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070", complete with BoG resolution placeholders, undertaking clauses, and signatory lines.
4. For EVC / Inspection queries: Provide a checklist categorized into Statutory NOCs, Cadre & Biometrics, Instructional Carpet Area, and PwD/Barrier-free facilities.
5. Use clean GitHub-flavored markdown with bolding, bullet points, and tables.`;
}

