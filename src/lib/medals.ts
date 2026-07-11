import type { Medal } from "@/lib/types";

export type QuestionMedal = Exclude<Medal, "practice">;

type MedalRule<TMedal extends Medal> = {
  medal: TMedal;
  minimumScore: number;
};

// Daily scores have a maximum of 390 points. Keep these rules in descending
// order so the first matching threshold is the medal that should be awarded.
export const DAILY_MEDAL_RULES = [
  { medal: "gold", minimumScore: 330 },
  { medal: "silver", minimumScore: 240 },
  { medal: "bronze", minimumScore: 150 },
  { medal: "practice", minimumScore: 0 }
] as const satisfies readonly MedalRule<Medal>[];

// A question has a maximum of 130 points. A first-try solve is gold, a
// second-try solve is silver, and a miss is bronze.
export const QUESTION_MEDAL_RULES = [
  { medal: "gold", minimumScore: 100 },
  { medal: "silver", minimumScore: 50 },
  { medal: "bronze", minimumScore: 0 }
] as const satisfies readonly MedalRule<QuestionMedal>[];

const MEDAL_LABELS: Record<Medal, string> = {
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  practice: "Practice"
};

export function getMedal(totalScore: number): Medal {
  return getMedalForScore(totalScore, DAILY_MEDAL_RULES);
}

export function getQuestionMedal(score: number): QuestionMedal {
  return getMedalForScore(score, QUESTION_MEDAL_RULES);
}

export function getMedalLabel(medal: Medal): string {
  return MEDAL_LABELS[medal];
}

function getMedalForScore<TMedal extends Medal>(
  score: number,
  rules: readonly MedalRule<TMedal>[]
): TMedal {
  return rules.find((rule) => score >= rule.minimumScore)?.medal ?? rules[rules.length - 1].medal;
}
