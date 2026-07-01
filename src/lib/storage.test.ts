import { describe, expect, it } from "vitest";
import {
  calculateCurrentStreak,
  getCachedLeaderboard,
  getDailyResult,
  getSavedStudentName,
  getStudentHistory,
  normalizeStudentName,
  replaceStudentHistory,
  saveCachedLeaderboard,
  saveDailyDraft,
  saveDailyResult,
  saveStudentName,
  type StorageLike
} from "@/lib/storage";
import { isDisallowedStudentName } from "@/lib/studentNamePolicy";
import type { DailyResult } from "@/lib/types";

describe("local result storage", () => {
  it("normalizes student names", () => {
    expect(normalizeStudentName("  Ada   Lovelace ")).toBe("Ada Lovelace");
  });

  it("flags high-confidence dirty student names without substring false positives", () => {
    expect(isDisallowedStudentName("sh!t")).toBe(true);
    expect(isDisallowedStudentName("Frank the butt")).toBe(true);
    expect(isDisallowedStudentName("ass frank")).toBe(true);
    expect(isDisallowedStudentName("Ada Cassie Dickinson")).toBe(false);
    expect(isDisallowedStudentName("Essex Class")).toBe(false);
    expect(isDisallowedStudentName("Button Class")).toBe(false);
  });

  it("silently skips persisting disallowed student names and results", () => {
    const storage = createMemoryStorage();

    saveStudentName("sh!t", storage);
    saveDailyDraft(
      {
        dateKey: "2026-06-24",
        studentName: "sh!t",
        currentIndex: 0,
        questionResults: [],
        selectedChoiceId: null,
        attemptedChoiceIds: [],
        checkedResult: null,
        isCurrentQuestionFinalized: false,
        questionElapsedMs: 0
      },
      storage
    );
    saveDailyResult(createResult("sh!t", "2026-06-24", 240), storage);

    expect(getSavedStudentName(storage)).toBe("");
    expect(getStudentHistory("sh!t", storage)).toEqual([]);
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

  it("merges cached leaderboard entries case-insensitively", () => {
    const storage = createMemoryStorage();

    saveCachedLeaderboard(
      [
        { studentName: "Bob", totalPoints: 100, gold: 1, silver: 0, bronze: 0 },
        { studentName: "bob", totalPoints: 80, gold: 0, silver: 1, bronze: 0 },
        { studentName: "Ada", totalPoints: 90, gold: 0, silver: 0, bronze: 1 }
      ],
      storage
    );

    expect(getCachedLeaderboard(storage)).toEqual([
      { studentName: "Bob", totalPoints: 180, gold: 1, silver: 1, bronze: 0 },
      { studentName: "Ada", totalPoints: 90, gold: 0, silver: 0, bronze: 1 }
    ]);
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
