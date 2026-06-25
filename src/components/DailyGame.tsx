"use client";

import { ArrowRight, Check, Clock3, Flame, Medal, Play, Trophy } from "lucide-react";
import { FormEvent, memo, useEffect, useMemo, useState } from "react";
import { MathText } from "@/components/MathText";
import { problems } from "@/data/problems";
import { formatDateKey, getPacificDateKey } from "@/lib/date";
import { selectDailyProblems } from "@/lib/daily";
import { MAX_DAILY_SCORE, buildDailyResult, getMedalLabel, scoreQuestion } from "@/lib/score";
import {
  calculateCurrentStreak,
  getDailyResult,
  getSavedStudentName,
  getStudentHistory,
  normalizeStudentName,
  saveDailyResult,
  saveStudentName,
  type StorageLike
} from "@/lib/storage";
import type { DailyResult, Problem, QuestionResult } from "@/lib/types";

type DailyGameProps = {
  today?: Date;
  storage?: StorageLike;
};

type GameMode = "home" | "quiz" | "review" | "score" | "streak";

export function DailyGame({ today, storage }: DailyGameProps) {
  const dateKey = useMemo(() => getPacificDateKey(today), [today]);
  const dailyProblems = useMemo(() => selectDailyProblems(problems, dateKey), [dateKey]);
  const activeStorage = storage;

  const [mode, setMode] = useState<GameMode>("home");
  const [nameInput, setNameInput] = useState("");
  const [studentName, setStudentName] = useState("");
  const [history, setHistory] = useState<DailyResult[]>([]);
  const [currentResult, setCurrentResult] = useState<DailyResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStart, setQuestionStart] = useState(() => performance.now());
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [checkedResult, setCheckedResult] = useState<QuestionResult | null>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);

  const trimmedInput = normalizeStudentName(nameInput);
  const homeHistory = trimmedInput ? getStudentHistory(trimmedInput, activeStorage) : [];
  const homeStreak = calculateCurrentStreak(homeHistory, dateKey);
  const streak = calculateCurrentStreak(history, dateKey);
  const currentProblem = dailyProblems[currentIndex];

  useEffect(() => {
    const savedName = getSavedStudentName(activeStorage);

    if (!savedName) {
      return;
    }

    setNameInput(savedName);
    setStudentName(savedName);
    setHistory(getStudentHistory(savedName, activeStorage));
  }, [activeStorage]);

  function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedInput) {
      return;
    }

    saveStudentName(trimmedInput, activeStorage);
    setStudentName(trimmedInput);

    const existingResult = getDailyResult(trimmedInput, dateKey, activeStorage);
    const nextHistory = getStudentHistory(trimmedInput, activeStorage);
    setHistory(nextHistory);

    if (existingResult) {
      setCurrentResult(existingResult);
      setQuestionResults(existingResult.questionResults);
      setCurrentIndex(0);
      setMode("review");
      return;
    }

    setCurrentResult(null);
    setQuestionResults([]);
    setCurrentIndex(0);
    startQuestion();
    setMode("quiz");
  }

  function startQuestion() {
    const start = performance.now();
    setSelectedChoiceId(null);
    setCheckedResult(null);
    setQuestionStart(start);
  }

  function handleCheck() {
    if (!selectedChoiceId || checkedResult) {
      return;
    }

    const answeredAt = performance.now();
    const exactElapsedSeconds = Math.max(0, (answeredAt - questionStart) / 1000);
    const solved = selectedChoiceId === currentProblem.correctChoiceId;

    setCheckedResult(
      scoreQuestion({
        problemId: currentProblem.id,
        difficulty: currentProblem.difficulty,
        selectedChoiceIds: [selectedChoiceId],
        correctChoiceId: currentProblem.correctChoiceId,
        solved,
        elapsedSeconds: Number(exactElapsedSeconds.toFixed(1))
      })
    );
  }

  function handleNextQuestion() {
    if (!checkedResult) {
      return;
    }

    const nextQuestionResults = [...questionResults, checkedResult];
    setQuestionResults(nextQuestionResults);

    if (currentIndex < dailyProblems.length - 1) {
      setCurrentIndex((value) => value + 1);
      startQuestion();
      return;
    }

    setCurrentResult(
      buildDailyResult({
        dateKey,
        studentName,
        questionResults: nextQuestionResults
      })
    );
    setMode("score");
  }

  function handleNextReviewQuestion() {
    if (currentIndex < dailyProblems.length - 1) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    setMode("score");
  }

  function handleScoreContinue() {
    if (!currentResult) {
      return;
    }

    saveDailyResult(currentResult, activeStorage);
    const nextHistory = getStudentHistory(currentResult.studentName, activeStorage);
    setHistory(nextHistory);
    setMode("streak");
  }

  function handleStreakContinue() {
    setCurrentResult(null);
    setQuestionResults([]);
    setSelectedChoiceId(null);
    setCheckedResult(null);
    setMode("home");
  }

  return (
    <main className="app-shell">
      {mode === "home" ? (
        <HomeScreen
          dateKey={dateKey}
          nameInput={nameInput}
          onNameChange={setNameInput}
          onSubmit={handleStart}
          streak={homeStreak}
        />
      ) : null}

      {mode === "quiz" || mode === "review" ? (
        <QuestionScreen
          currentIndex={currentIndex}
          isReview={mode === "review"}
          onCheck={handleCheck}
          onNext={mode === "review" ? handleNextReviewQuestion : handleNextQuestion}
          onSelectChoice={setSelectedChoiceId}
          problem={currentProblem}
          questionStart={questionStart}
          result={checkedResult}
          reviewResult={mode === "review" ? currentResult?.questionResults[currentIndex] ?? null : null}
          selectedChoiceId={selectedChoiceId}
          studentName={studentName}
          totalQuestions={dailyProblems.length}
        />
      ) : null}

      {mode === "score" && currentResult ? (
        <ScoreScreen onContinue={handleScoreContinue} result={currentResult} />
      ) : null}

      {mode === "streak" ? (
        <StreakScreen onContinue={handleStreakContinue} streak={streak} />
      ) : null}
    </main>
  );
}

