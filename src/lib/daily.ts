import type { Difficulty, Problem } from "@/lib/types";

const DAILY_DIFFICULTIES: Difficulty[] = ["easy", "medium", "stretch"];

export function selectDailyProblems(allProblems: Problem[], dateKey: string): Problem[] {
  return DAILY_DIFFICULTIES.map((difficulty) => {
    const candidates = allProblems
      .filter((problem) => problem.difficulty === difficulty)
      .sort((a, b) => a.id.localeCompare(b.id));

    if (candidates.length === 0) {
      throw new Error(`No ${difficulty} problems are available.`);
    }

    const index = deterministicIndex(`${dateKey}:${difficulty}`, candidates.length);
    return candidates[index];
  });
}

export function deterministicIndex(seed: string, modulo: number): number {
  if (modulo <= 0) {
    throw new Error("Modulo must be positive.");
  }

  return hashSeed(seed) % modulo;
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
