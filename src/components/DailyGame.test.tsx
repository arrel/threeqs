import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DailyGame } from "@/components/DailyGame";
import { problems } from "@/data/problems";
import { getPacificDateKey } from "@/lib/date";
import { selectDailyProblems } from "@/lib/daily";
import type { StorageLike } from "@/lib/storage";

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
    expect(screen.getByRole("heading", { name: "Three Qs" })).toBeInTheDocument();

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

    expect(screen.getByRole("heading", { name: "Three Qs" })).toBeInTheDocument();
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

    expect(screen.getByRole("heading", { name: "Three Qs" })).toBeInTheDocument();

    await user.click(getButtonByText(/^play$/i));

    expect(screen.getByTestId(`choice-${problem.correctChoiceId}`)).toHaveClass("correct");
    expect(getButtonByText(/^next$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^check$/i)).not.toBeInTheDocument();
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
    let leaderboardRequests = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes("/api/leaderboard")) {
          const entries =
            leaderboardResponses[Math.min(leaderboardRequests, leaderboardResponses.length - 1)];
          leaderboardRequests += 1;
          return jsonResponse({ entries });
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

    expect(await screen.findByText("Ada", { selector: ".leaderboard-name" })).toBeInTheDocument();
    expect(screen.queryByText("Riley", { selector: ".leaderboard-name" })).not.toBeInTheDocument();
    expect(leaderboardRequests).toBe(2);
  });
});

function getButtonByText(text: RegExp): HTMLButtonElement {
  const button = screen.getByText(text).closest("button");

  if (!button) {
    throw new Error(`Could not find button with text ${text}`);
  }

  return button;
}

function createMemoryStorage(): StorageLike {
  const entries = new Map<string, string>();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key)
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
