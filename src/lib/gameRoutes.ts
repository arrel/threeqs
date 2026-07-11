export type GameRoute =
  | { screen: "home" }
  | { screen: "ready"; dateKey?: string }
  | { screen: "question"; questionIndex: number; dateKey?: string }
  | { screen: "results"; dateKey?: string }
  | { screen: "streak"; dateKey?: string }
  | { screen: "invalid" };

export type RouteNavigation = "push" | "replace";

export function parseGameRoutePath(pathname: string, dateKey?: string | null): GameRoute {
  const normalizedPath = normalizePathname(pathname);
  const routeDateKey = isDateKey(dateKey) ? dateKey : undefined;

  if (normalizedPath === "/") {
    return { screen: "home" };
  }

  if (normalizedPath === "/ready") {
    return { screen: "ready", dateKey: routeDateKey };
  }

  const questionMatch = normalizedPath.match(/^\/questions\/([1-3])$/);
  if (questionMatch) {
    return {
      screen: "question",
      questionIndex: Number(questionMatch[1]) - 1,
      dateKey: routeDateKey
    };
  }

  if (normalizedPath === "/results") {
    return { screen: "results", dateKey: routeDateKey };
  }

  if (normalizedPath === "/streak") {
    return { screen: "streak", dateKey: routeDateKey };
  }

  return { screen: "invalid" };
}

export function getGameRoutePath(route: GameRoute): string {
  let pathname: string;

  switch (route.screen) {
    case "home":
      return "/";
    case "ready":
      pathname = "/ready";
      break;
    case "question":
      pathname = `/questions/${route.questionIndex + 1}`;
      break;
    case "results":
      pathname = "/results";
      break;
    case "streak":
      pathname = "/streak";
      break;
    case "invalid":
      return "/";
  }

  return route.dateKey ? `${pathname}?date=${encodeURIComponent(route.dateKey)}` : pathname;
}

function isDateKey(value?: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}
