# Three Qs

A Vercel-ready Next.js practice game for a 6th grade Math Super Bowl team.

Students enter a name and complete the same three multiple-choice questions each Pacific-time day. Names are the only identity layer: a normalized name is unique, and anyone who types that name can see that student’s saved daily result.

## Run locally

```bash
pnpm install
pnpm dev
```

If Supabase env vars are not present, the app falls back to local browser storage.

## Supabase setup

Run `supabase/schema.sql` in the Supabase SQL editor, then set these environment variables locally and in Vercel:

```bash
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
```

Supabase may also provide `SUPABASE_SECRET_KEY` and `SUPABASE_JWKS_URL`; Three Qs does not use those in v1. The schema enables row level security with public read and insert policies only. The app writes through Next.js route handlers using the publishable key, so public clients can read and add rows but cannot update or delete saved records. This project intentionally does not implement auth, roster codes, or private student accounts.

Stored data:

- `students`: unique normalized names.
- `daily_results`: one completed daily result per student/date.
- `question_results`: selected answers, seconds spent, and score details for each question in a daily result.

## Test

```bash
pnpm test
```

## Edit problems

Problems live in `src/data/problems.ts`. Add original or adapted multiple-choice questions with prompt text, optional LaTeX, answer choices, explanation, difficulty, topics, grade band, and source metadata.
