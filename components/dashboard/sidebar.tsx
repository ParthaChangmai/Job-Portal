"use client";

import { Menu, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { dashboardNav } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/logo";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {dashboardNav.map((item) => {
        const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-border/60 bg-card/70 p-6 backdrop-blur xl:flex">
        <LogoMark />
        <div className="mt-10 flex-1 overflow-y-auto pr-1">
          <NavLinks />
        </div>
        <div className="mt-auto rounded-3xl bg-secondary/60 p-5 text-sm text-secondary-foreground">
          <p className="font-semibold">Free-tier friendly</p>
          <p className="mt-2 text-secondary-foreground/80">
            Built to run on Vercel plus Neon or Supabase Postgres, with a fallback search mode when API keys are missing.
          </p>
        </div>
      </aside>

      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-2xl border border-border bg-card p-3 shadow-soft xl:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Close navigation backdrop"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <LogoMark />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="rounded-2xl border border-border p-2"
              >
                <PanelLeftClose className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
