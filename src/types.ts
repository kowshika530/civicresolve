export type Role = 'CITIZEN' | 'OFFICER' | 'SENIOR_OFFICER' | 'ADMIN';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'New' | 'Assigned' | 'Accepted' | 'In Progress' | 'Resolved' | 'Citizen Verification' | 'Closed' | 'Reopened';

export interface UserJurisdiction {
  city: string;
  departmentId: string;
  departmentName?: string;
  zone?: string;
  isPrimary?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  department?: string;
  phone?: string;
  city?: string;
  district?: string;
  state?: string;
  zone?: string;
  designation?: string;
  jurisdictions?: UserJurisdiction[];
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  citizenId: string;
  citizenName?: string;
  citizenContact?: string;
  citizenPhone?: string;
  additionalPhone?: string;
  sendSms?: boolean;
  smsSent?: boolean;
  smsRecord?: {
    id: string;
    recipientPhone: string;
    message: string;
    status: string;
    timestamp: number;
    gateway?: string;
  };
  smsHistory?: {
    id: string;
    recipientPhone: string;
    message: string;
    status: string;
    timestamp: number;
    type: string;
  }[];
  subject: string;
  description: string;
  location: string;
  emergencyFlag: boolean;
  
  latitude?: number | null;
  longitude?: number | null;
  location_address?: string;
  location_source?: 'MAP_SELECTION' | 'CURRENT_LOCATION' | 'SEARCH' | 'MANUAL';
  location_accuracy?: number;
  state?: string;
  district?: string;
  city?: string;
  pin_code?: string;
  street_address?: string;
  
  categoryId?: string;
  categoryName?: string;
  departmentId?: string;
  departmentName?: string;
  
  aiCategory?: string;
  aiConfidence?: number;
  aiReasoning?: string;
  aiModelVersion?: string;
  manualReviewRequired?: boolean;
  
  recommendedPriority?: Priority;
  finalPriority?: Priority;
  
  status: Status;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedOfficerEmail?: string;
  
  createdAt: number;
  updatedAt: number;
  slaDeadline?: number;
  
  resolutionRemarks?: string;
  resolutionDate?: number;
  resolutionProofUrl?: string;
  reopenReason?: string;
  
  attachments?: { id: string; name: string; url: string; size: number; type: string }[];
  rating?: { stars: number; feedback?: string; createdAt: number };
  statusHistory?: ComplaintStatusHistory[];
  
  duplicateGroupId?: string;
  isDuplicate?: boolean;
  primaryComplaintId?: string;
  primaryComplaintNumber?: string;
  duplicateCount?: number;
  duplicateInfo?: {
    primaryComplaintId?: string;
    primaryComplaintNumber?: string;
    primarySubject?: string;
    distanceMeters?: number;
  };
  
  // Unique AI, SLA Risk, and Clustering Intelligence Fields
  slaRiskScore?: number;
  slaRiskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  slaRiskReasons?: string[];
  humanReviewDecision?: HumanReviewDecision;
  aiExplainability?: ExplainableAi;
  relatedComplaints?: RelatedComplaint[];
  clusterId?: string;
}

export interface ComplaintStatusHistory {
  id: string;
  complaintId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  role: Role | 'SYSTEM';
  timestamp: number;
  remarks?: string;
  proofUrl?: string;
}

export interface Notification {
  id: string;
  userId: string; // recipient user ID or role identifier
  recipientRole?: Role;
  title: string;
  message: string;
  type: 'COMPLAINT_SUBMITTED' | 'COMPLAINT_ASSIGNED' | 'STATUS_CHANGED' | 'SLA_WARNING' | 'ESCALATION' | 'RESOLUTION_VERIFY' | 'REOPENED' | 'INFO_REQUESTED';
  complaintId?: string;
  complaintNumber?: string;
  timestamp: number;
  read: boolean;
  smsDispatched?: boolean;
  smsRecipientPhone?: string;
  smsReceiptId?: string;
}

export interface Escalation {
  id: string;
  complaintId: string;
  complaintNumber?: string;
  type: 'AUTOMATIC' | 'MANUAL';
  reason: string;
  timestamp: number;
  officerId?: string;
  officerName?: string;
  seniorOfficerId?: string;
  resolved?: boolean;
  resolutionNotes?: string;
  complaint?: Partial<Complaint>;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  defaultPriority: Priority;
  keywords: string[];
}

export interface Department {
  id: string;
  name: string;
  headName: string;
  headEmail: string;
  officerCount?: number;
  activeComplaintsCount?: number;
}

export interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: number;
}

export interface ExplainableAi {
  predictedCategory: string;
  confidence: number;
  recommendedDepartment: string;
  recommendedPriority: Priority;
  priorityReasons: string[];
  importantTerms: string[];
  reasoning: string;
  modelVersion: string;
  timestamp: number;
  manualReviewRequired: boolean;
}

export interface HumanReviewDecision {
  aiCategory: string;
  aiConfidence: number;
  finalCategory: string;
  finalDepartment: string;
  decision: 'ACCEPTED_AI' | 'OVERRIDDEN';
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  timestamp: number;
  notes?: string;
}

export interface RelatedComplaint {
  complaintId: string;
  complaintNumber: string;
  subject: string;
  categoryName?: string;
  status: Status;
  similarityScore: number;
  distanceKm?: number;
  confirmed?: boolean;
  rejected?: boolean;
}

