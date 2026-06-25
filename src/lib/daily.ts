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

  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0) % modulo;
}
