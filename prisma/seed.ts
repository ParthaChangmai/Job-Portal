import { EmploymentType, JobStatus, RemoteType, SeniorityLabel, WorkStyleLabel } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

const demoJobs = [
  {
    title: "Frontend Engineer",
    company: "Northstar Labs",
    location: "Remote - US",
    remoteType: RemoteType.REMOTE,
    employmentType: EmploymentType.FULL_TIME,
    source: "JSearch",
    sourceUrl: "https://example.com/jobs/northstar-frontend-engineer",
    externalJobId: "northstar-fe-001",
    salaryEstimate: "$115k - $135k",
    description:
      "Build polished React and Next.js product experiences, collaborate with design, and ship performant interfaces for a fast-moving B2B platform.",
    aiSummary:
      "Customer-facing frontend role focused on shipping product features in React and Next.js with strong design collaboration.",
    extractedSkills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    seniority: SeniorityLabel.MID,
    workStyle: WorkStyleLabel.REMOTE,
    status: JobStatus.SAVED
  },
  {
    title: "Product Designer",
    company: "Maple Cloud",
    location: "New York, NY",
    remoteType: RemoteType.HYBRID,
    employmentType: EmploymentType.FULL_TIME,
    source: "JSearch",
    sourceUrl: "https://example.com/jobs/maple-cloud-product-designer",
    externalJobId: "maple-pd-002",
    salaryEstimate: "$95k - $120k",
    description:
      "Own end-to-end product design for dashboards, user research, prototypes, and close partnership with PMs and engineers.",
    aiSummary:
      "Hybrid design role centered on UX strategy, prototyping, and interface design for a workflow-heavy SaaS product.",
    extractedSkills: ["Figma", "Product Design", "User Research"],
    seniority: SeniorityLabel.MID,
    workStyle: WorkStyleLabel.HYBRID,
    status: JobStatus.APPLIED
  },
  {
    title: "Senior Full Stack Engineer",
    company: "Beacon Health",
    location: "Austin, TX",
    remoteType: RemoteType.HYBRID,
    employmentType: EmploymentType.FULL_TIME,
    source: "LinkedIn Import",
    sourceUrl: "https://example.com/jobs/beacon-senior-fullstack",
    externalJobId: "beacon-fs-003",
    salaryEstimate: "$145k - $170k",
    description:
      "Lead backend and frontend delivery across Node.js, PostgreSQL, TypeScript, and cloud infrastructure for healthcare workflows.",
    aiSummary:
      "Senior engineering role combining platform ownership, mentoring, and full-stack delivery in a regulated domain.",
    extractedSkills: ["TypeScript", "Node.js", "PostgreSQL", "AWS"],
    seniority: SeniorityLabel.SENIOR,
    workStyle: WorkStyleLabel.HYBRID,
    status: JobStatus.INTERVIEWING
  },
  {
    title: "Machine Learning Engineer",
    company: "Sparrow AI",
    location: "San Francisco, CA",
    remoteType: RemoteType.ONSITE,
    employmentType: EmploymentType.FULL_TIME,
    source: "JSearch",
    sourceUrl: "https://example.com/jobs/sparrow-ml-engineer",
    externalJobId: "sparrow-ml-004",
    salaryEstimate: "$150k - $185k",
    description:
      "Develop ML pipelines, train recommendation models, and collaborate with data engineering to productionize experiments.",
    aiSummary:
      "Hands-on machine learning role focused on model development, experimentation, and operationalizing data products.",
    extractedSkills: ["Python", "Machine Learning", "SQL", "Docker"],
    seniority: SeniorityLabel.MID,
    workStyle: WorkStyleLabel.ONSITE,
    status: JobStatus.REJECTED
  },
  {
    title: "Growth Marketing Analyst",
    company: "Pulse Commerce",
    location: "Chicago, IL",
    remoteType: RemoteType.REMOTE,
    employmentType: EmploymentType.FULL_TIME,
    source: "Manual",
    sourceUrl: "https://example.com/jobs/pulse-growth-analyst",
    externalJobId: "pulse-gm-005",
    salaryEstimate: "$80k - $98k",
    description:
      "Analyze paid and organic funnel performance, design experiments, and report on campaign effectiveness.",
    aiSummary:
      "Growth analytics role spanning experiment design, funnel reporting, and weekly performance insights.",
    extractedSkills: ["Data Analysis", "SQL", "Testing"],
    seniority: SeniorityLabel.JUNIOR,
    workStyle: WorkStyleLabel.REMOTE,
    status: JobStatus.OFFER
  }
];

const extraStatuses: JobStatus[] = [
  JobStatus.SAVED,
  JobStatus.APPLIED,
  JobStatus.INTERVIEWING,
  JobStatus.REJECTED,
  JobStatus.ARCHIVED
];

