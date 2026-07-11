"use client";

import { ArrowLeft, ArrowRight, Check, Clock3, Flame, HelpCircle, Medal, Pencil, Play, Trophy, UserRound } from "lucide-react";
import { ChangeEvent, FormEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { MathText } from "@/components/MathText";
import { problems } from "@/data/problems";
import { formatDateKey, getPacificDateKey } from "@/lib/date";
import { selectDailyProblems, shuffleWithSeed } from "@/lib/daily";
import type { GameRoute, RouteNavigation } from "@/lib/gameRoutes";
import {
  fetchLeaderboard,
  fetchRemoteHistory,
  fetchRemoteProfile,
  saveRemoteDailyResult,
  saveRemoteProfilePhoto,
  type RemoteHistory
} from "@/lib/remoteResults";
import type { LeaderboardEntry } from "@/lib/supabaseLeaderboard";
import { getMedalLabel, getQuestionMedal } from "@/lib/medals";
import {
  MAX_ATTEMPTS,
  MAX_DAILY_SCORE,
  buildDailyResult,
  scoreQuestion
} from "@/lib/score";
import {
  calculateCurrentStreak,
  clearDailyDraft,
  clearSavedStudentName,
  getCachedLeaderboard,
  getDailyDraft,
  getSavedStudentName,
  getSavedStudentPhoto,
  getStudentKey,
  getStudentHistory,
  normalizeStudentName,
  replaceStudentHistory,
  saveCachedLeaderboard,
  saveDailyDraft,
  saveDailyResult,
  saveStudentName,
  saveStudentPhoto,
  type DailyDraft,
  type StorageLike
} from "@/lib/storage";
import { formatElapsedSeconds } from "@/lib/time";
import type { DailyResult, Medal as MedalResult, Problem, QuestionResult, VocabTerm } from "@/lib/types";

type DailyGameProps = {
  onRouteChange?(route: GameRoute, navigation?: RouteNavigation): void;
  route?: GameRoute;
  today?: Date;
  storage?: StorageLike;
  // Overridable so tests don't have to wait the real three minutes.
  idlePromptAfterMs?: number;
};

type GameMode = "home" | "ready" | "quiz" | "review" | "score" | "streak";

type PlayerProfileData = {
  studentName: string;
  photoDataUrl: string;
  history: DailyResult[];
};

// Pop the "Are you still here?" prompt after three solid minutes of inactivity.
const IDLE_PROMPT_AFTER_MS = 3 * 60 * 1000;
const READY_MESSAGES = [
  "Your brain has a tiny whiteboard. Your paper has a giant one. Use the giant one.",
  "Even mathematicians don’t solve hard problems in their heads. They write.",
  "Scratch paper is extra working memory. Use it.",
  "Every number you write down is one less number your brain has to remember.",
  "Your brain is for thinking, not for remembering. Let your pencil remember the steps.",
  "Don’t make your brain juggle numbers. Put them on paper and let your brain solve the problem."
];

export function DailyGame({
  onRouteChange,
  route,
  today,
  storage,
  idlePromptAfterMs = IDLE_PROMPT_AFTER_MS
}: DailyGameProps) {
  const todayDateKey = useMemo(() => getPacificDateKey(today), [today]);
  const [dateKey, setDateKey] = useState(todayDateKey);
  const dailyProblems = useMemo(() => selectDailyProblems(problems, dateKey), [dateKey]);
  const activeStorage = storage;
  const shouldUseRemoteResults = storage === undefined;
  const isRoutingEnabled = Boolean(route && onRouteChange);

  const [mode, setMode] = useState<GameMode>("home");
  const [nameInput, setNameInput] = useState("");
  const [studentName, setStudentName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [history, setHistory] = useState<DailyResult[]>([]);
  const [homeHistory, setHomeHistory] = useState<DailyResult[]>([]);
  const [currentResult, setCurrentResult] = useState<DailyResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionTimer, setQuestionTimer] = useState<QuestionTimer>(() => pausedTimer(0));
  const questionTimerRef = useRef(questionTimer);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
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
  const [isSwitchingPlayer, setIsSwitchingPlayer] = useState(false);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  const trimmedInput = normalizeStudentName(nameInput);
  const streak = calculateCurrentStreak(history, todayDateKey);
  const currentProblem = dailyProblems[currentIndex];

  const navigateTo = useCallback(
    (nextRoute: GameRoute, navigation: RouteNavigation = "push", targetDateKey = dateKey) => {
      const datedRoute =
        nextRoute.screen === "home" || nextRoute.screen === "invalid"
          ? nextRoute
          : { ...nextRoute, dateKey: targetDateKey };
      onRouteChange?.(datedRoute, navigation);
    },
    [dateKey, onRouteChange]
  );

  // Keep a ref alongside the timer state so effect cleanups and event handlers
  // can read the live timer (the state closure would be stale).
  const updateTimer = useCallback((next: QuestionTimer) => {
    questionTimerRef.current = next;
    setQuestionTimer(next);
  }, []);

  // An overlay (vocab help or the idle prompt) covering the question pauses the
  // clock; dismissing it resumes from the same elapsed time.
  const handleTimerPauseChange = useCallback((isPaused: boolean) => {
    setIsTimerPaused(isPaused);
  }, []);

  const handleSwitchPlayer = useCallback(() => {
    setNameInput("");
    setIsSwitchingPlayer(true);
  }, []);

  const handleCancelSwitchPlayer = useCallback(() => {
    setIsSwitchingPlayer(false);
    setNameInput("");
  }, []);

  const handleProfilePhotoChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || !studentName || isPhotoSaving) {
        return;
      }

      setIsPhotoSaving(true);
      setPhotoError("");

      try {
        const photoDataUrl = await resizeProfilePhoto(file);
        const savedProfile = shouldUseRemoteResults
          ? await saveRemoteProfilePhoto(studentName, photoDataUrl)
          : { studentName, photoDataUrl };

        setProfilePhoto(savedProfile.photoDataUrl);
        saveStudentPhoto(studentName, savedProfile.photoDataUrl, activeStorage);
      } catch {
        setPhotoError("That photo couldn’t be saved. Try a different image.");
      } finally {
        setIsPhotoSaving(false);
      }
    },
    [activeStorage, isPhotoSaving, shouldUseRemoteResults, studentName]
  );

  const handleLoadPlayerProfile = useCallback(
    async (profileName: string): Promise<PlayerProfileData> => {
      if (!shouldUseRemoteResults) {
        return {
          studentName: normalizeStudentName(profileName),
          photoDataUrl: "",
          history: getStudentHistory(profileName, activeStorage)
        };
      }

      const [profile, remoteHistory] = await Promise.all([
        fetchRemoteProfile(profileName),
        fetchRemoteHistory(profileName)
      ]);

      return {
        studentName: profile.studentName,
        photoDataUrl: profile.photoDataUrl,
        history: remoteHistory.results
      };
    },
    [activeStorage, shouldUseRemoteResults]
  );

  useEffect(() => {
    setHasLoadedProfile(false);
    const savedName = getSavedStudentName(activeStorage);

    if (!savedName) {
      setNameInput("");
      setStudentName("");
      setProfilePhoto("");
      setHistory([]);
      setHomeHistory([]);
      setIsProfileLoading(false);
      setIsHomeHistoryLoading(false);
      setHasLoadedProfile(true);
      return;
    }

    setNameInput("");
    setStudentName(savedName);
    setProfilePhoto(getSavedStudentPhoto(activeStorage));
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
    if (!studentName || !shouldUseRemoteResults) {
      return undefined;
    }

    let isCanceled = false;
    fetchRemoteProfile(studentName)
      .then((profile) => {
        if (isCanceled) {
          return;
        }

        setProfilePhoto(profile.photoDataUrl);
        saveStudentPhoto(studentName, profile.photoDataUrl, activeStorage);
      })
      .catch(() => {});

    return () => {
      isCanceled = true;
    };
  }, [activeStorage, shouldUseRemoteResults, studentName]);

  useEffect(() => {
    if (mode !== "home" || isStarting) {
      return undefined;
    }

    if (!studentName) {
      setHomeHistory([]);
      setIsHomeHistoryLoading(false);
      return undefined;
    }

    const localHistory = getStudentHistory(studentName, activeStorage);
    setHomeHistory(localHistory);

    if (!shouldUseRemoteResults) {
      setIsHomeHistoryLoading(false);
      return undefined;
    }

    let isCanceled = false;
    // Show the cached streak while we revalidate; only fall back to the
    // skeleton when there's nothing stored locally to display yet.
    setIsHomeHistoryLoading(localHistory.length === 0);

    loadRemoteHistoryWithLocalFallback(studentName, activeStorage)
      .then((remoteHistory) => {
        if (!isCanceled) {
          setHomeHistory(remoteHistory.results);
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
  }, [activeStorage, isStarting, mode, shouldUseRemoteResults, studentName]);

  useEffect(() => {
    if (!shouldUseRemoteResults || mode !== "home") {
      return undefined;
    }

    let isCanceled = false;
    // Show the cached leaderboard while we refresh; only fall back to the
    // skeleton when there's nothing cached to display yet.
    const cachedLeaderboard = getCachedLeaderboard(activeStorage);
    const hasCachedEntries = Boolean(cachedLeaderboard && cachedLeaderboard.length > 0);
    if (cachedLeaderboard && cachedLeaderboard.length > 0) {
      setLeaderboard(cachedLeaderboard);
    }
    setIsLeaderboardLoading(!hasCachedEntries);

    fetchLeaderboard()
      .then((entries) => {
        if (isCanceled) {
          return;
        }

        // A populated leaderboard shouldn't be wiped out by an empty refresh
        // (e.g. a transient failure or an unconfigured backend that returns
        // an empty list). Keep showing the last good data until we get real
        // entries back, and never cache an empty result over a good one.
        if (entries.length === 0) {
          setLeaderboard((current) => (current.length > 0 ? current : entries));
          return;
        }

        setLeaderboard(entries);
        saveCachedLeaderboard(entries, activeStorage);
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
  }, [activeStorage, mode, shouldUseRemoteResults]);

  useEffect(() => {
    if (!isRoutingEnabled || !route || !hasLoadedProfile) {
      return;
    }

    if (route.screen === "home") {
      setDateKey(todayDateKey);
      setMode("home");
      return;
    }

    if (route.screen === "invalid") {
      forceHome();
      return;
    }

    const routeDateKey = route.dateKey ?? todayDateKey;
    const earliestAllowedDateKey = addDaysToDateKey(todayDateKey, -6);
    if (routeDateKey < earliestAllowedDateKey || routeDateKey > todayDateKey) {
      forceHome();
      return;
    }

    if (routeDateKey !== dateKey) {
      setDateKey(routeDateKey);
      return;
    }

    const savedName = getSavedStudentName(activeStorage);

    if (!savedName) {
      forceHome();
      return;
    }

    const savedHistory = getStudentHistory(savedName, activeStorage);
    const existingResult = savedHistory.find((result) => result.dateKey === dateKey);

    setStudentName(savedName);
    setHistory(savedHistory);
    setHomeHistory(savedHistory);

    if (existingResult) {
      restoreCompletedRoute(existingResult, route);
      return;
    }

    const draft = getDailyDraft(savedName, dateKey, activeStorage);

    if (route.screen === "streak") {
      forceHome();
      return;
    }

    if (route.screen === "ready") {
      if (draft) {
        const firstIncompleteQuestionIndex = getFirstIncompleteQuestionIndex(
          draft.questionResults,
          dailyProblems.length
        );
        const questionIndex = Math.min(
          clampQuestionIndex(draft.currentIndex, dailyProblems.length),
          firstIncompleteQuestionIndex
        );

        restoreQuestionRoute(draft, questionIndex);
        navigateTo({ screen: "question", questionIndex }, "replace");
        return;
      }

      setCurrentResult(null);
      setQuestionResults([]);
      setCurrentIndex(0);
      setSelectedChoiceId(null);
      setAttemptedChoiceIds([]);
      setCheckedResult(null);
      setIsCurrentQuestionFinalized(false);
      updateTimer(pausedTimer(0));
      setMode("ready");
      return;
    }

    if (route.screen === "results") {
      void restoreDraftResultsRoute(savedName, draft);
      return;
    }

    restoreQuestionRoute(draft, route.questionIndex);
  }, [activeStorage, dateKey, hasLoadedProfile, isRoutingEnabled, navigateTo, route, todayDateKey]);

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
    questionTimer,
    selectedChoiceId,
    studentName
  ]);

  // The clock runs while the active (still-unanswered) question is on screen and
  // nothing is covering it. Leaving the screen — navigating away, unmounting,
  // hiding the tab, or opening an overlay (vocab help / idle prompt) — pauses
  // it; returning resumes from the same elapsed time.
  useEffect(() => {
    const isOnActiveQuestion =
      mode === "quiz" && !getQuestionResultAt(questionResults, currentIndex);

    if (!isOnActiveQuestion || isTimerPaused) {
      return undefined;
    }

    if (typeof document === "undefined" || document.visibilityState !== "hidden") {
      updateTimer(resumeTimer(questionTimerRef.current));
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Persist eagerly: the tab may be frozen before React flushes the
        // draft-save effect. No navigation has happened, so closures are fresh.
        const paused = pauseTimer(questionTimerRef.current);
        updateTimer(paused);
        saveDraftSnapshot({ questionElapsedMs: Math.round(paused.elapsedMs) });
      } else {
        updateTimer(resumeTimer(questionTimerRef.current));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Freeze the timer on the way out. The draft-save effect re-persists the
      // paused elapsed with the post-navigation state, so we don't write here.
      updateTimer(pauseTimer(questionTimerRef.current));
    };
    // saveDraftSnapshot is intentionally omitted from deps: it is recreated
    // every render and always reads the latest values via closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isTimerPaused, mode, questionResults, updateTimer]);

  function forceHome() {
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
    setDateKey(todayDateKey);
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
    updateTimer(pausedTimer(0));

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

  async function restoreDraftResultsRoute(
    savedName: string,
    draft: DailyDraft | null,
    targetDateKey = dateKey,
    targetProblems = dailyProblems
  ) {
    const completeResults = draft
      ? getCompleteQuestionResults(draft.questionResults, targetProblems.length)
      : null;

    if (!completeResults) {
      forceHome();
      return;
    }

    const result = buildDailyResult({
      dateKey: targetDateKey,
      studentName: savedName,
      questionResults: completeResults
    });

    setIsSavingResult(true);
    const savingResult = persistCompletedResult(result);
    setCurrentResult(result);
    setQuestionResults(result.questionResults);
    setCurrentIndex(targetProblems.length - 1);
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
    updateTimer(pausedTimer(0));
    setMode("score");

    try {
      const savedResult = await savingResult;
      setCurrentResult(savedResult);
      setQuestionResults(savedResult.questionResults);
    } finally {
      setIsSavingResult(false);
    }
  }

  function restoreQuestionRoute(
    draft: DailyDraft | null,
    questionIndex: number,
    targetProblems = dailyProblems
  ) {
    if (questionIndex < 0 || questionIndex >= targetProblems.length) {
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
      updateTimer(pausedTimer(0));
      setMode("quiz");
      return;
    }

    const firstIncompleteQuestionIndex = getFirstIncompleteQuestionIndex(
      draft.questionResults,
      targetProblems.length
    );

    if (questionIndex > firstIncompleteQuestionIndex) {
      forceHome();
      return;
    }

    const draftCurrentIndex = clampQuestionIndex(draft.currentIndex, targetProblems.length);
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
    updateTimer(pausedTimer(shouldRestoreActiveQuestion ? draft.questionElapsedMs : 0));
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
        questionElapsedMs: Math.round(getTimerElapsedMs(questionTimerRef.current)),
        ...overrides
      },
      activeStorage
    );
  }

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextStudentName = trimmedInput || studentName;

    if (!nextStudentName || isStarting) {
      return;
    }

    const isSameStudent = normalizeStudentName(studentName).toLocaleLowerCase() ===
      normalizeStudentName(nextStudentName).toLocaleLowerCase();
    if (!isSameStudent) {
      setProfilePhoto("");
    }
    setPhotoError("");
    setNameInput("");
    setIsSwitchingPlayer(false);
    setIsStarting(true);

    try {
      const historySnapshot = shouldUseRemoteResults
        ? await loadRemoteHistoryWithLocalFallback(nextStudentName, activeStorage)
        : { accepted: true, results: getStudentHistory(nextStudentName, activeStorage) };
      const nextHistory = historySnapshot.results;

      if (historySnapshot.accepted) {
        saveStudentName(nextStudentName, activeStorage);
      } else {
        clearSavedStudentName(nextStudentName, activeStorage);
      }
      setStudentName(nextStudentName);

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

      const draft = getDailyDraft(nextStudentName, dateKey, activeStorage);
      if (draft) {
        const firstIncompleteQuestionIndex = getFirstIncompleteQuestionIndex(
          draft.questionResults,
          dailyProblems.length
        );

        if (firstIncompleteQuestionIndex >= dailyProblems.length) {
          void restoreDraftResultsRoute(nextStudentName, draft);
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
        studentName === nextStudentName &&
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
      setSelectedChoiceId(null);
      setAttemptedChoiceIds([]);
      setCheckedResult(null);
      setIsCurrentQuestionFinalized(false);
      updateTimer(pausedTimer(0));
      setMode("ready");
      navigateTo({ screen: "ready" });
    } finally {
      setIsStarting(false);
    }
  }

  function handleStreakDaySelect(selectedDateKey: string) {
    if (!studentName || selectedDateKey > todayDateKey) {
      return;
    }

    const selectedProblems = selectDailyProblems(problems, selectedDateKey);
    const existingResult = homeHistory.find((result) => result.dateKey === selectedDateKey);
    const draft = getDailyDraft(studentName, selectedDateKey, activeStorage);

    setDateKey(selectedDateKey);
    setHistory(homeHistory);

    if (existingResult) {
      restoreCompletedRoute(existingResult, {
        screen: "question",
        questionIndex: 0,
        dateKey: selectedDateKey
      });
      navigateTo({ screen: "question", questionIndex: 0 }, "push", selectedDateKey);
      return;
    }

    if (draft) {
      const firstIncompleteQuestionIndex = getFirstIncompleteQuestionIndex(
        draft.questionResults,
        selectedProblems.length
      );

      if (firstIncompleteQuestionIndex >= selectedProblems.length) {
        void restoreDraftResultsRoute(studentName, draft, selectedDateKey, selectedProblems);
        navigateTo({ screen: "results" }, "push", selectedDateKey);
        return;
      }

      const questionIndex = Math.min(
        clampQuestionIndex(draft.currentIndex, selectedProblems.length),
        firstIncompleteQuestionIndex
      );
      restoreQuestionRoute(draft, questionIndex, selectedProblems);
      navigateTo({ screen: "question", questionIndex }, "push", selectedDateKey);
      return;
    }

    setCurrentResult(null);
    setQuestionResults([]);
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
    updateTimer(pausedTimer(0));
    setMode("ready");
    navigateTo({ screen: "ready" }, "push", selectedDateKey);
  }

  function handleReadyContinue() {
    setCurrentResult(null);
    setQuestionResults([]);
    setCurrentIndex(0);
    startQuestion();
    setMode("quiz");
    navigateTo({ screen: "question", questionIndex: 0 });
  }

  function startQuestion() {
    setIsTimerPaused(false);
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
    updateTimer(pausedTimer(0));
  }

  function handleCheck() {
    if (!selectedChoiceId || checkedResult) {
      return;
    }

    const exactElapsedSeconds = getTimerElapsedMs(questionTimerRef.current) / 1000;
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

  async function handleNextQuestion() {
    if (isSavingResult) {
      return;
    }

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
      // Advancing past the question we just answered starts a fresh clock;
      // stepping forward through already-answered questions keeps the running
      // question's elapsed time so it resumes where it paused.
      const isStartingNewQuestion = !storedResult && !getQuestionResultAt(nextQuestionResults, nextIndex);

      if (isStartingNewQuestion) {
        updateTimer(pausedTimer(0));
      }

      saveDraftSnapshot({
        currentIndex: nextIndex,
        questionResults: nextQuestionResults,
        selectedChoiceId: null,
        attemptedChoiceIds: [],
        checkedResult: null,
        isCurrentQuestionFinalized: false,
        ...(isStartingNewQuestion ? { questionElapsedMs: 0 } : {})
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
    setIsSavingResult(true);
    const savingResult = persistCompletedResult(nextResult);
    setCurrentResult(nextResult);
    setQuestionResults(nextResult.questionResults);
    setMode("score");
    navigateTo({ screen: "results" });

    try {
      const savedResult = await savingResult;
      setCurrentResult(savedResult);
      setQuestionResults(savedResult.questionResults);
    } finally {
      setIsSavingResult(false);
    }
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

  function moveToQuestion(index: number, _results: QuestionResult[]) {
    // The timer effect resumes (or, for a freshly started question, runs from
    // zero) once the new index lands on screen, so navigation only resets the
    // per-question answer state here.
    setIsTimerPaused(false);
    setCurrentIndex(index);
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
  }

  async function handleScoreContinue() {
    if (!currentResult || isSavingResult) {
      return;
    }

    setIsSavingResult(true);

    try {
      const historySnapshot = shouldUseRemoteResults
        ? await loadRemoteHistoryWithLocalFallback(currentResult.studentName, activeStorage)
        : { accepted: true, results: getStudentHistory(currentResult.studentName, activeStorage) };
      const nextHistory = historySnapshot.results;

      setHistory(nextHistory);
      setHomeHistory(nextHistory);
      setMode("streak");
      navigateTo({ screen: "streak" });
    } finally {
      setIsSavingResult(false);
    }
  }

  async function persistCompletedResult(result: DailyResult): Promise<DailyResult> {
    let savedResult = result;

    // Save synchronously before starting the request so closing the tab after
    // seeing the result cannot lose the completed game locally.
    saveDailyResult(result, activeStorage);
    clearDailyDraft(result.studentName, result.dateKey, activeStorage);

    if (shouldUseRemoteResults) {
      try {
        const remoteSave = await saveRemoteDailyResult(result);
        savedResult = remoteSave.result;

        if (remoteSave.accepted) {
          saveDailyResult(savedResult, activeStorage);
        } else {
          clearSavedStudentName(savedResult.studentName, activeStorage);
          replaceStudentHistory(savedResult.studentName, [], activeStorage);
        }
      } catch {
        // The synchronous local save remains available and the keepalive
        // request can still finish if the page is being unloaded.
      }
    }

    return savedResult;
  }

  function handleStreakContinue() {
    setIsTimerPaused(false);
    setCurrentResult(null);
    setQuestionResults([]);
    setSelectedChoiceId(null);
    setAttemptedChoiceIds([]);
    setCheckedResult(null);
    setIsCurrentQuestionFinalized(false);
    showHome();
  }

  function showHome() {
    setDateKey(todayDateKey);
    setMode("home");
    navigateTo({ screen: "home" });
  }

  return (
    <main className="app-shell">
      {mode === "home" ? (
        <HomeScreen
          dateKey={dateKey}
          isHomeHistoryLoading={isHomeHistoryLoading}
          isLeaderboardLoading={isLeaderboardLoading}
          isProfileLoading={isProfileLoading}
          isStarting={isStarting}
          isSwitchingPlayer={isSwitchingPlayer}
          leaderboard={leaderboard}
          history={homeHistory}
          isPhotoSaving={isPhotoSaving}
          nameInput={nameInput}
          onCancelSwitchPlayer={handleCancelSwitchPlayer}
          onNameChange={setNameInput}
          onLoadProfile={handleLoadPlayerProfile}
          onPhotoChange={handleProfilePhotoChange}
          onSelectStreakDay={handleStreakDaySelect}
          onSwitchPlayer={handleSwitchPlayer}
          onSubmit={handleStart}
          photoDataUrl={profilePhoto}
          photoError={photoError}
          savedName={studentName}
        />
      ) : null}

      {mode === "ready" ? (
        <ReadyScreen dateKey={dateKey} onBack={showHome} onContinue={handleReadyContinue} />
      ) : null}

      {mode === "quiz" || mode === "review" ? (
        <QuestionScreen
          attemptedChoiceIds={attemptedChoiceIds}
          currentIndex={currentIndex}
          isCurrentQuestionFinalized={isCurrentQuestionFinalized}
          isReview={mode === "review"}
          idlePromptAfterMs={idlePromptAfterMs}
          onBack={mode === "review" ? handleBackReviewQuestion : handleBackQuestion}
          onCheck={handleCheck}
          onExplain={handleExplainQuestion}
          onNext={mode === "review" ? handleNextReviewQuestion : handleNextQuestion}
          onSelectChoice={setSelectedChoiceId}
          onTimerPauseChange={handleTimerPauseChange}
          onTryAgain={handleTryAgain}
          problem={currentProblem}
          questionTimer={questionTimer}
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

type ReadyScreenProps = {
  dateKey: string;
  onBack(): void;
  onContinue(): void;
};

function ReadyScreen({ dateKey, onBack, onContinue }: ReadyScreenProps) {
  const [message, setMessage] = useState(READY_MESSAGES[0]);

  useEffect(() => {
    setMessage(READY_MESSAGES[Math.floor(Math.random() * READY_MESSAGES.length)]);
  }, []);

  return (
    <section className="app-card ready-card" aria-label="Pencil and paper check">
      <header className="ready-topbar">
        <button className="quiz-back-btn" aria-label="Back" onClick={onBack} type="button">
          <ArrowLeft size={23} />
        </button>
      </header>

      <div className="ready-copy">
        <div className="ready-icon" aria-hidden="true">
          <Pencil size={42} />
        </div>
        <h1>Do you have your pencil and paper ready?</h1>
        <p className="ready-date">Challenge for {formatDateKey(dateKey)}</p>
        <p>{message}</p>
      </div>

      <div className="ready-actions">
        <button className="primary-action" onClick={onContinue} type="button">
          I&apos;m Ready
        </button>
        <button className="secondary-action" onClick={onContinue} type="button">
          I don&apos;t like good advice
        </button>
      </div>
    </section>
  );
}

type HomeScreenProps = {
  dateKey: string;
  isHomeHistoryLoading: boolean;
  isLeaderboardLoading: boolean;
  isProfileLoading: boolean;
  isStarting: boolean;
  isSwitchingPlayer: boolean;
  isPhotoSaving: boolean;
  leaderboard: LeaderboardEntry[];
  history: DailyResult[];
  nameInput: string;
  onCancelSwitchPlayer(): void;
  onLoadProfile(studentName: string): Promise<PlayerProfileData>;
  onNameChange(name: string): void;
  onPhotoChange(event: ChangeEvent<HTMLInputElement>): void;
  onSelectStreakDay(dateKey: string): void;
  onSwitchPlayer(): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
  savedName: string;
  photoDataUrl: string;
  photoError: string;
};

function HomeScreen({
  dateKey,
  isHomeHistoryLoading,
  isLeaderboardLoading,
  isProfileLoading,
  isStarting,
  isSwitchingPlayer,
  isPhotoSaving,
  leaderboard,
  history,
  nameInput,
  onCancelSwitchPlayer,
  onLoadProfile,
  onNameChange,
  onPhotoChange,
  onSelectStreakDay,
  onSwitchPlayer,
  onSubmit,
  savedName,
  photoDataUrl,
  photoError
}: HomeScreenProps) {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PlayerProfileData | null>(null);
  const [isSelectedProfileLoading, setIsSelectedProfileLoading] = useState(false);
  const [selectedProfileError, setSelectedProfileError] = useState("");
  const profileRequestRef = useRef(0);
  const nameLabelId = "student-name-label";
  const switchNameLabelId = "switch-player-name-label";
  const leaderboardPosition = getLeaderboardPosition(leaderboard, savedName);
  const streakDays = buildHomeStreakDays(history, dateKey);
  const primaryActionLabel = savedName ? `Continue as ${savedName}` : "Play";
  const isPrimaryActionDisabled = isStarting || (!savedName && !normalizeStudentName(nameInput));
  const switchTargetName = normalizeStudentName(nameInput);

  const openPlayerProfile = useCallback(
    (entry: Pick<LeaderboardEntry, "studentName" | "photoDataUrl">) => {
      const requestId = profileRequestRef.current + 1;
      profileRequestRef.current = requestId;
      const isCurrentPlayer = getStudentKey(entry.studentName) === getStudentKey(savedName);

      setSelectedProfile({
        studentName: entry.studentName,
        photoDataUrl: isCurrentPlayer ? photoDataUrl : entry.photoDataUrl ?? "",
        history: isCurrentPlayer ? history : []
      });
      setSelectedProfileError("");
      setIsSelectedProfileLoading(!isCurrentPlayer);
      setIsProfileOpen(true);

      if (isCurrentPlayer) {
        return;
      }

      onLoadProfile(entry.studentName)
        .then((profile) => {
          if (profileRequestRef.current === requestId) {
            setSelectedProfile((current) => ({
              ...profile,
              photoDataUrl: profile.photoDataUrl || current?.photoDataUrl || ""
            }));
          }
        })
        .catch(() => {
          if (profileRequestRef.current === requestId) {
            setSelectedProfileError("This player’s full history couldn’t be loaded.");
          }
        })
        .then(() => {
          if (profileRequestRef.current === requestId) {
            setIsSelectedProfileLoading(false);
          }
        });
    },
    [history, onLoadProfile, photoDataUrl, savedName]
  );

  const closePlayerProfile = useCallback(() => {
    profileRequestRef.current += 1;
    setIsProfileOpen(false);
  }, []);

  return (
    <section className="app-card home-card" aria-label="Three Qs home">
      <div className="home-content">
        <div className="home-topbar">
          <p className="today-label home-date">{formatDateKey(dateKey)}</p>
          <button
            aria-label={
              leaderboardPosition
                ? `Open leaderboard, you are #${leaderboardPosition}`
                : "Open leaderboard"
            }
            className="leaderboard-trigger"
            onClick={() => setIsLeaderboardOpen(true)}
            type="button"
          >
            <Trophy size={17} />
            <span>{leaderboardPosition ? `#${leaderboardPosition}` : "Leaderboard"}</span>
          </button>
        </div>

        <div aria-hidden="true" />

        <div className="home-copy">
          <h1 className="home-wordmark">
            Three<span className="home-wordmark-qs">Qs</span>
          </h1>
          <p>Your daily math superbowl challenge</p>
        </div>

        <div aria-hidden="true" />

        {savedName ? (
          <HomeStreakStrip
            days={streakDays.days}
            hasActiveDay={streakDays.hasActiveDay}
            isLoading={isHomeHistoryLoading}
            onSelectDay={onSelectStreakDay}
          />
        ) : (
          <div className="home-streak-blank" aria-hidden="true" />
        )}

        <div aria-hidden="true" />

        <form className="home-form" onSubmit={onSubmit}>
          <div className="name-field">
            <span className="name-field-label" id={nameLabelId}>
              {savedName ? "Player" : "Your Name"}
            </span>
            {isProfileLoading ? (
              <div aria-label="Name loading" className="name-loading" role="status">
                <span aria-hidden="true" className="name-skeleton-bar" />
              </div>
            ) : savedName ? (
              <div aria-labelledby={nameLabelId} className="name-display">
                <button
                  aria-label={`Open profile for ${savedName}`}
                  className="name-profile-button"
                  onClick={() => openPlayerProfile({ studentName: savedName, photoDataUrl })}
                  type="button"
                >
                  <PlayerAvatar className="name-avatar" name={savedName} photoDataUrl={photoDataUrl} />
                  <span className="name-display-text">{savedName}</span>
                </button>
                <button className="name-switch-btn" onClick={onSwitchPlayer} type="button">
                  Switch
                </button>
              </div>
            ) : (
              <input
                aria-labelledby={nameLabelId}
                className="name-input"
                name="studentName"
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Type your name"
                value={nameInput}
              />
            )}
          </div>

          <button
            className="primary-action home-play-action"
            disabled={isPrimaryActionDisabled}
            type="submit"
          >
            <Play size={19} fill="currentColor" />
            {primaryActionLabel}
          </button>
        </form>
      </div>

      <BottomSheet
        backdropTestId="switch-player-backdrop"
        className="switch-player-sheet"
        closeLabel="Cancel switching player"
        onDismiss={onCancelSwitchPlayer}
        open={isSwitchingPlayer}
        testId="switch-player-sheet"
        title="Switch Player"
        titleId="switch-player-sheet-title"
      >
        <form className="switch-player-form" onSubmit={onSubmit}>
          <div className="switch-player-panel">
            <div className="switch-player-current">
              <span className="switch-player-current-icon" aria-hidden="true">
                <UserRound size={16} />
              </span>
              <span className="switch-player-current-copy">
                <span className="switch-player-kicker">Playing as</span>
                <span className="current-player-name">{savedName}</span>
              </span>
            </div>
            <label className="switch-player-target" htmlFor="switch-player-name">
              <span className="switch-player-kicker" id={switchNameLabelId}>
                Continue as
              </span>
              <input
                aria-labelledby={switchNameLabelId}
                className="switch-player-input"
                id="switch-player-name"
                name="studentName"
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="New player name"
                value={nameInput}
              />
            </label>
          </div>
          <button
            className="primary-action"
            disabled={!switchTargetName || isStarting}
            type="submit"
          >
            {switchTargetName ? `Continue as ${switchTargetName}` : "Continue as this player"}
          </button>
        </form>
      </BottomSheet>

      <BottomSheet
        backdropTestId="leaderboard-backdrop"
        className="leaderboard-sheet"
        closeLabel="Close leaderboard"
        onDismiss={() => setIsLeaderboardOpen(false)}
        open={isLeaderboardOpen}
        testId="leaderboard-sheet"
        title="Leaderboard"
        titleId="leaderboard-sheet-title"
      >
        <Leaderboard
          entries={leaderboard}
          isLoading={isLeaderboardLoading}
          onSelectProfile={openPlayerProfile}
          variant="sheet"
        />
      </BottomSheet>

      <PlayerProfileSheet
        currentPhotoDataUrl={photoDataUrl}
        currentPlayerName={savedName}
        dateKey={dateKey}
        error={selectedProfileError}
        isLoading={isSelectedProfileLoading}
        isPhotoSaving={isPhotoSaving}
        onClosed={() => setSelectedProfile(null)}
        onDismiss={closePlayerProfile}
        onPhotoChange={onPhotoChange}
        open={isProfileOpen}
        photoError={photoError}
        profile={selectedProfile}
      />
    </section>
  );
}

function Leaderboard({
  entries,
  isLoading,
  onSelectProfile,
  variant = "inline"
}: {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  onSelectProfile(entry: LeaderboardEntry): void;
  variant?: "inline" | "sheet";
}) {
  const display = entries;
  return (
    <div
      className={["leaderboard", variant === "sheet" ? "leaderboard-sheet-content" : ""]
        .filter(Boolean)
        .join(" ")}
      aria-busy={isLoading}
    >
      <p className="leaderboard-title">Top Players · Last 7 Days</p>
      <div className="leaderboard-body">
        {isLoading ? (
          <div className="leaderboard-skeleton" aria-label="Leaderboard loading" role="status">
            {Array.from({ length: 5 }).map((_, index) => (
              <span aria-hidden="true" className="leaderboard-skeleton-bar" key={index} />
            ))}
          </div>
        ) : display.length === 0 ? (
          <p className="leaderboard-empty">Top spot is yours for the taking</p>
        ) : (
          <ol className="leaderboard-list">
            {display.map((entry, index) => (
              <li className="leaderboard-row" key={entry.studentName}>
                <span className="leaderboard-rank">{index + 1}</span>
                <button
                  aria-label={`Open profile for ${entry.studentName}`}
                  className="leaderboard-player-button"
                  onClick={() => onSelectProfile(entry)}
                  type="button"
                >
                  <PlayerAvatar
                    className="leaderboard-avatar"
                    name={entry.studentName}
                    photoDataUrl={entry.photoDataUrl ?? ""}
                  />
                  <span className="leaderboard-player-details">
                    <span className="leaderboard-name">{entry.studentName}</span>
                    <span className="leaderboard-medals">
                      {entry.gold > 0 && (
                        <span className="lb-medal gold" data-tip={`${entry.gold} gold`}>
                          {entry.gold}
                        </span>
                      )}
                      {entry.silver > 0 && (
                        <span className="lb-medal silver" data-tip={`${entry.silver} silver`}>
                          {entry.silver}
                        </span>
                      )}
                      {entry.bronze > 0 && (
                        <span className="lb-medal bronze" data-tip={`${entry.bronze} bronze`}>
                          {entry.bronze}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
                <span className="leaderboard-pts">{entry.totalPoints}<small>pts</small></span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function PlayerAvatar({
  className,
  name,
  photoDataUrl
}: {
  className: string;
  name: string;
  photoDataUrl: string;
}) {
  return (
    <span aria-hidden="true" className={className}>
      {photoDataUrl ? <img alt="" src={photoDataUrl} /> : <span>{getPlayerInitials(name)}</span>}
    </span>
  );
}

function PlayerProfileSheet({
  currentPhotoDataUrl,
  currentPlayerName,
  dateKey,
  error,
  isLoading,
  isPhotoSaving,
  onClosed,
  onDismiss,
  onPhotoChange,
  open,
  photoError,
  profile
}: {
  currentPhotoDataUrl: string;
  currentPlayerName: string;
  dateKey: string;
  error: string;
  isLoading: boolean;
  isPhotoSaving: boolean;
  onClosed(): void;
  onDismiss(): void;
  onPhotoChange(event: ChangeEvent<HTMLInputElement>): void;
  open: boolean;
  photoError: string;
  profile: PlayerProfileData | null;
}) {
  if (!profile) {
    return null;
  }

  const isCurrentPlayer = getStudentKey(profile.studentName) === getStudentKey(currentPlayerName);
  const photoDataUrl = isCurrentPlayer ? currentPhotoDataUrl : profile.photoDataUrl;
  const recentHistory = [...profile.history]
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .slice(0, 7);
  const lifetimePoints = profile.history.reduce((total, result) => total + result.totalScore, 0);
  const currentStreak = calculateCurrentStreak(profile.history, dateKey);
  const medalCounts = {
    gold: profile.history.filter((result) => result.medal === "gold").length,
    silver: profile.history.filter((result) => result.medal === "silver").length,
    bronze: profile.history.filter((result) => result.medal === "bronze").length,
    practice: profile.history.filter((result) => result.medal === "practice").length
  };

  const avatar = isCurrentPlayer && !photoDataUrl ? (
    <span aria-hidden="true" className="profile-avatar-photo profile-avatar-empty">
      <UserRound size={30} />
      <span>Add photo</span>
    </span>
  ) : (
    <PlayerAvatar
      className="profile-avatar-photo"
      name={profile.studentName}
      photoDataUrl={photoDataUrl}
    />
  );

  return (
    <BottomSheet
      backdropTestId="player-profile-backdrop"
      className="player-profile-sheet"
      closeLabel={`Close profile for ${profile.studentName}`}
      onClosed={onClosed}
      onDismiss={onDismiss}
      open={open}
      testId="player-profile-sheet"
      title={`${profile.studentName} profile`}
      titleId="player-profile-sheet-title"
    >
      <div className="player-profile-content">
        {isCurrentPlayer ? (
          <label
            aria-label={`${photoDataUrl ? "Change" : "Add"} profile photo for ${profile.studentName}`}
            className={["profile-avatar-sticker", "editable", isPhotoSaving ? "saving" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            {avatar}
            <span aria-hidden="true" className="profile-avatar-edit-overlay">
              <Pencil size={22} />
            </span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="visually-hidden"
              disabled={isPhotoSaving}
              onChange={onPhotoChange}
              type="file"
            />
          </label>
        ) : (
          <div className="profile-avatar-sticker">{avatar}</div>
        )}

        <div className="player-profile-heading">
          <h3>{profile.studentName}</h3>
          <p>{isCurrentPlayer ? "Your player profile" : "Player profile"}</p>
        </div>

        {photoError && isCurrentPlayer ? (
          <p className="profile-photo-error profile-sheet-error" role="alert">
            {photoError}
          </p>
        ) : null}

        {isLoading ? (
          <div aria-label="Profile loading" className="player-profile-loading" role="status">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <>
            {error ? <p className="player-profile-load-error">{error}</p> : null}
            <section aria-label="Lifetime stats" className="profile-section">
              <p className="profile-section-title">Lifetime stats</p>
              <div className="profile-primary-stats">
                <span><strong>{lifetimePoints.toLocaleString()}</strong><small>points</small></span>
                <span><strong>{profile.history.length}</strong><small>days</small></span>
                <span><strong>{currentStreak}</strong><small>day streak</small></span>
              </div>
              <div className="profile-medal-stats">
                {(Object.keys(medalCounts) as MedalResult[]).map((medal) => (
                  <span className={`profile-medal-stat ${medal}`} key={medal}>
                    <strong>{medalCounts[medal]}</strong>
                    <small>{getMedalLabel(medal)}</small>
                  </span>
                ))}
              </div>
            </section>

            <section aria-label="Recent history" className="profile-section recent-history-section">
              <p className="profile-section-title">Recent history</p>
              {recentHistory.length > 0 ? (
                <ol className="profile-history-list">
                  {recentHistory.map((result) => (
                    <li key={result.dateKey}>
                      <span aria-hidden="true" className={`profile-history-medal ${result.medal}`}>
                        {getStreakSpotLabel(result.medal)}
                      </span>
                      <span className="profile-history-date">{formatProfileHistoryDate(result.dateKey)}</span>
                      <span className="profile-history-score">{result.totalScore}<small> pts</small></span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="profile-history-empty">No completed days yet.</p>
              )}
            </section>
          </>
        )}
      </div>
    </BottomSheet>
  );
}

function getPlayerInitials(name: string): string {
  return normalizeStudentName(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? "")
    .join("") || "?";
}

function formatProfileHistoryDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

type HomeStreakDay = {
  dateKey: string;
  dayLabel: string;
  medal: MedalResult | null;
};

function HomeStreakStrip({
  days,
  hasActiveDay,
  isLoading,
  onSelectDay
}: {
  days: HomeStreakDay[];
  hasActiveDay: boolean;
  isLoading: boolean;
  onSelectDay(dateKey: string): void;
}) {
  if (isLoading) {
    return (
      <section className="home-streak-panel" aria-label="Streak loading" aria-busy="true">
        <div className="home-streak-heading">
          <p className="leaderboard-title">Current Streak</p>
          <span aria-hidden="true" className="home-streak-title-skeleton" />
        </div>
        <div className="home-streak-strip" role="status">
          {Array.from({ length: 7 }).map((_, index) => (
            <span aria-hidden="true" className="home-streak-skeleton-day" key={index} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="home-streak-panel" aria-label="Recent streak">
      <div className="home-streak-heading">
        <p className="leaderboard-title">Current Streak</p>
        {!hasActiveDay ? (
          <p className="home-streak-encouragement">Start your streak today.</p>
        ) : null}
      </div>
      <div className="home-streak-strip">
        {days.map((day) => (
          <div className="home-streak-day" key={day.dateKey}>
            <span className="home-streak-day-label">{day.dayLabel}</span>
            <button
              aria-label={day.medal ? `${day.dayLabel} ${day.medal}` : `${day.dayLabel} blank`}
              className={["home-streak-spot", day.medal ?? "blank"].join(" ")}
              data-testid={`streak-spot-${day.dateKey}`}
              onClick={() => onSelectDay(day.dateKey)}
              type="button"
            >
              {day.medal ? getStreakSpotLabel(day.medal) : ""}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function getLeaderboardPosition(entries: LeaderboardEntry[], savedName: string): number | null {
  const savedKey = normalizeStudentName(savedName).toLocaleLowerCase();
  if (!savedKey) {
    return null;
  }

  const index = entries.findIndex(
    (entry) => normalizeStudentName(entry.studentName).toLocaleLowerCase() === savedKey
  );

  return index >= 0 ? index + 1 : null;
}

function buildHomeStreakDays(
  results: DailyResult[],
  todayKey: string
): { days: HomeStreakDay[]; hasActiveDay: boolean } {
  const resultByDate = new Map(results.map((result) => [result.dateKey, result]));
  const lookbackKeys = Array.from({ length: 7 }, (_, index) =>
    addDaysToDateKey(todayKey, index - 6)
  );

  return {
    hasActiveDay: lookbackKeys.some((dateKey) => resultByDate.has(dateKey)),
    days: lookbackKeys.map((dateKey) => {
      return {
        dateKey,
        dayLabel: formatWeekdayLabel(dateKey),
        medal: resultByDate.get(dateKey)?.medal ?? null
      };
    })
  };
}

function addDaysToDateKey(dateKey: string, offsetDays: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function formatWeekdayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short"
  }).format(date);
}

function getStreakSpotLabel(medal: MedalResult): string {
  if (medal === "gold") {
    return "G";
  }

  if (medal === "silver") {
    return "S";
  }

  if (medal === "bronze") {
    return "B";
  }

  return "P";
}

type QuestionScreenProps = {
  attemptedChoiceIds: string[];
  currentIndex: number;
  idlePromptAfterMs: number;
  isCurrentQuestionFinalized: boolean;
  isReview: boolean;
  onBack(): void;
  onCheck(): void;
  onExplain(): void;
  onNext(): void;
  onSelectChoice(choiceId: string): void;
  onTimerPauseChange(isPaused: boolean): void;
  onTryAgain(): void;
  problem: Problem;
  questionTimer: QuestionTimer;
  result: QuestionResult | null;
  reviewResult: QuestionResult | null;
  savedResult: QuestionResult | null;
  selectedChoiceId: string | null;
  totalQuestions: number;
};

function QuestionScreen({
  attemptedChoiceIds,
  currentIndex,
  idlePromptAfterMs,
  isCurrentQuestionFinalized,
  isReview,
  onBack,
  onCheck,
  onExplain,
  onNext,
  onSelectChoice,
  onTimerPauseChange,
  onTryAgain,
  problem,
  questionTimer,
  result,
  reviewResult,
  savedResult,
  selectedChoiceId,
  totalQuestions
}: QuestionScreenProps) {
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const [isIdleOpen, setIsIdleOpen] = useState(false);
  const [selectedVocabTerm, setSelectedVocabTerm] = useState<VocabTerm | null>(null);
  const displayResult = isReview ? reviewResult : savedResult ?? result;
  const displayAttemptedChoiceIds = isReview
    ? reviewResult?.selectedChoiceIds ?? []
    : savedResult?.selectedChoiceIds ?? displayResult?.selectedChoiceIds ?? attemptedChoiceIds;
  const displaySelectedChoiceId = isReview
    ? reviewResult?.selectedChoiceIds.at(-1) ?? null
    : savedResult?.selectedChoiceIds.at(-1) ?? selectedChoiceId;
  const isViewingSavedAnswer = Boolean(isReview || savedResult);
  const displayIsFinalized = Boolean(isViewingSavedAnswer || isCurrentQuestionFinalized);
  const promptSizeClass = getPromptSizeClass(problem.prompt);
  const canTryAgain = Boolean(
    !isReview &&
      !savedResult &&
      displayResult &&
      !displayResult.solved &&
      !isCurrentQuestionFinalized &&
      displayResult.attemptsUsed < MAX_ATTEMPTS
  );
  const vocabTerms = problem.vocabTerms ?? [];

  // Shuffle choices deterministically per problem so the order is randomized
  // but stays stable across re-renders, attempts, navigation, and review.
  const orderedChoices = useMemo(
    () => shuffleWithSeed(problem.choices, problem.id),
    [problem.id, problem.choices]
  );

  // Reset any open overlay when moving to a different question.
  useEffect(() => {
    setIsVocabOpen(false);
    setIsIdleOpen(false);
    setSelectedVocabTerm(null);
  }, [problem.id]);

  // Pause the clock whenever an overlay (vocab help or the idle prompt) covers
  // the question, and resume the moment it is dismissed.
  const isOverlayOpen = isVocabOpen || isIdleOpen;
  useEffect(() => {
    onTimerPauseChange(isOverlayOpen);
  }, [isOverlayOpen, onTimerPauseChange]);

  // After three solid minutes without any interaction on an unanswered
  // question, raise the "Are you still here?" prompt over the question.
  const isAwaitingAnswer = !isReview && !displayResult;
  useEffect(() => {
    if (!isAwaitingAnswer || isOverlayOpen) {
      return undefined;
    }

    let timeoutId = window.setTimeout(() => setIsIdleOpen(true), idlePromptAfterMs);
    const restart = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setIsIdleOpen(true), idlePromptAfterMs);
    };

    const activityEvents = ["pointerdown", "pointermove", "keydown", "touchstart", "wheel"] as const;
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, restart, { passive: true })
    );

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, restart));
    };
  }, [idlePromptAfterMs, isAwaitingAnswer, isOverlayOpen]);

  function openVocabSheet(term: VocabTerm | null = null) {
    if (vocabTerms.length === 0) {
      return;
    }

    setSelectedVocabTerm(term ?? vocabTerms[0]);
    setIsVocabOpen(true);
  }

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

        <div className="quiz-tools">
          {vocabTerms.length > 0 ? (
            <button
              aria-label="Open vocabulary help"
              className="vocab-help-btn"
              onClick={() => openVocabSheet()}
              type="button"
            >
              <HelpCircle size={18} />
            </button>
          ) : null}

          <TimerPill
            key={currentIndex}
            frozenSeconds={displayResult?.elapsedSeconds}
            timer={questionTimer}
          />
        </div>
      </header>

      <div className="quiz-content">
        <div className={["quiz-prompt", promptSizeClass].filter(Boolean).join(" ")}>
          <MathText onVocabTermSelect={openVocabSheet} text={problem.prompt} vocabTerms={vocabTerms} />
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

      <BottomSheet
        backdropTestId="vocab-backdrop"
        closeLabel="Close vocabulary help"
        onDismiss={() => setIsVocabOpen(false)}
        open={isVocabOpen && vocabTerms.length > 0}
        testId="vocab-sheet"
        title="Words to Know"
        titleId="vocab-sheet-title"
      >
        <div className="vocab-term-list">
          {vocabTerms.map((term) => (
            <article
              className={["vocab-term-card", selectedVocabTerm?.term === term.term ? "selected" : ""]
                .filter(Boolean)
                .join(" ")}
              key={term.term}
            >
              <h3>{term.term}</h3>
              <p>
                <MathText text={term.definition} />
              </p>
            </article>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        backdropTestId="idle-backdrop"
        closeLabel="Dismiss reminder"
        onDismiss={() => setIsIdleOpen(false)}
        open={isIdleOpen}
        testId="idle-sheet"
        title="Are you still here?"
        titleId="idle-sheet-title"
      >
        <div className="idle-prompt">
          <p className="idle-prompt-copy">
            Your timer is paused. Tap below when you&rsquo;re ready to keep going.
          </p>
          <button
            className="primary-action"
            onClick={() => setIsIdleOpen(false)}
            type="button"
          >
            I&rsquo;m still here
          </button>
        </div>
      </BottomSheet>
    </section>
  );
}

const TimerPill = memo(function TimerPill({
  frozenSeconds,
  timer
}: {
  frozenSeconds?: number;
  timer: QuestionTimer;
}) {
  const [liveElapsedMs, setLiveElapsedMs] = useState(() => getTimerElapsedMs(timer));
  const isRunning = frozenSeconds === undefined && timer.runningSince !== null;
  const displaySeconds = toWholeSeconds(
    frozenSeconds !== undefined ? frozenSeconds : liveElapsedMs / 1000
  );
  const timerText = formatElapsedSeconds(displaySeconds);
  const digitClass = getTimerDigitClass(displaySeconds);

  useEffect(() => {
    setLiveElapsedMs(getTimerElapsedMs(timer));

    if (!isRunning) {
      return undefined;
    }

    const interval = window.setInterval(() => setLiveElapsedMs(getTimerElapsedMs(timer)), 200);
    return () => window.clearInterval(interval);
  }, [isRunning, timer]);

  return (
    <div className={`timer-pill ${digitClass}`} aria-label={`${displaySeconds} seconds elapsed`}>
      <Clock3 size={17} />
      <span className="timer-text">{timerText}</span>
    </div>
  );
});

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

function getPromptSizeClass(prompt: string): string {
  const displayLength = prompt
    .replace(/\$+/g, "")
    .replace(/\\([a-zA-Z]+|.)/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim().length;

  if (displayLength >= 175) {
    return "prompt-extra-long";
  }

  if (displayLength >= 115) {
    return "prompt-long";
  }

  return "";
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

// A pause-aware stopwatch for the active question. `elapsedMs` is the time
// banked from prior running segments; `runningSince` is the performance.now()
// mark of the current segment, or null while paused.
type QuestionTimer = {
  elapsedMs: number;
  runningSince: number | null;
};

function pausedTimer(elapsedMs = 0): QuestionTimer {
  return { elapsedMs: Math.max(0, elapsedMs), runningSince: null };
}

function getTimerElapsedMs(timer: QuestionTimer): number {
  const runningMs = timer.runningSince === null ? 0 : Math.max(0, performance.now() - timer.runningSince);
  return Math.max(0, timer.elapsedMs) + runningMs;
}

function resumeTimer(timer: QuestionTimer): QuestionTimer {
  if (timer.runningSince !== null) {
    return timer;
  }

  return { elapsedMs: Math.max(0, timer.elapsedMs), runningSince: performance.now() };
}

function pauseTimer(timer: QuestionTimer): QuestionTimer {
  if (timer.runningSince === null) {
    return timer;
  }

  return { elapsedMs: getTimerElapsedMs(timer), runningSince: null };
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
): Promise<RemoteHistory> {
  const localHistory = getStudentHistory(studentName, storage);

  try {
    const remoteHistory = await fetchRemoteHistory(studentName);

    if (remoteHistory.accepted) {
      replaceStudentHistory(studentName, remoteHistory.results, storage);
    } else {
      clearSavedStudentName(studentName, storage);
      replaceStudentHistory(studentName, [], storage);
    }

    return remoteHistory;
  } catch {
    return {
      accepted: true,
      results: localHistory
    };
  }
}

function resizeProfilePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Profile photo must be an image."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Profile photo could not be read."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Profile photo could not be decoded."));
      image.onload = () => {
        const size = 256;
        const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
        const sourceX = (image.naturalWidth - sourceSize) / 2;
        const sourceY = (image.naturalHeight - sourceSize) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Profile photo could not be resized."));
          return;
        }

        context.fillStyle = "#fffdf7";
        context.fillRect(0, 0, size, size);
        context.drawImage(
          image,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          size,
          size
        );
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
