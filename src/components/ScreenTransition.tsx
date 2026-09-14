"use client";

import { Component, createRef, type ReactNode } from "react";

type ScreenTransitionProps = {
  children: ReactNode;
  className?: string;
  screenKey: string;
  order: number;
};

type ScreenSnapshot = {
  content: HTMLElement;
  shouldMoveFocus: boolean;
} | null;

const SLIDE_OPTIONS: KeyframeAnimationOptions = {
  duration: 360,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)"
};

// Capture the outgoing DOM before React replaces it. A visual snapshot avoids
// mounting a second live quiz with its own timers, effects, and event handlers.
export class ScreenTransition extends Component<ScreenTransitionProps> {
  private current = createRef<HTMLDivElement>();
  private outgoing = createRef<HTMLDivElement>();
  private animations: Animation[] = [];

  getSnapshotBeforeUpdate(previous: ScreenTransitionProps): ScreenSnapshot {
    const current = this.current.current;
    if (
      previous.screenKey === this.props.screenKey ||
      !current ||
      typeof current.animate !== "function" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return null;
    }

    const content = current.cloneNode(true) as HTMLElement;
    content.style.height = `${current.offsetHeight}px`;
    content.removeAttribute("tabindex");
    // Nested transitions may still be finishing when a whole screen changes.
    content.querySelectorAll(".screen-transition-outgoing").forEach((node) => node.remove());
    content.querySelectorAll("[id], [data-testid]").forEach((node) => {
      node.removeAttribute("id");
      node.removeAttribute("data-testid");
    });

    return { content, shouldMoveFocus: current.contains(document.activeElement) };
  }

  componentDidUpdate(
    previous: ScreenTransitionProps,
    _previousState: unknown,
    snapshot: ScreenSnapshot
  ) {
    if (previous.screenKey === this.props.screenKey) {
      return;
    }

    this.clearTransition();
    const current = this.current.current;
    const outgoing = this.outgoing.current;
    if (!snapshot || !current || !outgoing) {
      return;
    }

    outgoing.append(snapshot.content);
    // Distance is always one screen, even when returning straight home.
    const direction = this.props.order < previous.order ? -1 : 1;
    const incomingAnimation = current.animate(
      [{ transform: `translateX(${direction * 100}%)` }, { transform: "translateX(0)" }],
      SLIDE_OPTIONS
    );
    const outgoingAnimation = snapshot.content.animate(
      [{ transform: "translateX(0)" }, { transform: `translateX(${direction * -100}%)` }],
      SLIDE_OPTIONS
    );
    this.animations = [incomingAnimation, outgoingAnimation];
    outgoingAnimation.onfinish = () => this.clearTransition();

    if (snapshot.shouldMoveFocus && document.activeElement === document.body) {
      current.focus({ preventScroll: true });
    }
  }

  componentWillUnmount() {
    this.clearTransition();
  }

  private clearTransition() {
    this.animations.forEach((animation) => {
      animation.onfinish = null;
      animation.cancel();
    });
    this.animations = [];
    this.outgoing.current?.replaceChildren();
  }

  render() {
    return (
      <div className={["screen-transition", this.props.className].filter(Boolean).join(" ")}>
        <div className="screen-transition-current" ref={this.current} tabIndex={-1}>
          {this.props.children}
        </div>
        <div aria-hidden="true" className="screen-transition-outgoing" inert ref={this.outgoing} />
      </div>
    );
  }
}
