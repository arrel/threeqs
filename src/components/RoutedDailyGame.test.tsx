import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoutedDailyGame } from "@/components/RoutedDailyGame";
import { getGameRoutePath, type GameRoute, type RouteNavigation } from "@/lib/gameRoutes";

const navigation = vi.hoisted(() => ({
  pathname: "/",
  push: vi.fn(),
  replace: vi.fn(),
  searchParams: new URLSearchParams()
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
  useSearchParams: () => navigation.searchParams
}));

vi.mock("@/components/DailyGame", () => ({
  DailyGame: ({
    onRouteChange,
    route
  }: {
    onRouteChange(route: GameRoute, navigation?: RouteNavigation): void;
    route: GameRoute;
  }) => (
    <div>
      <span data-testid="active-route">{getGameRoutePath(route)}</span>
      <button
        onClick={() =>
          onRouteChange({
            screen: "question",
            questionIndex: 0,
            dateKey: "2026-06-23"
          })
        }
        type="button"
      >
        Open previous quiz
      </button>
      <button onClick={() => onRouteChange({ screen: "home" }, "replace")} type="button">
        Replace with home
      </button>
    </div>
  )
}));

describe("RoutedDailyGame", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    navigation.pathname = "/";
    navigation.searchParams = new URLSearchParams();
    navigation.push.mockReset();
    navigation.replace.mockReset();
  });

  it("updates browser history and the game before Next navigation finishes", async () => {
    const user = userEvent.setup();
    const originalHistoryLength = window.history.length;
    navigation.replace.mockImplementation(() => {
      expect(window.location.pathname + window.location.search).toBe("/questions/1?date=2026-06-23");
      // The history entry is created while the departing screen is still in the DOM.
      expect(screen.getByTestId("active-route").textContent).toBe("/");
    });
    render(<RoutedDailyGame />);

    await user.click(screen.getByRole("button", { name: "Open previous quiz" }));

    expect(window.location.pathname + window.location.search).toBe("/questions/1?date=2026-06-23");
    expect(navigation.replace).toHaveBeenCalledWith("/questions/1?date=2026-06-23");
    expect(navigation.push).not.toHaveBeenCalled();
    expect(window.history.length).toBe(originalHistoryLength + 1);
    expect(screen.getByTestId("active-route")).toHaveTextContent(
      "/questions/1?date=2026-06-23"
    );

    // Repeating a destination before Next catches up must not add another entry.
    await user.click(screen.getByRole("button", { name: "Open previous quiz" }));
    expect(window.history.length).toBe(originalHistoryLength + 1);
    expect(navigation.replace).toHaveBeenCalledTimes(1);
  });

  it("replaces redirect history entries instead of pushing new ones", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/questions/1?date=2026-06-23");
    navigation.pathname = "/questions/1";
    navigation.searchParams = new URLSearchParams("date=2026-06-23");
    const originalHistoryLength = window.history.length;
    render(<RoutedDailyGame />);

    await user.click(screen.getByRole("button", { name: "Replace with home" }));

    expect(window.location.pathname + window.location.search).toBe("/");
    expect(window.history.length).toBe(originalHistoryLength);
    expect(screen.getByTestId("active-route").textContent).toBe("/");
    expect(navigation.replace).toHaveBeenCalledWith("/");
    expect(navigation.push).not.toHaveBeenCalled();
  });

  it("restores browser Back and Forward immediately while Next's pathname is stale", () => {
    navigation.pathname = "/questions/2";
    navigation.searchParams = new URLSearchParams("date=2026-06-23");
    const { rerender } = render(<RoutedDailyGame />);

    for (const href of ["/questions/1?date=2026-06-23", "/", "/questions/2?date=2026-06-23"]) {
      act(() => {
        window.history.replaceState(null, "", href);
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
      expect(screen.getByTestId("active-route").textContent).toBe(href);
    }

    navigation.pathname = "/questions/2";
    rerender(<RoutedDailyGame />);
    expect(screen.getByTestId("active-route")).toHaveTextContent("/questions/2?date=2026-06-23");
    expect(navigation.push).not.toHaveBeenCalled();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("lets browser Back override an unfinished in-game navigation", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<RoutedDailyGame />);
    await user.click(screen.getByRole("button", { name: "Open previous quiz" }));

    act(() => {
      window.history.replaceState(null, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(screen.getByTestId("active-route").textContent).toBe("/");

    rerender(<RoutedDailyGame />);
    expect(screen.getByTestId("active-route").textContent).toBe("/");
    // Traversing history must not create another entry or redirect.
    expect(navigation.replace).toHaveBeenCalledTimes(1);
    expect(navigation.push).not.toHaveBeenCalled();
  });
});
