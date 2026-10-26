import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BirdCollection, NextBirdDiscovery } from "@/components/BirdCollection";
import type { DailyResult, QuestionResult } from "@/lib/types";

const result: DailyResult = {
  dateKey: "2026-10-25",
  studentName: "Ada",
  totalScore: 0,
  maxScore: 390,
  medal: "practice",
  completedAt: "2026-10-25T18:00:00Z",
  shareText: "",
  questionResults: Array.from(
    { length: 3 },
    (_, i) => ({ problemId: `q${i}` }) as QuestionResult,
  ),
};

describe("BirdCollection", () => {
  it("opens an empty album with locked birds and no fact spoilers", () => {
    render(<BirdCollection history={[]} todayKey="2026-10-25" />);
    fireEvent.click(
      screen.getByRole("button", { name: /Santa Barbara field guide/ }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /Undiscovered bird/ }),
    ).toHaveLength(12);
    expect(
      screen.getByRole("button", { name: "Undiscovered bird 1" }),
    ).toBeDisabled();
    expect(screen.queryByText("Anna’s Hummingbird")).not.toBeInTheDocument();
  });
  it("shows the earned bird and fact, and allows returning to the album", () => {
    render(
      <BirdCollection
        history={[result]}
        todayKey="2026-10-25"
        rewardDate="2026-10-25"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Meet your bird/ }));
    expect(screen.getByText(/freeway speed/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Read more/ })).toHaveAttribute(
      "href",
      "https://abcbirds.org/birds/annas-hummingbird/",
    );
    fireEvent.click(screen.getByRole("button", { name: "Close bird detail" }));
    // Direct rewards close back to the completion screen.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("resets collection content when the parent switches player keys", () => {
    const { rerender } = render(
      <BirdCollection key="Ada" history={[result]} todayKey="2026-10-25" />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Santa Barbara field guide/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Anna’s Hummingbird" }));
    rerender(<BirdCollection key="Ben" history={[]} todayKey="2026-10-25" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("0 of 12 birds discovered")).toBeInTheDocument();
  });
  it("leads with a bird preview without granting it before quiz completion", () => {
    render(<BirdCollection prominent history={[]} todayKey="2026-10-25" />);
    expect(
      screen.getByRole("heading", { name: "A new bird, every day." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /painted preview/ }),
    ).toHaveAttribute("src", "/birds/annas-hummingbird.webp");
    expect(screen.getByText("0 of 12 birds discovered")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Preview your next bird discovery" }),
    );
    expect(
      screen.getByRole("button", { name: "Undiscovered bird 1" }),
    ).toBeDisabled();
  });

  it("celebrates today's earned bird on home and previews the next clue", () => {
    render(
      <BirdCollection prominent history={[result]} todayKey="2026-10-25" />,
    );
    expect(
      screen.getByRole("heading", { name: "Anna’s Hummingbird" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("An acorn thief dressed in blue."),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Meet Anna’s Hummingbird" }),
    );
    expect(screen.getByRole("link", { name: /Read more/ })).toBeInTheDocument();
  });

  it("shows the next unearned bird on a later day without losing progress", () => {
    render(
      <BirdCollection prominent history={[result]} todayKey="2026-10-27" />,
    );
    expect(
      screen.getByRole("img", { name: /painted preview/ }),
    ).toHaveAttribute("src", "/birds/california-scrub-jay.webp");
    expect(screen.getByText("1 of 12 birds discovered")).toBeInTheDocument();
  });
  it("keeps the preview obscured but shows earned artwork clearly", () => {
    const { rerender } = render(
      <BirdCollection prominent history={[]} todayKey="2026-10-25" />,
    );
    expect(
      screen.getByRole("button", { name: "Preview your next bird discovery" }),
    ).toHaveClass("bird-mystery");
    rerender(
      <BirdCollection prominent history={[result]} todayKey="2026-10-25" />,
    );
    expect(
      screen.getByRole("button", { name: "Meet Anna’s Hummingbird" }),
    ).not.toHaveClass("bird-mystery");
  });

  it("teases the next unearned bird and stops when the collection is complete", () => {
    const { rerender } = render(
      <NextBirdDiscovery history={[result]} todayKey="2026-10-25" />,
    );
    expect(
      screen.getByRole("heading", { name: "Tomorrow’s discovery" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/birds/california-scrub-jay.webp",
    );
    expect(screen.queryByText("California Scrub-Jay")).not.toBeInTheDocument();
    const complete = Array.from({ length: 12 }, (_, i) => ({
      ...result,
      dateKey: `2026-11-${String(i + 1).padStart(2, "0")}`,
    }));
    rerender(<NextBirdDiscovery history={complete} todayKey="2026-11-12" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/field guide is complete/)).toBeInTheDocument();
  });

  it("opens bird details outside the game card and restores focus on Escape", () => {
    render(
      <BirdCollection prominent history={[result]} todayKey="2026-10-25" />,
    );
    const trigger = screen.getByRole("button", {
      name: "Meet Anna’s Hummingbird",
    });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Anna’s Hummingbird" });
    expect(dialog.parentElement).toBe(document.body);
    expect(
      screen.getByRole("button", { name: "Close bird detail" }),
    ).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