export interface ComplaintCluster {
  id: string;
  clusterId: string; // e.g. CL-2026-014
  title: string;
  complaintCount: number;
  complaintIds: string[];
  complaints?: Partial<Complaint>[];
  category: string;
  departmentId: string;
  departmentName: string;
  area: string;
  latitude: number;
  longitude: number;
  firstReportedAt: number;
  latestReportedAt: number;
  status: 'UNDER_INVESTIGATION' | 'CONFIRMED_CIVIC_ISSUE' | 'FALSE_CLUSTER' | 'RESOLVED';
  investigationNotes?: string;
  assignedInvestigatorId?: string;
  assignedInvestigatorName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RecurringIssue {
  id: string;
  area: string;
  category: string;
  departmentName: string;
  totalComplaints: number;
  monthlyTrends: { month: string; count: number }[];
  trend: 'Increasing' | 'Stable' | 'Decreasing';
  increasePercentage: number;
  investigationHint: string;
  lastReportedAt: number;
  status: 'Active' | 'Under Inspection' | 'Mitigated';
}

export interface ProblemRadarItem {
  category: string;
  departmentName: string;
  currentPeriodCount: number;
  previousPeriodCount: number;
  percentageChange: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  statusLevel: 'NORMAL' | 'ELEVATED' | 'HIGH_ALERT';
  primaryHotspotArea: string;
}

export interface HotspotData {
  area: string;
  latitude: number;
  longitude: number;
  totalComplaints: number;
  topCategory: string;
  openComplaints: number;
  resolvedComplaints: number;
  overdueComplaints: number;
  recurringStatus: boolean;
  averageResolutionHours: number;
  urgencyLevel: 'Normal' | 'Moderate' | 'High' | 'Severe';
}

export interface SlaRiskAssessment {
  complaintId: string;
  complaintNumber: string;
  score: number; // 0 to 100
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  hoursRemaining: number;
  isOverdue: boolean;
  reasons: string[];
  recommendedAction: string;
  calculatedAt: number;
}

export interface OfficerWorkload {
  officerId: string;
  name: string;
  email: string;
  departmentId: string;
  departmentName: string;
  phone?: string;
  activeComplaints: number;
  criticalComplaints: number;
  highPriorityComplaints: number;
  atRiskComplaints: number;
  overdueComplaints: number;
  averageResolutionHours: number;
  workloadScore: number; // 0 - 100
  workloadCapacityPercent: number; // 0 - 100
  availabilityStatus: 'Available' | 'Optimal' | 'High Workload' | 'At Capacity';
}

export interface DepartmentPerformance {
  departmentId: string;
  name: string;
  headName: string;
  complaintsReceived: number;
  resolved: number;
  pending: number;
  overdue: number;
  escalated: number;
  slaComplianceRate: number; // percentage
  averageResolutionHours: number;
  reopenedCount: number;
  citizenRatingAvg: number;
}

export interface AiModelMetrics {
  modelVersion: string;
  trainedAt: string;
  datasetSize: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lowConfidenceCount: number;
  humanOverrideCount: number;
  totalInferences: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ==================================================
// DYNAMIC DEPARTMENT, CATEGORY & ROUTING ARCHITECTURE
// ==================================================

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headName: string;
  headEmail: string;
  headPhone?: string;
  status: 'Active' | 'Inactive';
  officerCount?: number;
  serviceAreas?: string[];
  createdAt?: number;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  defaultPriority: Priority;
  keywords: string[];
  createdAt?: number;
}

export interface CategoryDepartmentMapping {
  id: string;
  categoryId: string;
  categoryName: string;
  departmentId: string;
  departmentName: string;
  active: boolean;
  priority: number; // 1 = Primary, 2 = Secondary, etc.
  zoneOverride?: string; // Optional: specific zone/city rule
  description?: string;
  updatedAt?: number;
}

export interface OfficerAreaAssignment {
  id: string;
  officerId: string;
  officerName: string;
  officerEmail: string;
  officerPhone?: string;
  departmentId: string;
  departmentName: string;
  state: string;
  district: string;
  city: string;
  zone: string; // e.g. 'Zone 1', 'Zone 2', 'Central Zone', 'All Zones'
  areaWard?: string;
  active: boolean;
  maxWorkload: number;
  currentWorkload?: number;
  updatedAt?: number;
}

export interface RoutingTraceStep {
  step: number;
  title: string;
  detail: string;
  status: 'success' | 'warning' | 'info';
  metadata?: any;
}

export interface RoutingSimulationResult {
  complaintText: string;
  location: { state?: string; district?: string; city?: string; zone?: string };
  aiCategory: string;
  aiConfidence: number;
  aiPriority: Priority;
  mappedDepartment: { id: string; name: string; mappingId: string };
  areaZone: string;
  eligibleOfficers: {
    id: string;
    name: string;
    email: string;
    zone: string;
    active: boolean;
    currentWorkload: number;
    maxWorkload: number;
    isAvailable: boolean;
  }[];
  assignedOfficer: {
    id: string;
    name: string;
    email: string;
    reason: string;
  } | null;
  pipelineTrace: RoutingTraceStep[];
}

