import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Not found</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">This page doesn&apos;t exist.</h1>
        <p className="mt-3 text-muted-foreground">The route may have moved, or the job you were trying to open is no longer available.</p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
