import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth/session";
import { createReminderForUser, toggleReminderForUser } from "@/lib/services/saved-jobs";

const toggleReminderSchema = z.object({
  id: z.string().cuid(),
  completed: z.boolean()
});

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const reminder = await createReminderForUser(session.user.id, payload);
    return NextResponse.json(reminder);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create reminder." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = toggleReminderSchema.parse(await request.json());
    const reminder = await toggleReminderForUser(session.user.id, payload.id, payload.completed);
    return NextResponse.json(reminder);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update reminder." }, { status: 400 });
  }
}
