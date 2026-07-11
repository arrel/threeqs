import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DailyGame } from "@/components/DailyGame";
import { problems } from "@/data/problems";
import { getPacificDateKey } from "@/lib/date";
import { selectDailyProblems } from "@/lib/daily";
import {
  getDailyResult,
  getSavedStudentPhoto,
  replaceStudentHistory,
  saveCachedLeaderboard,
  saveStudentName,
  saveStudentPhoto,
  type StorageLike,
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
    await startFromHome(user);

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
    expect(
      screen.getByRole("heading", { name: "ThreeQs" }),
    ).toBeInTheDocument();

    rerender(<DailyGame storage={storage} today={today} />);
    await startFromHome(user);

    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();
    expect(
      screen.getByTestId(`choice-${dailyProblems[0].correctChoiceId}`),
    ).toHaveAttribute("aria-pressed", "true");
    expect(getButtonByText(/^next$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^check$/i)).not.toBeInTheDocument();

    for (const _problem of dailyProblems) {
      await user.click(getButtonByText(/^next$/i));
    }

    expect(screen.getByText(/challenge complete/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Question 1 of 3/i)).not.toBeInTheDocument();
  });

  it("saves a local result before Continue is tapped", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const dailyProblems = selectDailyProblems(problems, dateKey);

    render(<DailyGame storage={storage} today={today} />);
    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await startFromHome(user);

    for (const problem of dailyProblems) {
      await user.click(screen.getByTestId(`choice-${problem.correctChoiceId}`));
      await user.click(getButtonByText(/^check$/i));
      await user.click(getButtonByText(/^next$/i));
    }

    expect(await screen.findByText(/challenge complete/i)).toBeInTheDocument();
    expect(getDailyResult("Ada", dateKey, storage)).toMatchObject({
      dateKey,
      studentName: "Ada"
    });
  });

  it("shows the result while saving remotely and does not save again on Continue", async () => {
    const user = userEvent.setup();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const dailyProblems = selectDailyProblems(problems, dateKey);
    let postedResult: DailyResult | null = null;
    let savedResult: DailyResult | null = null;
    const remoteSave = { resolve: undefined as (() => void) | undefined };

    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes("/api/leaderboard")) {
        return jsonResponse({ entries: [] });
      }

      if (url.includes("/api/profile")) {
        return jsonResponse({ photoDataUrl: "", studentName: "Ada" });
      }

      if (url.includes("/api/results") && init?.method === "POST") {
        postedResult = JSON.parse(String(init.body)) as DailyResult;
        return new Promise<Response>((resolve) => {
          remoteSave.resolve = () => {
            savedResult = postedResult;
            resolve(jsonResponse({ accepted: true, result: postedResult }));
          };
        });
      }

      if (url.includes("/api/results")) {
        return jsonResponse({ accepted: true, results: savedResult ? [savedResult] : [] });
      }

      throw new Error(`Unhandled fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetch);

    render(<DailyGame today={today} />);
    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await startFromHome(user);

    for (const [index, problem] of dailyProblems.entries()) {
      await user.click(screen.getByTestId(`choice-${problem.correctChoiceId}`));
      await user.click(getButtonByText(/^check$/i));
      await user.click(getButtonByText(/^next$/i));

      if (index === dailyProblems.length - 1) {
        await waitFor(() => expect(remoteSave.resolve).toBeDefined());
        expect(screen.getByText(/challenge complete/i)).toBeInTheDocument();
        expect(getButtonByText(/^continue$/i)).toBeDisabled();
        expect(getDailyResult("Ada", dateKey)).toMatchObject({ dateKey, studentName: "Ada" });
        remoteSave.resolve?.();
      }
    }

    expect(await screen.findByText(/challenge complete/i)).toBeInTheDocument();
    await waitFor(() => expect(getButtonByText(/^continue$/i)).toBeEnabled());
    expect(postedResult).toMatchObject({ dateKey, studentName: "Ada" });
    expect(
      fetch.mock.calls.filter(([, init]) => init?.method === "POST")
    ).toHaveLength(1);
    expect(
      fetch.mock.calls.find(([, init]) => init?.method === "POST")?.[1]
    ).toMatchObject({ keepalive: true });

    await user.click(getButtonByText(/^continue$/i));
    expect(await screen.findByText(/current streak/i)).toBeInTheDocument();
    expect(
      fetch.mock.calls.filter(([, init]) => init?.method === "POST")
    ).toHaveLength(1);
  });

  it("shows a pencil and paper check before the first fresh question", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await user.click(getButtonByText(/^play$/i));

    expect(
      await screen.findByRole("heading", {
        name: "Do you have your pencil and paper ready?",
      }),
    ).toBeInTheDocument();
    expect(getButtonByText(/^I'm Ready$/i)).toBeInTheDocument();
    expect(getButtonByText(/^I don't like good advice$/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText("Back"));

    expect(
      screen.getByRole("heading", { name: "ThreeQs" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^continue as /i }));
    await screen.findByText(/^I don't like good advice$/i);
    await user.click(getButtonByText(/^I don't like good advice$/i));

    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();
  });

  it("uses the back button to revisit answered questions and return home from the first question", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const dailyProblems = selectDailyProblems(problems, dateKey);

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await startFromHome(user);

    await user.click(
      screen.getByTestId(`choice-${dailyProblems[0].correctChoiceId}`),
    );
    await user.click(getButtonByText(/^check$/i));
    await user.click(getButtonByText(/^next$/i));

    expect(screen.getByLabelText(/Question 2 of 3/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText("Back"));

    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();
    expect(
      screen.getByTestId(`choice-${dailyProblems[0].correctChoiceId}`),
    ).toHaveAttribute("aria-pressed", "true");
    expect(getButtonByText(/^next$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^check$/i)).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Back"));

    expect(
      screen.getByRole("heading", { name: "ThreeQs" }),
    ).toBeInTheDocument();
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
    await startFromHome(user);
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
    expect(screen.getByTestId(`choice-${problem.correctChoiceId}`)).toHaveClass(
      "correct",
    );
    expect(getButtonByText(/^next$/i)).toBeInTheDocument();
  });

  it("opens vocabulary help from underlined prompt words and the topbar help button", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-28T18:00:00Z");

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await startFromHome(user);

    const promptVocabButton =
      document.querySelector<HTMLButtonElement>("button.vocab-word");
    expect(promptVocabButton).not.toBeNull();
    await user.click(promptVocabButton as HTMLButtonElement);

    const vocabDialog = screen.getByRole("dialog", { name: /words to know/i });
    expect(vocabDialog).toBeInTheDocument();
    expect(
      within(vocabDialog).queryByText(/^Vocabulary$/i),
    ).not.toBeInTheDocument();
    expect(
      within(vocabDialog).getByText(/^Prime Factorization$/i),
    ).toBeInTheDocument();
    expect(
      within(vocabDialog).getByText(/prime numbers multiplied together/i),
    ).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByTestId("vocab-backdrop"));

    expect(screen.getByTestId("vocab-sheet")).toHaveClass("closing");
    finishVocabDismissal();

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: /words to know/i }),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/open vocabulary help/i));

    expect(
      screen.getByRole("dialog", { name: /words to know/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText(/close vocabulary help/i));

    expect(screen.getByTestId("vocab-sheet")).toHaveClass("closing");
    finishVocabDismissal();

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: /words to know/i }),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/open vocabulary help/i));

    const swipeSheet = screen.getByTestId("vocab-sheet");
    fireEvent.pointerDown(swipeSheet, { clientY: 120, pointerType: "touch" });
    fireEvent.pointerMove(swipeSheet, { clientY: 210, pointerType: "touch" });
    fireEvent.pointerUp(swipeSheet, { clientY: 210, pointerType: "touch" });

    expect(screen.getByTestId("vocab-sheet")).toHaveClass("closing");
    finishVocabDismissal();

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: /words to know/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("renders math inside vocabulary definitions", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-30T18:00:00Z");

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await startFromHome(user);
    await user.click(screen.getByLabelText(/open vocabulary help/i));

    const vocabDialog = screen.getByRole("dialog", { name: /words to know/i });

    expect(within(vocabDialog).getByText(/^Coordinate Plane$/i)).toBeInTheDocument();
    expect(vocabDialog.querySelectorAll(".vocab-term-card .katex")).toHaveLength(2);
    expect(within(vocabDialog).queryByText(/A grid with an \$x\$-axis/)).not.toBeInTheDocument();
  });

  it("shows literal dollar signs for money amounts while keeping nearby math rendered", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-29T18:00:00Z");

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await startFromHome(user);

    expect(document.body).toHaveTextContent("$12.50");
    expect(screen.getByText("$20.00")).toBeInTheDocument();
    expect(document.querySelectorAll(".quiz-prompt .katex").length).toBeGreaterThan(0);
  });

  it("raises the idle prompt after inactivity and resumes on dismiss", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");

    render(
      <DailyGame idlePromptAfterMs={250} storage={storage} today={today} />,
    );

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await startFromHome(user);
    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();

    // No interaction for the idle window: the prompt covers the question.
    const idleDialog = await screen.findByRole("dialog", {
      name: /are you still here/i,
    });
    expect(
      within(idleDialog).getByText(/timer is paused/i),
    ).toBeInTheDocument();

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
    const [firstWrongChoiceId, secondWrongChoiceId] =
      getWrongChoiceIds(problem);

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await startFromHome(user);
    await user.click(screen.getByTestId(`choice-${firstWrongChoiceId}`));
    await user.click(getButtonByText(/^check$/i));
    await user.click(getButtonByText(/^try again$/i));
    await user.click(screen.getByTestId(`choice-${secondWrongChoiceId}`));
    await user.click(getButtonByText(/^check$/i));

    expect(screen.getByText(/^not quite$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^try again$/i)).not.toBeInTheDocument();
    expect(screen.getByTestId(`choice-${firstWrongChoiceId}`)).toHaveClass(
      "wrong",
    );
    expect(screen.getByTestId(`choice-${secondWrongChoiceId}`)).toHaveClass(
      "wrong",
    );
    expect(
      screen.getByTestId(`choice-${problem.correctChoiceId}`),
    ).not.toHaveClass("correct");
  });

  it("resumes an answered first question after returning home", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const [problem] = selectDailyProblems(problems, dateKey);

    render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await startFromHome(user);
    await user.click(screen.getByTestId(`choice-${problem.correctChoiceId}`));
    await user.click(getButtonByText(/^check$/i));
    await user.click(screen.getByLabelText("Back"));

    expect(
      screen.getByRole("heading", { name: "ThreeQs" }),
    ).toBeInTheDocument();

    await startFromHome(user);

    expect(screen.getByTestId(`choice-${problem.correctChoiceId}`)).toHaveClass(
      "correct",
    );
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
    await startFromHome(user);
    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();

    // Spend 5 active seconds on the first question, then leave for home.
    clock = 6_000;
    await user.click(screen.getByLabelText("Back"));
    expect(
      screen.getByRole("heading", { name: "ThreeQs" }),
    ).toBeInTheDocument();

    // 100 seconds pass while the question is off screen — these must not count.
    clock = 106_000;
    await startFromHome(user);
    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();

    // 3 more active seconds, then answer. Recorded time should be ~8s, not ~108s.
    clock = 109_000;
    await user.click(
      screen.getByTestId(`choice-${dailyProblems[0].correctChoiceId}`),
    );
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
      />,
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
      />,
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
    await startFromHome(user);
    await user.click(
      screen.getByTestId(`choice-${firstProblem.correctChoiceId}`),
    );
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
      />,
    );

    expect(
      await screen.findByLabelText(/Question 2 of 3/i),
    ).toBeInTheDocument();
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
    await startFromHome(user);
    await user.click(
      screen.getByTestId(`choice-${firstProblem.correctChoiceId}`),
    );
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
      />,
    );

    await waitFor(() => {
      expect(routeChange).toHaveBeenCalledWith({ screen: "home" }, "replace");
    });
  });

  it("reloads the automatically saved result route without requiring Continue", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const dailyProblems = selectDailyProblems(problems, dateKey);

    const { unmount } = render(<DailyGame storage={storage} today={today} />);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    await startFromHome(user);

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
      />,
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
      [
        {
          studentName: "Riley",
          totalPoints: 210,
          gold: 0,
          silver: 1,
          bronze: 1,
        },
      ],
      [{ studentName: "Ada", totalPoints: 390, gold: 1, silver: 0, bronze: 0 }],
    ];
    const pendingLeaderboardResponses: Array<() => void> = [];
    let leaderboardRequests = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes("/api/leaderboard")) {
          const entries =
            leaderboardResponses[
              Math.min(leaderboardRequests, leaderboardResponses.length - 1)
            ];
          leaderboardRequests += 1;
          return new Promise<Response>((resolve) => {
            pendingLeaderboardResponses.push(() =>
              resolve(jsonResponse({ entries })),
            );
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
      }),
    );

    render(<DailyGame today={today} />);

    expect(screen.getByRole("button", { name: "Open leaderboard" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Leaderboard loading")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".leaderboard-skeleton-bar")).toHaveLength(0);
    expect(screen.queryByText(/top spot is yours/i)).not.toBeInTheDocument();
    await waitFor(() => expect(leaderboardRequests).toBe(1));
    resolveNextResponse(pendingLeaderboardResponses);

    await user.click(screen.getByRole("button", { name: "Open leaderboard" }));
    expect(await screen.findByText("Riley", { selector: ".leaderboard-name" })).toBeInTheDocument();
    await user.click(screen.getByLabelText("Close leaderboard"));
    finishLeaderboardDismissal();
    expect(leaderboardRequests).toBe(1);

    await user.type(screen.getByLabelText(/your name/i), "Ada");
    expect(leaderboardRequests).toBe(1);
    await startFromHome(user);

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
    await user.click(screen.getByRole("button", { name: "Open leaderboard" }));
    expect(screen.getByText("Riley", { selector: ".leaderboard-name" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Leaderboard loading")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".leaderboard-skeleton-bar")).toHaveLength(0);
    await waitFor(() => expect(leaderboardRequests).toBe(2));
    resolveNextResponse(pendingLeaderboardResponses);

    expect(
      await screen.findByText("Ada", { selector: ".leaderboard-name" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Riley", { selector: ".leaderboard-name" }),
    ).not.toBeInTheDocument();
    expect(leaderboardRequests).toBe(2);
  });

  it("keeps the cached leaderboard when the refresh returns empty", async () => {
    const today = new Date("2026-06-24T18:00:00Z");
    let leaderboardRequests = 0;

    saveCachedLeaderboard(
      [
        { studentName: "Ada", totalPoints: 280, gold: 1, silver: 0, bronze: 0 },
        { studentName: "Lin", totalPoints: 210, gold: 0, silver: 1, bronze: 0 },
      ],
      window.localStorage,
    );
    saveStudentName("Ada", window.localStorage);

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
      }),
    );

    render(<DailyGame today={today} />);

    // Cached entries paint immediately — no skeleton.
    expect(
      await screen.findByRole("button", { name: "Open leaderboard, you are #1" })
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open leaderboard, you are #1" }));
    expect(screen.getByText("Ada", { selector: ".leaderboard-name" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Leaderboard loading")).not.toBeInTheDocument();

    // The empty refresh resolves but must not blank out the leaderboard.
    await waitFor(() => expect(leaderboardRequests).toBe(1));

    expect(
      await screen.findByText("Ada", { selector: ".leaderboard-name" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Lin", { selector: ".leaderboard-name" }),
    ).toBeInTheDocument();
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
            pendingHistoryResponses.push(() =>
              resolve(jsonResponse({ results: [] })),
            );
          });
        }

        throw new Error(`Unhandled fetch: ${url}`);
      }),
    );

    render(<DailyGame today={today} />);

    expect(screen.getByText("Player")).toBeInTheDocument();
    expect(
      await screen.findByText("Ada", { selector: ".name-display-text" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue as Ada" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Name loading")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Streak loading")).toBeInTheDocument();
    expect(screen.queryByLabelText("Recent streak")).not.toBeInTheDocument();

    await waitFor(() => expect(historyRequests).toBe(1));
    resolveNextResponse(pendingHistoryResponses);

    expect(await screen.findByLabelText("Recent streak")).toBeInTheDocument();
    expect(screen.getByText("Start your streak today.")).toBeInTheDocument();
  });

  it("does not load another player's history while a switched name is still being typed", async () => {
    const user = userEvent.setup();
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
            pendingHistoryResponses.push(() =>
              resolve(jsonResponse({ results: [] })),
            );
          });
        }

        throw new Error(`Unhandled fetch: ${url}`);
      }),
    );

    render(<DailyGame today={today} />);

    await screen.findByText("Ada", { selector: ".name-display-text" });
    await waitFor(() => expect(historyRequests).toBe(1));

    await user.click(screen.getByRole("button", { name: "Switch" }));
    const switchSheet = await screen.findByRole("dialog", {
      name: "Switch Player",
    });
    await user.type(within(switchSheet).getByPlaceholderText(/new player name/i), "Lin");
    expect(historyRequests).toBe(1);

    resolveNextResponse(pendingHistoryResponses);
    await user.click(
      within(switchSheet).getByRole("button", {
        name: "Continue as Lin",
      }),
    );

    await waitFor(() => expect(historyRequests).toBe(2));
    resolveNextResponse(pendingHistoryResponses);
    expect(
      await screen.findByRole("heading", {
        name: /do you have your pencil and paper ready/i,
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByLabelText("Back"));
    expect(
      await screen.findByText("Lin", { selector: ".name-display-text" }),
    ).toBeInTheDocument();
  });

  it("shows the cached streak immediately while saved remote history revalidates", async () => {
    const today = new Date("2026-06-24T18:00:00Z");
    const dateKey = getPacificDateKey(today);
    const pendingHistoryResponses: Array<() => void> = [];
    let historyRequests = 0;

    saveStudentName("Ada", window.localStorage);
    replaceStudentHistory(
      "Ada",
      [makeDailyResult(dateKey, "Ada")],
      window.localStorage,
    );

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
            pendingHistoryResponses.push(() =>
              resolve(jsonResponse({ results: [] })),
            );
          });
        }

        throw new Error(`Unhandled fetch: ${url}`);
      }),
    );

    render(<DailyGame today={today} />);

    // The cached history yields a streak strip right away — no skeleton.
    expect(await screen.findByLabelText("Recent streak")).toBeInTheDocument();
    expect(screen.getByLabelText(/Wed practice/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Streak loading")).not.toBeInTheDocument();

    await waitFor(() => expect(historyRequests).toBe(1));
    resolveNextResponse(pendingHistoryResponses);

    // Remote returns no history, so the strip revalidates to the empty state.
    expect(await screen.findByText("Start your streak today.")).toBeInTheDocument();
  });

  it("shows the saved student's top-five leaderboard position in the top right", async () => {
    const today = new Date("2026-06-24T18:00:00Z");

    saveStudentName("Ada", window.localStorage);
    saveCachedLeaderboard(
      [
        { studentName: "Riley", totalPoints: 390, gold: 1, silver: 0, bronze: 0 },
        { studentName: "Ada", totalPoints: 280, gold: 0, silver: 1, bronze: 1 }
      ],
      window.localStorage
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/leaderboard")) {
          return jsonResponse({
            entries: [
              { studentName: "Riley", totalPoints: 390, gold: 1, silver: 0, bronze: 0 },
              { studentName: "Ada", totalPoints: 280, gold: 0, silver: 1, bronze: 1 }
            ]
          });
        }

        if (url.includes("/api/results")) {
          return jsonResponse({ results: [] });
        }

        throw new Error(`Unhandled fetch: ${url}`);
      })
    );

    render(<DailyGame today={today} />);

    expect(
      await screen.findByRole("button", { name: "Open leaderboard, you are #2" })
    ).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
  });

  it("opens and closes the leaderboard bottom sheet from the home topbar", async () => {
    const user = userEvent.setup();
    const today = new Date("2026-06-24T18:00:00Z");

    saveCachedLeaderboard(
      [{ studentName: "Riley", totalPoints: 390, gold: 1, silver: 0, bronze: 0 }],
      window.localStorage
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/api/leaderboard")) {
          return jsonResponse({
            entries: [{ studentName: "Riley", totalPoints: 390, gold: 1, silver: 0, bronze: 0 }]
          });
        }

        if (url.includes("/api/results")) {
          return jsonResponse({ results: [] });
        }

        throw new Error(`Unhandled fetch: ${url}`);
      })
    );

    render(<DailyGame today={today} />);

    await user.click(screen.getByRole("button", { name: "Open leaderboard" }));

    const sheet = await screen.findByTestId("leaderboard-sheet");
    expect(within(sheet).getByRole("heading", { name: "Leaderboard" })).toBeInTheDocument();
    expect(within(sheet).getByText("Riley", { selector: ".leaderboard-name" })).toBeInTheDocument();

    await user.click(screen.getByLabelText("Close leaderboard"));
    finishLeaderboardDismissal();

    await waitFor(() => expect(screen.queryByTestId("leaderboard-sheet")).not.toBeInTheDocument());
  });

  it("renders recent streak medals with blank gaps from the oldest active day", () => {
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");

    saveStudentName("Ada", storage);
    replaceStudentHistory(
      "Ada",
      [
        makeDailyResult("2026-06-22", "Ada", "bronze"),
        makeDailyResult("2026-06-24", "Ada", "gold")
      ],
      storage
    );

    render(<DailyGame storage={storage} today={today} />);

    expect(screen.getByLabelText("Recent streak")).toBeInTheDocument();
    expect(screen.getByLabelText("Mon bronze")).toBeInTheDocument();
    expect(screen.getByLabelText("Tue blank")).toBeInTheDocument();
    expect(screen.getByLabelText("Wed gold")).toBeInTheDocument();
    expect(screen.getByTestId("streak-spot-2026-06-22")).toBeInTheDocument();
    expect(screen.getByTestId("streak-spot-2026-06-18")).toBeInTheDocument();
  });

  it("shows the persisted medal for a completed day even if current thresholds differ", () => {
    const storage = createMemoryStorage();
    const persistedResult = {
      ...makeDailyResult("2026-06-24", "Ada", "gold"),
      totalScore: 240
    };

    saveStudentName("Ada", storage);
    replaceStudentHistory("Ada", [persistedResult], storage);
    render(<DailyGame storage={storage} today={new Date("2026-06-24T18:00:00Z")} />);

    expect(screen.getByLabelText("Wed gold")).toBeInTheDocument();
  });

  it("opens a completed previous streak day in answer review", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const previousDateKey = "2026-06-23";
    const previousProblems = selectDailyProblems(problems, previousDateKey);

    saveStudentName("Ada", storage);
    replaceStudentHistory(
      "Ada",
      [makeAnsweredDailyResult(previousDateKey, "Ada")],
      storage
    );

    render(<DailyGame storage={storage} today={today} />);
    await user.click(screen.getByTestId(`streak-spot-${previousDateKey}`));

    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByTestId(`choice-${previousProblems[0].correctChoiceId}`)).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.queryByText(/^check$/i)).not.toBeInTheDocument();
  });

  it("starts an unanswered previous streak day with that day's questions", async () => {
    const user = userEvent.setup();
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const previousDateKey = "2026-06-22";
    const [previousProblem] = selectDailyProblems(problems, previousDateKey);

    saveStudentName("Ada", storage);
    render(<DailyGame storage={storage} today={today} />);

    await user.click(screen.getByTestId(`streak-spot-${previousDateKey}`));
    expect(screen.getByText(/Challenge for Jun 22, 2026/i)).toBeInTheDocument();
    await user.click(getButtonByText(/^I'm Ready$/i));

    expect(screen.getByLabelText(/Question 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByTestId(`choice-${previousProblem.correctChoiceId}`)).toBeInTheDocument();
  });

  it("shows a saved profile photo in the player control", () => {
    const storage = createMemoryStorage();
    const photoDataUrl = "data:image/jpeg;base64,cGhvdG8=";
    saveStudentName("Ada", storage);
    saveStudentPhoto("Ada", photoDataUrl, storage);

    render(<DailyGame storage={storage} today={new Date("2026-06-24T18:00:00Z")} />);

    const photoControl = screen.getByLabelText("Change profile photo for Ada");
    expect(photoControl.querySelector("img")).toHaveAttribute("src", photoDataUrl);
    expect(getSavedStudentPhoto(storage)).toBe(photoDataUrl);
  });

  it("shows seven filled streak spots when the last seven days are complete through today", () => {
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const todayKey = getPacificDateKey(today);

    saveStudentName("Ada", storage);
    replaceStudentHistory(
      "Ada",
      Array.from({ length: 7 }, (_, index) =>
        makeDailyResult(offsetDateKey(todayKey, index - 6), "Ada", "silver")
      ),
      storage
    );

    render(<DailyGame storage={storage} today={today} />);

    expect(screen.getByLabelText("Recent streak")).toBeInTheDocument();
    expect(document.querySelectorAll(".home-streak-spot.blank")).toHaveLength(0);
    expect(document.querySelectorAll(".home-streak-spot.silver")).toHaveLength(7);
  });

  it("omits the result from seven days ago when today is blank", () => {
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");
    const todayKey = getPacificDateKey(today);

    saveStudentName("Ada", storage);
    replaceStudentHistory(
      "Ada",
      Array.from({ length: 7 }, (_, index) =>
        makeDailyResult(offsetDateKey(todayKey, index - 7), "Ada", "gold")
      ),
      storage
    );

    render(<DailyGame storage={storage} today={today} />);

    expect(screen.queryByTestId("streak-spot-2026-06-17")).not.toBeInTheDocument();
    expect(screen.getByTestId("streak-spot-2026-06-24")).toHaveClass("blank");
    expect(document.querySelectorAll(".home-streak-spot.gold")).toHaveLength(6);
  });

  it("shows seven empty streak spots and encouragement when there are no recent active days", () => {
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");

    saveStudentName("Ada", storage);
    replaceStudentHistory("Ada", [makeDailyResult("2026-06-01", "Ada", "practice")], storage);

    render(<DailyGame storage={storage} today={today} />);

    expect(screen.getByText("Start your streak today.")).toBeInTheDocument();
    expect(document.querySelectorAll(".home-streak-spot.blank")).toHaveLength(7);
  });

  it("leaves the home streak section blank before a name is saved", () => {
    const storage = createMemoryStorage();
    const today = new Date("2026-06-24T18:00:00Z");

    render(<DailyGame storage={storage} today={today} />);

    expect(screen.queryByLabelText("Recent streak")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Streak loading")).not.toBeInTheDocument();
    expect(screen.queryByText("Start your streak today.")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".home-streak-spot")).toHaveLength(0);
  });
});

function getButtonByText(text: RegExp): HTMLButtonElement {
  const button = screen.getByText(text).closest("button");

  if (!button) {
    throw new Error(`Could not find button with text ${text}`);
  }

  return button;
}

async function startFromHome(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  const startButton =
    screen.queryByRole("button", { name: /^play$/i }) ??
    screen.getByRole("button", { name: /^continue as /i });
  await user.click(startButton);

  await waitFor(() => {
    const isReady = screen.queryByText(/^I'm Ready$/i);
    const isQuestion = screen.queryByLabelText(/Question [1-3] of 3/i);
    const isScore = screen.queryByText(/challenge complete/i);

    if (!isReady && !isQuestion && !isScore) {
      throw new Error("Start did not leave the home screen.");
    }
  });

  const readyButton = screen.queryByText(/^I'm Ready$/i)?.closest("button");
  if (readyButton) {
    await user.click(readyButton);
  }
}

function finishVocabDismissal() {
  const event = new Event("animationend", { bubbles: true });
  Object.defineProperty(event, "animationName", {
    value: "bottom-sheet-slide-down",
  });
  fireEvent(screen.getByTestId("vocab-sheet"), event);
}

function finishLeaderboardDismissal() {
  const event = new Event("animationend", { bubbles: true });
  Object.defineProperty(event, "animationName", {
    value: "bottom-sheet-slide-down"
  });
  fireEvent(screen.getByTestId("leaderboard-sheet"), event);
}

function createMemoryStorage(): StorageLike {
  const entries = new Map<string, string>();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  };
}

function makeDailyResult(
  dateKey: string,
  studentName: string,
  medal: DailyResult["medal"] = "practice"
): DailyResult {
  const totalScore = {
    gold: 330,
    silver: 240,
    bronze: 150,
    practice: 0
  }[medal];

  return {
    dateKey,
    studentName,
    totalScore,
    maxScore: 390,
    medal,
    completedAt: new Date().toISOString(),
    questionResults: [],
    shareText: "",
  };
}

function makeAnsweredDailyResult(dateKey: string, studentName: string): DailyResult {
  const dailyProblems = selectDailyProblems(problems, dateKey);
  return {
    ...makeDailyResult(dateKey, studentName, "gold"),
    totalScore: 390,
    questionResults: dailyProblems.map((problem) => ({
      problemId: problem.id,
      difficulty: problem.difficulty,
      selectedChoiceIds: [problem.correctChoiceId],
      correctChoiceId: problem.correctChoiceId,
      attemptsUsed: 1,
      solved: true,
      elapsedSeconds: 5,
      attemptPoints: 100,
      speedBonus: 30,
      score: 130
    }))
  };
}

function offsetDateKey(dateKey: string, offsetDays: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function getWrongChoiceIds(problem: (typeof problems)[number]): string[] {
  return problem.choices
    .filter((choice) => choice.id !== problem.correctChoiceId)
    .map((choice) => choice.id);
}

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 200,
  });
}

function resolveNextResponse(pendingResponses: Array<() => void>): void {
  const resolve = pendingResponses.shift();

  if (!resolve) {
    throw new Error("No pending response to resolve.");
  }

  resolve();
}
