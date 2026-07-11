import { describe, expect, it } from "vitest";
import {
  calculateCurrentStreak,
  clearDailyDraft,
  clearSavedStudentName,
  getCachedLeaderboard,
  getDailyResult,
  getSavedStudentName,
  getSavedStudentPhoto,
  getDailyDraft,
  getStudentHistory,
  normalizeStudentName,
  replaceStudentHistory,
  saveCachedLeaderboard,
  saveDailyResult,
  saveDailyDraft,
  saveStudentName,
  saveStudentPhoto,
  type StorageLike
} from "@/lib/storage";
import type { DailyResult } from "@/lib/types";

describe("local result storage", () => {
  it("normalizes student names", () => {
    expect(normalizeStudentName("  Ada   Lovelace ")).toBe("Ada Lovelace");
  });

  it("clears the saved student profile", () => {
    const storage = createMemoryStorage();

    saveStudentName("Ada", storage);
    clearSavedStudentName("Ada", storage);

    expect(getSavedStudentName(storage)).toBe("");
  });

  it("keeps a photo with the saved student profile", () => {
    const storage = createMemoryStorage();
    saveStudentName("Ada", storage);
    saveStudentPhoto("Ada", "data:image/jpeg;base64,cGhvdG8=", storage);

    expect(getSavedStudentPhoto(storage)).toBe("data:image/jpeg;base64,cGhvdG8=");
    saveStudentName("Ada", storage);
    expect(getSavedStudentPhoto(storage)).toBe("data:image/jpeg;base64,cGhvdG8=");
  });

  it("stores independent drafts for multiple days", () => {
    const storage = createMemoryStorage();
    saveDailyDraft(createDraft("2026-06-23", 0), storage);
    saveDailyDraft(createDraft("2026-06-24", 1), storage);

    expect(getDailyDraft("Ada", "2026-06-23", storage)?.currentIndex).toBe(0);
    expect(getDailyDraft("Ada", "2026-06-24", storage)?.currentIndex).toBe(1);

    clearDailyDraft("Ada", "2026-06-23", storage);
    expect(getDailyDraft("Ada", "2026-06-23", storage)).toBeNull();
    expect(getDailyDraft("Ada", "2026-06-24", storage)?.currentIndex).toBe(1);
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
        {
          studentName: "Bob",
          photoDataUrl: "data:image/jpeg;base64,Ym9i",
          totalPoints: 100,
          gold: 1,
          silver: 0,
          bronze: 0
        },
        { studentName: "bob", totalPoints: 80, gold: 0, silver: 1, bronze: 0 },
        { studentName: "Ada", totalPoints: 90, gold: 0, silver: 0, bronze: 1 }
      ],
      storage
    );

    expect(getCachedLeaderboard(storage)).toEqual([
      {
        studentName: "Bob",
        photoDataUrl: "data:image/jpeg;base64,Ym9i",
        totalPoints: 180,
        gold: 1,
        silver: 1,
        bronze: 0
      },
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

function createDraft(dateKey: string, currentIndex: number) {
  return {
    dateKey,
    studentName: "Ada",
    currentIndex,
    questionResults: [],
    selectedChoiceId: null,
    attemptedChoiceIds: [],
    checkedResult: null,
    isCurrentQuestionFinalized: false,
    questionElapsedMs: 0
  };
}
