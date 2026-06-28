import { describe, expect, it } from "vitest";
import { problems } from "@/data/problems";
import { getPacificDateKey } from "@/lib/date";
import { selectDailyProblems } from "@/lib/daily";
import type { Difficulty, Problem } from "@/lib/types";

describe("daily problem selection", () => {
  it("uses the Pacific date for the daily key", () => {
    expect(getPacificDateKey(new Date("2026-06-24T06:30:00Z"))).toBe("2026-06-23");
    expect(getPacificDateKey(new Date("2026-06-24T18:30:00Z"))).toBe("2026-06-24");
  });

  it("selects one problem per target difficulty", () => {
    const selected = selectDailyProblems(problems, "2026-06-24");

    expect(selected).toHaveLength(3);
    expect(selected.map((problem) => problem.difficulty)).toEqual(["easy", "medium", "stretch"]);
  });

  it("is deterministic for the same date", () => {
    const first = selectDailyProblems(problems, "2026-06-24").map((problem) => problem.id);
    const second = selectDailyProblems(problems, "2026-06-24").map((problem) => problem.id);

    expect(second).toEqual(first);
  });

  it("keeps the schedule start aligned with the existing daily questions", () => {
    expect(selectDailyProblems(problems, "2026-06-28").map((problem) => problem.id)).toEqual([
      "easy-prime-factorization-90",
      "medium-gcf-bins",
      "stretch-exponent-simplify"
    ]);
  });

  it("uses explicitly scheduled problems without depending on array order", () => {
    const expandedProblems = [
      makeProblem("new-future-easy", "easy", "2026-07-10"),
      makeProblem("new-future-medium", "medium", "2026-07-10"),
      makeProblem("new-future-stretch", "stretch", "2026-07-10"),
      ...problems
    ];

    expect(selectDailyProblems(expandedProblems, "2026-06-28").map((problem) => problem.id)).toEqual([
      "easy-prime-factorization-90",
      "medium-gcf-bins",
      "stretch-exponent-simplify"
    ]);
  });

  it("uses new explicitly scheduled problems on their assigned date", () => {
    const expandedProblems = [
      ...problems,
      makeProblem("new-future-easy", "easy", "2026-07-10"),
      makeProblem("new-future-medium", "medium", "2026-07-10"),
      makeProblem("new-future-stretch", "stretch", "2026-07-10")
    ];

    expect(selectDailyProblems(expandedProblems, "2026-07-10").map((problem) => problem.id)).toEqual([
      "new-future-easy",
      "new-future-medium",
      "new-future-stretch"
    ]);
  });

  it("loops from the schedule start when a date has no assigned problems", () => {
    expect(selectDailyProblems(problems, "2026-07-04").map((problem) => problem.id)).toEqual([
      "easy-prime-factorization-90",
      "medium-gcf-bins",
      "stretch-exponent-simplify"
    ]);
  });

  it("does not let future scheduled problems perturb an unassigned date", () => {
    const expandedProblems = [
      ...problems,
      makeProblem("new-future-easy", "easy", "2026-07-10"),
      makeProblem("new-future-medium", "medium", "2026-07-10"),
      makeProblem("new-future-stretch", "stretch", "2026-07-10")
    ];

    expect(selectDailyProblems(expandedProblems, "2026-07-04").map((problem) => problem.id)).toEqual(
      selectDailyProblems(problems, "2026-07-04").map((problem) => problem.id)
    );
  });
});

function makeProblem(id: string, difficulty: Difficulty, scheduledDate: string): Problem {
  return {
    id,
    scheduledDate,
    prompt: `${id} prompt`,
    choices: [
      { id: "A", label: "A" },
      { id: "B", label: "B" }
    ],
    correctChoiceId: "A",
    explanation: `${id} explanation`,
    difficulty,
    topics: [],
    gradeBand: "6",
    source: { name: "Test source" },
    adapted: true
  };
}
