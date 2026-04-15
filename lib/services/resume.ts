import mammoth from "mammoth";
import pdfParse from "pdf-parse";

import { skillKeywordLibrary } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";
import type { ResumeInsightsPayload, ResumeJobMatchPayload } from "@/types";

function stripWhitespace(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function normalizeSkillMatches(input: string) {
  const haystack = input.toLowerCase();

  return skillKeywordLibrary.filter((skill) => haystack.includes(skill.toLowerCase())).slice(0, 12);
}

function summarizeText(input: string, maxLength = 320) {
  const clean = stripWhitespace(input);
  const sentences = clean
    .split(/(?<=[.?!])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return (sentences.slice(0, 2).join(" ") || clean).slice(0, maxLength);
}

async function callCompatibleAiJson<T>(payload: {
  system: string;
  user: string;
}): Promise<T | null> {
  const apiKey = process.env.FREE_AI_API_KEY;
  const apiUrl =
    process.env.FREE_AI_API_URL ?? (apiKey ? "https://openrouter.ai/api/v1/chat/completions" : undefined);
  const model = process.env.FREE_AI_MODEL ?? "openrouter/auto";

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
          content: payload.system
        },
        {
          role: "user",
          content: payload.user
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

  const json = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = json.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function extractResumeTextFromFile(file: File) {
  const fileName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
    const parsed = await pdfParse(buffer);
    return stripWhitespace(parsed.text);
  }

  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    const parsed = await mammoth.extractRawText({
      buffer
    });
    return stripWhitespace(parsed.value);
  }

  if (file.type.startsWith("text/") || fileName.endsWith(".txt") || fileName.endsWith(".md")) {
    return stripWhitespace(buffer.toString("utf-8"));
  }

  throw new Error("Unsupported resume format. Please upload a PDF, DOCX, TXT, or MD file.");
}

export async function analyzeResumeText(rawText: string): Promise<ResumeInsightsPayload> {
  const aiResult = await callCompatibleAiJson<ResumeInsightsPayload>({
    system:
      "You analyze resumes. Return strict JSON only with keys: summary, skills. skills must be an array of up to 12 concise skill names.",
    user: `Resume text:\n${rawText.slice(0, 7000)}\n\nReturn JSON with:\nsummary: short professional summary\nskills: array of skill keywords`
  }).catch(() => null);

  if (aiResult?.summary && Array.isArray(aiResult.skills)) {
    return {
      summary: aiResult.summary.slice(0, 400),
      skills: aiResult.skills.filter((skill): skill is string => typeof skill === "string").slice(0, 12)
    };
  }

  return {
    summary: summarizeText(rawText, 380),
    skills: normalizeSkillMatches(rawText)
  };
}

function computeHeuristicMatch(input: {
  resumeText: string;
  resumeSkills: string[];
  jobTitle: string;
  jobDescription: string;
  jobSkills: string[];
}): ResumeJobMatchPayload {
  const resumeSkills = input.resumeSkills.length > 0 ? input.resumeSkills : normalizeSkillMatches(input.resumeText);
  const jobSkills =
    input.jobSkills.length > 0
      ? input.jobSkills
      : normalizeSkillMatches(`${input.jobTitle} ${input.jobDescription}`);

  const overlap = jobSkills.filter((skill) =>
    resumeSkills.some((resumeSkill) => resumeSkill.toLowerCase() === skill.toLowerCase())
  );
  const gaps = jobSkills.filter(
    (skill) => !resumeSkills.some((resumeSkill) => resumeSkill.toLowerCase() === skill.toLowerCase())
  );
  const ratio = jobSkills.length > 0 ? overlap.length / jobSkills.length : 0.45;
  const score = Math.max(35, Math.min(96, Math.round(40 + ratio * 55 + overlap.length * 2)));

  return {
    score,
    summary:
      overlap.length > 0
        ? `Your resume aligns well with this role through ${overlap.slice(0, 3).join(", ")} and related experience.`
        : "Your resume has some transferable overlap, but the role will likely need more direct tailoring.",
    strengths: overlap.length > 0 ? overlap.slice(0, 5) : resumeSkills.slice(0, 5),
    gaps: gaps.slice(0, 5)
  };
}

export async function compareResumeToJob(input: {
  resumeText: string;
  resumeSkills: string[];
  jobTitle: string;
  jobDescription: string;
  jobSkills: string[];
  location: string;
}): Promise<ResumeJobMatchPayload> {
  const heuristic = computeHeuristicMatch(input);

  const aiResult = await callCompatibleAiJson<ResumeJobMatchPayload>({
    system:
      "You compare resumes to jobs. Return strict JSON only with keys: score, summary, strengths, gaps. score must be an integer 0-100. strengths and gaps must be arrays of concise bullet fragments.",
    user: `Resume:\n${input.resumeText.slice(0, 6000)}\n\nJob title: ${input.jobTitle}\nLocation: ${input.location}\nJob description:\n${input.jobDescription.slice(0, 5000)}\nKnown job skills: ${input.jobSkills.join(", ")}\n\nReturn JSON with:\nscore: integer 0-100\nsummary: concise fit summary\nstrengths: array of matching strengths\ngaps: array of probable gaps or missing keywords`
  }).catch(() => null);

  if (
    aiResult &&
    typeof aiResult.score === "number" &&
    typeof aiResult.summary === "string" &&
    Array.isArray(aiResult.strengths) &&
    Array.isArray(aiResult.gaps)
  ) {
    return {
      score: Math.max(0, Math.min(100, Math.round(aiResult.score))),
      summary: aiResult.summary.slice(0, 420),
      strengths: aiResult.strengths.filter((item): item is string => typeof item === "string").slice(0, 5),
      gaps: aiResult.gaps.filter((item): item is string => typeof item === "string").slice(0, 5)
    };
  }

  return heuristic;
}

export async function upsertResumeProfileForUser(input: {
  userId: string;
  fileName: string;
  mimeType: string;
  rawText: string;
}) {
  const insights = await analyzeResumeText(input.rawText);

  try {
    return await prisma.resumeProfile.upsert({
      where: {
        userId: input.userId
      },
      update: {
        fileName: input.fileName,
        mimeType: input.mimeType,
        rawText: input.rawText,
        aiSummary: insights.summary,
        extractedSkills: insights.skills
      },
      create: {
        userId: input.userId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        rawText: input.rawText,
        aiSummary: insights.summary,
        extractedSkills: insights.skills
      }
    });
  } catch (error) {
    if (isMissingTableError(error, "ResumeProfile")) {
      throw new Error("Resume uploads need a database schema update. Run `npx prisma db push` and try again.");
    }

    throw error;
  }
}

export async function getResumeProfileForUser(userId: string) {
  try {
    return await prisma.resumeProfile.findUnique({
      where: {
        userId
      }
    });
  } catch (error) {
    if (isMissingTableError(error, "ResumeProfile")) {
      return null;
    }

    throw error;
  }
}
