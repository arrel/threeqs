import { describe, expect, it } from "vitest";
import {
  calculateCurrentStreak,
  getDailyResult,
  getStudentHistory,
  normalizeStudentName,
  replaceStudentHistory,
  saveDailyResult,
  type StorageLike
} from "@/lib/storage";
import type { DailyResult } from "@/lib/types";

describe("local result storage", () => {
  it("normalizes student names", () => {
    expect(normalizeStudentName("  Ada   Lovelace ")).toBe("Ada Lovelace");
  });

  it("saves one result per student per date", () => {
    const storage = createMemoryStorage();
    const first = createResult("Ada", "2026-06-24", 240);
    const replacement = createResult("Ada", "2026-06-24", 330);

    saveDailyResult(first, storage);
    saveDailyResult(replacement, storage);

    expect(getStudentHistory("ada", storage)).toHaveLength(1);
    expect(getDailyResult("Ada", "2026-06-24", storage)?.totalScore).toBe(330);
  });

  it("replaces cached history for one student", () => {
    const storage = createMemoryStorage();
    saveDailyResult(createResult("Ada", "2026-06-24", 240), storage);

    replaceStudentHistory("Ada", [createResult("Ada", "2026-06-25", 330)], storage);

    expect(getDailyResult("Ada", "2026-06-24", storage)).toBeUndefined();
    expect(getDailyResult("Ada", "2026-06-25", storage)?.totalScore).toBe(330);
  });

  it("calculates a streak using completed local days", () => {
    const results = [
      createResult("Ada", "2026-06-24", 330),
      createResult("Ada", "2026-06-23", 240),
      createResult("Ada", "2026-06-21", 100)
    ];

    expect(calculateCurrentStreak(results, "2026-06-24")).toBe(2);
  });
});

function createMemoryStorage(): StorageLike {
  const entries = new Map<string, string>();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key)
  };
}

function createResult(studentName: string, dateKey: string, totalScore: number): DailyResult {
  return {
    dateKey,
    studentName,
    totalScore,
    maxScore: 390,
    medal: "silver",
    completedAt: `${dateKey}T12:00:00.000Z`,
    questionResults: [],
    shareText: "share"
  };
}
