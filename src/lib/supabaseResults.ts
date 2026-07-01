import { getStudentKey, normalizeStudentName } from "@/lib/storage";
import { isDisallowedStudentName } from "@/lib/server/studentNamePolicy";
import type { DailyResult, Medal, QuestionResult } from "@/lib/types";

type SupabaseConfig = {
  key: string;
  url: string;
};

type StudentRow = {
  id: string;
  name: string;
  name_key: string;
};

type DailyResultRow = {
  id: string;
  student_id: string;
  student_name: string;
  date_key: string;
  total_score: number;
  max_score: number;
  medal: Medal;
  completed_at: string;
  share_text: string;
};

type QuestionResultRow = {
  id: string;
  daily_result_id: string;
  student_id: string;
  student_name: string;
  date_key: string;
  question_index: number;
  problem_id: string;
  difficulty: QuestionResult["difficulty"];
  selected_choice_ids: string[];
  correct_choice_id: string;
  attempts_used: number;
  solved: boolean;
  elapsed_seconds: number | string;
  attempt_points: number;
  speed_bonus: number;
  score: number;
};

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Supabase is not configured.");
    this.name = "SupabaseNotConfiguredError";
  }
}

export async function loadSupabaseHistory(studentName: string): Promise<DailyResult[]> {
  if (isDisallowedStudentName(studentName)) {
    return [];
  }

  const student = await findStudent(studentName);
  if (!student) {
    return [];
  }

  const dailyRows = await supabaseRest<DailyResultRow[]>("daily_results", {
    order: "date_key.desc",
    select: "*",
    student_id: `eq.${student.id}`
  });

  if (dailyRows.length === 0) {
    return [];
  }

  const dailyIds = dailyRows.map((row) => row.id).join(",");
  const questionRows = await supabaseRest<QuestionResultRow[]>("question_results", {
    daily_result_id: `in.(${dailyIds})`,
    order: "question_index.asc",
    select: "*"
  });
  const questionsByDailyId = groupQuestionsByDailyId(questionRows);

  return dailyRows.map((row) => rowToDailyResult(row, questionsByDailyId.get(row.id) ?? []));
}

