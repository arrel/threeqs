import { describe, expect, it } from "vitest";
import { birds } from "@/data/birds";
import { getBirdCollection } from "@/lib/birds";
import type { DailyResult } from "@/lib/types";

export function completedDay(dateKey: string): DailyResult {
  return {
    dateKey,
    studentName: "Ada",
    totalScore: 0,
    maxScore: 390,
    medal: "practice",
    completedAt: `${dateKey}T18:00:00Z`,
    shareText: "",
    questionResults: Array.from({ length: 3 }, (_, i) => ({
      problemId: `q${i}`,
      difficulty: "easy",
      selectedChoiceIds: [],
      correctChoiceId: "a",
      attemptsUsed: 2,
      solved: false,
      elapsedSeconds: 10,
      attemptPoints: 0,
      speedBonus: 0,
      score: 0,
    })),
  };
}

describe("bird collection", () => {
  it("rewards completion regardless of score and keeps progress across missed days", () => {
    const result = getBirdCollection(
      [completedDay("2026-10-28"), completedDay("2026-10-25")],
      "2026-10-28",
    );
    expect(result.collected).toEqual(birds.slice(0, 2));
    expect(result.rewardForDate("2026-10-25")).toBe(birds[0]);
    expect(result.rewardForDate("2026-10-28")).toBe(birds[1]);
    expect(result.nextBird).toBe(birds[2]);
    expect(result.completedToday).toBe(true);
  });
  it("does not grant duplicates, partial quizzes, pre-launch history, or future rewards", () => {
    const partial = {
      ...completedDay("2026-10-26"),
      questionResults: completedDay("2026-10-26").questionResults.slice(0, 2),
    };
    const result = getBirdCollection(
      [
        completedDay("2026-10-25"),
        completedDay("2026-10-25"),
        completedDay("2026-10-24"),
        completedDay("2026-10-30"),
        partial,
      ],
      "2026-10-27",
    );
    expect(result.collected).toEqual([birds[0]]);
    expect(result.completedToday).toBe(false);
    expect(result.rewardForDate("2026-10-24")).toBeUndefined();
  });
  it("caps the album and does not invent a thirteenth reward", () => {
    const history = Array.from({ length: 15 }, (_, i) =>
      completedDay(`2026-11-${String(i + 1).padStart(2, "0")}`),
    );
    const result = getBirdCollection(history, "2026-11-15");
    expect(result.collected).toHaveLength(12);
    expect(result.nextBird).toBeUndefined();
    expect(result.rewardForDate("2026-11-13")).toBeUndefined();
  });
});
