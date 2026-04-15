import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/session";
import { getDashboardHomeData } from "@/lib/data/dashboard";
import { formatRelativeDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardHomeData(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Keep your search moving with clarity"
        description="Monitor applications, see what needs follow-up, and keep your pipeline healthy without leaving the dashboard."
        action={
          <Link
            href="/dashboard/search"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Search jobs
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Saved jobs" value={data.analytics.metrics.totalSavedJobs} hint="Everything currently tracked in your workspace." />
        <MetricCard label="Applications" value={data.analytics.metrics.totalApplied} hint={`${data.analytics.metrics.applicationsThisWeek} added in the last week.`} />
        <MetricCard label="Offer rate snapshot" value={`${data.analytics.metrics.offers} offers`} hint={`${data.analytics.metrics.rejectionRate}% rejection rate across active applications.`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold">Recent jobs</h2>
              <p className="mt-1 text-sm text-muted-foreground">Jump back into the roles you touched most recently.</p>
            </div>
            <Link href="/dashboard/jobs" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {data.recentJobs.map((job) => (
              <div key={job.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <Link href={`/dashboard/jobs/${job.id}`} className="font-semibold hover:text-primary">
                      {job.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.company} - {job.location}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {job.notes[0]?.content ?? job.aiSummary ?? "No notes yet."}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-2xl font-semibold">Upcoming reminders</h2>
          <p className="mt-1 text-sm text-muted-foreground">Stay on top of follow-ups and recruiter nudges.</p>
          <div className="mt-6 space-y-4">
            {data.reminders.map((reminder) => {
              const overdue = !reminder.completed && new Date(reminder.dueDate) < new Date();

              return (
                <div key={reminder.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{reminder.title}</p>
                    {overdue ? <span className="text-sm font-medium text-danger">Overdue</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {reminder.savedJob.company} - {formatRelativeDate(reminder.dueDate)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recent searches</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.searchHistory.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/search?query=${encodeURIComponent(item.query)}&location=${encodeURIComponent(item.location ?? "")}`}
                  className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
                >
                  {item.query}
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
