import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DailyGame } from "@/components/DailyGame";
import { problems } from "@/data/problems";
import { getPacificDateKey } from "@/lib/date";
import { selectDailyProblems } from "@/lib/daily";
import {
  replaceStudentHistory,
  saveCachedLeaderboard,
  saveStudentName,
  type StorageLike
} from "@/lib/storage";
import type { DailyResult } from "@/lib/types";

describe("DailyGame", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("lets a student complete the three-question flow and locks the daily result", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const dailyProblems = selectDailyProblems(problems, dateKey);

    const { rerender } = render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));

    for (const problem of dailyProblems) {
      await user.click(screen.getByTestId(`choice-${problem.correctChoiceId}`));
      await user.click(getButtonByText(/^check$/i));
      expect(screen.getByText(/100 pts \+ \d+ speed pts/i)).toBeInTheDocument();
      await user.click(getButtonByText(/^next$/i));
    }

    expect(screen.getByText(/challenge complete/i)).toBeInTheDocument();
    expect(screen.getByText(/out of 390 points/i)).toBeInTheDocument();

    await user.click(getButtonByText(/^continue$/i));
    expect(screen.getByText(/current streak/i)).toBeInTheDocument();
    await user.click(getButtonByText(/^continue$/i));
    expect(screen.getByRole("heading", { name: "ThreeQs" })).toBeInTheDocument();

    rerender(<DailyGame storage={storage} today={today} />);
    await user.click(getButtonByText(/^play$/i));

    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByTestId(`choice-${dailyProblems[0].correctChoiceId}`)).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(getButtonByText(/^next$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^check$/i)).not.toBeInTheDocument();

    for (const _problem of dailyProblems) {
      await user.click(getButtonByText(/^next$/i));
    }

    expect(screen.getByText(/challenge complete/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Question 1 of 3/i)).not.toBeInTheDocument();
  });

  it("uses the back button to revisit answered questions and return home from the first question", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const dailyProblems = selectDailyProblems(problems, dateKey);

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));

    await user.click(screen.getByTestId(`choice-${dailyProblems[0].correctChoiceId}`));
    await user.click(getButtonByText(/^check$/i));
    await user.click(getButtonByText(/^next$/i));

    expect(screen.getByLabelText(/Question 2 of 3/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText("Back"));

    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByTestId(`choice-${dailyProblems[0].correctChoiceId}`)).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(getButtonByText(/^next$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^check$/i)).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Back"));

    expect(screen.getByRole("heading", { name: "ThreeQs" })).toBeInTheDocument();
  });

  it("allows one retry and reviews the first wrong guess with the correct answer", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const [problem] = selectDailyProblems(problems, dateKey);
    const wrongChoiceId = getWrongChoiceIds(problem)[0];

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));
    await user.click(screen.getByTestId(`choice-${wrongChoiceId}`));
    await user.click(getButtonByText(/^check$/i));

    expect(screen.getByText(/try one more answer/i)).toBeInTheDocument();
    expect(getButtonByText(/^try again$/i)).toBeInTheDocument();
    expect(getButtonByText(/^explain it$/i)).toBeInTheDocument();
    expect(screen.getByTestId(`choice-${wrongChoiceId}`)).toHaveClass("wrong");

    await user.click(getButtonByText(/^try again$/i));

    expect(screen.getByTestId(`choice-${wrongChoiceId}`)).toBeDisabled();
    await user.click(screen.getByTestId(`choice-${problem.correctChoiceId}`));
    await user.click(getButtonByText(/^check$/i));

    expect(screen.getByText(/^correct!$/i)).toBeInTheDocument();
    await user.click(getButtonByText(/^next$/i));
    await user.click(screen.getByLabelText("Back"));

    expect(screen.getByTestId(`choice-${wrongChoiceId}`)).toHaveClass("wrong");
    expect(screen.getByTestId(`choice-${problem.correctChoiceId}`)).toHaveClass("correct");
    expect(getButtonByText(/^next$/i)).toBeInTheDocument();
  });

  it("opens vocabulary help from underlined prompt words and the topbar help button", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-27T18:00:00Z");

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));

    await user.click(screen.getAllByRole("button", { name: /show definition for mean/i })[0]);

    const vocabDialog = screen.getByRole("dialog", { name: /words to know/i });
    expect(vocabDialog).toBeInTheDocument();
    expect(within(vocabDialog).queryByText(/^Vocabulary$/i)).not.toBeInTheDocument();
    expect(within(vocabDialog).getByText(/^Mean$/i)).toBeInTheDocument();
    expect(within(vocabDialog).getByText(/add all the values/i)).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByTestId("vocab-backdrop"));

    expect(screen.getByTestId("vocab-sheet")).toHaveClass("closing");
    finishVocabDismissal();

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /words to know/i })).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/open vocabulary help/i));

    expect(screen.getByRole("dialog", { name: /words to know/i })).toBeInTheDocument();

    await user.click(screen.getByLabelText(/close vocabulary help/i));

    expect(screen.getByTestId("vocab-sheet")).toHaveClass("closing");
    finishVocabDismissal();

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /words to know/i })).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/open vocabulary help/i));

    const swipeSheet = screen.getByTestId("vocab-sheet");
    fireEvent.pointerDown(swipeSheet, { clientY: 120, pointerType: "touch" });
    fireEvent.pointerMove(swipeSheet, { clientY: 210, pointerType: "touch" });
    fireEvent.pointerUp(swipeSheet, { clientY: 210, pointerType: "touch" });

    expect(screen.getByTestId("vocab-sheet")).toHaveClass("closing");
    finishVocabDismissal();

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /words to know/i })).not.toBeInTheDocument();
    });
  });

  it("raises the idle prompt after inactivity and resumes on dismiss", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");

    render(<DailyGame idlePromptAfterMs={250} storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));
    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();

    // No interaction for the idle window: the prompt covers the question.
    const idleDialog = await screen.findByRole("dialog", { name: /are you still here/i });
    expect(within(idleDialog).getByText(/timer is paused/i)).toBeInTheDocument();

    // Dismissing it begins closing the sheet, which resumes the question clock.
    await user.click(getButtonByText(/i.m still here/i));
    expect(screen.getByTestId("idle-sheet")).toHaveClass("closing");
  });

  it("shows the explanation and two red answers after two misses", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const [problem] = selectDailyProblems(problems, dateKey);
    const [firstWrongChoiceId, secondWrongChoiceId] = getWrongChoiceIds(problem);

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));
    await user.click(screen.getByTestId(`choice-${firstWrongChoiceId}`));
    await user.click(getButtonByText(/^check$/i));
    await user.click(getButtonByText(/^try again$/i));
    await user.click(screen.getByTestId(`choice-${secondWrongChoiceId}`));
    await user.click(getButtonByText(/^check$/i));

    expect(screen.getByText(/^not quite$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^try again$/i)).not.toBeInTheDocument();
    expect(screen.getByTestId(`choice-${firstWrongChoiceId}`)).toHaveClass("wrong");
    expect(screen.getByTestId(`choice-${secondWrongChoiceId}`)).toHaveClass("wrong");
    expect(screen.getByTestId(`choice-${problem.correctChoiceId}`)).not.toHaveClass("correct");
  });

  it("resumes an answered first question after returning home", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const [problem] = selectDailyProblems(problems, dateKey);

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));
    await user.click(screen.getByTestId(`choice-${problem.correctChoiceId}`));
    await user.click(getButtonByText(/^check$/i));
    await user.click(screen.getByLabelText("Back"));

    expect(screen.getByRole("heading", { name: "ThreeQs" })).toBeInTheDocument();

    await user.click(getButtonByText(/^play$/i));

    expect(screen.getByTestId(`choice-${problem.correctChoiceId}`)).toHaveClass("correct");
    expect(getButtonByText(/^next$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^check$/i)).not.toBeInTheDocument();
  });

  it("pauses the question clock while away from the screen and resumes on return", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const dailyProblems = selectDailyProblems(problems, dateKey);

    // Drive the stopwatch with a controllable clock so we can prove that the
    // time spent away from the question is not counted.
    let clock = 1_000;
    vi.spyOn(performance, "now").mockImplementation(() => clock);

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));
    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();

    // Spend 5 active seconds on the first question, then leave for home.
    clock = 6_000;
    await user.click(screen.getByLabelText("Back"));
    expect(screen.getByRole("heading", { name: "ThreeQs" })).toBeInTheDocument();

    // 100 seconds pass while the question is off screen — these must not count.
    clock = 106_000;
    await user.click(getButtonByText(/^play$/i));
    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();

    // 3 more active seconds, then answer. Recorded time should be ~8s, not ~108s.
    clock = 109_000;
    await user.click(screen.getByTestId(`choice-${dailyProblems[0].correctChoiceId}`));
    await user.click(getButtonByText(/^check$/i));
    await user.click(getButtonByText(/^next$/i));

    for (const problem of dailyProblems.slice(1)) {
      await user.click(screen.getByTestId(`choice-${problem.correctChoiceId}`));
      await user.click(getButtonByText(/^check$/i));
      await user.click(getButtonByText(/^next$/i));
    }

    expect(screen.getByText(/challenge complete/i)).toBeInTheDocument();
    const questionTimes = document.querySelectorAll(".question-time");
    expect(questionTimes[0]).toHaveTextContent("8s");
  });

  it("redirects protected routes home when no student is saved", async () => {
    const routeChange = vi.fn();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");

    render(
      <DailyGame
        onRouteChange={routeChange}
        route={{ screen: "question", questionIndex: 0 }}
        storage={storage}
        today={today}
      />
    );

    await waitFor(() => {
      expect(routeChange).toHaveBeenCalledWith({ screen: "home" }, "replace");
    });
  });

  it("redirects skip-ahead question routes home instead of to the next allowed question", async () => {
    const routeChange = vi.fn();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    saveStudentName("Ada", storage);

    render(
      <DailyGame
        onRouteChange={routeChange}
        route={{ screen: "question", questionIndex: 1 }}
        storage={storage}
        today={today}
      />
    );

    await waitFor(() => {
      expect(routeChange).toHaveBeenCalledWith({ screen: "home" }, "replace");
    });
  });

  it("reloads a valid in-progress question route from the saved draft", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const [firstProblem] = selectDailyProblems(problems, dateKey);

    const { unmount } = render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));
    await user.click(screen.getByTestId(`choice-${firstProblem.correctChoiceId}`));
    await user.click(getButtonByText(/^check$/i));
    await user.click(getButtonByText(/^next$/i));
    expect(screen.getByLabelText(/Question 2 of 3/i)).toBeInTheDocument();

    unmount();

    const routeChange = vi.fn();
    render(
      <DailyGame
        onRouteChange={routeChange}
        route={{ screen: "question", questionIndex: 1 }}
        storage={storage}
        today={today}
      />
    );

    expect(await screen.findByLabelText(/Question 2 of 3/i)).toBeInTheDocument();
    expect(routeChange).not.toHaveBeenCalledWith({ screen: "home" }, "replace");
  });

  it("redirects the results route home until all questions are answered", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const [firstProblem] = selectDailyProblems(problems, dateKey);

    const { unmount } = render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));
    await user.click(screen.getByTestId(`choice-${firstProblem.correctChoiceId}`));
    await user.click(getButtonByText(/^check$/i));
    await user.click(getButtonByText(/^next$/i));

    unmount();

    const routeChange = vi.fn();
    render(
      <DailyGame
        onRouteChange={routeChange}
        route={{ screen: "results" }}
        storage={storage}
        today={today}
      />
    );

    await waitFor(() => {
      expect(routeChange).toHaveBeenCalledWith({ screen: "home" }, "replace");
    });
  });

  it("reloads the results route from a complete unsaved draft", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const dailyProblems = selectDailyProblems(problems, dateKey);

    const { unmount } = render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));

    for (const problem of dailyProblems) {
      await user.click(screen.getByTestId(`choice-${problem.correctChoiceId}`));
      await user.click(getButtonByText(/^check$/i));
      await user.click(getButtonByText(/^next$/i));
    }

    expect(screen.getByText(/challenge complete/i)).toBeInTheDocument();
    unmount();

    const routeChange = vi.fn();
    render(
      <DailyGame
        onRouteChange={routeChange}
        route={{ screen: "results" }}
        storage={storage}
        today={today}
      />
    );

    expect(await screen.findByText(/challenge complete/i)).toBeInTheDocument();
    expect(routeChange).not.toHaveBeenCalledWith({ screen: "home" }, "replace");
  });

  it("refreshes the remote leaderboard each time the home screen loads", async () => {
    const user = userEvent.setup();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const dailyProblems = selectDailyProblems(problems, dateKey);
    const leaderboardResponses = [
      [{ studentName: "Riley", totalPoints: 210, gold: 0, silver: 1, bronze: 1 }],
      [{ studentName: "Ada", totalPoints: 390, gold: 1, silver: 0, bronze: 0 }]
    ];
    const pendingLeaderboardResponses: Array<() => void> = [];
    let leaderboardRequests = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes("/api/leaderboard")) {
          const entries =
            leaderboardResponses[Math.min(leaderboardRequests, leaderboardResponses.length - 1)];
          leaderboardRequests += 1;
          return new Promise<Response>((resolve) => {
            pendingLeaderboardResponses.push(() => resolve(jsonResponse({ entries })));
          });
        }

        if (url.includes("/api/results") && init?.method === "POST") {
          const body = typeof init.body === "string" ? init.body : "{}";
          return jsonResponse({ result: JSON.parse(body) });
        }

        if (url.includes("/api/results")) {
          return jsonResponse({ results: [] });
        }

        throw new Error(`Unhandled fetch: ${url}`);
      })
    );

    render(<DailyGame today={today} />);

    expect(screen.getByLabelText("Leaderboard loading")).toBeInTheDocument();
    expect(document.querySelectorAll(".leaderboard-skeleton-bar")).toHaveLength(5);
    expect(screen.queryByText(/top spot is yours/i)).not.toBeInTheDocument();
    await waitFor(() => expect(leaderboardRequests).toBe(1));
    resolveNextResponse(pendingLeaderboardResponses);

    expect(await screen.findByText("Riley")).toBeInTheDocument();
    expect(leaderboardRequests).toBe(1);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    expect(leaderboardRequests).toBe(1);
    await user.click(getButtonByText(/^play$/i));

    for (const problem of dailyProblems) {
      await user.click(screen.getByTestId(`choice-${problem.correctChoiceId}`));
      await user.click(getButtonByText(/^check$/i));
      await user.click(getButtonByText(/^next$/i));
    }

    await user.click(getButtonByText(/^continue$/i));
    expect(screen.getByText(/current streak/i)).toBeInTheDocument();
    expect(leaderboardRequests).toBe(1);

    await user.click(getButtonByText(/^continue$/i));

    // The cached leaderboard stays visible while the refresh is in flight,
    // instead of flashing the loading skeleton.
    expect(screen.getByText("Riley", { selector: ".leaderboard-name" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Leaderboard loading")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".leaderboard-skeleton-bar")).toHaveLength(0);
    await waitFor(() => expect(leaderboardRequests).toBe(2));
    resolveNextResponse(pendingLeaderboardResponses);

    expect(await screen.findByText("Ada", { selector: ".leaderboard-name" })).toBeInTheDocument();
    expect(screen.queryByText("Riley", { selector: ".leaderboard-name" })).not.toBeInTheDocument();
    expect(leaderboardRequests).toBe(2);
  });

  it("keeps the cached leaderboard when the refresh returns empty", async () => {
    const today = new Date("2026-06-24T18:00:00Z");
    let leaderboardRequests = 0;

    saveCachedLeaderboard(
      [
        { studentName: "Ada", totalPoints: 280, gold: 1, silver: 0, bronze: 0 },
        { studentName: "Lin", totalPoints: 210, gold: 0, silver: 1, bronze: 0 }
      ],
      window.localStorage
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/leaderboard")) {
          leaderboardRequests += 1;
          // Mirrors an unconfigured/transient backend that returns an empty list.
          return jsonResponse({ entries: [] });
        }

        if (url.includes("/api/results")) {
          return jsonResponse({ results: [] });
        }

        throw new Error(`Unhandled fetch: ${url}`);
      })
    );

    render(<DailyGame today={today} />);

    // Cached entries paint immediately — no skeleton.
    expect(screen.getByText("Ada", { selector: ".leaderboard-name" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Leaderboard loading")).not.toBeInTheDocument();

    // The empty refresh resolves but must not blank out the leaderboard.
    await waitFor(() => expect(leaderboardRequests).toBe(1));

    expect(await screen.findByText("Ada", { selector: ".leaderboard-name" })).toBeInTheDocument();
    expect(screen.getByText("Lin", { selector: ".leaderboard-name" })).toBeInTheDocument();
    expect(screen.queryByText(/top spot is yours/i)).not.toBeInTheDocument();
  });

  it("shows a streak placeholder while saved remote history loads", async () => {
    const today = new Date("2026-06-24T18:00:00Z");
    const pendingHistoryResponses: Array<() => void> = [];
    let historyRequests = 0;

    saveStudentName("Ada", window.localStorage);

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/leaderboard")) {
          return jsonResponse({ entries: [] });
        }

        if (url.includes("/api/results")) {
          historyRequests += 1;
          return new Promise<Response>((resolve) => {
            pendingHistoryResponses.push(() => resolve(jsonResponse({ results: [] })));
          });
        }

        throw new Error(`Unhandled fetch: ${url}`);
      })
    );

    render(<DailyGame today={today} />);

    expect(screen.getByText("Your Name")).toBeInTheDocument();
    expect(await screen.findByText("Ada", { selector: ".name-display-text" })).toBeInTheDocument();
    expect(screen.getByLabelText("Edit name")).toBeInTheDocument();
    expect(screen.queryByLabelText("Name loading")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Streak loading")).toBeInTheDocument();
    expect(screen.queryByLabelText("0 day streak")).not.toBeInTheDocument();

    await waitFor(() => expect(historyRequests).toBe(1));
    resolveNextResponse(pendingHistoryResponses);

    expect(await screen.findByLabelText("0 day streak")).toBeInTheDocument();
  });

  it("shows the cached streak immediately while saved remote history revalidates", async () => {
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const pendingHistoryResponses: Array<() => void> = [];
    let historyRequests = 0;

    saveStudentName("Ada", window.localStorage);
    replaceStudentHistory("Ada", [makeDailyResult(dateKey, "Ada")], window.localStorage);

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/leaderboard")) {
          return jsonResponse({ entries: [] });
        }

        if (url.includes("/api/results")) {
          historyRequests += 1;
          return new Promise<Response>((resolve) => {
            pendingHistoryResponses.push(() => resolve(jsonResponse({ results: [] })));
          });
        }

        throw new Error(`Unhandled fetch: ${url}`);
      })
    );

    render(<DailyGame today={today} />);

    // The cached history yields a 1-day streak right away — no skeleton.
    expect(await screen.findByLabelText("1 day streak")).toBeInTheDocument();
    expect(screen.queryByLabelText("Streak loading")).not.toBeInTheDocument();

    await waitFor(() => expect(historyRequests).toBe(1));
    resolveNextResponse(pendingHistoryResponses);

    // Remote returns no history, so the streak revalidates down to zero.
    expect(await screen.findByLabelText("0 day streak")).toBeInTheDocument();
  });
});

