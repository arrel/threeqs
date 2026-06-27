import { describe, expect, it } from "vitest";
import { formatElapsedSeconds } from "@/lib/time";

describe("time formatting", () => {
  it("formats elapsed seconds under a minute as seconds", () => {
    expect(formatElapsedSeconds(0)).toBe("0s");
    expect(formatElapsedSeconds(59)).toBe("59s");
  });

  it("formats elapsed seconds at a minute or longer as minutes and seconds", () => {
    expect(formatElapsedSeconds(60)).toBe("1m 0s");
    expect(formatElapsedSeconds(203)).toBe("3m 23s");
  });
});
