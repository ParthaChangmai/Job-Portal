"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { jobStatuses, statusLabels } from "@/lib/constants";

export function JobMetaForm({
  job
}: {
  job: {
    id: string;
    status: string;
    applicationDate: string | null;
    followUpDate: string | null;
    expectedSalary: number | null;
    resumeVersion: string | null;
    coverLetterVersion: string | null;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    status: job.status,
    applicationDate: job.applicationDate ? job.applicationDate.slice(0, 10) : "",
    followUpDate: job.followUpDate ? job.followUpDate.slice(0, 10) : "",
    expectedSalary: job.expectedSalary ? String(job.expectedSalary) : "",
    resumeVersion: job.resumeVersion ?? "",
    coverLetterVersion: job.coverLetterVersion ?? ""
  });

  function submit() {
    startTransition(async () => {
      const res = await fetch(`/api/saved-jobs/${job.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: form.status,
          applicationDate: form.applicationDate || null,
          followUpDate: form.followUpDate || null,
          expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : null,
          resumeVersion: form.resumeVersion || null,
          coverLetterVersion: form.coverLetterVersion || null
        })
      });

      if (!res.ok) {
        toast.error("Could not update job details.");
        return;
      }

      toast.success("Job details updated.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Status</label>
        <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
          {jobStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Application date</label>
          <Input
            type="date"
            value={form.applicationDate}
            onChange={(event) => setForm((current) => ({ ...current, applicationDate: event.target.value }))}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Follow-up date</label>
          <Input
            type="date"
            value={form.followUpDate}
            onChange={(event) => setForm((current) => ({ ...current, followUpDate: event.target.value }))}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Expected salary</label>
          <Input
            type="number"
            placeholder="120000"
            value={form.expectedSalary}
            onChange={(event) => setForm((current) => ({ ...current, expectedSalary: event.target.value }))}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Resume version</label>
          <Input
            value={form.resumeVersion}
            onChange={(event) => setForm((current) => ({ ...current, resumeVersion: event.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Cover letter version</label>
        <Input
          value={form.coverLetterVersion}
          onChange={(event) => setForm((current) => ({ ...current, coverLetterVersion: event.target.value }))}
        />
      </div>
      <Button onClick={submit} disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save changes
      </Button>
    </div>
  );
}

export function NoteForm({ savedJobId }: { savedJobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/saved-jobs/${savedJobId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content })
    });

    setLoading(false);

    if (!res.ok) {
      toast.error("Could not save note.");
      return;
    }

    toast.success("Note added.");
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Textarea
        placeholder="Add interview notes, follow-up context, or prep reminders"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Add note
      </Button>
    </form>
  );
}

export function ReminderForm({ savedJobId }: { savedJobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        savedJobId,
        title,
        dueDate
      })
    });

    setLoading(false);

    if (!res.ok) {
      toast.error("Could not create reminder.");
      return;
    }

    toast.success("Reminder created.");
    setTitle("");
    setDueDate("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input placeholder="Follow up with recruiter" value={title} onChange={(event) => setTitle(event.target.value)} required />
      <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
      <Button type="submit" variant="secondary" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create reminder
      </Button>
    </form>
  );
}
