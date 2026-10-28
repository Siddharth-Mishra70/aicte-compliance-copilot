export type FacultyDesignation = 'Professor' | 'Associate Professor' | 'Assistant Professor';
export type HighestDegree = 'PhD' | 'Masters' | 'Bachelors';
export type RoomType = 'Classroom' | 'Tutorial' | 'Laboratory' | 'Seminar Hall';
export type IssueCategory = 'Data Quality' | 'AICTE Norm Deficit';
export type IssueSeverity = 'Critical' | 'Warning' | 'Info';
export type EntityType = 'Faculty' | 'Infrastructure' | 'Disclosure';

export interface InstitutionProfile {
  id: string;
  name: string;
  aictePermanentId: string;
  academicYear: string;
  sanctionedIntake: number;
  builtUpAreaSqm: number;
}

export interface FacultyRecord {
  id: string;
  fullName: string;
  panNumber: string;
  aicteFacultyId: string;
  designation: FacultyDesignation;
  highestDegree: HighestDegree;
  department: string;
  joiningDate: string; // ISO format YYYY-MM-DD
  isRegular: boolean;
}

export interface InfrastructureRecord {
  id: string;
  roomNumber: string;
  roomType: RoomType;
  areaSqm: number;
  seatingCapacity: number;
  hasSmartBoard: boolean;
}

export interface ComplianceIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  entityType: EntityType;
  recordReference: string;
  description: string;
  aicteNormReference: string;
  suggestedFix: string;
  isResolved: boolean;
}

export interface CadreBreakdown {
  professors: { actual: number; required: number; deficit: number };
  associates: { actual: number; required: number; deficit: number };
  assistants: { actual: number; required: number; deficit: number };
}

export interface ValidationMetrics {
  eoaReadinessScore: number;
  currentFSR: number;
  cleanDataPercentage: number;
  totalRegularFaculty: number;
  requiredFaculty: number;
  cadreBreakdown: CadreBreakdown;
}

export interface ValidationResult {
  issues: ComplianceIssue[];
  metrics: ValidationMetrics;
}

export interface ComplianceStats {
  overallScore: number;
  eoaReadinessScore: number;
  cleanDataPercentage: number;
  criticalIssuesCount: number;
  warningIssuesCount: number;
  infoIssuesCount: number;
  facultyStudentRatio: number;
  totalRegularFaculty: number;
  requiredFaculty: number;
  cadreRatio: {
    professors: number;
    associates: number;
    assistants: number;
    requiredProfessors: number;
    requiredAssociates: number;
    requiredAssistants: number;
  };
  eoaReadiness: 'Ready' | 'Deficient' | 'Critical Issues Pending';
}

export interface ComplianceContextType {
  institution: InstitutionProfile;
  faculty: FacultyRecord[];
  infrastructure: InfrastructureRecord[];
  issues: ComplianceIssue[];
  stats: ComplianceStats;
  lastAuditTimestamp: string | null;
  updateInstitution: (profile: Partial<InstitutionProfile>) => void;
  setFacultyRecords: (records: FacultyRecord[]) => void;
  addFaculty: (record: Omit<FacultyRecord, 'id'>) => void;
  updateFaculty: (id: string, record: Partial<FacultyRecord>) => void;
  deleteFaculty: (id: string) => void;
  setInfrastructureRecords: (records: InfrastructureRecord[]) => void;
  addInfrastructure: (record: Omit<InfrastructureRecord, 'id'>) => void;
  updateInfrastructure: (id: string, record: Partial<InfrastructureRecord>) => void;
  deleteInfrastructure: (id: string) => void;
  resolveIssue: (issueId: string) => void;
  recalculateCompliance: () => void;
  loadDemoData: () => void;
}
