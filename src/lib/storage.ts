import { previousDateKey } from "@/lib/date";
import type { LeaderboardEntry } from "@/lib/supabaseLeaderboard";
import type { DailyResult, QuestionResult } from "@/lib/types";

const STORAGE_KEY = "msb-daily-results-v1";
const PROFILE_KEY = "three-qs-profile-v1";
const DRAFT_KEY = "three-qs-daily-draft-v1";
const LEADERBOARD_KEY = "three-qs-leaderboard-v2";

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
  version: 1 | 2;
  studentName: string;
  photoDataUrl?: string;
};

type StoredLeaderboard = {
  version: 2;
  entries: LeaderboardEntry[];
};

export type DailyDraft = {
  dateKey: string;
  studentName: string;
  currentIndex: number;
  questionResults: QuestionResult[];
  selectedChoiceId: string | null;
  attemptedChoiceIds: string[];
  checkedResult: QuestionResult | null;
  isCurrentQuestionFinalized: boolean;
  questionElapsedMs: number;
};

type StoredDailyDraft = Omit<DailyDraft, "questionResults"> & {
  version: 1;
  questionResults: Record<string, QuestionResult>;
  updatedAt: string;
};

type StoredDailyDraftCollection = {
  version: 2;
  drafts: Record<string, StoredDailyDraft>;
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
    if (parsed.version !== 1 && parsed.version !== 2) {
      return "";
    }

    return normalizeStudentName(parsed.studentName);
  } catch {
    return "";
  }
}

export function getSavedStudentPhoto(storage = getBrowserStorage()): string {
  if (!storage) {
    return "";
  }

  const raw = storage.getItem(PROFILE_KEY);
  if (!raw) {
    return "";
  }

  try {
    const parsed = JSON.parse(raw) as StoredProfile;
    return parsed.version === 2 && typeof parsed.photoDataUrl === "string"
      ? parsed.photoDataUrl
      : "";
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

  const savedName = getSavedStudentName(storage);
  const savedPhoto =
    getStudentKey(savedName) === getStudentKey(studentName) ? getSavedStudentPhoto(storage) : "";

  storage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      version: 2,
      studentName,
      ...(savedPhoto ? { photoDataUrl: savedPhoto } : {})
    } satisfies StoredProfile)
  );
}

export function saveStudentPhoto(
  name: string,
  photoDataUrl: string,
  storage = getBrowserStorage()
): void {
  if (!storage) {
    return;
  }

  const studentName = normalizeStudentName(name);
  if (!studentName || getStudentKey(getSavedStudentName(storage)) !== getStudentKey(studentName)) {
    return;
  }

  storage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      version: 2,
      studentName,
      photoDataUrl
    } satisfies StoredProfile)
  );
}

export function clearSavedStudentName(
  name?: string,
  storage = getBrowserStorage()
): void {
  if (!storage) {
    return;
  }

  if (name && getStudentKey(getSavedStudentName(storage)) !== getStudentKey(name)) {
    return;
  }

  if (storage.removeItem) {
    storage.removeItem(PROFILE_KEY);
    return;
  }

  storage.setItem(PROFILE_KEY, "");
}

export function getCachedLeaderboard(storage = getBrowserStorage()): LeaderboardEntry[] | null {
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(LEADERBOARD_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredLeaderboard;
    if (parsed.version !== 2 || !Array.isArray(parsed.entries)) {
      return null;
    }

    return mergeLeaderboardEntries(parsed.entries);
  } catch {
    return null;
  }
}

export function saveCachedLeaderboard(
  entries: LeaderboardEntry[],
  storage = getBrowserStorage()
): void {
  if (!storage) {
    return;
  }

  storage.setItem(
    LEADERBOARD_KEY,
    JSON.stringify({
      version: 2,
      entries: mergeLeaderboardEntries(entries)
    } satisfies StoredLeaderboard)
  );
}

function mergeLeaderboardEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const byStudent = new Map<string, LeaderboardEntry>();

  for (const entry of entries) {
    const studentKey = getStudentKey(entry.studentName);
    if (!studentKey) {
      continue;
    }

    const current =
      byStudent.get(studentKey) ??
      ({
        studentName: normalizeStudentName(entry.studentName),
        totalPoints: 0,
        gold: 0,
        silver: 0,
        bronze: 0
      } satisfies LeaderboardEntry);

    current.totalPoints += entry.totalPoints;
    current.gold += entry.gold;
    current.silver += entry.silver;
    current.bronze += entry.bronze;
    byStudent.set(studentKey, current);
  }

  return [...byStudent.values()].sort(
    (a, b) => b.totalPoints - a.totalPoints || b.gold - a.gold || b.silver - a.silver
  );
}

