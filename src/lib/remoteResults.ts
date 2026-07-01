import type { LeaderboardEntry } from "@/lib/supabaseLeaderboard";
import type { DailyResult } from "@/lib/types";

type ResultsResponse = {
  accepted?: boolean;
  results?: DailyResult[];
};

type SaveResponse = {
  accepted?: boolean;
  result?: DailyResult;
};

type LeaderboardResponse = {
  entries?: LeaderboardEntry[];
};

export type RemoteHistory = {
  accepted: boolean;
  results: DailyResult[];
};

export type RemoteSaveResult = {
  accepted: boolean;
  result: DailyResult;
};

export async function fetchRemoteHistory(studentName: string): Promise<RemoteHistory> {
  const url = new URL("/api/results", window.location.origin);
  url.searchParams.set("studentName", studentName);

  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Could not load remote history: ${response.status}`);
  }

  const payload = (await response.json()) as ResultsResponse;
  return {
    accepted: payload.accepted !== false,
    results: payload.results ?? []
  };
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch("/api/leaderboard", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Could not load leaderboard: ${response.status}`);
  }

  const payload = (await response.json()) as LeaderboardResponse;
  return payload.entries ?? [];
}

export async function saveRemoteDailyResult(result: DailyResult): Promise<RemoteSaveResult> {
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

  return {
    accepted: payload.accepted !== false,
    result: payload.result
  };
}