type HomeScreenProps = {
  dateKey: string;
  nameInput: string;
  onNameChange(name: string): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
  streak: number;
};

function HomeScreen({ dateKey, nameInput, onNameChange, onSubmit, streak }: HomeScreenProps) {
  return (
    <section className="app-card home-card" aria-label="Three Qs home">
      <div className="home-art" aria-hidden="true">
        <div className="math-bubble bubble-one">3</div>
        <div className="math-bubble bubble-two">x</div>
        <div className="math-bubble bubble-three">?</div>
      </div>

      <div className="home-copy">
        <p className="today-label">{formatDateKey(dateKey)}</p>
        <h1>Three Qs</h1>
        <p>Your daily math superbowl challenge</p>
      </div>

      <div className="streak-pill" aria-label={`${streak} day streak`}>
        <span className="streak-icon">
          <Flame size={23} />
        </span>
        <span>
          <strong>{streak}</strong>
          <small>day streak</small>
        </span>
      </div>

      <form className="home-form" onSubmit={onSubmit}>
        <label className="input-label">
          <span>Your name</span>
          <input
            className="name-input"
            name="studentName"
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Type your name"
            value={nameInput}
          />
        </label>

        <button className="primary-action" disabled={!normalizeStudentName(nameInput)} type="submit">
          <Play size={19} fill="currentColor" />
          Play
        </button>
      </form>
    </section>
  );
}

type QuestionScreenProps = {
  currentIndex: number;
  isReview: boolean;
  onCheck(): void;
  onNext(): void;
  onSelectChoice(choiceId: string): void;
  problem: Problem;
  questionStart: number;
  result: QuestionResult | null;
  reviewResult: QuestionResult | null;
  selectedChoiceId: string | null;
  studentName: string;
  totalQuestions: number;
};

