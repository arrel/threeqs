import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSupabaseHistory, saveSupabaseDailyResult } from "@/lib/supabaseResults";
import type { DailyResult } from "@/lib/types";

describe("Supabase results", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("silently skips Supabase reads and writes for disallowed student names", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    const result = createResult("Frank the butt", "2026-06-24", 240);

    await expect(loadSupabaseHistory(result.studentName)).resolves.toEqual([]);
    await expect(saveSupabaseDailyResult(result)).resolves.toMatchObject({
      dateKey: result.dateKey,
      medal: "silver",
      studentName: result.studentName,
      totalScore: 240
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("recalculates the medal from the score before persistence", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "test-key");
    const insertedDailyRows: Array<Record<string, unknown>> = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(input.toString());
        const table = url.pathname.split("/").at(-1);
        const method = init?.method ?? "GET";

        if (table === "students" && method === "GET") {
          return jsonResponse([]);
        }

        if (table === "students" && method === "POST") {
          return jsonResponse([
            { id: "student-1", name: "Ada", name_key: "ada", photo_data_url: null }
          ]);
        }

        if (table === "daily_results" && method === "GET") {
          return jsonResponse([]);
        }

        if (table === "daily_results" && method === "POST") {
          const row = JSON.parse(String(init?.body)) as Record<string, unknown>;
          insertedDailyRows.push(row);
          return jsonResponse([{ id: "daily-1", ...row }]);
        }

        throw new Error(`Unexpected ${method} request for ${table}`);
      })
    );

    const inconsistentResult = createResult("Ada", "2026-06-24", 330);
    expect(inconsistentResult.medal).toBe("silver");

    await expect(saveSupabaseDailyResult(inconsistentResult)).resolves.toMatchObject({
      medal: "gold",
      totalScore: 330
    });
    expect(insertedDailyRows).toHaveLength(1);
    expect(insertedDailyRows[0]).toMatchObject({ medal: "gold", total_score: 330 });
  });

  it("returns an existing persisted medal before applying current rules", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "test-key");
    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(input.toString());
      const table = url.pathname.split("/").at(-1);
      const method = init?.method ?? "GET";

      if (table === "students" && method === "GET") {
        return jsonResponse([
          { id: "student-1", name: "Ada", name_key: "ada", photo_data_url: null }
        ]);
      }

      if (table === "daily_results" && method === "GET") {
        return jsonResponse([
          {
            id: "daily-1",
            student_id: "student-1",
            student_name: "Ada",
            date_key: "2026-06-24",
            total_score: 330,
            max_score: 390,
            medal: "silver",
            completed_at: "2026-06-24T12:00:00.000Z",
            share_text: "Historical silver"
          }
        ]);
      }

      if (table === "question_results" && method === "GET") {
        return jsonResponse([]);
      }

      throw new Error(`Unexpected ${method} request for ${table}`);
    });
    vi.stubGlobal("fetch", fetch);

    await expect(
      saveSupabaseDailyResult(createResult("Ada", "2026-06-24", 330))
    ).resolves.toMatchObject({
      medal: "silver",
      shareText: "Historical silver",
      totalScore: 330
    });
    expect(
      fetch.mock.calls.some(([, init]) => (init?.method ?? "GET") === "POST")
    ).toBe(false);
  });
});

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
    status: 200
  });
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
