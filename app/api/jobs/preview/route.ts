import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { enrichJob } from "@/lib/services/enrichment";
import { compareResumeToJob, getResumeProfileForUser } from "@/lib/services/resume";
import { saveJobSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = saveJobSchema.parse(await request.json());
    const [enrichment, resumeProfile] = await Promise.all([
      enrichJob({
        description: payload.description,
        title: payload.title,
        location: payload.location,
        company: payload.company
      }),
      getResumeProfileForUser(session.user.id)
    ]);

    const resumeMatch = resumeProfile
      ? await compareResumeToJob({
          resumeText: resumeProfile.rawText,
          resumeSkills: resumeProfile.extractedSkills,
          jobTitle: payload.title,
          jobDescription: payload.description,
          jobSkills: enrichment.skills,
          location: payload.location
        })
      : null;

    return NextResponse.json({
      enrichment,
      resumeMatch,
      hasResume: Boolean(resumeProfile)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to preview this job right now." }, { status: 400 });
  }
}
