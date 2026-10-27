import { birds } from "@/data/birds";
import type { DailyResult } from "@/lib/types";

// Earlier quiz history remains intact, but does not instantly fill the new album.
export const BIRD_COLLECTION_START = "2026-10-25";

export function getBirdCollection(history: DailyResult[], todayKey: string) {
  const dates = [
    ...new Set(
      history
        .filter(
          (result) =>
            result.dateKey >= BIRD_COLLECTION_START &&
            result.dateKey <= todayKey &&
            result.questionResults.length === 3 &&
            Array.from(result.questionResults).every(Boolean),
        )
        .map((result) => result.dateKey),
    ),
  ].sort();
  const collected = birds.slice(0, dates.length);
  return {
    collected,
    nextBird: birds[collected.length],
    completedToday: dates.includes(todayKey),
    rewardForDate: (dateKey: string) => {
      const index = dates.indexOf(dateKey);
      return index < 0 ? undefined : birds[index];
    },
  };
}
