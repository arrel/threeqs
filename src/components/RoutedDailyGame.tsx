"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DailyGame } from "@/components/DailyGame";
import { getGameRoutePath, parseGameRoutePath, type GameRoute, type RouteNavigation } from "@/lib/gameRoutes";

export function RoutedDailyGame() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateKey = searchParams.get("date");
  const route = useMemo(() => parseGameRoutePath(pathname, dateKey), [dateKey, pathname]);
  const currentHref = dateKey ? `${pathname}?date=${encodeURIComponent(dateKey)}` : pathname;
  const [pendingRoute, setPendingRoute] = useState<GameRoute | null>(null);

  useEffect(() => {
    if (pendingRoute && getGameRoutePath(pendingRoute) === currentHref) {
      setPendingRoute(null);
    }
  }, [currentHref, pendingRoute]);

  const handleRouteChange = useCallback(
    (nextRoute: GameRoute, navigation: RouteNavigation = "push") => {
      const href = getGameRoutePath(nextRoute);

      if (href === currentHref) {
        return;
      }

      // The game updates its screen immediately, while Next's pathname catches
      // up asynchronously. Keep supplying the destination route in that gap so
      // route synchronization cannot reset the game to the previous screen.
      setPendingRoute(nextRoute);

      if (navigation === "replace") {
        router.replace(href);
        return;
      }

      router.push(href);
    },
    [currentHref, router]
  );

  return <DailyGame onRouteChange={handleRouteChange} route={pendingRoute ?? route} />;
}
