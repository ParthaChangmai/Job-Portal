import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { searchJobs } from "@/lib/services/job-search";
import { searchJobsSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = searchJobsSchema.parse({
      query: url.searchParams.get("query"),
      location: url.searchParams.get("location") ?? "",
      remote: url.searchParams.get("remote") ?? "ANY",
      datePosted: url.searchParams.get("datePosted") ?? "all",
      employmentType: url.searchParams.get("employmentType") ?? "all",
      page: url.searchParams.get("page") ?? "1"
    });

    const [session, results] = await Promise.all([getCurrentSession(), searchJobs(parsed)]);

    let items = results.items;

    if (session?.user?.id && parsed.page === 1) {
      const [savedJobs] = await Promise.all([
        prisma.savedJob.findMany({
          where: {
            userId: session.user.id,
            OR: [
              {
                externalJobId: {
                  in: items.map((item) => item.externalJobId).filter(Boolean)
                }
              },
              {
                sourceUrl: {
                  in: items.map((item) => item.sourceUrl)
                }
              }
            ]
          },
          select: {
            id: true,
            externalJobId: true,
            sourceUrl: true
          }
        }),
        prisma.searchHistory.create({
          data: {
            userId: session.user.id,
            query: parsed.query,
            location: parsed.location,
            remote: parsed.remote,
            employmentType: parsed.employmentType
          }
        })
      ]);

      const byExternalId = new Map(
        savedJobs.filter((job) => job.externalJobId).map((job) => [job.externalJobId as string, job.id])
      );
      const bySourceUrl = new Map(savedJobs.map((job) => [job.sourceUrl, job.id]));

      items = items.map((item) => {
        const savedJobId = byExternalId.get(item.externalJobId) ?? bySourceUrl.get(item.sourceUrl) ?? null;

        return {
          ...item,
          isSaved: Boolean(savedJobId),
          savedJobId
        };
      });
    } else if (session?.user?.id) {
      const savedJobs = await prisma.savedJob.findMany({
        where: {
          userId: session.user.id,
          OR: [
            {
              externalJobId: {
                in: items.map((item) => item.externalJobId).filter(Boolean)
              }
            },
            {
              sourceUrl: {
                in: items.map((item) => item.sourceUrl)
              }
            }
          ]
        },
        select: {
          id: true,
          externalJobId: true,
          sourceUrl: true
        }
      });

      const byExternalId = new Map(
        savedJobs.filter((job) => job.externalJobId).map((job) => [job.externalJobId as string, job.id])
      );
      const bySourceUrl = new Map(savedJobs.map((job) => [job.sourceUrl, job.id]));

      items = items.map((item) => {
        const savedJobId = byExternalId.get(item.externalJobId) ?? bySourceUrl.get(item.sourceUrl) ?? null;

        return {
          ...item,
          isSaved: Boolean(savedJobId),
          savedJobId
        };
      });
    }

    return NextResponse.json({
      ...results,
      items
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to fetch job listings." }, { status: 400 });
  }
}
