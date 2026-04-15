# Job Tracker Pro AI

Job Tracker Pro AI is a full-stack job application tracker built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and Auth.js/NextAuth. It lets users search real job listings, save roles into a private tracker, manage application status, add notes and reminders, and enrich descriptions with AI-generated or heuristic insights.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth credentials + optional GitHub auth
- Recharts for analytics
- Zod for validation
- Sonner for toasts

## Features

- Secure authentication with credentials and optional GitHub OAuth
- Protected user-specific dashboard
- Live job search through JSearch via secure server-side API calls
- Dummy fallback job search mode when `JSEARCH_API_KEY` is missing
- Save/import jobs with duplicate protection per user
- Resume upload with text extraction for PDF, DOCX, TXT, and MD files
- AI enrichment abstraction with:
  - optional OpenRouter-compatible free provider
  - local regex/keyword fallback parser
- Resume-to-job fit analysis with score, strengths, gaps, and summary
- Job pipeline management:
  - Saved
  - Applied
  - Interviewing
  - Offer
  - Rejected
  - Archived
- Notes, reminders, follow-up tracking
- Analytics for applications, statuses, companies, and extracted skills
- Kanban and table views
- CSV export for tracked jobs
- Seeded demo account and sample dataset

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Duplicate `.env.example` as `.env` and update values:

```bash
copy .env.example .env
```

3. Run Prisma migration:

```bash
npx prisma migrate dev --name init
```

4. Seed demo data:

```bash
npx prisma db seed
```

5. Start the app:

```bash
npm run dev
```

## Demo credentials

- Email: `demo@jobtrackerpro.ai`
- Password: `Demo@12345`

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: app base URL
- `NEXTAUTH_SECRET`: required auth secret
- `GITHUB_ID`, `GITHUB_SECRET`: optional GitHub OAuth
- `JSEARCH_API_KEY`: optional RapidAPI key for live job search
- `JSEARCH_API_HOST`: defaults to `jsearch.p.rapidapi.com`
- `FREE_AI_API_KEY`: optional API key for an OpenAI-compatible provider
- `FREE_AI_API_URL`: compatible chat completions endpoint
- `FREE_AI_MODEL`: optional model name for the enrichment provider

## Deployment

This project is intended to be free-tier friendly:

- Frontend/app hosting: Vercel
- Database: Neon or Supabase Postgres
- Job search: RapidAPI JSearch
- AI enrichment: optional free-compatible provider or local fallback

For deployment:

1. Provision a Postgres database.
2. Set the environment variables in Vercel.
3. Run Prisma migrations against production.
4. Redeploy.

## Architecture notes

- App Router pages use server components by default.
- Interactive dashboard areas are client components.
- Mutations use route handlers under `app/api`.
- Third-party API secrets stay server-side.
- Saved jobs are created even if enrichment fails.
- Search history is recorded for signed-in users.

## Important notes

- If `JSEARCH_API_KEY` is missing, the app still works using realistic fallback data.
- If `FREE_AI_API_KEY` is missing, enrichment and resume-job matching fall back to local parsing.
- GitHub auth only appears when both GitHub env vars are configured.
- The recommended free AI setup is OpenRouter with `FREE_AI_API_URL="https://openrouter.ai/api/v1/chat/completions"` and `FREE_AI_MODEL="openrouter/free"`.
