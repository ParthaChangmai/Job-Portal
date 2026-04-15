import { ArrowRight, BarChart3, BriefcaseBusiness, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { LogoMark } from "@/components/ui/logo";

const features = [
  {
    title: "Live job discovery",
    description: "Search live roles through JSearch on a secure server route, with a fallback demo mode for local development.",
    icon: BriefcaseBusiness
  },
  {
    title: "AI enrichment",
    description: "Summaries, extracted skills, seniority tags, and work-style detection via a free-compatible provider or local parser.",
    icon: Sparkles
  },
  {
    title: "Tracker + analytics",
    description: "Move jobs through your pipeline, log notes and reminders, and monitor application performance with clean charts.",
    icon: BarChart3
  }
];

export default function LandingPage() {
  return (
    <main className="section-grid min-h-screen">
      <section className="container py-8">
        <header className="flex items-center justify-between rounded-3xl border border-border/70 bg-card/70 px-5 py-4 shadow-soft backdrop-blur">
          <LogoMark />
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="rounded-2xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90"
            >
              Get started
            </Link>
          </div>
        </header>

        <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/75 px-6 py-16 shadow-soft backdrop-blur md:px-12 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.18),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.14),transparent_22%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                Free job import + smart AI enrichment
              </div>
              <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
                Search real listings, save the right roles, and manage your application pipeline without spreadsheet chaos.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Job Tracker Pro AI is a portfolio-ready full-stack app for modern job hunting: live search, personal tracking, reminders,
                analytics, and AI-assisted job insights with a safe local fallback.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center rounded-2xl bg-primary px-5 py-3 font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90"
                >
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center rounded-2xl border border-border bg-background/80 px-5 py-3 font-medium shadow-soft transition hover:bg-muted"
                >
                  Open demo account
                </Link>
              </div>
              <div className="mt-8 text-sm text-muted-foreground">
                Demo login: <span className="font-semibold text-foreground">demo@jobtrackerpro.ai</span> /{" "}
                <span className="font-semibold text-foreground">Demo@12345</span>
              </div>
            </div>

            <Card className="relative overflow-hidden bg-slate-950 p-0 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.22),transparent_28%)]" />
              <div className="relative space-y-6 p-8">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-300">Weekly momentum</p>
                  <p className="mt-3 font-display text-4xl font-semibold">+7 applications</p>
                  <p className="mt-2 text-sm text-slate-400">Steady flow across product, frontend, and full-stack roles.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-300">Pipeline</p>
                    <p className="mt-3 text-2xl font-semibold">24 tracked jobs</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-slate-300">Top skill</p>
                    <p className="mt-3 text-2xl font-semibold">TypeScript</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-300">AI summary example</p>
                  <p className="mt-3 text-sm leading-7 text-slate-100">
                    Senior full-stack role focused on scalable product delivery, mentoring, and backend ownership across Node.js,
                    PostgreSQL, and cloud systems.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title}>
                <div className="mb-5 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl font-semibold">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
