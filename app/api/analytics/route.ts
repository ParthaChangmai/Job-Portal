import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { getAnalyticsForUser } from "@/lib/services/analytics";

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const analytics = await getAnalyticsForUser(session.user.id);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load analytics." }, { status: 400 });
  }
}
