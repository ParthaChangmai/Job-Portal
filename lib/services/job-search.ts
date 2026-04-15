import type { EmploymentType, RemoteType } from "@/types";
import type { NormalizedJobSearchItem, SearchFilters } from "@/types";

import { mockJobResults } from "@/lib/data/mock-jobs";

interface JSearchJob {
  job_id?: string;
  job_title?: string;
  employer_name?: string;
  employer_logo?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_employment_type?: string;
  job_apply_link?: string;
  job_description?: string;
  job_posted_at_datetime_utc?: string;
  job_is_remote?: boolean;
  job_city_slug?: string;
  job_google_link?: string;
  job_min_salary?: number;
  job_max_salary?: number;
}

function mapEmploymentType(value?: string | null): EmploymentType {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("full")) return "FULL_TIME";
  if (normalized.includes("part")) return "PART_TIME";
  if (normalized.includes("intern")) return "INTERNSHIP";
  if (normalized.includes("contract")) return "CONTRACT";
  if (normalized.includes("temp")) return "TEMPORARY";

  return "UNKNOWN";
}

function mapRemoteType(raw: {
  remote?: boolean;
  title?: string;
  description?: string;
}): RemoteType {
  const haystack = `${raw.title ?? ""} ${raw.description ?? ""}`.toLowerCase();

  if (raw.remote || haystack.includes("remote")) return "REMOTE";
  if (haystack.includes("hybrid")) return "HYBRID";
  if (haystack.includes("on-site") || haystack.includes("onsite")) return "ONSITE";

  return "UNKNOWN";
}

function formatSalary(job: JSearchJob) {
  if (!job.job_min_salary && !job.job_max_salary) {
    return null;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

  if (job.job_min_salary && job.job_max_salary) {
    return `${formatter.format(job.job_min_salary)} - ${formatter.format(job.job_max_salary)}`;
  }

  return formatter.format(job.job_min_salary ?? job.job_max_salary ?? 0);
}

function normalizeJob(job: JSearchJob): NormalizedJobSearchItem {
  const location =
    [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ") || "Location not listed";

  return {
    externalJobId: job.job_id ?? job.job_apply_link ?? crypto.randomUUID(),
    title: job.job_title ?? "Untitled role",
    company: job.employer_name ?? "Unknown company",
    location,
    remoteType: mapRemoteType({
      remote: job.job_is_remote,
      title: job.job_title,
      description: job.job_description
    }),
    employmentType: mapEmploymentType(job.job_employment_type),
    salaryEstimate: formatSalary(job),
    source: "JSearch",
    sourceUrl: job.job_apply_link ?? job.job_google_link ?? "https://www.google.com/search?q=jobs",
    companyLogo: job.employer_logo ?? null,
    datePosted: job.job_posted_at_datetime_utc ?? null,
    description: job.job_description ?? "No description provided."
  };
}

function filterFallbackResults(filters: SearchFilters) {
  const query = (filters.query ?? "").toLowerCase();
  const location = (filters.location ?? "").toLowerCase();
  const remote = (filters.remote ?? "").toLowerCase();
  const employmentType = (filters.employmentType ?? "").toLowerCase();

  return mockJobResults.filter((job) => {
    const matchesQuery =
      !query ||
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query);

    const matchesLocation = !location || job.location.toLowerCase().includes(location);
    const matchesRemote = !remote || remote === "any" || job.remoteType.toLowerCase() === remote;
    const matchesEmployment =
      !employmentType ||
      employmentType === "all" ||
      job.employmentType.toLowerCase() === employmentType.toLowerCase();

    return matchesQuery && matchesLocation && matchesRemote && matchesEmployment;
  });
}

export async function searchJobs(filters: SearchFilters) {
  const apiKey = process.env.JSEARCH_API_KEY;
  const host = process.env.JSEARCH_API_HOST ?? "jsearch.p.rapidapi.com";

  if (!apiKey) {
    return {
      items: filterFallbackResults(filters),
      page: filters.page ?? 1,
      hasMore: false,
      sourceMode: "fallback" as const
    };
  }

  const queryParts = [
    filters.query,
    filters.location ? `in ${filters.location}` : "",
    filters.remote && filters.remote !== "ANY" ? filters.remote.toLowerCase() : ""
  ]
    .filter(Boolean)
    .join(" ");

  const params = new URLSearchParams({
    query: queryParts,
    page: String(filters.page ?? 1),
    num_pages: "1",
    date_posted: filters.datePosted && filters.datePosted !== "all" ? filters.datePosted : "all"
  });

  try {
    const response = await fetch(`https://${host}/search?${params.toString()}`, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": host
      },
      next: {
        revalidate: 300
      }
    });

    if (!response.ok) {
      return {
        items: filterFallbackResults(filters),
        page: filters.page ?? 1,
        hasMore: false,
        sourceMode: "fallback" as const
      };
    }

    const payload = (await response.json()) as {
      data?: JSearchJob[];
    };

    const normalized = (payload.data ?? []).map(normalizeJob).filter((job) => {
      if (filters.remote && filters.remote !== "ANY" && job.remoteType !== filters.remote) {
        return false;
      }

      if (
        filters.employmentType &&
        filters.employmentType !== "all" &&
        job.employmentType !== filters.employmentType
      ) {
        return false;
      }

      return true;
    });

    return {
      items: normalized,
      page: filters.page ?? 1,
      hasMore: normalized.length >= 10,
      sourceMode: "live" as const
    };
  } catch {
    return {
      items: filterFallbackResults(filters),
      page: filters.page ?? 1,
      hasMore: false,
      sourceMode: "fallback" as const
    };
  }
}
