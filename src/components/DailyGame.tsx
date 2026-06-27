"use client";

import { ArrowLeft, ArrowRight, Check, Clock3, Flame, Medal, Pencil, Play, Trophy } from "lucide-react";
import { FormEvent, memo, useCallback, useEffect, useMemo, useState } from "react";
import { MathText } from "@/components/MathText";
import { problems } from "@/data/problems";
import { formatDateKey, getPacificDateKey } from "@/lib/date";
import { selectDailyProblems, shuffleWithSeed } from "@/lib/daily";
import type { GameRoute, RouteNavigation } from "@/lib/gameRoutes";
import { fetchLeaderboard, fetchRemoteHistory, saveRemoteDailyResult } from "@/lib/remoteResults";
import type { LeaderboardEntry } from "@/lib/supabaseLeaderboard";
import {
  MAX_ATTEMPTS,
  MAX_DAILY_SCORE,
  buildDailyResult,
  getMedalLabel,
  getQuestionMedal,
  scoreQuestion
} from "@/lib/score";
import {
  calculateCurrentStreak,
  clearDailyDraft,
  getDailyDraft,
  getSavedStudentName,
  getStudentHistory,
  normalizeStudentName,
  replaceStudentHistory,
  saveDailyDraft,
  saveDailyResult,
  saveStudentName,
  type DailyDraft,
  type StorageLike
} from "@/lib/storage";
import { formatElapsedSeconds } from "@/lib/time";
import type { DailyResult, Problem, QuestionResult } from "@/lib/types";

type DailyGameProps = {
  onRouteChange?(route: GameRoute, navigation?: RouteNavigation): void;
  route?: GameRoute;
  today?: Date;
  storage?: StorageLike;
};

type GameMode = "home" | "quiz" | "review" | "score" | "streak";

