import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getStudentNamePolicySourceUrl,
  isDisallowedStudentName
} from "@/lib/server/studentNamePolicy";

describe("server student name policy", () => {
  it("uses the CMU bad words source", () => {
    expect(getStudentNamePolicySourceUrl()).toBe(
      "https://www.cs.cmu.edu/~biglou/resources/bad-words.txt"
    );
  });

  it("flags standalone tokens from the bad words list", () => {
    expect(isDisallowedStudentName("sh!t")).toBe(true);
    expect(isDisallowedStudentName("Frank the butt")).toBe(true);
    expect(isDisallowedStudentName("ass frank")).toBe(true);
  });

  it("avoids substring matches inside otherwise allowed names", () => {
    expect(isDisallowedStudentName("Ada Cassie Dickinson")).toBe(false);
    expect(isDisallowedStudentName("Essex Class")).toBe(false);
    expect(isDisallowedStudentName("Button Class")).toBe(false);
    expect(isDisallowedStudentName("Sam S")).toBe(false);
  });

  it("is not imported by client-facing modules", () => {
    const clientFacingFiles = [
      "src/components/DailyGame.tsx",
      "src/lib/remoteResults.ts",
      "src/lib/storage.ts"
    ];

    for (const file of clientFacingFiles) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      expect(source).not.toContain("@/lib/server/studentNamePolicy");
    }
  });
});
