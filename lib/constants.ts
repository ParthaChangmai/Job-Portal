import type { JobStatus, RemoteType, SeniorityLabel, WorkStyleLabel } from "@/types";

export const jobStatuses: JobStatus[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "ARCHIVED"
];

export const statusLabels: Record<JobStatus, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  ARCHIVED: "Archived"
};

export const remoteTypeLabels: Record<RemoteType, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "Onsite",
  UNKNOWN: "Unknown"
};

export const seniorityLabels: Record<SeniorityLabel, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID: "Mid",
  SENIOR: "Senior",
  LEAD: "Lead",
  UNKNOWN: "Unknown"
};

export const workStyleLabels: Record<WorkStyleLabel, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "Onsite",
  UNKNOWN: "Unknown"
};

export const skillKeywordLibrary = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Tailwind CSS",
  "Prisma",
  "PostgreSQL",
  "Python",
  "Java",
  "AWS",
  "Docker",
  "GraphQL",
  "REST APIs",
  "Figma",
  "Product Design",
  "SQL",
  "Machine Learning",
  "Data Analysis",
  "Kubernetes",
  "CI/CD",
  "Testing",
  "Redis",
  "Go",
  "C#",
  "Leadership"
];

export const dashboardNav = [
  {
    href: "/dashboard",
    label: "Overview"
  },
  {
    href: "/dashboard/search",
    label: "Job Search"
  },
  {
    href: "/dashboard/jobs",
    label: "My Jobs"
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics"
  },
  {
    href: "/dashboard/reminders",
    label: "Reminders"
  },
  {
    href: "/dashboard/settings",
    label: "Settings"
  }
];
