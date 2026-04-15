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

    if (session?.user?.id && parsed.page === 1) {
      await prisma.searchHistory.create({
        data: {
          userId: session.user.id,
          query: parsed.query,
          location: parsed.location,
          remote: parsed.remote,
          employmentType: parsed.employmentType
        }
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to fetch job listings." }, { status: 400 });
  }
}
