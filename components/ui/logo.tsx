export function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-amber-400 text-sm font-bold text-white shadow-soft">
        JT
      </div>
      <div>
        <p className="font-display text-base font-semibold leading-none">Job Tracker Pro AI</p>
        <p className="mt-1 text-xs text-muted-foreground">Search. Save. Apply smarter.</p>
      </div>
    </div>
  );
}
