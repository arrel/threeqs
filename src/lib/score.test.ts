import { describe, expect, it } from "vitest";
import {
  buildShareText,
  getAttemptPoints,
  getSpeedBonus,
  scoreQuestion
} from "@/lib/score";
import { getMedal, getQuestionMedal } from "@/lib/medals";

describe("scoring", () => {
  it("awards attempt points for first and second try solves", () => {
    expect(getAttemptPoints(true, 1)).toBe(100);
    expect(getAttemptPoints(true, 2)).toBe(50);
    expect(getAttemptPoints(true, 3)).toBe(0);
    expect(getAttemptPoints(false, 2)).toBe(0);
  });

  it("awards speed bonuses only for solved questions", () => {
    expect(getSpeedBonus(true, 9.9)).toBe(30);
    expect(getSpeedBonus(true, 10)).toBe(20);
    expect(getSpeedBonus(true, 29.9)).toBe(20);
    expect(getSpeedBonus(true, 30)).toBe(10);
    expect(getSpeedBonus(true, 60)).toBe(0);
    expect(getSpeedBonus(false, 5)).toBe(0);
  });

  it("combines attempt points and speed bonuses", () => {
    const result = scoreQuestion({
      problemId: "p1",
      difficulty: "medium",
      selectedChoiceIds: ["A", "C"],
      correctChoiceId: "C",
      solved: true,
      elapsedSeconds: 24
    });

    expect(result.score).toBe(70);
    expect(result.attemptPoints).toBe(50);
    expect(result.speedBonus).toBe(20);
  });

  it("maps score thresholds to medals", () => {
    expect(getMedal(330)).toBe("gold");
    expect(getMedal(240)).toBe("silver");
    expect(getMedal(150)).toBe("bronze");
    expect(getMedal(149)).toBe("practice");
  });

  it("maps per-question scores to gold, silver, or bronze", () => {
    expect(getQuestionMedal(130)).toBe("gold");
    expect(getQuestionMedal(100)).toBe("gold");
    expect(getQuestionMedal(80)).toBe("silver");
    expect(getQuestionMedal(50)).toBe("silver");
    expect(getQuestionMedal(0)).toBe("bronze");
  });

  it("formats share text elapsed time over a minute as minutes and seconds", () => {
    expect(
      buildShareText({
        dateKey: "2026-06-24",
        studentName: "Ada",
        totalScore: 50,
        maxScore: 390,
        medal: "practice",
        completedAt: "2026-06-24T18:00:00.000Z",
        shareText: "",
        questionResults: [
          {
            problemId: "p1",
            difficulty: "medium",
            selectedChoiceIds: ["A", "C"],
            correctChoiceId: "C",
            attemptsUsed: 2,
            solved: true,
            elapsedSeconds: 203.2,
            attemptPoints: 50,
            speedBonus: 0,
            score: 50
          }
        ]
      })
    ).toContain("Q1: correct, 2 tries, 3m 23s");
  });
});
