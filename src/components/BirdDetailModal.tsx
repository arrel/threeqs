"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { birds, type Bird } from "@/data/birds";

/** Portaled outside the game card so artwork can use the entire viewport. */
export function BirdDetailModal({
  bird,
  onDismiss,
}: {
  bird: Bird;
  onDismiss(): void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    const background = Array.from(document.body.children).filter(
      (node): node is HTMLElement =>
        node instanceof HTMLElement && node !== root.current,
    );
    const previousInert = background.map((node) => node.inert);
    background.forEach((node) => {
      node.inert = true;
    });
    document.body.style.overflow = "hidden";
    close.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        dismiss.current();
      }
      if (event.key === "Tab") {
        const elements =
          root.current?.querySelectorAll<HTMLElement>("button, a[href]");
        if (!elements?.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      background.forEach((node, index) => {
        node.inert = previousInert[index];
      });
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <div
      className="bird-lightbox"
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bird-detail-title"
    >
      <header className="bird-lightbox-header">
        <span>Santa Barbara field guide</span>
        <button
          ref={close}
          type="button"
          onClick={onDismiss}
          aria-label="Close bird detail"
        >
          <X size={24} />
        </button>
      </header>
      <article className="bird-lightbox-content">
        <div className="bird-lightbox-image">
          <img
            src={`/birds/${bird.id}.webp`}
            alt={`Natural-history painting of ${bird.name}`}
            width="1200"
            height="800"
          />
        </div>
        <div className="bird-lightbox-story">
          <p className="bird-album-kicker">
            {bird.habitat} · #{String(birds.indexOf(bird) + 1).padStart(2, "0")}
          </p>
          <h1 id="bird-detail-title">{bird.name}</h1>
          <p className="bird-fact">{bird.fact}</p>
          <div className="bird-spotting">
            <strong>Out in the wild</strong>
            <p>{bird.spottingTip}</p>
          </div>
          <a
            className="bird-source"
            href={bird.source}
            target="_blank"
            rel="noreferrer"
          >
            Read more & see real photos ↗
          </a>
        </div>
      </article>
    </div>,
    document.body,
  );
}
