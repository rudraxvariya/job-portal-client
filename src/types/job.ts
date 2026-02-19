export const JOB_STATUSES = ["pending", "interview", "declined"] as const;
export const JOB_TYPES = ["full-time", "part-time", "internship"] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];
export type JobType = (typeof JOB_TYPES)[number];

export interface Job {
  _id: string;
  company: string;
  position: string;
  jobStatus: JobStatus | string;
  jobType: JobType | string;
  jobLocation: string;
  companyLogo?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface JobPayload {
  company: string;
  position: string;
  jobStatus: JobStatus;
  jobType: JobType;
  jobLocation: string;
  companyLogo?: string;
}
