"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
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

  useEffect(() => {
    const handlePopState = () => {
      const destination = parseGameRoutePath(
        window.location.pathname,
        new URLSearchParams(window.location.search).get("date")
      );

      // Let Next handle non-game pages, including the localhost review page.
      if (destination.screen === "invalid") {
        setPendingRoute(null);
        return;
      }

      // Safari restores the live page after its native history-swipe preview.
      // Show the destination before that handoff, without waiting for Next's
      // asynchronous pathname update or leaving an older pending route active.
      flushSync(() => setPendingRoute(destination));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleRouteChange = useCallback(
    (nextRoute: GameRoute, navigation: RouteNavigation = "push") => {
      const href = getGameRoutePath(nextRoute);

      if (href === window.location.pathname + window.location.search) {
        return;
      }

      // The game updates its screen immediately, while Next's pathname catches
      // up asynchronously. Keep supplying the destination route in that gap so
      // route synchronization cannot reset the game to the previous screen.
      setPendingRoute(nextRoute);

      // Advance history while the departing screen is still painted. Waiting
      // for router.push would let the quiz render its next question under the
      // old URL, so Safari could save the wrong image for its swipe-back preview.
      // Next integrates these native history calls; replace then loads the
      // destination route/metadata without adding a second history entry.
      if (navigation === "replace") {
        window.history.replaceState(null, "", href);
      } else {
        window.history.pushState(null, "", href);
      }

      router.replace(href);
    },
    [router]
  );

  if (pathname === "/review") {
    return null;
  }

  return <DailyGame onRouteChange={handleRouteChange} route={pendingRoute ?? route} />;
}
