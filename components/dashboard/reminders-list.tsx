"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatRelativeDate } from "@/lib/utils";

export function RemindersList({
  reminders
}: {
  reminders: Array<{
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
    savedJob: {
      id: string;
      title: string;
      company: string;
      status: string;
    };
  }>;
}) {
  const router = useRouter();

  async function toggleReminder(id: string, completed: boolean) {
    const res = await fetch("/api/reminders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id,
        completed
      })
    });

    if (!res.ok) {
      toast.error("Could not update reminder.");
      return;
    }

    toast.success(completed ? "Reminder completed." : "Reminder reopened.");
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      {reminders.map((reminder) => {
        const overdue = !reminder.completed && new Date(reminder.dueDate) < new Date();

        return (
          <Card key={reminder.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{reminder.title}</h3>
                {reminder.completed ? <Badge variant="success">Done</Badge> : null}
                {overdue ? <Badge variant="danger">Overdue</Badge> : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                For{" "}
                <Link href={`/dashboard/jobs/${reminder.savedJob.id}`} className="font-medium text-foreground hover:text-primary">
                  {reminder.savedJob.title}
                </Link>{" "}
                at {reminder.savedJob.company}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Due {formatDate(reminder.dueDate)} - {formatRelativeDate(reminder.dueDate)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => toggleReminder(reminder.id, !reminder.completed)}>
                {reminder.completed ? "Reopen" : "Mark complete"}
              </Button>
              <Button variant="ghost" onClick={() => router.push(`/dashboard/jobs/${reminder.savedJob.id}`)}>
                Open job
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
