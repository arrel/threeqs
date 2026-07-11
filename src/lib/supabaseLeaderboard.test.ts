import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLeaderboard } from "@/lib/supabaseLeaderboard";

describe("Supabase leaderboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("groups student names case-insensitively and respects their awarded medals", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "test-key");
    const fetchMock = vi.fn(async (_input: RequestInfo | URL) =>
      jsonResponse([
        {
          student_name: "Bob",
          total_score: 330,
          medal: "silver",
          date_key: "2026-06-24",
          students: { photo_data_url: "data:image/jpeg;base64,Ym9i" }
        },
        { student_name: "bob", total_score: 240, medal: "gold", date_key: "2026-06-23" },
        { student_name: "Ada", total_score: 150, medal: "gold", date_key: "2026-06-24" }
      ])
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchLeaderboard()).resolves.toEqual([
      {
        studentName: "Bob",
        photoDataUrl: "data:image/jpeg;base64,Ym9i",
        totalPoints: 570,
        gold: 1,
        silver: 1,
        bronze: 0
      },
      {
        studentName: "Ada",
        photoDataUrl: "",
        totalPoints: 150,
        gold: 1,
        silver: 0,
        bronze: 0
      }
    ]);

    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestUrl.searchParams.get("select")).toContain("students(photo_data_url)");
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
