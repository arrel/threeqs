import { NextResponse } from "next/server";
import {
  SupabaseNotConfiguredError,
  loadSupabaseHistory,
  saveSupabaseDailyResult
} from "@/lib/supabaseResults";
import { normalizeStudentName } from "@/lib/storage";
import { isDisallowedStudentName } from "@/lib/server/studentNamePolicy";
import type { DailyResult } from "@/lib/types";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const studentName = normalizeStudentName(url.searchParams.get("studentName") ?? "");
  const dateKey = url.searchParams.get("dateKey");

  if (!studentName) {
    return NextResponse.json({ error: "studentName is required" }, { status: 400 });
  }

  try {
    const accepted = !isDisallowedStudentName(studentName);
    const history = await loadSupabaseHistory(studentName);
    const results = dateKey ? history.filter((result) => result.dateKey === dateKey) : history;
    return NextResponse.json({ accepted, results });
  } catch (error) {
    return resultErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let result: unknown;

  try {
    result = (await request.json()) as DailyResult;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isDailyResultLike(result)) {
    return NextResponse.json({ error: "Daily result is required" }, { status: 400 });
  }

  try {
    const accepted = !isDisallowedStudentName(result.studentName);
    const savedResult = await saveSupabaseDailyResult(result);
    return NextResponse.json({ accepted, result: savedResult });
  } catch (error) {
    return resultErrorResponse(error);
  }
}

function resultErrorResponse(error: unknown): NextResponse {
  if (error instanceof SupabaseNotConfiguredError) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  console.error(error);
  return NextResponse.json({ error: "Result storage failed" }, { status: 500 });
}

function isDailyResultLike(value: unknown): value is DailyResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<DailyResult>;

  return Boolean(
    typeof result.dateKey === "string" &&
      typeof result.studentName === "string" &&
      typeof result.totalScore === "number" &&
      typeof result.maxScore === "number" &&
      typeof result.completedAt === "string" &&
      Array.isArray(result.questionResults)
  );
}
