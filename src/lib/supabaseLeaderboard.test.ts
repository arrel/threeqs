import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLeaderboard } from "@/lib/supabaseLeaderboard";

describe("Supabase leaderboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("groups student names case-insensitively", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse([
          { student_name: "Bob", total_score: 100, medal: "gold", date_key: "2026-06-24" },
          { student_name: "bob", total_score: 80, medal: "silver", date_key: "2026-06-23" },
          { student_name: "Ada", total_score: 90, medal: "bronze", date_key: "2026-06-24" }
        ])
      )
    );

    await expect(fetchLeaderboard()).resolves.toEqual([
      { studentName: "Bob", totalPoints: 180, gold: 1, silver: 1, bronze: 0 },
      { studentName: "Ada", totalPoints: 90, gold: 0, silver: 0, bronze: 1 }
    ]);
  });
});

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json"
    },
    status: 200
  });
}