export function DailyGame({ onRouteChange, route, today, storage }: DailyGameProps) {
  const dateKey = useMemo(() => getPacificDateKey(today), [today]);
  const dailyProblems = useMemo(() => selectDailyProblems(problems, dateKey), [dateKey]);
  const activeStorage = storage;
  const shouldUseRemoteResults = storage === undefined;
  const isRoutingEnabled = Boolean(route && onRouteChange);

  const [mode, setMode] = useState<GameMode>("home");
  const [nameInput, setNameInput] = useState("");
  const [studentName, setStudentName] = useState("");
  const [history, setHistory] = useState<DailyResult[]>([]);
  const [homeHistory, setHomeHistory] = useState<DailyResult[]>([]);
  const [currentResult, setCurrentResult] = useState<DailyResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStart, setQuestionStart] = useState(() => performance.now());
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [attemptedChoiceIds, setAttemptedChoiceIds] = useState<string[]>([]);
  const [checkedResult, setCheckedResult] = useState<QuestionResult | null>(null);
  const [isCurrentQuestionFinalized, setIsCurrentQuestionFinalized] = useState(false);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(shouldUseRemoteResults);
  const [isHomeHistoryLoading, setIsHomeHistoryLoading] = useState(shouldUseRemoteResults);
  const [isEditingName, setIsEditingName] = useState(false);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  const trimmedInput = normalizeStudentName(nameInput);
  const homeStreak = calculateCurrentStreak(homeHistory, dateKey);
  const streak = calculateCurrentStreak(history, dateKey);
  const currentProblem = dailyProblems[currentIndex];

  const navigateTo = useCallback(
    (nextRoute: GameRoute, navigation: RouteNavigation = "push") => {
      onRouteChange?.(nextRoute, navigation);
    },
    [onRouteChange]
  );

  useEffect(() => {
    setHasLoadedProfile(false);
    const savedName = getSavedStudentName(activeStorage);

    if (!savedName) {
      setIsProfileLoading(false);
      setIsHomeHistoryLoading(false);
      setHasLoadedProfile(true);
      return;
    }

    setNameInput(savedName);
    setStudentName(savedName);
    const savedHistory = getStudentHistory(savedName, activeStorage);
    setHistory(savedHistory);
    setHomeHistory(savedHistory);

    if (!shouldUseRemoteResults) {
      setIsHomeHistoryLoading(false);
    }

    setIsProfileLoading(false);
    setHasLoadedProfile(true);
  }, [activeStorage, shouldUseRemoteResults]);

  useEffect(() => {
    if (!trimmedInput) {
      setHomeHistory([]);
      setIsHomeHistoryLoading(false);
      return undefined;
    }

    const localHistory = getStudentHistory(trimmedInput, activeStorage);
    setHomeHistory(localHistory);

    if (!shouldUseRemoteResults) {
      setIsHomeHistoryLoading(false);
      return undefined;
    }

    let isCanceled = false;
    setIsHomeHistoryLoading(true);

    loadRemoteHistoryWithLocalFallback(trimmedInput, activeStorage)
      .then((remoteHistory) => {
        if (!isCanceled) {
          setHomeHistory(remoteHistory);
        }
      })
      .catch(() => {
        if (!isCanceled) {
          setHomeHistory(localHistory);
        }
      })
      .then(() => {
        if (!isCanceled) {
          setIsHomeHistoryLoading(false);
        }
      });

    return () => {
      isCanceled = true;
    };
  }, [activeStorage, shouldUseRemoteResults, trimmedInput]);

  useEffect(() => {
    if (!shouldUseRemoteResults || mode !== "home") {
      return undefined;
    }

    let isCanceled = false;
    setIsLeaderboardLoading(true);

    fetchLeaderboard()
      .then((entries) => {
        if (!isCanceled) {
          setLeaderboard(entries);
        }
      })
      .catch(() => {})
      .then(() => {
        if (!isCanceled) {
          setIsLeaderboardLoading(false);
        }
      });

    return () => {
      isCanceled = true;
    };
  }, [mode, shouldUseRemoteResults]);

  useEffect(() => {
    if (!isRoutingEnabled || !route || !hasLoadedProfile) {
      return;
    }

    if (route.screen === "home") {
      setMode("home");
      return;
    }

    const savedName = getSavedStudentName(activeStorage);

    if (!savedName) {
      forceHome();
      return;
    }

    const savedHistory = getStudentHistory(savedName, activeStorage);
    const existingResult = savedHistory.find((result) => result.dateKey === dateKey);

    setNameInput(savedName);
    setStudentName(savedName);
    setHistory(savedHistory);
    setHomeHistory(savedHistory);

    if (route.screen === "invalid") {
      forceHome();
      return;
    }

    if (existingResult) {
      restoreCompletedRoute(existingResult, route);
      return;
    }

    const draft = getDailyDraft(savedName, dateKey, activeStorage);

    if (route.screen === "streak") {
      forceHome();
      return;
    }

    if (route.screen === "results") {
      restoreDraftResultsRoute(savedName, draft);
      return;
    }

    restoreQuestionRoute(draft, route.questionIndex);
  }, [activeStorage, dateKey, hasLoadedProfile, isRoutingEnabled, navigateTo, route]);

  useEffect(() => {
    if (mode !== "quiz" || !studentName) {
      return;
    }

    saveDraftSnapshot();
  }, [
    activeStorage,
    attemptedChoiceIds,
    checkedResult,
    currentIndex,
    dateKey,
    isCurrentQuestionFinalized,
    mode,
    questionResults,
    questionStart,
    selectedChoiceId,
    studentName
  ]);

  function forceHome() {
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
    setMode("home");
    navigateTo({ screen: "home" }, "replace");
  }

  function restoreCompletedRoute(result: DailyResult, targetRoute: GameRoute) {
    setCurrentResult(result);
    setQuestionResults(result.questionResults);
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
    setQuestionStart(performance.now());

    if (targetRoute.screen === "question") {
      setCurrentIndex(targetRoute.questionIndex);
      setMode("review");
      return;
    }

    if (targetRoute.screen === "results") {
      setCurrentIndex(0);
      setMode("score");
      return;
    }

    if (targetRoute.screen === "streak") {
      setCurrentIndex(0);
      setMode("streak");
      return;
    }

    forceHome();
  }

  function restoreDraftResultsRoute(savedName: string, draft: DailyDraft | null) {
    const completeResults = draft
      ? getCompleteQuestionResults(draft.questionResults, dailyProblems.length)
      : null;

    if (!completeResults) {
      forceHome();
      return;
    }

    setCurrentResult(
      buildDailyResult({
        dateKey,
        studentName: savedName,
        questionResults: completeResults
      })
    );
    setQuestionResults(completeResults);
    setCurrentIndex(dailyProblems.length - 1);
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
    setQuestionStart(performance.now());
    setMode("score");
  }

  function restoreQuestionRoute(draft: DailyDraft | null, questionIndex: number) {
    if (questionIndex < 0 || questionIndex >= dailyProblems.length) {
      forceHome();
      return;
    }

    if (!draft) {
      if (questionIndex > 0) {
        forceHome();
        return;
      }

      setCurrentResult(null);
      setQuestionResults([]);
      setCurrentIndex(0);
      setSelectedChoiceId(null);
      setAttemptedChoiceIds([]);
      setCheckedResult(null);
      setIsCurrentQuestionFinalized(false);
      setQuestionStart(performance.now());
      setMode("quiz");
      return;
    }

    const firstIncompleteQuestionIndex = getFirstIncompleteQuestionIndex(
      draft.questionResults,
      dailyProblems.length
    );

    if (questionIndex > firstIncompleteQuestionIndex) {
      forceHome();
      return;
    }

    const draftCurrentIndex = clampQuestionIndex(draft.currentIndex, dailyProblems.length);
    const shouldRestoreActiveQuestion =
      draftCurrentIndex === questionIndex && !getQuestionResultAt(draft.questionResults, questionIndex);

    setCurrentResult(null);
    setQuestionResults(draft.questionResults);
    setCurrentIndex(questionIndex);
    setSelectedChoiceId(shouldRestoreActiveQuestion ? draft.selectedChoiceId : null);
    setAttemptedChoiceIds(shouldRestoreActiveQuestion ? draft.attemptedChoiceIds : []);
    setCheckedResult(shouldRestoreActiveQuestion ? draft.checkedResult : null);
    setIsCurrentQuestionFinalized(
      shouldRestoreActiveQuestion ? draft.isCurrentQuestionFinalized : false
    );
    setQuestionStart(
      shouldRestoreActiveQuestion
        ? getRestoredQuestionStart(draft.questionStartedAtMs)
        : performance.now()
    );
    setMode("quiz");
  }

  function saveDraftSnapshot(overrides: Partial<DailyDraft> = {}) {
    if (!studentName) {
      return;
    }

    saveDailyDraft(
      {
        dateKey,
        studentName,
        currentIndex,
        questionResults,
        selectedChoiceId,
        attemptedChoiceIds,
        checkedResult,
        isCurrentQuestionFinalized,
        questionStartedAtMs: getQuestionStartedAtMs(questionStart),
        ...overrides
      },
      activeStorage
    );
  }

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedInput || isStarting) {
      return;
    }

    saveStudentName(trimmedInput, activeStorage);
    setStudentName(trimmedInput);
    setIsEditingName(false);
    setIsStarting(true);

    try {
      const nextHistory = shouldUseRemoteResults
        ? await loadRemoteHistoryWithLocalFallback(trimmedInput, activeStorage)
        : getStudentHistory(trimmedInput, activeStorage);
      const existingResult = nextHistory.find((result) => result.dateKey === dateKey);
      setHistory(nextHistory);
      setHomeHistory(nextHistory);

      if (existingResult) {
        setCurrentResult(existingResult);
        setQuestionResults(existingResult.questionResults);
        setCurrentIndex(0);
        setMode("review");
        navigateTo({ screen: "question", questionIndex: 0 });
        return;
      }

      const draft = getDailyDraft(trimmedInput, dateKey, activeStorage);
      if (draft) {
        const firstIncompleteQuestionIndex = getFirstIncompleteQuestionIndex(
          draft.questionResults,
          dailyProblems.length
        );

        if (firstIncompleteQuestionIndex >= dailyProblems.length) {
          restoreDraftResultsRoute(trimmedInput, draft);
          navigateTo({ screen: "results" });
          return;
        }

        const questionIndex = Math.min(
          clampQuestionIndex(draft.currentIndex, dailyProblems.length),
          firstIncompleteQuestionIndex
        );
        restoreQuestionRoute(draft, questionIndex);
        navigateTo({ screen: "question", questionIndex });
        return;
      }

      if (
        studentName === trimmedInput &&
        (questionResults.some(Boolean) ||
          attemptedChoiceIds.length > 0 ||
          Boolean(checkedResult) ||
          currentIndex > 0)
      ) {
        setCurrentResult(null);
        setMode("quiz");
        navigateTo({ screen: "question", questionIndex: currentIndex });
        return;
      }

      setCurrentResult(null);
      setQuestionResults([]);
      setCurrentIndex(0);
      startQuestion();
      setMode("quiz");
      navigateTo({ screen: "question", questionIndex: 0 });
    } finally {
      setIsStarting(false);
    }
  }

  function startQuestion() {
    const start = performance.now();
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
    setQuestionStart(start);
  }

  function handleCheck() {
    if (!selectedChoiceId || checkedResult) {
      return;
    }

    const answeredAt = performance.now();
    const exactElapsedSeconds = Math.max(0, (answeredAt - questionStart) / 1000);
    const nextSelectedChoiceIds = [...attemptedChoiceIds, selectedChoiceId];
    const solved = selectedChoiceId === currentProblem.correctChoiceId;
    const nextResult = scoreQuestion({
      problemId: currentProblem.id,
      difficulty: currentProblem.difficulty,
      selectedChoiceIds: nextSelectedChoiceIds,
      correctChoiceId: currentProblem.correctChoiceId,
      solved,
      elapsedSeconds: Number(exactElapsedSeconds.toFixed(1))
    });

    setAttemptedChoiceIds(nextSelectedChoiceIds);
    setSelectedChoiceId(null);
    setCheckedResult(nextResult);
    setIsCurrentQuestionFinalized(solved || nextSelectedChoiceIds.length >= MAX_ATTEMPTS);
  }

  function handleTryAgain() {
    if (!checkedResult || checkedResult.solved || checkedResult.attemptsUsed >= MAX_ATTEMPTS) {
      return;
    }

    setAttemptedChoiceIds(checkedResult.selectedChoiceIds);
    setSelectedChoiceId(null);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
  }

  function handleExplainQuestion() {
    if (!checkedResult || checkedResult.solved) {
      return;
    }

    setAttemptedChoiceIds(checkedResult.selectedChoiceIds);
    setIsCurrentQuestionFinalized(true);
  }

  function handleNextQuestion() {
    const storedResult = getQuestionResultAt(questionResults, currentIndex);

    if (!storedResult && (!checkedResult || !isCurrentQuestionFinalized)) {
      return;
    }

    const nextQuestionResults = storedResult
      ? questionResults
      : upsertQuestionResult(questionResults, currentIndex, checkedResult);

    if (!storedResult) {
      setQuestionResults(nextQuestionResults);
    }

    if (currentIndex < dailyProblems.length - 1) {
      const nextIndex = currentIndex + 1;
      saveDraftSnapshot({
        currentIndex: nextIndex,
        questionResults: nextQuestionResults,
        selectedChoiceId: null,
        attemptedChoiceIds: [],
        checkedResult: null,
        isCurrentQuestionFinalized: false,
        questionStartedAtMs: Date.now()
      });
      moveToQuestion(nextIndex, nextQuestionResults);
      navigateTo({ screen: "question", questionIndex: nextIndex });
      return;
    }

    const completeResults = getCompleteQuestionResults(nextQuestionResults, dailyProblems.length);

    if (!completeResults) {
      return;
    }

    const nextResult = buildDailyResult({
      dateKey,
      studentName,
      questionResults: completeResults
    });

    saveDraftSnapshot({
      questionResults: completeResults,
      selectedChoiceId: null,
      attemptedChoiceIds: [],
      checkedResult: null,
      isCurrentQuestionFinalized: false
    });
    setCurrentResult(nextResult);
    setMode("score");
    navigateTo({ screen: "results" });
  }

  function handleBackQuestion() {
    const storedResult = getQuestionResultAt(questionResults, currentIndex);
    const nextQuestionResults =
      !storedResult && checkedResult && isCurrentQuestionFinalized
        ? upsertQuestionResult(questionResults, currentIndex, checkedResult)
        : questionResults;

    if (nextQuestionResults !== questionResults) {
      setQuestionResults(nextQuestionResults);
    }

    if (currentIndex === 0) {
      saveDraftSnapshot({ questionResults: nextQuestionResults });
      setCurrentIndex(0);
      showHome();
      return;
    }

    const previousIndex = currentIndex - 1;
    saveDraftSnapshot({
      currentIndex: previousIndex,
      questionResults: nextQuestionResults,
      selectedChoiceId: null,
      attemptedChoiceIds: [],
      checkedResult: null,
      isCurrentQuestionFinalized: false
    });
    moveToQuestion(previousIndex, nextQuestionResults);
    navigateTo({ screen: "question", questionIndex: previousIndex });
  }

  function handleNextReviewQuestion() {
    if (currentIndex < dailyProblems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      navigateTo({ screen: "question", questionIndex: nextIndex });
      return;
    }

    setMode("score");
    navigateTo({ screen: "results" });
  }

  function handleBackReviewQuestion() {
    if (currentIndex === 0) {
      setCurrentIndex(0);
      showHome();
      return;
    }

    const previousIndex = currentIndex - 1;
    setCurrentIndex(previousIndex);
    navigateTo({ screen: "question", questionIndex: previousIndex });
  }

  function moveToQuestion(index: number, results: QuestionResult[]) {
    setCurrentIndex(index);
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);

    if (!getQuestionResultAt(results, index)) {
      setQuestionStart(performance.now());
    }
  }

  async function handleScoreContinue() {
    if (!currentResult || isSavingResult) {
      return;
    }

    setIsSavingResult(true);

    try {
      let savedResult = currentResult;
      saveDailyResult(savedResult, activeStorage);

      if (shouldUseRemoteResults) {
        try {
          savedResult = await saveRemoteDailyResult(currentResult);
          saveDailyResult(savedResult, activeStorage);
        } catch {
          savedResult = currentResult;
        }
      }

      const nextHistory = shouldUseRemoteResults
        ? await loadRemoteHistoryWithLocalFallback(savedResult.studentName, activeStorage)
        : getStudentHistory(savedResult.studentName, activeStorage);
      clearDailyDraft(savedResult.studentName, dateKey, activeStorage);
      setHistory(nextHistory);
      setHomeHistory(nextHistory);
      setMode("streak");
      navigateTo({ screen: "streak" });
    } finally {
      setIsSavingResult(false);
    }
  }

  function handleStreakContinue() {
    setCurrentResult(null);
    setQuestionResults([]);
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
    showHome();
  }

  function showHome() {
    if (shouldUseRemoteResults) {
      setIsLeaderboardLoading(true);
    }

    setMode("home");
    navigateTo({ screen: "home" });
  }

  return (
    <main className="app-shell">
      {mode === "home" ? (
        <HomeScreen
          dateKey={dateKey}
          isEditingName={isEditingName}
          isHomeHistoryLoading={isHomeHistoryLoading}
          isLeaderboardLoading={isLeaderboardLoading}
          isProfileLoading={isProfileLoading}
          isStarting={isStarting}
          leaderboard={leaderboard}
          nameInput={nameInput}
          onEditName={() => setIsEditingName(true)}
          onNameChange={setNameInput}
          onSubmit={handleStart}
          savedName={studentName}
          streak={homeStreak}
        />
      ) : null}

      {mode === "quiz" || mode === "review" ? (
        <QuestionScreen
          attemptedChoiceIds={attemptedChoiceIds}
          currentIndex={currentIndex}
          isCurrentQuestionFinalized={isCurrentQuestionFinalized}
          isReview={mode === "review"}
          onBack={mode === "review" ? handleBackReviewQuestion : handleBackQuestion}
          onCheck={handleCheck}
          onExplain={handleExplainQuestion}
          onNext={mode === "review" ? handleNextReviewQuestion : handleNextQuestion}
          onSelectChoice={setSelectedChoiceId}
          onTryAgain={handleTryAgain}
          problem={currentProblem}
          questionStart={questionStart}
          result={checkedResult}
          reviewResult={mode === "review" ? currentResult?.questionResults[currentIndex] ?? null : null}
          savedResult={mode === "quiz" ? getQuestionResultAt(questionResults, currentIndex) : null}
          selectedChoiceId={selectedChoiceId}
          totalQuestions={dailyProblems.length}
        />
      ) : null}

      {mode === "score" && currentResult ? (
        <ScoreScreen isSaving={isSavingResult} onContinue={handleScoreContinue} result={currentResult} />
      ) : null}

      {mode === "streak" ? (
        <StreakScreen onContinue={handleStreakContinue} streak={streak} />
      ) : null}
    </main>
  );
}

