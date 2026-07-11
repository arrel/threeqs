import { getStudentKey, normalizeStudentName } from "@/lib/storage";
import type { Medal } from "@/lib/types";

type DailyResultRow = {
  student_name: string;
  total_score: number;
  medal: Medal;
  date_key: string;
  students?: {
    photo_data_url: string | null;
  } | null;
};

export type LeaderboardEntry = {
  studentName: string;
  photoDataUrl?: string;
  totalPoints: number;
  gold: number;
  silver: number;
  bronze: number;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const { SupabaseNotConfiguredError } = require("@/lib/supabaseResults");
    throw new SupabaseNotConfiguredError();
  }

  return { url: url.replace(/\/$/, ""), key };
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const config = getSupabaseConfig();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateFloor = sevenDaysAgo.toISOString().slice(0, 10).replace(/-/g, "");

  const url = new URL(`${config.url}/rest/v1/daily_results`);
  url.searchParams.set("select", "student_name,total_score,medal,date_key,students(photo_data_url)");
  url.searchParams.set("date_key", `gte.${dateFloor}`);
  url.searchParams.set("order", "date_key.desc");

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Leaderboard fetch failed: ${response.status}`);
  }

  const rows = (await response.json()) as DailyResultRow[];

  const byStudent = new Map<string, LeaderboardEntry>();

  for (const row of rows) {
    const studentKey = getStudentKey(row.student_name);
    if (!studentKey) {
      continue;
    }

    const name = normalizeStudentName(row.student_name);
    const entry = byStudent.get(studentKey) ?? {
      studentName: name,
      photoDataUrl: row.students?.photo_data_url ?? "",
      totalPoints: 0,
      gold: 0,
      silver: 0,
      bronze: 0
    };
    if (!entry.photoDataUrl && row.students?.photo_data_url) {
      entry.photoDataUrl = row.students.photo_data_url;
    }
    entry.totalPoints += row.total_score;
    if (row.medal === "gold") entry.gold += 1;
    else if (row.medal === "silver") entry.silver += 1;
    else if (row.medal === "bronze") entry.bronze += 1;
    byStudent.set(studentKey, entry);
  }

  return [...byStudent.values()]
    .sort((a, b) => b.totalPoints - a.totalPoints || b.gold - a.gold || b.silver - a.silver)
    .slice(0, 5);
}
