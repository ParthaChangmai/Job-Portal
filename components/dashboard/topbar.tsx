"use client";

import { Search } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function DashboardTopbar({ name }: { name?: string | null }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
      <form action="/dashboard/jobs" className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="query" placeholder="Search saved jobs, notes, or skills" className="pl-11" />
      </form>
      <div className="flex items-center justify-between gap-3 md:justify-end">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <p className="font-semibold">{name ?? "Your dashboard"}</p>
        </div>
        <ThemeToggle />
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
