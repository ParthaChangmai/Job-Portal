"use client";

import { Download, LayoutGrid, TableProperties } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { jobStatuses, statusLabels } from "@/lib/constants";
import { formatDate, formatRelativeDate } from "@/lib/utils";

interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  status: keyof typeof statusLabels;
  followUpDate: string | null;
  applicationDate: string | null;
  extractedSkills: string[];
  aiSummary: string | null;
  updatedAt: string;
}

export function JobsView({ jobs }: { jobs: JobItem[] }) {
  const router = useRouter();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [isPending, startTransition] = useTransition();
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [activeDropStatus, setActiveDropStatus] = useState<string | null>(null);

  const grouped = useMemo(
    () =>
      jobStatuses.map((status) => ({
        status,
        jobs: jobs.filter((job) => job.status === status)
      })),
    [jobs]
  );

  async function updateStatus(jobId: string, status: string) {
    startTransition(async () => {
      const response = await fetch(`/api/saved-jobs/${jobId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status
        })
      });

      if (!response.ok) {
        toast.error("Unable to update status.");
        return;
      }

      toast.success("Job status updated.");
      router.refresh();
    });
  }

  function handleDrop(jobId: string, nextStatus: string) {
    const currentJob = jobs.find((job) => job.id === jobId);

    setDraggedJobId(null);
    setActiveDropStatus(null);

    if (!currentJob || currentJob.status === nextStatus) {
      return;
    }

    void updateStatus(jobId, nextStatus);
  }

  function exportCsv() {
    const lines = [
      ["Title", "Company", "Status", "Location", "Application Date", "Follow-up Date", "Skills"].join(","),
      ...jobs.map((job) =>
        [
          job.title,
          job.company,
          statusLabels[job.status],
          job.location,
          job.applicationDate ? formatDate(job.applicationDate) : "",
          job.followUpDate ? formatDate(job.followUpDate) : "",
          job.extractedSkills.join(" | ")
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "job-tracker-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function openJob(jobId: string) {
    router.push(`/dashboard/jobs/${jobId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setView("kanban")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${view === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <span className="inline-flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </span>
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <span className="inline-flex items-center gap-2">
              <TableProperties className="h-4 w-4" />
              Table
            </span>
          </button>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {view === "kanban" ? (
        <div className="grid gap-5 xl:grid-cols-3 2xl:grid-cols-6">
          {grouped.map((column) => (
            <Card
              key={column.status}
              className={`p-4 transition ${activeDropStatus === column.status ? "border-primary bg-primary/5" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                if (draggedJobId) {
                  setActiveDropStatus(column.status);
                }
              }}
              onDragLeave={() => {
                if (activeDropStatus === column.status) {
                  setActiveDropStatus(null);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                const jobId = event.dataTransfer.getData("text/plain") || draggedJobId;

                if (jobId) {
                  handleDrop(jobId, column.status);
                }
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {statusLabels[column.status]}
                </h3>
                <Badge>{column.jobs.length}</Badge>
              </div>
              <div className="space-y-4">
                {column.jobs.map((job) => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(event) => {
                      setDraggedJobId(job.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", job.id);
                    }}
                    onDragEnd={() => {
                      setDraggedJobId(null);
                      setActiveDropStatus(null);
                    }}
                    onClick={() => openJob(job.id)}
                    className={`cursor-pointer rounded-2xl border border-border/70 bg-background/80 p-4 transition ${
                      draggedJobId === job.id ? "opacity-60 ring-2 ring-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/dashboard/jobs/${job.id}`} className="font-semibold hover:text-primary">
                          {job.title}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{job.location}</p>
                    <p className="mt-3 text-sm">{job.aiSummary ?? "No summary yet."}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.extractedSkills.slice(0, 3).map((skill) => (
                        <Badge key={skill}>{skill}</Badge>
                      ))}
                    </div>
                    <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Drag to another column to change status
                    </p>
                    <div className="mt-4">
                      <select
                        value={job.status}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => updateStatus(job.id, event.target.value)}
                        disabled={isPending}
                        className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm"
                      >
                        {jobStatuses.map((status) => (
                          <option key={status} value={status}>
                            Move to {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Follow-up</th>
                <th className="px-5 py-4 font-medium">Updated</th>
                <th className="px-5 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="cursor-pointer border-b border-border/60 transition hover:bg-muted/30 last:border-0"
                  onClick={() => openJob(job.id)}
                >
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/jobs/${job.id}`} className="font-semibold hover:text-primary">
                      {job.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {job.company} - {job.location}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {job.followUpDate ? formatRelativeDate(job.followUpDate) : "No reminder"}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{formatRelativeDate(job.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <select
                      value={job.status}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => updateStatus(job.id, event.target.value)}
                      disabled={isPending}
                      className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
                    >
                      {jobStatuses.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