export function getDailyDraft(
  name: string,
  dateKey: string,
  storage = getBrowserStorage()
): DailyDraft | null {
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const payload = JSON.parse(raw) as StoredDailyDraft | StoredDailyDraftCollection;
    const parsed = payload.version === 2
      ? payload.drafts[getDraftKey(name, dateKey)]
      : payload;

    if (
      !parsed ||
      parsed.version !== 1 ||
      parsed.dateKey !== dateKey ||
      getStudentKey(parsed.studentName) !== getStudentKey(name)
    ) {
      return null;
    }

    return {
      dateKey: parsed.dateKey,
      studentName: normalizeStudentName(parsed.studentName),
      currentIndex: Math.max(0, Math.floor(parsed.currentIndex)),
      questionResults: decodeQuestionResults(parsed.questionResults),
      selectedChoiceId: typeof parsed.selectedChoiceId === "string" ? parsed.selectedChoiceId : null,
      attemptedChoiceIds: Array.isArray(parsed.attemptedChoiceIds)
        ? parsed.attemptedChoiceIds.filter((choiceId): choiceId is string => typeof choiceId === "string")
        : [],
      checkedResult: isQuestionResult(parsed.checkedResult) ? parsed.checkedResult : null,
      isCurrentQuestionFinalized: Boolean(parsed.isCurrentQuestionFinalized),
      questionElapsedMs:
        typeof parsed.questionElapsedMs === "number" && Number.isFinite(parsed.questionElapsedMs)
          ? Math.max(0, parsed.questionElapsedMs)
          : 0
    };
  } catch {
    return null;
  }
}

export function saveDailyDraft(draft: DailyDraft, storage = getBrowserStorage()): void {
  if (!storage) {
    return;
  }

  const studentName = normalizeStudentName(draft.studentName);
  if (!studentName || !draft.dateKey) {
    return;
  }

  const storedDraft = {
      version: 1,
      dateKey: draft.dateKey,
      studentName,
      currentIndex: Math.max(0, Math.floor(draft.currentIndex)),
      questionResults: encodeQuestionResults(draft.questionResults),
      selectedChoiceId: draft.selectedChoiceId,
      attemptedChoiceIds: draft.attemptedChoiceIds,
      checkedResult: draft.checkedResult,
      isCurrentQuestionFinalized: draft.isCurrentQuestionFinalized,
      questionElapsedMs:
        Number.isFinite(draft.questionElapsedMs) && draft.questionElapsedMs > 0
          ? draft.questionElapsedMs
          : 0,
      updatedAt: new Date().toISOString()
    } satisfies StoredDailyDraft;
  const collection = readDraftCollection(storage);
  collection.drafts[getDraftKey(studentName, draft.dateKey)] = storedDraft;
  storage.setItem(DRAFT_KEY, JSON.stringify(collection));
}

export function clearDailyDraft(
  name: string,
  dateKey: string,
  storage = getBrowserStorage()
): void {
  if (!storage || !getDailyDraft(name, dateKey, storage)) {
    return;
  }

  const collection = readDraftCollection(storage);
  delete collection.drafts[getDraftKey(name, dateKey)];

  if (Object.keys(collection.drafts).length > 0) {
    storage.setItem(DRAFT_KEY, JSON.stringify(collection));
    return;
  }

  if (storage.removeItem) {
    storage.removeItem(DRAFT_KEY);
  } else {
    storage.setItem(DRAFT_KEY, "");
  }
}

function getDraftKey(name: string, dateKey: string): string {
  return `${getStudentKey(name)}:${dateKey}`;
}

function readDraftCollection(storage: StorageLike): StoredDailyDraftCollection {
  const empty: StoredDailyDraftCollection = { version: 2, drafts: {} };
  const raw = storage.getItem(DRAFT_KEY);
  if (!raw) {
    return empty;
  }

  try {
    const payload = JSON.parse(raw) as StoredDailyDraft | StoredDailyDraftCollection;
    if (payload.version === 2 && payload.drafts && typeof payload.drafts === "object") {
      return payload;
    }

    if (payload.version === 1 && payload.studentName && payload.dateKey) {
      return {
        version: 2,
        drafts: { [getDraftKey(payload.studentName, payload.dateKey)]: payload }
      };
    }
  } catch {
    return empty;
  }

  return empty;
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

export function replaceStudentHistory(
  name: string,
  results: DailyResult[],
  storage = getBrowserStorage()
): void {
  const studentKey = getStudentKey(name);
  if (!studentKey) {
    return;
  }

  const payload = readStoredResults(storage);
  payload.students[studentKey] = [...results].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
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

function encodeQuestionResults(results: QuestionResult[]): Record<string, QuestionResult> {
  return results.reduce<Record<string, QuestionResult>>((encoded, result, index) => {
    if (isQuestionResult(result)) {
      encoded[index] = result;
    }

    return encoded;
  }, {});
}

function decodeQuestionResults(results: Record<string, QuestionResult>): QuestionResult[] {
  if (!results || typeof results !== "object") {
    return [];
  }

  return Object.entries(results).reduce<QuestionResult[]>((decoded, [key, result]) => {
    const index = Number(key);

    if (Number.isInteger(index) && index >= 0 && isQuestionResult(result)) {
      decoded[index] = result;
    }

    return decoded;
  }, []);
}

function isQuestionResult(value: unknown): value is QuestionResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<QuestionResult>;
  return (
    typeof result.problemId === "string" &&
    typeof result.correctChoiceId === "string" &&
    Array.isArray(result.selectedChoiceIds) &&
    typeof result.attemptsUsed === "number" &&
    typeof result.solved === "boolean" &&
    typeof result.elapsedSeconds === "number" &&
    typeof result.attemptPoints === "number" &&
    typeof result.speedBonus === "number" &&
    typeof result.score === "number"
  );
}
