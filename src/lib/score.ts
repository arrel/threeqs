import type { DailyResult, QuestionResult } from "@/lib/types";
import { formatElapsedSeconds } from "@/lib/time";
import { getMedal, getMedalLabel } from "@/lib/medals";

export const MAX_ATTEMPTS = 2;
export const MAX_DAILY_SCORE = 390;

export function getAttemptPoints(solved: boolean, attemptsUsed: number): number {
  if (!solved) {
    return 0;
  }

  if (attemptsUsed === 1) {
    return 100;
  }

  if (attemptsUsed === 2) {
    return 50;
  }

  return 0;
}

export function getSpeedBonus(solved: boolean, elapsedSeconds: number): number {
  if (!solved) {
    return 0;
  }

  if (elapsedSeconds < 10) {
    return 30;
  }

  if (elapsedSeconds < 30) {
    return 20;
  }

  if (elapsedSeconds < 60) {
    return 10;
  }

  return 0;
}

export function scoreQuestion(input: {
  problemId: string;
  difficulty: QuestionResult["difficulty"];
  selectedChoiceIds: string[];
  correctChoiceId: string;
  solved: boolean;
  elapsedSeconds: number;
}): QuestionResult {
  const attemptsUsed = input.selectedChoiceIds.length;
  const attemptPoints = getAttemptPoints(input.solved, attemptsUsed);
  const speedBonus = getSpeedBonus(input.solved, input.elapsedSeconds);

  return {
    problemId: input.problemId,
    difficulty: input.difficulty,
    selectedChoiceIds: input.selectedChoiceIds,
    correctChoiceId: input.correctChoiceId,
    attemptsUsed,
    solved: input.solved,
    elapsedSeconds: input.elapsedSeconds,
    attemptPoints,
    speedBonus,
    score: attemptPoints + speedBonus
  };
}

export function buildDailyResult(input: {
  dateKey: string;
  studentName: string;
  questionResults: QuestionResult[];
  completedAt?: Date;
}): DailyResult {
  const totalScore = input.questionResults.reduce((sum, result) => sum + result.score, 0);
  const medal = getMedal(totalScore);

  const result: DailyResult = {
    dateKey: input.dateKey,
    studentName: input.studentName,
    totalScore,
    maxScore: MAX_DAILY_SCORE,
    medal,
    completedAt: (input.completedAt ?? new Date()).toISOString(),
    questionResults: input.questionResults,
    shareText: ""
  };

  return {
    ...result,
    shareText: buildShareText(result)
  };
}

export function canonicalizeDailyResult(result: DailyResult): DailyResult {
  const canonicalResult = {
    ...result,
    medal: getMedal(result.totalScore)
  };

  return {
    ...canonicalResult,
    shareText: buildShareText(canonicalResult)
  };
}

export function buildShareText(result: DailyResult): string {
  const lines = [
    `Three Qs ${result.dateKey}`,
    `${getMedalLabel(result.medal)} ${result.totalScore}/${result.maxScore}`,
    ...result.questionResults.map((question, index) => {
      const status = question.solved ? "correct" : "missed";
      const tries = question.attemptsUsed === 1 ? "1 try" : `${question.attemptsUsed} tries`;
      return `Q${index + 1}: ${status}, ${tries}, ${formatElapsedSeconds(Math.round(question.elapsedSeconds))}`;
    })
  ];

  return lines.join("\n");
}
