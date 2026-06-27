import { NextResponse } from "next/server";
import { SupabaseNotConfiguredError } from "@/lib/supabaseResults";
import { fetchLeaderboard } from "@/lib/supabaseLeaderboard";

export async function GET(): Promise<NextResponse> {
  try {
    const entries = await fetchLeaderboard();
    return NextResponse.json({ entries });
  } catch (error) {
    if (error instanceof SupabaseNotConfiguredError) {
      return NextResponse.json({ entries: [] });
    }
    console.error(error);
    return NextResponse.json({ error: "Leaderboard fetch failed" }, { status: 500 });
  }
}