export async function saveSupabaseDailyResult(result: DailyResult): Promise<DailyResult> {
  if (isDisallowedStudentName(result.studentName)) {
    return {
      ...result,
      studentName: normalizeStudentName(result.studentName)
    };
  }

  const student = await getOrCreateStudent(result.studentName);
  const studentName = normalizeStudentName(result.studentName);
  const existingResult = await findDailyResult(student.id, result.dateKey);

  if (existingResult) {
    return existingResult;
  }

  let dailyRow: DailyResultRow;

  try {
    dailyRow = await insertDailyResult({
      result,
      studentId: student.id,
      studentName
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const duplicateResult = await findDailyResult(student.id, result.dateKey);

      if (duplicateResult) {
        return duplicateResult;
      }
    }

    throw error;
  }

  if (result.questionResults.length > 0) {
    await insertQuestionResults({
      dailyResultId: dailyRow.id,
      result,
      studentId: student.id,
      studentName
    });
  }

  return {
    ...result,
    studentName
  };
}

async function findDailyResult(studentId: string, dateKey: string): Promise<DailyResult | null> {
  const dailyRows = await supabaseRest<DailyResultRow[]>("daily_results", {
    date_key: `eq.${dateKey}`,
    limit: "1",
    select: "*",
    student_id: `eq.${studentId}`
  });
  const dailyRow = dailyRows[0];

  if (!dailyRow) {
    return null;
  }

  const questionRows = await supabaseRest<QuestionResultRow[]>("question_results", {
    daily_result_id: `eq.${dailyRow.id}`,
    order: "question_index.asc",
    select: "*"
  });

  return rowToDailyResult(dailyRow, questionRows);
}

async function insertDailyResult(input: {
  result: DailyResult;
  studentId: string;
  studentName: string;
}): Promise<DailyResultRow> {
  const dailyRows = await supabaseRest<DailyResultRow[]>(
    "daily_results",
    {},
    {
      body: JSON.stringify({
        student_id: input.studentId,
        student_name: input.studentName,
        date_key: input.result.dateKey,
        total_score: input.result.totalScore,
        max_score: input.result.maxScore,
        medal: input.result.medal,
        completed_at: input.result.completedAt,
        share_text: input.result.shareText
      }),
      headers: {
        Prefer: "return=representation"
      },
      method: "POST"
    }
  );

  const dailyRow = dailyRows[0];

  if (!dailyRow) {
    throw new Error("Supabase did not return the saved daily result.");
  }

  return dailyRow;
}

async function insertQuestionResults(input: {
  dailyResultId: string;
  result: DailyResult;
  studentId: string;
  studentName: string;
}): Promise<void> {
  try {
    await supabaseRest<QuestionResultRow[]>(
      "question_results",
      {},
      {
        body: JSON.stringify(
          input.result.questionResults.map((questionResult, index) =>
            questionResultToRow({
              dailyResultId: input.dailyResultId,
              dateKey: input.result.dateKey,
              index,
              questionResult,
              studentId: input.studentId,
              studentName: input.studentName
            })
          )
        ),
        headers: {
          Prefer: "return=minimal"
        },
        method: "POST"
      }
    );
  } catch (error) {
    if (!isUniqueViolation(error)) {
      throw error;
    }
  }
}

async function getOrCreateStudent(studentName: string): Promise<StudentRow> {
  const normalizedName = normalizeStudentName(studentName);
  const nameKey = getStudentKey(normalizedName);

  if (!nameKey) {
    throw new Error("Student name is required.");
  }

  const existingStudent = await findStudent(normalizedName);
  if (existingStudent) {
    return existingStudent;
  }

  try {
    const rows = await supabaseRest<StudentRow[]>(
      "students",
      {},
      {
        body: JSON.stringify({
          name: normalizedName,
          name_key: nameKey
        }),
        headers: {
          Prefer: "return=representation"
        },
        method: "POST"
      }
    );

    const student = rows[0];
    if (!student) {
      throw new Error("Supabase did not return the saved student.");
    }

    return student;
  } catch (error) {
    if (isUniqueViolation(error)) {
      const student = await findStudent(normalizedName);

      if (student) {
        return student;
      }
    }

    throw error;
  }
}

async function findStudent(studentName: string): Promise<StudentRow | null> {
  const studentKey = getStudentKey(studentName);
  if (!studentKey) {
    return null;
  }

  const rows = await supabaseRest<StudentRow[]>("students", {
    limit: "1",
    name_key: `eq.${studentKey}`,
    select: "*"
  });

  return rows[0] ?? null;
}

async function supabaseRest<T>(
  table: string,
  query: Record<string, string>,
  init: RequestInit = {}
): Promise<T> {
  const config = getSupabaseConfig();
  const url = new URL(`${config.url}/rest/v1/${table}`);

  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const headers = new Headers(init.headers);
  headers.set("apikey", config.key);
  headers.set("Authorization", `Bearer ${config.key}`);
  headers.set("Accept", "application/json");

  if (init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Supabase ${init.method ?? "GET"} ${table} failed: ${response.status} ${text}`);
  }

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new SupabaseNotConfiguredError();
  }

  return {
    key,
    url: url.replace(/\/$/, "")
  };
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Error && (error.message.includes("23505") || error.message.includes("duplicate key"));
}

function groupQuestionsByDailyId(rows: QuestionResultRow[]): Map<string, QuestionResultRow[]> {
  const grouped = new Map<string, QuestionResultRow[]>();

  rows.forEach((row) => {
    const rowsForDailyResult = grouped.get(row.daily_result_id) ?? [];
    rowsForDailyResult.push(row);
    grouped.set(row.daily_result_id, rowsForDailyResult);
  });

  return grouped;
}

function rowToDailyResult(row: DailyResultRow, questionRows: QuestionResultRow[]): DailyResult {
  return {
    dateKey: row.date_key,
    studentName: row.student_name,
    totalScore: row.total_score,
    maxScore: row.max_score,
    medal: row.medal,
    completedAt: row.completed_at,
    questionResults: questionRows
      .sort((a, b) => a.question_index - b.question_index)
      .map(rowToQuestionResult),
    shareText: row.share_text
  };
}

function rowToQuestionResult(row: QuestionResultRow): QuestionResult {
  return {
    problemId: row.problem_id,
    difficulty: row.difficulty,
    selectedChoiceIds: row.selected_choice_ids,
    correctChoiceId: row.correct_choice_id,
    attemptsUsed: row.attempts_used,
    solved: row.solved,
    elapsedSeconds: Number(row.elapsed_seconds),
    attemptPoints: row.attempt_points,
    speedBonus: row.speed_bonus,
    score: row.score
  };
}

function questionResultToRow(input: {
  dailyResultId: string;
  dateKey: string;
  index: number;
  questionResult: QuestionResult;
  studentId: string;
  studentName: string;
}): Omit<QuestionResultRow, "id"> {
  return {
    daily_result_id: input.dailyResultId,
    student_id: input.studentId,
    student_name: input.studentName,
    date_key: input.dateKey,
    question_index: input.index,
    problem_id: input.questionResult.problemId,
    difficulty: input.questionResult.difficulty,
    selected_choice_ids: input.questionResult.selectedChoiceIds,
    correct_choice_id: input.questionResult.correctChoiceId,
    attempts_used: input.questionResult.attemptsUsed,
    solved: input.questionResult.solved,
    elapsed_seconds: input.questionResult.elapsedSeconds,
    attempt_points: input.questionResult.attemptPoints,
    speed_bonus: input.questionResult.speedBonus,
    score: input.questionResult.score
  };
}
