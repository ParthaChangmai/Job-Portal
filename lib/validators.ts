import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export const searchJobsSchema = z.object({
  query: z.string().min(2).max(120),
  location: z.string().max(120).optional().default(""),
  remote: z.enum(["REMOTE", "HYBRID", "ONSITE", "ANY"]).optional().default("ANY"),
  datePosted: z.string().max(40).optional().default("all"),
  employmentType: z.string().max(40).optional().default("all"),
  page: z.coerce.number().min(1).max(30).optional().default(1)
});

export const saveJobSchema = z.object({
  externalJobId: z.string().min(1).max(255).optional(),
  title: z.string().min(2).max(255),
  company: z.string().min(2).max(255),
  location: z.string().max(255).optional().default("Unknown"),
  remoteType: z.enum(["REMOTE", "HYBRID", "ONSITE", "UNKNOWN"]).default("UNKNOWN"),
  employmentType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY", "UNKNOWN"])
    .default("UNKNOWN"),
  salaryEstimate: z.string().max(120).nullable().optional(),
  source: z.string().min(2).max(120),
  sourceUrl: z.string().url(),
  companyLogo: z.string().url().nullable().optional(),
  datePosted: z.string().nullable().optional(),
  description: z.string().min(20),
  resumeVersion: z.string().max(120).optional().nullable(),
  coverLetterVersion: z.string().max(120).optional().nullable()
});

export const updateJobSchema = z.object({
  status: z.enum(["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "ARCHIVED"]),
  applicationDate: z.string().nullable().optional(),
  followUpDate: z.string().nullable().optional(),
  expectedSalary: z.coerce.number().nullable().optional(),
  resumeVersion: z.string().max(120).nullable().optional(),
  coverLetterVersion: z.string().max(120).nullable().optional()
});

export const addNoteSchema = z.object({
  content: z.string().min(2).max(3000)
});

export const reminderSchema = z.object({
  savedJobId: z.string().cuid(),
  title: z.string().min(2).max(180),
  dueDate: z.string()
});

export const jobFilterSchema = z.object({
  status: z.string().optional().default("all"),
  company: z.string().optional().default(""),
  skill: z.string().optional().default(""),
  location: z.string().optional().default(""),
  remoteType: z.string().optional().default("all"),
  query: z.string().optional().default(""),
  from: z.string().optional().default(""),
  to: z.string().optional().default("")
});
