import Link from "next/link";
import { notFound } from "next/navigation";

import { SeniorityBadge, StatusBadge, WorkStyleBadge } from "@/components/dashboard/status-badge";
import { JobMetaForm, NoteForm, ReminderForm } from "@/components/forms/job-detail-forms";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/session";
import { getSavedJobDetail } from "@/lib/data/dashboard";
import { getResumeProfileForUser, compareResumeToJob } from "@/lib/services/resume";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function SavedJobDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const job = await getSavedJobDetail(user.id, id);
  const resumeProfile = await getResumeProfileForUser(user.id);

  if (!job) {
    notFound();
  }

  const match = resumeProfile
    ? await compareResumeToJob({
        resumeText: resumeProfile.rawText,
        resumeSkills: resumeProfile.extractedSkills,
        jobTitle: job.title,
        jobDescription: job.description,
        jobSkills: job.extractedSkills,
        location: job.location
      })
    : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Saved Job"
        title={job.title}
        description={`${job.company} - ${job.location}`}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={job.status} />
              <SeniorityBadge seniority={job.seniority} />
              <WorkStyleBadge workStyle={job.workStyle} />
              {job.salaryEstimate ? <Badge variant="success">{job.salaryEstimate}</Badge> : null}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Applied</p>
                <p className="mt-2 font-semibold">{job.applicationDate ? formatDate(job.applicationDate) : "Not yet"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Follow-up</p>
                <p className="mt-2 font-semibold">{job.followUpDate ? formatDate(job.followUpDate) : "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected salary</p>
                <p className="mt-2 font-semibold">{formatCurrency(job.expectedSalary)}</p>
              </div>
            </div>
            <div className="mt-8 rounded-3xl bg-secondary/50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">AI summary</p>
              <p className="mt-3 text-sm leading-7 text-secondary-foreground">{job.aiSummary ?? "Enrichment has not produced a summary yet."}</p>
            </div>
            <div className="mt-6">
              <h2 className="font-display text-2xl font-semibold">Description</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">{job.description}</p>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Skills and prep</h2>
              {match ? <Badge variant="primary">Resume match {match.score}%</Badge> : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.extractedSkills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
            {match ? (
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                  <h3 className="font-semibold">AI fit summary</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{match.summary}</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                  <h3 className="font-semibold">Strengths</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {match.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/70 p-5 lg:col-span-2">
                  <h3 className="font-semibold">Likely gaps to address</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {match.gaps.length > 0 ? (
                      match.gaps.map((item) => (
                        <Badge key={item} variant="warning">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No obvious keyword gaps detected from the current resume.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-border bg-background/60 p-5 text-sm text-muted-foreground">
                Upload your resume in{" "}
                <Link href="/dashboard/settings" className="font-semibold text-primary hover:underline">
                  Settings
                </Link>{" "}
                to unlock AI-based job matching, strengths, and gap analysis for this role.
              </div>
            )}
            <div className="mt-6 rounded-3xl border border-border/70 bg-background/70 p-5">
              <h3 className="font-semibold">Interview prep checklist</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Review 2-3 examples tied to {job.extractedSkills[0] ?? "the role requirements"}.</li>
                <li>Tailor your resume and cover letter versions before the next outreach.</li>
                <li>Prepare one concise story about measurable impact and cross-functional collaboration.</li>
              </ul>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-2xl font-semibold">Notes</h2>
            <div className="mt-5">
              <NoteForm savedJobId={job.id} />
            </div>
            <div className="mt-6 space-y-4">
              {job.notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-sm leading-7">{note.content}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-2xl font-semibold">Application details</h2>
            <div className="mt-5">
              <JobMetaForm
                job={{
                  id: job.id,
                  status: job.status,
                  applicationDate: job.applicationDate?.toISOString() ?? null,
                  followUpDate: job.followUpDate?.toISOString() ?? null,
                  expectedSalary: job.expectedSalary,
                  resumeVersion: job.resumeVersion,
                  coverLetterVersion: job.coverLetterVersion
                }}
              />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-2xl font-semibold">Reminders</h2>
            <div className="mt-5">
              <ReminderForm savedJobId={job.id} />
            </div>
            <div className="mt-6 space-y-4">
              {job.reminders.map((reminder) => {
                const overdue = !reminder.completed && new Date(reminder.dueDate) < new Date();

                return (
                  <div key={reminder.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{reminder.title}</p>
                      {overdue ? <Badge variant="danger">Overdue</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Due {formatDate(reminder.dueDate)}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
