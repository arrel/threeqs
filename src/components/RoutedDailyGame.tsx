"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { DailyGame } from "@/components/DailyGame";
import { getGameRoutePath, parseGameRoutePath, type GameRoute, type RouteNavigation } from "@/lib/gameRoutes";

export function RoutedDailyGame() {
  const pathname = usePathname();
  const router = useRouter();
  const route = useMemo(() => parseGameRoutePath(pathname), [pathname]);

  const handleRouteChange = useCallback(
    (nextRoute: GameRoute, navigation: RouteNavigation = "push") => {
      const href = getGameRoutePath(nextRoute);

      if (href === pathname) {
        return;
      }

      if (navigation === "replace") {
        router.replace(href);
        return;
      }

      router.push(href);
    },
    [pathname, router]
  );

  return <DailyGame onRouteChange={handleRouteChange} route={route} />;
}
