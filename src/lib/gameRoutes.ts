export type GameRoute =
  | { screen: "home" }
  | { screen: "ready" }
  | { screen: "question"; questionIndex: number }
  | { screen: "results" }
  | { screen: "streak" }
  | { screen: "invalid" };

export type RouteNavigation = "push" | "replace";

export function parseGameRoutePath(pathname: string): GameRoute {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/") {
    return { screen: "home" };
  }

  if (normalizedPath === "/ready") {
    return { screen: "ready" };
  }

  const questionMatch = normalizedPath.match(/^\/questions\/([1-3])$/);
  if (questionMatch) {
    return {
      screen: "question",
      questionIndex: Number(questionMatch[1]) - 1
    };
  }

  if (normalizedPath === "/results") {
    return { screen: "results" };
  }

  if (normalizedPath === "/streak") {
    return { screen: "streak" };
  }

  return { screen: "invalid" };
}

export function getGameRoutePath(route: GameRoute): string {
  switch (route.screen) {
    case "home":
      return "/";
    case "ready":
      return "/ready";
    case "question":
      return `/questions/${route.questionIndex + 1}`;
    case "results":
      return "/results";
    case "streak":
      return "/streak";
    case "invalid":
      return "/";
  }
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}
