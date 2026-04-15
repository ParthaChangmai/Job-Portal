"use client";

import { Loader2, MapPin, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDate, truncate } from "@/lib/utils";
import type { NormalizedJobSearchItem } from "@/types";

interface SearchResponse {
  items: NormalizedJobSearchItem[];
  page: number;
  hasMore: boolean;
  sourceMode: "live" | "fallback";
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
  const [form, setForm] = useState({
    query: searchParams.get("query") ?? "frontend engineer",
    location: searchParams.get("location") ?? "",
    remote: searchParams.get("remote") ?? "ANY",
    datePosted: searchParams.get("datePosted") ?? "all",
    employmentType: searchParams.get("employmentType") ?? "all"
  });

  useEffect(() => {
    handleSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function saveJob(job: NormalizedJobSearchItem) {
    const res = await fetch("/api/saved-jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(job)
    });

    const data = (await res.json()) as { created?: boolean; error?: string };

    if (!res.ok) {
      toast.error(data.error ?? "Could not save job.");
      return;
    }

    toast.success(data.created ? "Job saved and enriched." : "Job already exists in your tracker.");
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_0.9fr_0.9fr_0.9fr_auto]">
          <Input
            placeholder="Role or keywords"
            value={form.query}
            onChange={(event) => setForm((current) => ({ ...current, query: event.target.value }))}
          />
          <Input
            placeholder="Location"
            value={form.location}
            onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
          />
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
          <Card key={`${job.sourceUrl}-${job.externalJobId}`} className="animate-fade-up">
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
                </div>
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
                <Button onClick={() => saveJob(job)}>Save Job</Button>
                <Button variant="outline" onClick={() => window.open(job.sourceUrl, "_blank", "noopener,noreferrer")}>
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
  );
}
