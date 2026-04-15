import { SeniorityLabel, WorkStyleLabel } from "@prisma/client";

import { seniorityLabels, skillKeywordLibrary, workStyleLabels } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { EnrichedJobPayload } from "@/types";

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function inferSeniority(haystack: string) {
  const value = haystack.toLowerCase();

  if (/\bintern(ship)?\b/.test(value)) return SeniorityLabel.INTERN;
  if (/\bjunior\b|\bentry[- ]level\b/.test(value)) return SeniorityLabel.JUNIOR;
  if (/\blead\b|\bprincipal\b|\bhead of\b/.test(value)) return SeniorityLabel.LEAD;
  if (/\bsenior\b|\bstaff\b/.test(value)) return SeniorityLabel.SENIOR;
  if (/\bmid\b|\bintermediate\b|\bassociate\b/.test(value)) return SeniorityLabel.MID;

  return SeniorityLabel.UNKNOWN;
}

function inferWorkStyle(haystack: string) {
  const value = haystack.toLowerCase();

  if (value.includes("hybrid")) return WorkStyleLabel.HYBRID;
  if (value.includes("remote")) return WorkStyleLabel.REMOTE;
  if (value.includes("onsite") || value.includes("on-site")) return WorkStyleLabel.ONSITE;

  return WorkStyleLabel.UNKNOWN;
}

function extractSkills(haystack: string) {
  const normalized = haystack.toLowerCase();

  return skillKeywordLibrary.filter((skill) => normalized.includes(skill.toLowerCase())).slice(0, 8);
}

function extractResponsibilitySnippet(description: string) {
  const clean = stripHtml(description);
  const sentences = clean
    .split(/(?<=[.?!])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 35);

  const useful = sentences.find(
    (sentence) =>
      !/equal opportunity|benefits|about us|apply now|privacy policy|accommodation/i.test(sentence)
  );

  return useful?.slice(0, 180) ?? clean.slice(0, 180);
}

function buildSummary(input: {
  description: string;
  title: string;
  location: string;
  company?: string;
}) {
  const haystack = `${input.title} ${input.location} ${input.description}`;
  const skills = extractSkills(haystack);
  const seniority = inferSeniority(haystack);
  const workStyle = inferWorkStyle(haystack);
  const parts = [
    input.company ? `${input.title} at ${input.company}` : input.title,
    seniority !== SeniorityLabel.UNKNOWN ? `${seniorityLabels[seniority].toLowerCase()} level` : null,
    workStyle !== WorkStyleLabel.UNKNOWN ? `${workStyleLabels[workStyle].toLowerCase()} setup` : null,
    input.location ? `based in ${input.location}` : null
  ].filter(Boolean);

  const opening = `${parts.join(" with ")}.`.replace(" with based in", " based in");
  const skillLine =
    skills.length > 0
      ? `The role emphasizes ${skills.slice(0, 4).join(", ")} and related execution.`
      : null;
  const responsibilityLine = extractResponsibilitySnippet(input.description);

  return [opening, skillLine, responsibilityLine].filter(Boolean).join(" ").slice(0, 360);
}

function heuristicEnrichment(input: {
  description: string;
  title: string;
  location: string;
  company?: string;
}): EnrichedJobPayload {
  const haystack = `${input.title} ${input.location} ${stripHtml(input.description)}`;

  return {
    summary: buildSummary(input),
    skills: extractSkills(haystack),
    seniority: inferSeniority(haystack),
    workStyle: inferWorkStyle(haystack)
  };
}

async function callCompatibleAi(input: {
  description: string;
  title: string;
  location: string;
  company?: string;
}): Promise<EnrichedJobPayload | null> {
  const apiKey = process.env.FREE_AI_API_KEY;
  const apiUrl =
    process.env.FREE_AI_API_URL ?? (apiKey ? "https://openrouter.ai/api/v1/chat/completions" : undefined);
  const model = process.env.FREE_AI_MODEL ?? "openrouter/free";

  if (!apiKey || !apiUrl) {
    return null;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      "X-Title": "Job Tracker Pro AI"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You extract structured job insights. Return strict JSON only with keys: summary, skills, seniority, workStyle. The summary must be 2 concise sentences, specific, recruiter-friendly, and should explain scope, likely stack/domain, and work setup without generic filler."
        },
        {
          role: "user",
          content: `Title: ${input.title}\nCompany: ${input.company ?? "Unknown"}\nLocation: ${input.location}\nDescription: ${stripHtml(
            input.description
          )}\n\nReturn JSON with:\nsummary: exactly 2 useful sentences, no fluff, no mention of \"job description\", avoid repeating the full title verbatim if unnecessary\nskills: array of up to 8 skills\nseniority: INTERN | JUNIOR | MID | SENIOR | LEAD | UNKNOWN\nworkStyle: REMOTE | HYBRID | ONSITE | UNKNOWN`
        }
      ],
      temperature: 0.2,
      response_format: {
        type: "json_object"
      }
    })
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as Partial<EnrichedJobPayload>;

    return {
      summary: parsed.summary?.slice(0, 400) ?? buildSummary(input),
      skills: Array.isArray(parsed.skills)
        ? parsed.skills
            .filter((skill): skill is string => typeof skill === "string")
            .slice(0, 8)
        : extractSkills(`${input.title} ${input.description}`),
      seniority:
        parsed.seniority && parsed.seniority in SeniorityLabel
          ? (parsed.seniority as EnrichedJobPayload["seniority"])
          : inferSeniority(`${input.title} ${input.description}`),
      workStyle:
        parsed.workStyle && parsed.workStyle in WorkStyleLabel
          ? (parsed.workStyle as EnrichedJobPayload["workStyle"])
          : inferWorkStyle(`${input.title} ${input.description} ${input.location}`)
    };
  } catch {
    return null;
  }
}

export async function enrichJob(input: {
  description: string;
  title: string;
  location: string;
  company?: string;
}): Promise<EnrichedJobPayload> {
  const aiResult = await callCompatibleAi(input).catch(() => null);

  if (aiResult) {
    return aiResult;
  }

  return heuristicEnrichment(input);
}

export async function enrichSavedJob(savedJobId: string) {
  const job = await prisma.savedJob.findUnique({
    where: {
      id: savedJobId
    }
  });

  if (!job) {
    return null;
  }

  const enriched = await enrichJob({
    description: job.description,
    title: job.title,
    location: job.location,
    company: job.company
  });

  return prisma.savedJob.update({
    where: {
      id: savedJobId
    },
    data: {
      aiSummary: enriched.summary,
      extractedSkills: enriched.skills,
      seniority: enriched.seniority,
      workStyle: enriched.workStyle
    }
  });
}
