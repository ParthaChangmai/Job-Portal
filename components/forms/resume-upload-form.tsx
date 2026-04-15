"use client";

import { Loader2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ResumeUploadForm({
  existingResume
}: {
  existingResume?: {
    fileName: string;
    updatedAt: string;
    aiSummary: string | null;
    extractedSkills: string[];
  } | null;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      toast.error("Choose a resume file first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch("/api/resume", {
      method: "POST",
      body: formData
    });

    const data = (await response.json()) as { error?: string };

    setLoading(false);

    if (!response.ok) {
      toast.error(data.error ?? "Could not upload your resume.");
      return;
    }

    toast.success("Resume uploaded and analyzed.");
    setFile(null);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {existingResume ? (
        <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
          <p className="font-semibold">{existingResume.fileName}</p>
          <p className="mt-2 text-sm text-muted-foreground">{existingResume.aiSummary ?? "Resume analyzed and ready for job matching."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {existingResume.extractedSkills.slice(0, 8).map((skill) => (
              <span key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-dashed border-border bg-card/60 p-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Upload resume</label>
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-2xl file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-primary-foreground"
          />
          <p className="mt-2 text-xs text-muted-foreground">Supported: PDF, DOCX, TXT, MD. Max file size: 4 MB.</p>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
          {existingResume ? "Replace resume" : "Upload resume"}
        </Button>
      </form>
    </div>
  );
}
