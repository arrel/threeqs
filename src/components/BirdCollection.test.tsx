import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BirdCollection } from "@/components/BirdCollection";
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
    fireEvent.click(screen.getByRole("button", { name: /All birds/ }));
    expect(
      screen.getByRole("button", { name: "Anna’s Hummingbird" }),
    ).toBeEnabled();
    expect(
      screen.getAllByRole("button", { name: /Undiscovered bird/ }),
    ).toHaveLength(11);
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
});
