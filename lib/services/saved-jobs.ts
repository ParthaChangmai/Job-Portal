import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { enrichSavedJob } from "@/lib/services/enrichment";
import { addNoteSchema, reminderSchema, saveJobSchema, updateJobSchema } from "@/lib/validators";

export async function saveJobForUser(userId: string, input: Prisma.SavedJobUncheckedCreateInput) {
  const parsed = saveJobSchema.parse(input);

  const duplicate = await prisma.savedJob.findFirst({
    where: {
      userId,
      OR: [
        parsed.externalJobId
          ? {
              externalJobId: parsed.externalJobId
            }
          : undefined,
        {
          sourceUrl: parsed.sourceUrl
        }
      ].filter(Boolean) as Prisma.SavedJobWhereInput[]
    }
  });

  if (duplicate) {
    return {
      job: duplicate,
      created: false
    };
  }

  const job = await prisma.savedJob.create({
    data: {
      ...parsed,
      userId,
      datePosted: parsed.datePosted ? new Date(parsed.datePosted) : null
    }
  });

  try {
    await enrichSavedJob(job.id);
  } catch (error) {
    console.error("Job enrichment failed", error);
  }

  const refreshedJob = await prisma.savedJob.findUnique({
    where: {
      id: job.id
    }
  });

  return {
    job: refreshedJob ?? job,
    created: true
  };
}

export async function updateSavedJobForUser(userId: string, id: string, input: unknown) {
  const parsed = updateJobSchema.parse(input);

  const existing = await prisma.savedJob.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existing) {
    throw new Error("Job not found.");
  }

  const data: Prisma.SavedJobUpdateInput = {
    status: parsed.status
  };

  if (Object.prototype.hasOwnProperty.call(parsed, "applicationDate")) {
    data.applicationDate = parsed.applicationDate ? new Date(parsed.applicationDate) : null;
  }

  if (Object.prototype.hasOwnProperty.call(parsed, "followUpDate")) {
    data.followUpDate = parsed.followUpDate ? new Date(parsed.followUpDate) : null;
  }

  if (Object.prototype.hasOwnProperty.call(parsed, "expectedSalary")) {
    data.expectedSalary = parsed.expectedSalary ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(parsed, "resumeVersion")) {
    data.resumeVersion = parsed.resumeVersion ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(parsed, "coverLetterVersion")) {
    data.coverLetterVersion = parsed.coverLetterVersion ?? null;
  }

  return prisma.savedJob.update({
    where: {
      id
    },
    data
  });
}

export async function addNoteToJobForUser(userId: string, savedJobId: string, input: unknown) {
  const parsed = addNoteSchema.parse(input);

  const job = await prisma.savedJob.findFirst({
    where: {
      id: savedJobId,
      userId
    }
  });

  if (!job) {
    throw new Error("Job not found.");
  }

  return prisma.jobNote.create({
    data: {
      savedJobId,
      content: parsed.content
    }
  });
}

export async function createReminderForUser(userId: string, input: unknown) {
  const parsed = reminderSchema.parse(input);

  const job = await prisma.savedJob.findFirst({
    where: {
      id: parsed.savedJobId,
      userId
    }
  });

  if (!job) {
    throw new Error("Job not found.");
  }

  return prisma.reminder.create({
    data: {
      userId,
      savedJobId: parsed.savedJobId,
      title: parsed.title,
      dueDate: new Date(parsed.dueDate)
    }
  });
}

export async function toggleReminderForUser(userId: string, reminderId: string, completed: boolean) {
  const reminder = await prisma.reminder.findFirst({
    where: {
      id: reminderId,
      userId
    }
  });

  if (!reminder) {
    throw new Error("Reminder not found.");
  }

  return prisma.reminder.update({
    where: {
      id: reminderId
    },
    data: {
      completed
    }
  });
}
