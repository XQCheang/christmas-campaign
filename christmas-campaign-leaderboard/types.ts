export interface Applicant {
  id: string;
  email: string; // Unique identifier for distinct check
  name: string;
  appliedDate: string; // ISO string
  source: string;
}

export interface Recruiter {
  id: string;
  name: string;
  avatar: string;
  applicants: Applicant[];
  company: string;
  isBot?: boolean;
}

export interface MonthlyStat {
  month: string; // "Jan 2024"
  count: number;
}

export interface CampaignState {
  currentUser: Recruiter | null;
  allRecruiters: Recruiter[];
}