function getButtonByText(text: RegExp): HTMLButtonElement {
  const button = screen.getByText(text).closest("button");

  if (!button) {
    throw new Error(`Could not find button with text ${text}`);
  }

  return button;
}

function finishVocabDismissal() {
  const event = new Event("animationend", { bubbles: true });
  Object.defineProperty(event, "animationName", {
    value: "bottom-sheet-slide-down"
  });
  fireEvent(screen.getByTestId("vocab-sheet"), event);
}

function createMemoryStorage(): StorageLike {
  const entries = new Map<string, string>();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key)
  };
}

function makeDailyResult(dateKey: string, studentName: string): DailyResult {
  return {
    dateKey,
    studentName,
    totalScore: 0,
    maxScore: 390,
    medal: "practice",
    completedAt: new Date().toISOString(),
    questionResults: [],
    shareText: ""
  };
}

function getWrongChoiceIds(problem: (typeof problems)[number]): string[] {
  return problem.choices
    .filter((choice) => choice.id !== problem.correctChoiceId)
    .map((choice) => choice.id);
}

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json"
    },
    status: 200
  });
}

function resolveNextResponse(pendingResponses: Array<() => void>): void {
  const resolve = pendingResponses.shift();

  if (!resolve) {
    throw new Error("No pending response to resolve.");
  }

  resolve();
}