function QuestionScreen({
  currentIndex,
  isReview,
  onCheck,
  onNext,
  onSelectChoice,
  problem,
  questionStart,
  result,
  reviewResult,
  selectedChoiceId,
  studentName,
  totalQuestions
}: QuestionScreenProps) {
  const firstLetter = studentName.charAt(0).toUpperCase() || "?";
  const displayResult = isReview ? reviewResult : result;
  const displaySelectedChoiceId = isReview
    ? reviewResult?.selectedChoiceIds.at(-1) ?? null
    : selectedChoiceId;

  return (
    <section className="app-card quiz-card" aria-label="Question screen">
      <header className="quiz-topbar">
        <div className="avatar" aria-label={`Account ${firstLetter}`}>
          {firstLetter}
        </div>

        <div className="segmented-progress" aria-label={`Question ${currentIndex + 1} of ${totalQuestions}`}>
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <span
              className={[
                "progress-segment",
                index < currentIndex ? "complete" : "",
                index === currentIndex ? "current" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              key={index}
            />
          ))}
        </div>

        <TimerPill
          key={`${currentIndex}-${questionStart}`}
          frozenSeconds={displayResult?.elapsedSeconds}
          startedAt={questionStart}
        />
      </header>

      <div className="quiz-content">
        <p className="question-count">Question {currentIndex + 1} of {totalQuestions}</p>
        <div className="quiz-prompt">
          <MathText text={problem.prompt} />
        </div>

        <div className="answer-grid">
          {problem.choices.map((choice) => {
            const isSelected = displaySelectedChoiceId === choice.id;
            const isCorrect = Boolean(displayResult && choice.id === problem.correctChoiceId);
            const isWrong = Boolean(displayResult && isSelected && choice.id !== problem.correctChoiceId);

            return (
              <button
                aria-pressed={isSelected}
                className={[
                  "answer-button",
                  isSelected ? "selected" : "",
                  isCorrect ? "correct" : "",
                  isWrong ? "wrong" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-testid={`choice-${choice.id}`}
                disabled={Boolean(displayResult) || isReview}
                key={choice.id}
                onClick={() => onSelectChoice(choice.id)}
                type="button"
              >
                <span className="answer-letter">{choice.id}</span>
                <span className="answer-text">
                  <MathText text={choice.label} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="quiz-footer">
        {isReview ? (
          <button className="primary-action check-action" onClick={onNext} type="button">
            <ArrowRight size={19} />
            Next
          </button>
        ) : (
          <button
            className="primary-action check-action"
            disabled={!selectedChoiceId || Boolean(result)}
            onClick={onCheck}
            type="button"
          >
            <Check size={19} />
            Check
          </button>
        )}
      </div>

      {!isReview && result ? (
        <FeedbackSheet
          isFinalQuestion={currentIndex + 1 === totalQuestions}
          onNext={onNext}
          problem={problem}
          result={result}
        />
      ) : null}
    </section>
  );
}

const TimerPill = memo(function TimerPill({
  frozenSeconds,
  startedAt
}: {
  frozenSeconds?: number;
  startedAt: number;
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(() => getElapsedSeconds(startedAt));
  const displaySeconds = toWholeSeconds(frozenSeconds ?? elapsedSeconds);
  const digitClass = getTimerDigitClass(displaySeconds);

  useEffect(() => {
    if (frozenSeconds !== undefined) {
      setElapsedSeconds(frozenSeconds);
      return undefined;
    }

    const updateElapsed = () => setElapsedSeconds(getElapsedSeconds(startedAt));
    updateElapsed();

    const interval = window.setInterval(updateElapsed, 200);
    return () => window.clearInterval(interval);
  }, [frozenSeconds, startedAt]);

  return (
    <div className={`timer-pill ${digitClass}`} aria-label={`${displaySeconds} seconds elapsed`}>
      <Clock3 size={17} />
      {displaySeconds}s
    </div>
  );
});

function getElapsedSeconds(startedAt: number): number {
  return Math.max(0, (performance.now() - startedAt) / 1000);
}

function toWholeSeconds(seconds: number): number {
  return Math.max(0, Math.floor(seconds));
}

function getTimerDigitClass(seconds: number): "digits-1" | "digits-2" | "digits-3" {
  if (seconds >= 100) {
    return "digits-3";
  }

  if (seconds >= 10) {
    return "digits-2";
  }

  return "digits-1";
}

type FeedbackSheetProps = {
  isFinalQuestion: boolean;
  onNext(): void;
  problem: Problem;
  result: QuestionResult;
};

function FeedbackSheet({ isFinalQuestion, onNext, problem, result }: FeedbackSheetProps) {
  return (
    <div className={`feedback-sheet ${result.solved ? "correct" : "incorrect"}`} role="status">
      <div>
        <h2>{result.solved ? "Correct!" : "Not quite"}</h2>
        {result.solved ? (
          <p>
            +{result.score} points in {toWholeSeconds(result.elapsedSeconds)} seconds.
          </p>
        ) : (
          <p>
            <MathText text={problem.explanation} />
          </p>
        )}
      </div>

      <button className="sheet-next" onClick={onNext} type="button">
        {isFinalQuestion ? "Next" : "Next"}
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

type ScoreScreenProps = {
  onContinue(): void;
  result: DailyResult;
};

function ScoreScreen({ onContinue, result }: ScoreScreenProps) {
  const solvedCount = result.questionResults.filter((entry) => entry.solved).length;
  const medalLabel = getMedalLabel(result.medal);

  return (
    <section className="app-card score-card" aria-label="Completion score">
      <div className={`medal-emblem ${result.medal}`}>
        {result.medal === "gold" ? <Trophy size={54} /> : <Medal size={54} />}
      </div>

      <div className="score-copy">
        <p className="today-label">Challenge complete</p>
        <h1>{medalLabel}</h1>
        <p>
          You scored <strong>{result.totalScore}</strong> out of {MAX_DAILY_SCORE} points.
        </p>
      </div>

      <div className="score-stats">
        <div>
          <strong>{solvedCount}/3</strong>
          <span>correct</span>
        </div>
        <div>
          <strong>{Math.round(averageTime(result.questionResults))}s</strong>
          <span>avg time</span>
        </div>
      </div>

      <button className="primary-action" onClick={onContinue} type="button">
        Continue
      </button>
    </section>
  );
}

type StreakScreenProps = {
  onContinue(): void;
  streak: number;
};

function StreakScreen({ onContinue, streak }: StreakScreenProps) {
  return (
    <section className="app-card streak-card" aria-label="Current streak">
      <div className="streak-burst" aria-hidden="true">
        <Flame size={86} fill="currentColor" />
      </div>

      <div className="streak-copy">
        <p className="today-label">Current streak</p>
        <h1>{streak}</h1>
        <p>{streak === 1 ? "day" : "days"} in a row</p>
      </div>

      <button className="primary-action" onClick={onContinue} type="button">
        Continue
      </button>
    </section>
  );
}

function averageTime(results: QuestionResult[]): number {
  if (results.length === 0) {
    return 0;
  }

  return results.reduce((sum, result) => sum + result.elapsedSeconds, 0) / results.length;
}
