"use client";

import { ExternalLink, Loader2, MapPin, Search, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { indiaLocationSuggestions } from "@/lib/constants";
import { formatDate, truncate } from "@/lib/utils";
import type { NormalizedJobSearchItem } from "@/types";

interface SearchResponse {
  items: NormalizedJobSearchItem[];
  page: number;
  hasMore: boolean;
  sourceMode: "live" | "fallback";
}

interface PreviewResponse {
  enrichment: {
    summary: string;
    skills: string[];
    seniority: string;
    workStyle: string;
  };
  resumeMatch: {
    score: number;
    summary: string;
    strengths: string[];
    gaps: string[];
  } | null;
  hasResume: boolean;
}

const initialState: SearchResponse = {
  items: [],
  page: 1,
  hasMore: false,
  sourceMode: "fallback"
};

export function SearchPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [response, setResponse] = useState<SearchResponse>(initialState);
  const [loading, setLoading] = useState(false);
  const [openingJobKey, setOpeningJobKey] = useState<string | null>(null);
  const [previewJob, setPreviewJob] = useState<NormalizedJobSearchItem | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [form, setForm] = useState({
    query: searchParams.get("query") ?? "frontend engineer",
    location: searchParams.get("location") ?? "India",
    remote: searchParams.get("remote") ?? "ANY",
    datePosted: searchParams.get("datePosted") ?? "all",
    employmentType: searchParams.get("employmentType") ?? "all"
  });
  const [locationSuggestions, setLocationSuggestions] = useState(indiaLocationSuggestions.slice(0, 6));

  useEffect(() => {
    handleSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const normalized = form.location.trim().toLowerCase();

    if (!normalized) {
      setLocationSuggestions(indiaLocationSuggestions.slice(0, 6));
      return;
    }

    const suggestions = indiaLocationSuggestions.filter((location) =>
      location.toLowerCase().includes(normalized)
    ).slice(0, 6);

    setLocationSuggestions(suggestions.length > 0 ? suggestions : indiaLocationSuggestions.slice(0, 6));
  }, [form.location]);

  async function handleSearch(page: number, append = false) {
    setLoading(true);

    const params = new URLSearchParams({
      ...form,
      page: String(page)
    });

    router.replace(`/dashboard/search?${params.toString()}`);

    const res = await fetch(`/api/jobs/search?${params.toString()}`);
    const data = (await res.json()) as SearchResponse | { error: string };

    if (!res.ok || "error" in data) {
      toast.error("Unable to search jobs right now.");
      setLoading(false);
      return;
    }

    setResponse((current) => ({
      ...data,
      items: append ? [...current.items, ...data.items] : data.items
    }));
    setLoading(false);
  }

  async function saveJob(job: NormalizedJobSearchItem, options?: { openAfterSave?: boolean }) {
    const jobKey = `${job.externalJobId}-${job.sourceUrl}`;

    if (options?.openAfterSave) {
      setOpeningJobKey(jobKey);
    }

    const res = await fetch("/api/saved-jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(job)
    });

    const data = (await res.json()) as {
      created?: boolean;
      error?: string;
      job?: {
        id: string;
      };
    };

    if (options?.openAfterSave) {
      setOpeningJobKey(null);
    }

    if (!res.ok) {
      toast.error(data.error ?? "Could not save job.");
      return;
    }

    toast.success(data.created ? "Job saved and enriched." : "Job already exists in your tracker.");

    if (data.job?.id) {
      const savedJobId = data.job.id;

      setResponse((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.externalJobId === job.externalJobId || item.sourceUrl === job.sourceUrl
            ? {
                ...item,
                isSaved: true,
                savedJobId
              }
            : item
        )
      }));

      setPreviewJob((current) =>
        current &&
        (current.externalJobId === job.externalJobId || current.sourceUrl === job.sourceUrl)
          ? {
              ...current,
              isSaved: true,
              savedJobId
            }
          : current
      );
    }

    if (options?.openAfterSave && data.job?.id) {
      router.push(`/dashboard/jobs/${data.job.id}`);
    }
  }

  async function openPreview(job: NormalizedJobSearchItem) {
    setPreviewJob(job);
    setPreviewData(null);
    setPreviewLoading(true);

    const res = await fetch("/api/jobs/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(job)
    });

    const data = (await res.json()) as PreviewResponse | { error?: string };

    if (!res.ok || "error" in data) {
      toast.error("Could not load AI preview for this job.");
      setPreviewLoading(false);
      return;
    }

    setPreviewData(data as PreviewResponse);
    setPreviewLoading(false);
  }

  return (
    <>
      <div className="space-y-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_0.9fr_0.9fr_0.9fr_auto]">
          <Input
            placeholder="Role or keywords"
            value={form.query}
            onChange={(event) => setForm((current) => ({ ...current, query: event.target.value }))}
          />
          <div className="space-y-2">
            <Input
              list="job-search-location-suggestions"
              placeholder="Location"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
            />
            <datalist id="job-search-location-suggestions">
              {locationSuggestions.map((location) => (
                <option key={location} value={location} />
              ))}
            </datalist>
            <div className="flex flex-wrap gap-2">
              {locationSuggestions.slice(0, 4).map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, location }))}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
          <Select
            value={form.remote}
            onChange={(event) => setForm((current) => ({ ...current, remote: event.target.value }))}
          >
            <option value="ANY">Any workplace</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">Onsite</option>
          </Select>
          <Select
            value={form.datePosted}
            onChange={(event) => setForm((current) => ({ ...current, datePosted: event.target.value }))}
          >
            <option value="all">Any time</option>
            <option value="today">Past 24 hours</option>
            <option value="3days">Past 3 days</option>
            <option value="week">Past week</option>
            <option value="month">Past month</option>
          </Select>
          <Select
            value={form.employmentType}
            onChange={(event) => setForm((current) => ({ ...current, employmentType: event.target.value }))}
          >
            <option value="all">Any type</option>
            <option value="FULL_TIME">Full time</option>
            <option value="PART_TIME">Part time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </Select>
          <Button onClick={() => handleSearch(1)} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Save any job to trigger AI enrichment with provider fallback support.
          </span>
          <Badge variant={response.sourceMode === "live" ? "success" : "warning"}>
            {response.sourceMode === "live" ? "Live JSearch data" : "Fallback demo mode"}
          </Badge>
        </div>
      </Card>

      {response.items.length === 0 && !loading ? (
        <EmptyState
          title="No jobs found yet"
          description="Try a broader keyword, a different location, or remove one of the filters to widen the results."
        />
      ) : null}

      <div className="grid gap-5">
        {response.items.map((job) => (
          <Card
            key={`${job.sourceUrl}-${job.externalJobId}`}
            className="animate-fade-up cursor-pointer transition hover:border-primary/40 hover:shadow-soft"
            role="link"
            tabIndex={0}
            onClick={() => void openPreview(job)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                void openPreview(job);
              }
            }}
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold">{job.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.company} - {job.location}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">{job.remoteType}</Badge>
                  <Badge>{job.employmentType.replaceAll("_", " ")}</Badge>
                  {job.salaryEstimate ? <Badge variant="success">{job.salaryEstimate}</Badge> : null}
                  {job.isSaved ? <Badge variant="warning">Saved Job</Badge> : null}
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                  Click card to preview AI summary and resume match
                </p>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{truncate(job.description, 320)}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                  <span>{job.datePosted ? `Posted ${formatDate(job.datePosted)}` : "Posting date unavailable"}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    void saveJob(job);
                  }}
                  disabled={job.isSaved}
                >
                  {openingJobKey === `${job.externalJobId}-${job.sourceUrl}` ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {job.isSaved ? "Already saved" : "Save Job"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (job.isSaved && job.savedJobId) {
                      router.push(`/dashboard/jobs/${job.savedJobId}`);
                      return;
                    }

                    void saveJob(job, { openAfterSave: true });
                  }}
                >
                  {job.isSaved ? "Open saved job" : "Save and open tracker"}
                </Button>
                <Button
                  variant="outline"
                  onClick={(event) => {
                    event.stopPropagation();
                    window.open(job.sourceUrl, "_blank", "noopener,noreferrer");
                  }}
                >
                  View Source
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {response.hasMore ? (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => handleSearch(response.page + 1, true)} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Load more
          </Button>
        </div>
      ) : null}
      </div>

      {previewJob ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close preview backdrop"
            className="absolute inset-0 bg-slate-950/55"
            onClick={() => {
              setPreviewJob(null);
              setPreviewData(null);
              setPreviewLoading(false);
            }}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto border-l border-border bg-background p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">AI Preview</p>
                <h2 className="mt-2 font-display text-3xl font-semibold">{previewJob.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {previewJob.company} - {previewJob.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewJob(null);
                  setPreviewData(null);
                  setPreviewLoading(false);
                }}
                className="rounded-2xl border border-border p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="primary">{previewJob.remoteType}</Badge>
              <Badge>{previewJob.employmentType.replaceAll("_", " ")}</Badge>
              {previewJob.salaryEstimate ? <Badge variant="success">{previewJob.salaryEstimate}</Badge> : null}
              {previewData ? <Badge variant="warning">{previewData.enrichment.seniority}</Badge> : null}
              {previewData ? <Badge>{previewData.enrichment.workStyle}</Badge> : null}
            </div>

            {previewLoading ? (
              <div className="mt-8 flex items-center gap-3 rounded-3xl border border-border bg-card/70 p-5">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Preparing AI summary and resume comparison...</p>
              </div>
            ) : previewData ? (
              <div className="mt-8 space-y-6">
                <Card>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">AI summary</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{previewData.enrichment.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {previewData.enrichment.skills.map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                    {previewJob.isSaved ? <Badge variant="warning">Saved Job</Badge> : null}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl font-semibold">Resume match</h3>
                    {previewData.resumeMatch ? <Badge variant="primary">{previewData.resumeMatch.score}% fit</Badge> : null}
                  </div>
                  {previewData.resumeMatch ? (
                    <div className="mt-4 space-y-4">
                      <p className="text-sm leading-7 text-muted-foreground">{previewData.resumeMatch.summary}</p>
                      <div>
                        <p className="text-sm font-semibold">Strengths</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {previewData.resumeMatch.strengths.map((item) => (
                            <Badge key={item} variant="success">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Gaps</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {previewData.resumeMatch.gaps.length > 0 ? (
                            previewData.resumeMatch.gaps.map((item) => (
                              <Badge key={item} variant="warning">
                                {item}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No obvious gaps detected.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {previewData.hasResume
                        ? "Resume comparison is not available for this preview right now."
                        : "Upload your resume in Settings to compare this job against your experience."}
                    </p>
                  )}
                </Card>

                <Card>
                  <h3 className="font-display text-2xl font-semibold">Job description</h3>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {previewJob.description}
                  </p>
                </Card>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  if (previewJob.isSaved && previewJob.savedJobId) {
                    router.push(`/dashboard/jobs/${previewJob.savedJobId}`);
                    return;
                  }

                  void saveJob(previewJob, { openAfterSave: true });
                }}
                disabled={Boolean(previewJob.isSaved && !previewJob.savedJobId)}
              >
                {openingJobKey === `${previewJob.externalJobId}-${previewJob.sourceUrl}` ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {previewJob.isSaved ? "Open saved job" : "Save and open tracker"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.open(previewJob.sourceUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View source
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
