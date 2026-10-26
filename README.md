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

Run the development server and open `http://localhost:3000/review` to scroll through the full question bank, with all answer choices, correct answers, and explanations in schedule order. This page only works in development on a localhost address; production and non-local hosts return 404.

Problems live in `src/data/problems.ts`. Add original or adapted multiple-choice questions with prompt text, optional LaTeX, answer choices, explanation, difficulty, topics, grade band, and source metadata.

## Santa Barbara field guide

Completing all three questions earns one illustrated local bird, regardless of
score. The first collection contains 12 species, with a sourced fact and a
spotting tip for each. Open the field guide from home or tap the earned bird on
the results screen. Photo uploads are not part of the collection.

Progress is derived from the active player's existing saved quiz history; it
uses the same local persistence and remote history as the game. Unique completed
quiz dates from October 25, 2026 onward count, so old history does not fill the
album immediately. Replaying a date never adds another bird, missed days never
remove birds, and future/partial results do not count. After 12 qualifying dates,
the complete album stays available. Keep the order in `src/data/birds.ts` stable
when updating content. Artwork in `public/birds` is generated natural-history painting, delivered as
optimized WebP images. The homepage leads with the next bird (or today’s earned
bird), its clue or fact, and collection progress. Quiz history remains below the
main discovery flow. Generation prompts are recorded in `docs/bird-art-prompts.json`.
