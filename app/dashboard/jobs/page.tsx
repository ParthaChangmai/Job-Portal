import Link from "next/link";

import { JobsView } from "@/components/dashboard/jobs-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { requireUser } from "@/lib/auth/session";
import { getJobsForUser } from "@/lib/data/dashboard";
import { jobStatuses, statusLabels } from "@/lib/constants";

export default async function DashboardJobsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const normalizedParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  const data = await getJobsForUser(user.id, normalizedParams);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="My Jobs"
        title="Manage your application pipeline"
        description="Filter by status, company, skill, location, work style, and text search to keep the right roles in focus."
        action={
          <Link
            href="/dashboard/search"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Import more jobs
          </Link>
        }
      />

      <Card>
        <form className="grid gap-4 lg:grid-cols-4 xl:grid-cols-9">
          <Input name="query" placeholder="Search title, company, notes, skills" defaultValue={data.filters.query} />
          <Select name="status" defaultValue={data.filters.status}>
            <option value="all">All statuses</option>
            {jobStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </Select>
          <Select name="company" defaultValue={data.filters.company}>
            <option value="">All companies</option>
            {data.companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </Select>
          <Select name="skill" defaultValue={data.filters.skill}>
            <option value="">All skills</option>
            {data.skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </Select>
          <Input name="location" placeholder="Location" defaultValue={data.filters.location} />
          <Select name="remoteType" defaultValue={data.filters.remoteType}>
            <option value="all">Any work style</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">Onsite</option>
            <option value="UNKNOWN">Unknown</option>
          </Select>
          <Input type="date" name="from" defaultValue={data.filters.from} />
          <Input type="date" name="to" defaultValue={data.filters.to} />
          <Button type="submit">Apply filters</Button>
        </form>
      </Card>

      {data.jobs.length === 0 ? (
        <EmptyState
          title="No saved jobs match these filters"
          description="Try clearing one or two filters, or bring in new opportunities from the search page."
          action={
            <Link
              href="/dashboard/search"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Search jobs
            </Link>
          }
        />
      ) : (
        <JobsView
          jobs={data.jobs.map((job) => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            status: job.status,
            followUpDate: job.followUpDate?.toISOString() ?? null,
            applicationDate: job.applicationDate?.toISOString() ?? null,
            extractedSkills: job.extractedSkills,
            aiSummary: job.aiSummary,
            updatedAt: job.updatedAt.toISOString()
          }))}
        />
      )}
    </div>
  );
}
