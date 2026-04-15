import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { saveJobForUser } from "@/lib/services/saved-jobs";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const result = await saveJobForUser(session.user.id, payload);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to save job." }, { status: 400 });
  }
}
