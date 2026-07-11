import { describe, expect, it } from "vitest";
import {
  DAILY_MEDAL_RULES,
  QUESTION_MEDAL_RULES,
  getMedal,
  getMedalLabel,
  getQuestionMedal
} from "@/lib/medals";

describe("medal rules", () => {
  it("keeps the daily medal thresholds in one inspectable rule set", () => {
    expect(DAILY_MEDAL_RULES).toEqual([
      { medal: "gold", minimumScore: 330 },
      { medal: "silver", minimumScore: 240 },
      { medal: "bronze", minimumScore: 150 },
      { medal: "practice", minimumScore: 0 }
    ]);
  });

  it.each([
    [390, "gold"],
    [330, "gold"],
    [329, "silver"],
    [240, "silver"],
    [239, "bronze"],
    [150, "bronze"],
    [149, "practice"]
  ] as const)("awards a %s point day a %s result", (score, medal) => {
    expect(getMedal(score)).toBe(medal);
  });

  it("keeps the per-question thresholds in the same medal rules module", () => {
    expect(QUESTION_MEDAL_RULES).toEqual([
      { medal: "gold", minimumScore: 100 },
      { medal: "silver", minimumScore: 50 },
      { medal: "bronze", minimumScore: 0 }
    ]);
    expect(getQuestionMedal(100)).toBe("gold");
    expect(getQuestionMedal(99)).toBe("silver");
    expect(getQuestionMedal(50)).toBe("silver");
    expect(getQuestionMedal(49)).toBe("bronze");
  });

  it("provides the display labels for every medal", () => {
    expect((["gold", "silver", "bronze", "practice"] as const).map(getMedalLabel)).toEqual([
      "Gold",
      "Silver",
      "Bronze",
      "Practice"
    ]);
  });
});
