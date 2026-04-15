import { JobStatus, RemoteType } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { addDays } from "date-fns";

import { prisma } from "@/lib/prisma";
import { getAnalyticsForUser } from "@/lib/services/analytics";
import { jobFilterSchema } from "@/lib/validators";

export async function getDashboardHomeData(userId: string) {
  const [analytics, recentJobs, reminders, searchHistory] = await Promise.all([
    getAnalyticsForUser(userId),
    prisma.savedJob.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    }),
    prisma.reminder.findMany({
      where: {
        userId,
        dueDate: {
          lte: addDays(new Date(), 7)
        }
      },
      orderBy: { dueDate: "asc" },
      take: 6,
      include: {
        savedJob: true
      }
    }),
    prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  return {
    analytics,
    recentJobs,
    reminders,
    searchHistory
  };
}

export async function getJobsForUser(userId: string, rawFilters: Record<string, string | undefined>) {
  const filters = jobFilterSchema.parse(rawFilters);

  const where: Prisma.SavedJobWhereInput = {
    userId,
    status: filters.status !== "all" ? (filters.status as JobStatus) : undefined,
    company: filters.company ? { contains: filters.company, mode: "insensitive" } : undefined,
    location: filters.location ? { contains: filters.location, mode: "insensitive" } : undefined,
    remoteType: filters.remoteType !== "all" ? (filters.remoteType as RemoteType) : undefined,
    createdAt:
      filters.from || filters.to
        ? {
            gte: filters.from ? new Date(filters.from) : undefined,
            lte: filters.to ? new Date(filters.to) : undefined
          }
        : undefined,
    AND: filters.skill
      ? [
          {
            extractedSkills: {
              has: filters.skill
            }
          }
        ]
      : undefined,
    OR: filters.query
      ? [
          {
            title: {
              contains: filters.query,
              mode: "insensitive"
            }
          },
          {
            company: {
              contains: filters.query,
              mode: "insensitive"
            }
          },
          {
            notes: {
              some: {
                content: {
                  contains: filters.query,
                  mode: "insensitive"
                }
              }
            }
          },
          {
            extractedSkills: {
              has: filters.query
            }
          }
        ]
      : undefined
  };

  const [jobs, companies, skills] = await Promise.all([
    prisma.savedJob.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      include: {
        notes: {
          orderBy: { createdAt: "desc" }
        },
        reminders: {
          orderBy: { dueDate: "asc" }
        }
      }
    }),
    prisma.savedJob.findMany({
      where: { userId },
      select: { company: true },
      distinct: ["company"],
      orderBy: { company: "asc" }
    }),
    prisma.savedJob.findMany({
      where: { userId },
      select: { extractedSkills: true }
    })
  ]);

  return {
    jobs,
    filters,
    companies: companies.map((item) => item.company),
    skills: [...new Set(skills.flatMap((item) => item.extractedSkills))].sort()
  };
}

export async function getSavedJobDetail(userId: string, jobId: string) {
  return prisma.savedJob.findFirst({
    where: {
      id: jobId,
      userId
    },
    include: {
      notes: {
        orderBy: { createdAt: "desc" }
      },
      reminders: {
        orderBy: { dueDate: "asc" }
      }
    }
  });
}

export async function getRemindersForUser(userId: string) {
  return prisma.reminder.findMany({
    where: {
      userId
    },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
    include: {
      savedJob: {
        select: {
          id: true,
          title: true,
          company: true,
          status: true
        }
      }
    }
  });
}
