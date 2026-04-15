import { subWeeks, startOfWeek } from "date-fns";

import { prisma } from "@/lib/prisma";

export async function getAnalyticsForUser(userId: string) {
  const jobs = await prisma.savedJob.findMany({
    where: {
      userId
    },
    select: {
      id: true,
      company: true,
      status: true,
      applicationDate: true,
      extractedSkills: true,
      createdAt: true
    }
  });

  const totalSavedJobs = jobs.length;
  const totalApplied = jobs.filter((job) => job.status !== "SAVED" && job.status !== "ARCHIVED").length;
  const interviews = jobs.filter((job) => job.status === "INTERVIEWING").length;
  const offers = jobs.filter((job) => job.status === "OFFER").length;
  const rejected = jobs.filter((job) => job.status === "REJECTED").length;
  const applicationsThisWeek = jobs.filter((job) => {
    if (!job.applicationDate) return false;

    return job.applicationDate >= subWeeks(new Date(), 1);
  }).length;

  const rejectionRate = totalApplied ? Math.round((rejected / totalApplied) * 100) : 0;

  const applicationsByWeek = Array.from({ length: 8 }, (_, index) => {
    const weekStart = startOfWeek(subWeeks(new Date(), 7 - index), { weekStartsOn: 1 });
    const count = jobs.filter((job) => {
      if (!job.applicationDate) return false;

      return startOfWeek(job.applicationDate, { weekStartsOn: 1 }).getTime() === weekStart.getTime();
    }).length;

    return {
      week: weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      }),
      applications: count
    };
  });

  const jobsByStatus = Object.entries(
    jobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, value]) => ({
    status,
    value
  }));

  const topCompanies = Object.entries(
    jobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.company] = (acc[job.company] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([company, count]) => ({
      company,
      count
    }));

  const topSkills = Object.entries(
    jobs.reduce<Record<string, number>>((acc, job) => {
      for (const skill of job.extractedSkills) {
        acc[skill] = (acc[skill] ?? 0) + 1;
      }

      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({
      skill,
      count
    }));

  return {
    metrics: {
      totalSavedJobs,
      totalApplied,
      interviews,
      offers,
      rejectionRate,
      applicationsThisWeek
    },
    charts: {
      applicationsByWeek,
      jobsByStatus,
      topCompanies,
      topSkills
    }
  };
}
