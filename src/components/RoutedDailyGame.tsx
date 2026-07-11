"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { DailyGame } from "@/components/DailyGame";
import { getGameRoutePath, parseGameRoutePath, type GameRoute, type RouteNavigation } from "@/lib/gameRoutes";

export function RoutedDailyGame() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateKey = searchParams.get("date");
  const route = useMemo(() => parseGameRoutePath(pathname, dateKey), [dateKey, pathname]);

  const handleRouteChange = useCallback(
    (nextRoute: GameRoute, navigation: RouteNavigation = "push") => {
      const href = getGameRoutePath(nextRoute);

      const currentHref = dateKey ? `${pathname}?date=${encodeURIComponent(dateKey)}` : pathname;
      if (href === currentHref) {
        return;
      }

      if (navigation === "replace") {
        router.replace(href);
        return;
      }

      router.push(href);
    },
    [dateKey, pathname, router]
  );

  return <DailyGame onRouteChange={handleRouteChange} route={route} />;
}
