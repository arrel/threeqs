import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScreenTransition } from "@/components/ScreenTransition";

type TestAnimation = { cancel: ReturnType<typeof vi.fn>; onfinish: (() => void) | null };

describe("ScreenTransition", () => {
  let animations: TestAnimation[];
  const animate = vi.fn();

  beforeEach(() => {
    animations = [];
    animate.mockReset().mockImplementation(() => {
      const animation: TestAnimation = { cancel: vi.fn(), onfinish: null };
      animations.push(animation);
      return animation;
    });
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    Object.defineProperty(HTMLElement.prototype, "animate", { configurable: true, value: animate });
  });

  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "animate");
    vi.unstubAllGlobals();
  });

  it("slides forward with an inaccessible outgoing snapshot and cleans up on completion", () => {
    const { container, rerender } = render(
      <ScreenTransition order={0} screenKey="home">
        <button id="play">Play</button>
      </ScreenTransition>
    );
    expect(animate).not.toHaveBeenCalled();
    screen.getByRole("button", { name: "Play" }).focus();

    rerender(
      <ScreenTransition order={1} screenKey="ready">
        <h1>Ready</h1>
      </ScreenTransition>
    );

    expect(animate.mock.calls.map(([frames]) => frames)).toEqual([
      [{ transform: "translateX(100%)" }, { transform: "translateX(0)" }],
      [{ transform: "translateX(0)" }, { transform: "translateX(-100%)" }]
    ]);
    expect(screen.queryByRole("button", { name: "Play" })).not.toBeInTheDocument();
    expect(container.querySelector("#play")).toBeNull();
    expect(container.querySelector("[inert]")).toHaveTextContent("Play");
    expect(document.activeElement).toContainElement(screen.getByRole("heading", { name: "Ready" }));

    animations[1].onfinish?.();
    expect(container.querySelector("[inert]")).toBeEmptyDOMElement();
    expect(animations.every((animation) => animation.cancel.mock.calls.length === 1)).toBe(true);
  });

  it("returns home from the last screen in one reverse slide", () => {
    const { rerender } = render(
      <ScreenTransition order={4} screenKey="streak">Streak</ScreenTransition>
    );
    rerender(<ScreenTransition order={0} screenKey="home">Home</ScreenTransition>);

    expect(animate.mock.calls.map(([frames]) => frames)).toEqual([
      [{ transform: "translateX(-100%)" }, { transform: "translateX(0)" }],
      [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }]
    ]);
  });

  it("does not replay slides for answer or timer updates and cancels interrupted slides", () => {
    const { container, rerender, unmount } = render(
      <ScreenTransition order={0} screenKey="question-1">Question 1</ScreenTransition>
    );
    rerender(<ScreenTransition order={1} screenKey="question-2">Question 2</ScreenTransition>);
    rerender(<ScreenTransition order={1} screenKey="question-2">Answer selected</ScreenTransition>);
    expect(animate).toHaveBeenCalledTimes(2);

    rerender(<ScreenTransition order={0} screenKey="question-1">Question 1</ScreenTransition>);
    expect(animations[0].cancel).toHaveBeenCalledOnce();
    expect(animations[1].cancel).toHaveBeenCalledOnce();
    expect(container.querySelector("[inert]")?.children).toHaveLength(1);
    expect(container.querySelector("[inert]")).toHaveTextContent("Answer selected");

    unmount();
    expect(animations[2].cancel).toHaveBeenCalledOnce();
    expect(animations[3].cancel).toHaveBeenCalledOnce();
  });

  it.each(["reduced motion", "unsupported animations"])("navigates immediately with %s", (setting) => {
    if (setting === "reduced motion") {
      vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, "animate");
    }
    const { container, rerender } = render(
      <ScreenTransition order={0} screenKey="home">Home</ScreenTransition>
    );
    rerender(<ScreenTransition order={1} screenKey="ready">Ready</ScreenTransition>);

    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
    expect(container.querySelector("[inert]")).toBeEmptyDOMElement();
    expect(animate).not.toHaveBeenCalled();
  });
});
