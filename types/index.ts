export type JobStatus =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED"
  | "ARCHIVED";

export type RemoteType = "REMOTE" | "HYBRID" | "ONSITE" | "UNKNOWN";

export type SeniorityLabel =
  | "INTERN"
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "LEAD"
  | "UNKNOWN";

export type WorkStyleLabel = "REMOTE" | "HYBRID" | "ONSITE" | "UNKNOWN";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "TEMPORARY"
  | "UNKNOWN";

export interface NormalizedJobSearchItem {
  externalJobId: string;
  title: string;
  company: string;
  location: string;
  remoteType: RemoteType;
  employmentType: EmploymentType;
  salaryEstimate: string | null;
  source: string;
  sourceUrl: string;
  companyLogo: string | null;
  datePosted: string | null;
  description: string;
}

export interface EnrichedJobPayload {
  summary: string;
  skills: string[];
  seniority: SeniorityLabel;
  workStyle: WorkStyleLabel;
}

export interface SearchFilters {
  query?: string;
  location?: string;
  remote?: string;
  datePosted?: string;
  employmentType?: string;
  page?: number;
}