type HomeScreenProps = {
  dateKey: string;
  isEditingName: boolean;
  isHomeHistoryLoading: boolean;
  isLeaderboardLoading: boolean;
  isProfileLoading: boolean;
  isStarting: boolean;
  leaderboard: LeaderboardEntry[];
  nameInput: string;
  onEditName(): void;
  onNameChange(name: string): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
  savedName: string;
  streak: number;
};

function HomeScreen({
  dateKey,
  isEditingName,
  isHomeHistoryLoading,
  isLeaderboardLoading,
  isProfileLoading,
  isStarting,
  leaderboard,
  nameInput,
  onEditName,
  onNameChange,
  onSubmit,
  savedName,
  streak
}: HomeScreenProps) {
  const showNameInput = !savedName || isEditingName;
  const nameLabelId = "student-name-label";

  return (
    <section className="app-card home-card" aria-label="Three Qs home">
      <div className="home-topbar">
        <p className="today-label home-date">{formatDateKey(dateKey)}</p>
        <div
          aria-busy={isHomeHistoryLoading}
          aria-label={isHomeHistoryLoading ? "Streak loading" : `${streak} day streak`}
          className="streak-pill"
        >
          <span className="streak-icon">
            <Flame size={18} />
          </span>
          <span className="streak-value">
            {isHomeHistoryLoading ? (
              <span aria-hidden="true" className="streak-skeleton" />
            ) : (
              <>
                <strong>{streak}</strong>
                <small>{streak === 1 ? "day" : "days"}</small>
              </>
            )}
          </span>
        </div>
      </div>

      <div aria-hidden="true" />

      <div className="home-copy">
        <h1>Three Qs</h1>
        <p>Your daily math superbowl challenge</p>
      </div>

      <div aria-hidden="true" />

      <Leaderboard entries={leaderboard} isLoading={isLeaderboardLoading} />

      <div aria-hidden="true" />

      <form className="home-form" onSubmit={onSubmit}>
        <div className="name-field">
          <span className="name-field-label" id={nameLabelId}>
            Your Name
          </span>
          {isProfileLoading ? (
            <div aria-label="Name loading" className="name-loading" role="status">
              <span aria-hidden="true" className="name-skeleton-bar" />
            </div>
          ) : showNameInput ? (
            <input
              autoFocus={isEditingName}
              aria-labelledby={nameLabelId}
              className="name-input"
              name="studentName"
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Type your name"
              value={nameInput}
            />
          ) : (
            <div aria-labelledby={nameLabelId} className="name-display">
              <span className="name-display-text">{savedName}</span>
              <button
                aria-label="Edit name"
                className="name-edit-btn"
                onClick={onEditName}
                type="button"
              >
                <Pencil size={15} />
              </button>
            </div>
          )}
        </div>

        <button
          className="primary-action home-play-action"
          disabled={!normalizeStudentName(nameInput) || isStarting}
          type="submit"
        >
          <Play size={19} fill="currentColor" />
          Play
        </button>
      </form>
    </section>
  );
}

