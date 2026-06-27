import type { LeaderboardEntry } from "@/lib/supabaseLeaderboard";
import type { DailyResult } from "@/lib/types";

type ResultsResponse = {
  results?: DailyResult[];
};

type SaveResponse = {
  result?: DailyResult;
};

type LeaderboardResponse = {
  entries?: LeaderboardEntry[];
};

export async function fetchRemoteHistory(studentName: string): Promise<DailyResult[]> {
  const url = new URL("/api/results", window.location.origin);
  url.searchParams.set("studentName", studentName);

  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Could not load remote history: ${response.status}`);
  }

  const payload = (await response.json()) as ResultsResponse;
  return payload.results ?? [];
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch("/api/leaderboard", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Could not load leaderboard: ${response.status}`);
  }

  const payload = (await response.json()) as LeaderboardResponse;
  return payload.entries ?? [];
}

export async function saveRemoteDailyResult(result: DailyResult): Promise<DailyResult> {
  const response = await fetch("/api/results", {
    body: JSON.stringify(result),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Could not save remote result: ${response.status}`);
  }

  const payload = (await response.json()) as SaveResponse;

  if (!payload.result) {
    throw new Error("Remote save did not return a result.");
  }

  return payload.result;
}
