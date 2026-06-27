import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DailyGame } from "@/components/DailyGame";
import { problems } from "@/data/problems";
import { getPacificDateKey } from "@/lib/date";
import { selectDailyProblems } from "@/lib/daily";
import { saveStudentName, type StorageLike } from "@/lib/storage";

describe("DailyGame", () => {
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
