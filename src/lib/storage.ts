import { previousDateKey } from "@/lib/date";
import type { DailyResult } from "@/lib/types";

const STORAGE_KEY = "msb-daily-results-v1";
const PROFILE_KEY = "three-qs-profile-v1";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

type StoredPayload = {
  version: 1;
  students: Record<string, DailyResult[]>;
};

type StoredProfile = {
  version: 1;
  studentName: string;
};

function emptyPayload(): StoredPayload {
  return {
    version: 1,
    students: {}
  };
}

export function normalizeStudentName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function getStudentKey(name: string): string {
  return normalizeStudentName(name).toLocaleLowerCase();
}

export function getBrowserStorage(): StorageLike | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

export function readStoredResults(storage = getBrowserStorage()): StoredPayload {
  if (!storage) {
    return emptyPayload();
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return emptyPayload();
  }

  try {
    const parsed = JSON.parse(raw) as StoredPayload;
    if (parsed.version !== 1 || !parsed.students) {
      return emptyPayload();
    }
    return parsed;
  } catch {
    return emptyPayload();
  }
}

export function writeStoredResults(payload: StoredPayload, storage = getBrowserStorage()): void {
  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getSavedStudentName(storage = getBrowserStorage()): string {
  if (!storage) {
    return "";
  }

  const raw = storage.getItem(PROFILE_KEY);
  if (!raw) {
    return "";
  }

  try {
    const parsed = JSON.parse(raw) as StoredProfile;
    if (parsed.version !== 1) {
      return "";
    }

    return normalizeStudentName(parsed.studentName);
  } catch {
    return "";
  }
}

export function saveStudentName(name: string, storage = getBrowserStorage()): void {
  if (!storage) {
    return;
  }

  const studentName = normalizeStudentName(name);
  if (!studentName) {
    return;
  }

  storage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      version: 1,
      studentName
    } satisfies StoredProfile)
  );
}

export function getStudentHistory(name: string, storage = getBrowserStorage()): DailyResult[] {
  const key = getStudentKey(name);
  if (!key) {
    return [];
  }

  return [...(readStoredResults(storage).students[key] ?? [])].sort((a, b) =>
    b.dateKey.localeCompare(a.dateKey)
  );
}

export function getDailyResult(
  name: string,
  dateKey: string,
  storage = getBrowserStorage()
): DailyResult | undefined {
  return getStudentHistory(name, storage).find((result) => result.dateKey === dateKey);
}

export function saveDailyResult(result: DailyResult, storage = getBrowserStorage()): void {
  const studentKey = getStudentKey(result.studentName);
  if (!studentKey) {
    return;
  }

  const payload = readStoredResults(storage);
  const currentResults = payload.students[studentKey] ?? [];
  const withoutSameDate = currentResults.filter((entry) => entry.dateKey !== result.dateKey);

  payload.students[studentKey] = [...withoutSameDate, result].sort((a, b) =>
    b.dateKey.localeCompare(a.dateKey)
  );

  writeStoredResults(payload, storage);
}

export function calculateCurrentStreak(results: DailyResult[], todayKey: string): number {
  const completedDates = new Set(results.map((result) => result.dateKey));
  let cursor = completedDates.has(todayKey) ? todayKey : previousDateKey(todayKey);
  let streak = 0;

  while (completedDates.has(cursor)) {
    streak += 1;
    cursor = previousDateKey(cursor);
  }

  return streak;
}