function Leaderboard({ entries, isLoading }: { entries: LeaderboardEntry[]; isLoading: boolean }) {
  const display = entries;
  return (
    <div className="leaderboard" aria-busy={isLoading}>
      <p className="leaderboard-title">Top Players · Last 7 Days</p>
      <div className="leaderboard-body">
        {isLoading ? (
          <div className="leaderboard-skeleton" aria-label="Leaderboard loading" role="status">
            {Array.from({ length: 5 }).map((_, index) => (
              <span aria-hidden="true" className="leaderboard-skeleton-bar" key={index} />
            ))}
          </div>
        ) : display.length === 0 ? (
          <p className="leaderboard-empty">No scores yet this week</p>
        ) : (
          <ol className="leaderboard-list">
            {display.map((entry, index) => (
              <li className="leaderboard-row" key={entry.studentName}>
                <span className="leaderboard-rank">{index + 1}</span>
                <span className="leaderboard-name">{entry.studentName}</span>
                <span className="leaderboard-medals">
                  {entry.gold > 0 && <span className="lb-medal gold" data-tip={`${entry.gold} gold`} tabIndex={0}>{entry.gold}</span>}
                  {entry.silver > 0 && <span className="lb-medal silver" data-tip={`${entry.silver} silver`} tabIndex={0}>{entry.silver}</span>}
                  {entry.bronze > 0 && <span className="lb-medal bronze" data-tip={`${entry.bronze} bronze`} tabIndex={0}>{entry.bronze}</span>}
                </span>
                <span className="leaderboard-pts">{entry.totalPoints}<small>pts</small></span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

type QuestionScreenProps = {
  attemptedChoiceIds: string[];
  currentIndex: number;
  isCurrentQuestionFinalized: boolean;
  isReview: boolean;
  onBack(): void;
  onCheck(): void;
  onExplain(): void;
  onNext(): void;
  onSelectChoice(choiceId: string): void;
  onTryAgain(): void;
  problem: Problem;
  questionStart: number;
  result: QuestionResult | null;
  reviewResult: QuestionResult | null;
  savedResult: QuestionResult | null;
  selectedChoiceId: string | null;
  totalQuestions: number;
};

function QuestionScreen({
  attemptedChoiceIds,
  currentIndex,
  isCurrentQuestionFinalized,
  isReview,
  onBack,
  onCheck,
  onExplain,
  onNext,
  onSelectChoice,
  onTryAgain,
  problem,
  questionStart,
  result,
  reviewResult,
  savedResult,
  selectedChoiceId,
  totalQuestions
}: QuestionScreenProps) {
  const displayResult = isReview ? reviewResult : savedResult ?? result;
  const displayAttemptedChoiceIds = isReview
    ? reviewResult?.selectedChoiceIds ?? []
    : savedResult?.selectedChoiceIds ?? displayResult?.selectedChoiceIds ?? attemptedChoiceIds;
  const displaySelectedChoiceId = isReview
    ? reviewResult?.selectedChoiceIds.at(-1) ?? null
    : savedResult?.selectedChoiceIds.at(-1) ?? selectedChoiceId;
  const isViewingSavedAnswer = Boolean(isReview || savedResult);
  const displayIsFinalized = Boolean(isViewingSavedAnswer || isCurrentQuestionFinalized);
  const canTryAgain = Boolean(
    !isReview &&
      !savedResult &&
      displayResult &&
      !displayResult.solved &&
      !isCurrentQuestionFinalized &&
      displayResult.attemptsUsed < MAX_ATTEMPTS
  );

  // Shuffle choices deterministically per problem so the order is randomized
  // but stays stable across re-renders, attempts, navigation, and review.
  const orderedChoices = useMemo(
    () => shuffleWithSeed(problem.choices, problem.id),
    [problem.id, problem.choices]
  );

  return (
    <section className="app-card quiz-card" aria-label="Question screen">
      <header className="quiz-topbar">
        <button className="quiz-back-btn" aria-label="Back" onClick={onBack} type="button">
          <ArrowLeft size={23} />
        </button>

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
        <div className="quiz-prompt">
          <MathText text={problem.prompt} />
        </div>

        <div className="answer-grid">
          {orderedChoices.map((choice, index) => {
            const isSelected = displaySelectedChoiceId === choice.id;
            const isAttemptedWrong =
              displayAttemptedChoiceIds.includes(choice.id) && choice.id !== problem.correctChoiceId;
            const shouldRevealCorrectChoice = Boolean(
              displayResult &&
                choice.id === problem.correctChoiceId &&
                (displayResult.solved || (displayIsFinalized && displayResult.attemptsUsed < MAX_ATTEMPTS))
            );

            return (
              <button
                aria-pressed={isSelected || displayAttemptedChoiceIds.includes(choice.id)}
                className={[
                  "answer-button",
                  isSelected ? "selected" : "",
                  shouldRevealCorrectChoice ? "correct" : "",
                  isAttemptedWrong ? "wrong" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-testid={`choice-${choice.id}`}
                disabled={Boolean(displayResult) || isReview || displayAttemptedChoiceIds.includes(choice.id)}
                key={choice.id}
                onClick={() => onSelectChoice(choice.id)}
                type="button"
              >
                <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                <span className="answer-text">
                  <MathText text={choice.label} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="quiz-footer">
        {isViewingSavedAnswer ? (
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

      {!isReview && !savedResult && result ? (
        <FeedbackSheet
          canTryAgain={canTryAgain}
          isFinalQuestion={currentIndex + 1 === totalQuestions}
          isFinalized={isCurrentQuestionFinalized}
          onExplain={onExplain}
          onNext={onNext}
          onTryAgain={onTryAgain}
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
  const timerText = formatElapsedSeconds(displaySeconds);
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
      <span className="timer-text">{timerText}</span>
    </div>
  );
});

function getElapsedSeconds(startedAt: number): number {
  return Math.max(0, (performance.now() - startedAt) / 1000);
}

function toWholeSeconds(seconds: number): number {
  return Math.max(0, Math.floor(seconds));
}

function getTimerDigitClass(seconds: number): "digits-1" | "digits-2" | "minutes" {
  if (seconds >= 60) {
    return "minutes";
  }

  if (seconds >= 10) {
    return "digits-2";
  }

  return "digits-1";
}

type FeedbackSheetProps = {
  canTryAgain: boolean;
  isFinalQuestion: boolean;
  isFinalized: boolean;
  onExplain(): void;
  onNext(): void;
  onTryAgain(): void;
  problem: Problem;
  result: QuestionResult;
};

function FeedbackSheet({
  canTryAgain,
  isFinalQuestion,
  isFinalized,
  onExplain,
  onNext,
  onTryAgain,
  problem,
  result
}: FeedbackSheetProps) {
  const shouldShowExplanation = !result.solved && isFinalized;

  return (
    <div className={`feedback-sheet ${result.solved ? "correct" : "incorrect"}`} role="status">
      <div>
        <h2>{result.solved ? "Correct!" : "Not quite"}</h2>
        {result.solved ? (
          <p>
            {result.attemptPoints} pts + {result.speedBonus} speed pts
          </p>
        ) : shouldShowExplanation ? (
          <p>
            <MathText text={problem.explanation} />
          </p>
        ) : (
          <p>Try one more answer, or see how to solve it.</p>
        )}
      </div>

      {canTryAgain ? (
        <div className="feedback-actions">
          <button className="sheet-secondary" onClick={onExplain} type="button">
            Explain it
          </button>
          <button className="sheet-next" onClick={onTryAgain} type="button">
            Try again
          </button>
        </div>
      ) : (
        <button className="sheet-next" onClick={onNext} type="button">
          {isFinalQuestion ? "Next" : "Next"}
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}

type ScoreScreenProps = {
  isSaving: boolean;
  onContinue(): void;
  result: DailyResult;
};

function ScoreScreen({ isSaving, onContinue, result }: ScoreScreenProps) {
  const medalLabel = getMedalLabel(result.medal);

  return (
    <section className="app-card score-card" aria-label="Completion score">
      <div className="card-body">
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

        <ul className="question-breakdown">
          {result.questionResults.map((question) => (
            <li className={`question-row ${getQuestionMedal(question.score)}`} key={question.problemId}>
              <span className="question-points">
                <strong>{question.score}</strong>
                pts
              </span>
              <span className="question-status">{getAttemptLabel(question)}</span>
              <span className="question-time">{formatElapsedSeconds(Math.round(question.elapsedSeconds))}</span>
            </li>
          ))}
        </ul>
      </div>

      <button className="primary-action" disabled={isSaving} onClick={onContinue} type="button">
        Continue
      </button>
    </section>
  );
}

function getAttemptLabel(result: QuestionResult): string {
  if (!result.solved) {
    return "Missed";
  }

  return result.attemptsUsed === 1 ? "First try" : "Second try";
}

type StreakScreenProps = {
  onContinue(): void;
  streak: number;
};

function StreakScreen({ onContinue, streak }: StreakScreenProps) {
  return (
    <section className="app-card streak-card" aria-label="Current streak">
      <div className="card-body">
        <div className="streak-burst" aria-hidden="true">
          <Flame size={86} fill="currentColor" />
        </div>

        <div className="streak-copy">
          <p className="today-label">Current streak</p>
          <h1>{streak}</h1>
          <p>{streak === 1 ? "day" : "days"} in a row</p>
        </div>
      </div>

      <button className="primary-action" onClick={onContinue} type="button">
        Continue
      </button>
    </section>
  );
}

function getQuestionResultAt(results: QuestionResult[], index: number): QuestionResult | null {
  return results[index] ?? null;
}

function getFirstIncompleteQuestionIndex(results: QuestionResult[], totalQuestions: number): number {
  for (let index = 0; index < totalQuestions; index += 1) {
    if (!getQuestionResultAt(results, index)) {
      return index;
    }
  }

  return totalQuestions;
}

function clampQuestionIndex(index: number, totalQuestions: number): number {
  if (totalQuestions <= 1) {
    return 0;
  }

  return Math.min(Math.max(0, Math.floor(index)), totalQuestions - 1);
}

function getQuestionStartedAtMs(questionStart: number): number {
  return Date.now() - Math.max(0, performance.now() - questionStart);
}

function getRestoredQuestionStart(questionStartedAtMs: number): number {
  return performance.now() - Math.max(0, Date.now() - questionStartedAtMs);
}

function upsertQuestionResult(
  results: QuestionResult[],
  index: number,
  result: QuestionResult | null
): QuestionResult[] {
  if (!result) {
    return results;
  }

  const nextResults = [...results];
  nextResults[index] = result;
  return nextResults;
}

function getCompleteQuestionResults(results: QuestionResult[], totalQuestions: number): QuestionResult[] | null {
  const completeResults: QuestionResult[] = [];

  for (let index = 0; index < totalQuestions; index += 1) {
    const result = results[index];

    if (!result) {
      return null;
    }

    completeResults.push(result);
  }

  return completeResults;
}

async function loadRemoteHistoryWithLocalFallback(
  studentName: string,
  storage: StorageLike | undefined
): Promise<DailyResult[]> {
  const localHistory = getStudentHistory(studentName, storage);

  try {
    const remoteHistory = await fetchRemoteHistory(studentName);
    replaceStudentHistory(studentName, remoteHistory, storage);
    return remoteHistory;
  } catch {
    return localHistory;
  }
}
