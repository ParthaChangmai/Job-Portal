import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Workspace and integration notes"
        description="A lightweight settings page for profile context, environment-based integrations, and deployment readiness."
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
          <h2 className="font-display text-2xl font-semibold">Integrations</h2>
          <div className="mt-5 space-y-4 text-sm text-muted-foreground">
            <p>
              Job search uses secure server-side JSearch calls when `JSEARCH_API_KEY` exists, and automatically falls back to demo
              listings when it does not.
            </p>
            <p>
              AI enrichment uses a free-compatible provider when `FREE_AI_API_KEY` and `FREE_AI_API_URL` are configured. Otherwise,
              a local rule-based parser extracts skills, seniority, work style, and a short summary.
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
