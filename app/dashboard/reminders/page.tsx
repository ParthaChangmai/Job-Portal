import { RemindersList } from "@/components/dashboard/reminders-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/session";
import { getRemindersForUser } from "@/lib/data/dashboard";

export default async function RemindersPage() {
  const user = await requireUser();
  const reminders = await getRemindersForUser(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Reminders"
        title="Follow-ups, all in one place"
        description="See upcoming outreach, detect overdue items, and jump directly into the related job detail page."
      />

      {reminders.length === 0 ? (
        <EmptyState
          title="No reminders yet"
          description="Create a reminder from any saved job to keep recruiter follow-ups and application deadlines visible."
        />
      ) : (
        <RemindersList
          reminders={reminders.map((reminder) => ({
            id: reminder.id,
            title: reminder.title,
            dueDate: reminder.dueDate.toISOString(),
            completed: reminder.completed,
            savedJob: reminder.savedJob
          }))}
        />
      )}
    </div>
  );
}
