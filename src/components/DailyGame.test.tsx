import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DailyGame } from "@/components/DailyGame";
import { problems } from "@/data/problems";
import { getPacificDateKey } from "@/lib/date";
import { selectDailyProblems } from "@/lib/daily";
import type { StorageLike } from "@/lib/storage";

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
    value: "vocab-sheet-slide-down"
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

function getWrongChoiceIds(problem: (typeof problems)[number]): string[] {
  return problem.choices
    .filter((choice) => choice.id !== problem.correctChoiceId)
    .map((choice) => choice.id);
}
