import { render, screen } from "@testing-library/react";
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
    </div>
  )
}));

describe("RoutedDailyGame", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    navigation.searchParams = new URLSearchParams();
    navigation.push.mockReset();
    navigation.replace.mockReset();
  });

  it("supplies the destination route while Next navigation is still pending", async () => {
    const user = userEvent.setup();
    render(<RoutedDailyGame />);

    await user.click(screen.getByRole("button", { name: "Open previous quiz" }));

    expect(navigation.push).toHaveBeenCalledWith("/questions/1?date=2026-06-23");
    expect(screen.getByTestId("active-route")).toHaveTextContent(
      "/questions/1?date=2026-06-23"
    );
  });
});
