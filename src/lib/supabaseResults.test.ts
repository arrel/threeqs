import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSupabaseHistory, saveSupabaseDailyResult } from "@/lib/supabaseResults";
import type { DailyResult } from "@/lib/types";

describe("Supabase results", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("silently skips Supabase reads and writes for disallowed student names", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    const result = createResult("Frank the butt", "2026-06-24", 240);

    await expect(loadSupabaseHistory(result.studentName)).resolves.toEqual([]);
    await expect(saveSupabaseDailyResult(result)).resolves.toEqual(result);
    expect(fetch).not.toHaveBeenCalled();
  });
});

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
