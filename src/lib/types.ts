export type Difficulty = "easy" | "medium" | "stretch";

export type ProblemChoice = {
  id: string;
  label: string;
};

export type ProblemSource = {
  name: string;
  url?: string;
  year?: string;
  event?: string;
};

export type VocabTerm = {
  term: string;
  definition: string;
  aliases?: string[];
};

export type Problem = {
  id: string;
  scheduledDate: string;
  prompt: string;
  choices: ProblemChoice[];
  correctChoiceId: string;
  explanation: string;
  difficulty: Difficulty;
  topics: string[];
  vocabTerms?: VocabTerm[];
  gradeBand: string;
  source: ProblemSource;
  adapted: boolean;
};

export type Medal = "gold" | "silver" | "bronze" | "practice";

export type QuestionResult = {
  problemId: string;
  difficulty: Difficulty;
  selectedChoiceIds: string[];
  correctChoiceId: string;
  attemptsUsed: number;
  solved: boolean;
  elapsedSeconds: number;
  attemptPoints: number;
  speedBonus: number;
  score: number;
};

export type DailyResult = {
  dateKey: string;
  studentName: string;
  totalScore: number;
  maxScore: number;
  medal: Medal;
  completedAt: string;
  questionResults: QuestionResult[];
  shareText: string;
};
