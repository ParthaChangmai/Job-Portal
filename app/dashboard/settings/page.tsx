import { ResumeUploadForm } from "@/components/forms/resume-upload-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/session";
import { getSettingsData } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/utils";

export default async function SettingsPage() {
  const user = await requireUser();
  const data = await getSettingsData(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Workspace, resume, and integrations"
        description="Manage your profile, upload the resume used for AI match analysis, and review the app's free-tier integrations."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl font-semibold">Profile</h2>
          <div className="mt-5 space-y-3 text-sm">
            <p>
              <span className="font-semibold">Name:</span> {user.name ?? "No name set"}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p className="text-muted-foreground">
              Credentials auth is available by default. GitHub login appears automatically when `GITHUB_ID` and `GITHUB_SECRET`
              are configured.
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-2xl font-semibold">Resume matching</h2>
          <div className="mt-5 space-y-4 text-sm text-muted-foreground">
            <p>
              Upload your resume once and the app will summarize it, extract skills, and compare it against saved jobs.
            </p>
            {!data.resumeFeatureReady ? (
              <p>
                Resume matching is temporarily unavailable because your database has not been updated with the latest schema yet.
              </p>
            ) : data.resumeProfile ? (
              <p>
                Current resume updated on {formatDate(data.resumeProfile.updatedAt)}.
              </p>
            ) : (
              <p>No resume uploaded yet. Upload one to unlock job-fit analysis.</p>
            )}
          </div>
          <div className="mt-5">
            <ResumeUploadForm
              existingResume={
                data.resumeProfile
                  ? {
                      fileName: data.resumeProfile.fileName,
                      updatedAt: data.resumeProfile.updatedAt.toISOString(),
                      aiSummary: data.resumeProfile.aiSummary,
                      extractedSkills: data.resumeProfile.extractedSkills
                    }
                  : null
              }
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-2xl font-semibold">Integrations</h2>
          <div className="mt-5 space-y-4 text-sm text-muted-foreground">
            <p>
              Job search uses secure server-side JSearch calls when `JSEARCH_API_KEY` exists, and automatically falls back to demo
              listings when it does not.
            </p>
            <p>
              AI enrichment and resume-job comparison use a free-compatible provider when `FREE_AI_API_KEY` is configured. The app
              defaults cleanly to OpenRouter-compatible requests and falls back to local heuristics if no key exists.
            </p>
            <p>
              This project is designed for free-tier deployment on Vercel plus Neon or Supabase Postgres.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
