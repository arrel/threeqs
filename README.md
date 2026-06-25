# Three Qs

A Vercel-ready Next.js practice game for a 6th grade Math Super Bowl team.

Students enter a name and complete the same three multiple-choice questions each Pacific-time day. The first version uses a flat problem bank and local browser storage only.

## Run locally

```bash
pnpm install
pnpm dev
```

## Test

```bash
pnpm test
```

## Edit problems

Problems live in `src/data/problems.ts`. Add original or adapted multiple-choice questions with prompt text, optional LaTeX, answer choices, explanation, difficulty, topics, grade band, and source metadata.
