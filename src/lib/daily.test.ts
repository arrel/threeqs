import { describe, expect, it } from "vitest";
import { problems } from "@/data/problems";
import { getPacificDateKey } from "@/lib/date";
import { selectDailyProblems } from "@/lib/daily";

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
});
