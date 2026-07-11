import { NextResponse } from "next/server";
import {
  SupabaseNotConfiguredError,
  loadSupabaseStudentProfile,
  saveSupabaseStudentPhoto
} from "@/lib/supabaseResults";
import { normalizeStudentName } from "@/lib/storage";

const MAX_PHOTO_DATA_URL_LENGTH = 500_000;
const PHOTO_DATA_URL = /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i;

export async function GET(request: Request): Promise<NextResponse> {
  const studentName = normalizeStudentName(new URL(request.url).searchParams.get("studentName") ?? "");
  if (!studentName) {
    return NextResponse.json({ error: "studentName is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await loadSupabaseStudentProfile(studentName));
  } catch (error) {
    return profileErrorResponse(error);
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  let payload: { photoDataUrl?: unknown; studentName?: unknown };

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const studentName = normalizeStudentName(
    typeof payload.studentName === "string" ? payload.studentName : ""
  );
  const photoDataUrl = typeof payload.photoDataUrl === "string" ? payload.photoDataUrl : "";

  if (!studentName) {
    return NextResponse.json({ error: "studentName is required" }, { status: 400 });
  }

  if (
    !photoDataUrl ||
    photoDataUrl.length > MAX_PHOTO_DATA_URL_LENGTH ||
    !PHOTO_DATA_URL.test(photoDataUrl)
  ) {
    return NextResponse.json({ error: "A resized JPEG, PNG, or WebP photo is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await saveSupabaseStudentPhoto(studentName, photoDataUrl));
  } catch (error) {
    return profileErrorResponse(error);
  }
}

function profileErrorResponse(error: unknown): NextResponse {
  if (error instanceof SupabaseNotConfiguredError) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  console.error(error);
  return NextResponse.json({ error: "Profile storage failed" }, { status: 500 });
}
