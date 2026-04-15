import { SeniorityLabel, WorkStyleLabel } from "@prisma/client";

import { skillKeywordLibrary } from "@/lib/constants";
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

function buildSummary(description: string) {
  const clean = stripHtml(description);
  const sentences = clean
    .split(/(?<=[.?!])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.slice(0, 2).join(" ").slice(0, 320) || clean.slice(0, 320);
}

function heuristicEnrichment(input: {
  description: string;
  title: string;
  location: string;
}): EnrichedJobPayload {
  const haystack = `${input.title} ${input.location} ${stripHtml(input.description)}`;

  return {
    summary: buildSummary(input.description),
    skills: extractSkills(haystack),
    seniority: inferSeniority(haystack),
    workStyle: inferWorkStyle(haystack)
  };
}

async function callCompatibleAi(input: {
  description: string;
  title: string;
  location: string;
}): Promise<EnrichedJobPayload | null> {
  const apiKey = process.env.FREE_AI_API_KEY;
  const apiUrl = process.env.FREE_AI_API_URL;
  const model = process.env.FREE_AI_MODEL ?? "openai/gpt-4.1-mini";

  if (!apiKey || !apiUrl) {
    return null;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You extract structured job insights. Return strict JSON only with keys: summary, skills, seniority, workStyle."
        },
        {
          role: "user",
          content: `Title: ${input.title}\nLocation: ${input.location}\nDescription: ${stripHtml(
            input.description
          )}\n\nReturn JSON with:\nsummary: short plain-English summary\nskills: array of up to 8 skills\nseniority: INTERN | JUNIOR | MID | SENIOR | LEAD | UNKNOWN\nworkStyle: REMOTE | HYBRID | ONSITE | UNKNOWN`
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
      summary: parsed.summary?.slice(0, 400) ?? buildSummary(input.description),
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
    location: job.location
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
