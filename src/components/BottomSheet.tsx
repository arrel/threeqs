"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  AnimationEvent as ReactAnimationEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode
} from "react";

// Keep in sync with the .bottom-sheet.closing animation duration in globals.css.
const SHEET_EXIT_MS = 290;
const SWIPE_DISMISS_THRESHOLD = 76;
const CLOSE_ANIMATION_NAME = "bottom-sheet-slide-down";

type BottomSheetProps = {
  open: boolean;
  title: string;
  titleId: string;
  testId: string;
  backdropTestId: string;
  closeLabel: string;
  onDismiss(): void;
  onClosed?(): void;
  children: ReactNode;
};

/**
 * A reusable bottom-sheet dialog: slides up over the card, dims the backdrop,
 * and dismisses on backdrop tap, swipe-down, Escape, or the close button. The
 * `open` prop is controlled; the sheet plays its own exit animation before it
 * unmounts and fires `onClosed`.
 */
export function BottomSheet({
  open,
  title,
  titleId,
  testId,
  backdropTestId,
  closeLabel,
  onDismiss,
  onClosed,
  children
}: BottomSheetProps) {
  const [isMounted, setIsMounted] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const swipeStartYRef = useRef<number | null>(null);
  const swipeLatestYRef = useRef<number | null>(null);

  // Translate the controlled `open` flag into the mount/closing lifecycle.
  useEffect(() => {
    if (open) {
      setIsMounted(true);
      setIsClosing(false);
      return undefined;
    }

    if (!isMounted) {
      return undefined;
    }

    setIsClosing(true);
    // Fallback in case the animationend event never lands (e.g. reduced motion).
    const timeout = window.setTimeout(finishClose, SHEET_EXIT_MS);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isMounted]);

  useEffect(() => {
    if (!isMounted) {
      return undefined;
    }

    closeButtonRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMounted, onDismiss]);

  function finishClose() {
    setIsMounted(false);
    setIsClosing(false);
    onClosed?.();
  }

  function handleBackdropPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onDismiss();
    }
  }

  function handleSheetPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== "touch") {
      return;
    }

    swipeStartYRef.current = event.clientY;
    swipeLatestYRef.current = event.clientY;
  }

  function handleSheetPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (swipeStartYRef.current === null) {
      return;
    }

    swipeLatestYRef.current = event.clientY;
  }

  function handleSheetPointerUp() {
    const swipeStartY = swipeStartYRef.current;
    const swipeLatestY = swipeLatestYRef.current;

    swipeStartYRef.current = null;
    swipeLatestYRef.current = null;

    if (swipeStartY === null || swipeLatestY === null) {
      return;
    }

    if (swipeLatestY - swipeStartY > SWIPE_DISMISS_THRESHOLD) {
      onDismiss();
    }
  }

  function handleSheetAnimationEnd(event: ReactAnimationEvent<HTMLElement>) {
    if (isClosing && event.animationName === CLOSE_ANIMATION_NAME) {
      finishClose();
    }
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={["bottom-sheet-backdrop", isClosing ? "closing" : ""].filter(Boolean).join(" ")}
      data-testid={backdropTestId}
      onPointerDown={handleBackdropPointerDown}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={["bottom-sheet", isClosing ? "closing" : ""].filter(Boolean).join(" ")}
        data-testid={testId}
        onAnimationEnd={handleSheetAnimationEnd}
        onPointerDown={handleSheetPointerDown}
        onPointerMove={handleSheetPointerMove}
        onPointerUp={handleSheetPointerUp}
        role="dialog"
      >
        <div className="bottom-sheet-grabber" aria-hidden="true" />
        <header className="bottom-sheet-header">
          <h2 className="bottom-sheet-title" id={titleId}>
            {title}
          </h2>
          <button
            aria-label={closeLabel}
            className="bottom-sheet-close-btn"
            onClick={onDismiss}
            ref={closeButtonRef}
            type="button"
          >
            <X size={22} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
