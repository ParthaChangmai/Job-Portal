import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { addNoteToJobForUser } from "@/lib/services/saved-jobs";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const { id } = await context.params;
    const note = await addNoteToJobForUser(session.user.id, id, payload);
    return NextResponse.json(note);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create note." }, { status: 400 });
  }
}