async function main() {
  const passwordHash = await bcrypt.hash("Demo@12345", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@jobtrackerpro.ai" },
    update: {
      name: "Demo User",
      passwordHash
    },
    create: {
      name: "Demo User",
      email: "demo@jobtrackerpro.ai",
      passwordHash
    }
  });

  await prisma.jobNote.deleteMany({
    where: {
      savedJob: {
        userId: user.id
      }
    }
  });

  await prisma.reminder.deleteMany({
    where: {
      userId: user.id
    }
  });

  await prisma.savedJob.deleteMany({
    where: {
      userId: user.id
    }
  });

  const createdJobs = [];

  for (let index = 0; index < 15; index += 1) {
    const baseJob = demoJobs[index % demoJobs.length];
    const status = extraStatuses[index % extraStatuses.length];

    const created = await prisma.savedJob.create({
      data: {
        userId: user.id,
        title: index < demoJobs.length ? baseJob.title : `${baseJob.title} ${index + 1}`,
        company: baseJob.company,
        location: baseJob.location,
        remoteType: baseJob.remoteType,
        employmentType: baseJob.employmentType,
        source: baseJob.source,
        sourceUrl: `${baseJob.sourceUrl}-${index + 1}`,
        externalJobId: `${baseJob.externalJobId}-${index + 1}`,
        salaryEstimate: baseJob.salaryEstimate,
        description: baseJob.description,
        aiSummary: baseJob.aiSummary,
        extractedSkills: baseJob.extractedSkills,
        seniority: baseJob.seniority,
        workStyle: baseJob.workStyle,
        status,
        applicationDate: status !== JobStatus.SAVED ? new Date(Date.now() - index * 86_400_000) : null,
        followUpDate: index % 3 === 0 ? new Date(Date.now() + (index + 1) * 86_400_000) : null,
        expectedSalary: 100000 + index * 2500,
        resumeVersion: `Resume v${(index % 4) + 1}`,
        coverLetterVersion: `CL-${(index % 3) + 1}`
      }
    });

    createdJobs.push(created);
  }

  for (const [index, job] of createdJobs.entries()) {
    await prisma.jobNote.create({
      data: {
        savedJobId: job.id,
        content:
          index % 2 === 0
            ? "Focus on product metrics, async collaboration, and measurable delivery examples in the next conversation."
            : "Potentially strong fit. Follow up with recruiter after tailoring resume for dashboard ownership and stakeholder communication."
      }
    });

    if (index < 6) {
      await prisma.reminder.create({
        data: {
          userId: user.id,
          savedJobId: job.id,
          title: `Follow up with ${job.company}`,
          dueDate: new Date(Date.now() + (index - 2) * 86_400_000),
          completed: index === 5
        }
      });
    }
  }

  await prisma.searchHistory.createMany({
    data: [
      {
        userId: user.id,
        query: "frontend engineer",
        location: "remote",
        remote: "REMOTE",
        employmentType: "FULL_TIME"
      },
      {
        userId: user.id,
        query: "product designer",
        location: "new york",
        remote: "HYBRID",
        employmentType: "FULL_TIME"
      }
    ]
  });

  await prisma.resumeProfile.upsert({
    where: {
      userId: user.id
    },
    update: {
      fileName: "demo_resume.txt",
      mimeType: "text/plain",
      rawText:
        "Partha Demo\nFrontend and full stack engineer with 4 years of experience building React, Next.js, TypeScript, Node.js, PostgreSQL, Tailwind CSS, and REST API products. Built analytics dashboards, shipped recruiter workflow tools, improved performance, collaborated with designers, and mentored junior teammates. Comfortable with AWS, Docker, testing, Git, and agile product delivery.",
      aiSummary:
        "Full stack engineer with strong React, Next.js, TypeScript, Node.js, and dashboard delivery experience, plus collaboration and mentoring strengths.",
      extractedSkills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "AWS", "Docker"]
    },
    create: {
      userId: user.id,
      fileName: "demo_resume.txt",
      mimeType: "text/plain",
      rawText:
        "Partha Demo\nFrontend and full stack engineer with 4 years of experience building React, Next.js, TypeScript, Node.js, PostgreSQL, Tailwind CSS, and REST API products. Built analytics dashboards, shipped recruiter workflow tools, improved performance, collaborated with designers, and mentored junior teammates. Comfortable with AWS, Docker, testing, Git, and agile product delivery.",
      aiSummary:
        "Full stack engineer with strong React, Next.js, TypeScript, Node.js, and dashboard delivery experience, plus collaboration and mentoring strengths.",
      extractedSkills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "AWS", "Docker"]
    }
  });

  console.log("Seed complete.");
  console.log("Demo email: demo@jobtrackerpro.ai");
  console.log("Demo password: Demo@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
