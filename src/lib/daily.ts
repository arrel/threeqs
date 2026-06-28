import type { Difficulty, Problem } from "@/lib/types";

const DAILY_DIFFICULTIES: Difficulty[] = ["easy", "medium", "stretch"];
const DAILY_SCHEDULE_START_DATE_KEY = "2026-06-28";

export function selectDailyProblems(allProblems: Problem[], dateKey: string): Problem[] {
  return DAILY_DIFFICULTIES.map((difficulty) => {
    const candidates = allProblems.filter((problem) => problem.difficulty === difficulty);

    if (candidates.length === 0) {
      throw new Error(`No ${difficulty} problems are available.`);
    }

    return selectDailyProblemForDifficulty(candidates, dateKey, difficulty);
  });
}

function selectDailyProblemForDifficulty(
  candidates: Problem[],
  dateKey: string,
  difficulty: Difficulty
): Problem {
  const duplicateScheduledDate = findDuplicateScheduledDate(candidates);
  if (duplicateScheduledDate) {
    throw new Error(`Multiple ${difficulty} problems are scheduled for ${duplicateScheduledDate}.`);
  }

  const datedCandidates = candidates.filter((problem) => problem.scheduledDate === dateKey);

  if (datedCandidates.length === 1) {
    return datedCandidates[0];
  }

  const loopCandidates = candidates
    .filter((problem) => problem.scheduledDate <= dateKey)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const schedule = loopCandidates.length > 0
    ? loopCandidates
    : [...candidates].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const daysSinceStart = getDateKeyDistanceInDays(DAILY_SCHEDULE_START_DATE_KEY, dateKey);

  return schedule[positiveModulo(daysSinceStart, schedule.length)];
}

function findDuplicateScheduledDate(problems: Problem[]): string | null {
  const scheduledDates = new Set<string>();

  for (const problem of problems) {
    if (scheduledDates.has(problem.scheduledDate)) {
      return problem.scheduledDate;
    }

    scheduledDates.add(problem.scheduledDate);
  }

  return null;
}

export function deterministicIndex(seed: string, modulo: number): number {
  if (modulo <= 0) {
    throw new Error("Modulo must be positive.");
  }

  return hashSeed(seed) % modulo;
}

function getDateKeyDistanceInDays(startDateKey: string, dateKey: string): number {
  return dateKeyToUtcDayNumber(dateKey) - dateKeyToUtcDayNumber(startDateKey);
}

function dateKeyToUtcDayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function positiveModulo(value: number, modulo: number): number {
  return ((value % modulo) + modulo) % modulo;
}

// Deterministic Fisher–Yates shuffle. The same seed always produces the same
// order, so callers get a stable, render-safe ordering without extra state.
export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  const result = [...items];
  const random = mulberry32(hashSeed(seed));

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }

  return result;
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
