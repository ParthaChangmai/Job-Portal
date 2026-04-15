import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { extractResumeTextFromFile, upsertResumeProfileForUser } from "@/lib/services/resume";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please choose a resume file." }, { status: 400 });
    }

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Resume file is too large. Please keep it under 4 MB." }, { status: 400 });
    }

    const rawText = await extractResumeTextFromFile(file);

    if (!rawText) {
      return NextResponse.json({ error: "We could not extract readable text from that resume." }, { status: 400 });
    }

    const resumeProfile = await upsertResumeProfileForUser({
      userId: session.user.id,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      rawText
    });

    return NextResponse.json({
      id: resumeProfile.id,
      fileName: resumeProfile.fileName,
      extractedSkills: resumeProfile.extractedSkills
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to upload and analyze the resume." }, { status: 400 });
  }
}
