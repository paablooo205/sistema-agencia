"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface UsePinnedScrollContext {
  isMobile: boolean;
  prefersReducedMotion: boolean;
  scrollTrigger: ScrollTrigger.Vars;
}

export interface UsePinnedScrollOptions {
  triggerRef: RefObject<HTMLElement | null>;
  pinDuration?: string | number;
  mobileBreakpoint?: number;
  // Lets a caller delay setup past mount — e.g. ImageSequence's real gate
  // (don't create the ScrollTrigger until every frame has preloaded).
  // Defaults to true so callers with no such gate don't need to pass it.
  enabled?: boolean;
}

export type PinnedScrollHandle = gsap.core.Tween | gsap.core.Timeline | null;
export type PinnedScrollBuilder = (
  ctx: UsePinnedScrollContext,
) => PinnedScrollHandle;

const DEFAULT_MOBILE_BREAKPOINT = 768;

/**
 * Owns the part of the pin+scroll pattern that ProductReveal,
 * Product3DCloseout and ImageSequence each implement identically today:
 * the prefers-reduced-motion check, the isMobile/pinDuration/end math, the
 * ScrollTrigger `{trigger, start, end, scrub, pin}` shape, and the
 * effect/cleanup ceremony around it.
 *
 * Deliberately does NOT own what gets animated or how — the three real
 * consumers tween a DOM element, a mix of Three.js object properties plus
 * several DOM subtrees, and a plain JS number driving canvas draws,
 * respectively. `builder` is where a caller decides that; it runs inside
 * this hook's own effect and gets back `ctx` (the computed isMobile/
 * reduced-motion/scrollTrigger values) to build whatever gsap.to/fromTo/
 * timeline call fits its own target, returning it (or `null`, e.g. when
 * `ctx.prefersReducedMotion` is true and the caller sets a static state
 * instead) so this hook can clean it up.
 */
export function usePinnedScroll(
  options: UsePinnedScrollOptions,
  builder: PinnedScrollBuilder,
) {
  const {
    triggerRef,
    pinDuration,
    mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
    enabled = true,
  } = options;

  // Always-latest ref instead of putting `builder` in the effect's
  // dependency array — callers pass an inline function, which is a new
  // reference on every render, and including it would re-run (and
  // re-create/kill) the ScrollTrigger on every render for no reason.
  const builderRef = useRef(builder);
  builderRef.current = builder;

  useEffect(() => {
    if (!enabled) return;
    const trigger = triggerRef.current;
    if (!trigger) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = window.innerWidth < mobileBreakpoint;
    const resolvedPinDuration =
      isMobile && typeof pinDuration === "number"
        ? pinDuration / 2
        : pinDuration;
    const resolvedEnd =
      typeof resolvedPinDuration === "number"
        ? `+=${resolvedPinDuration}`
        : resolvedPinDuration;

    const scrollTrigger: ScrollTrigger.Vars = {
      trigger,
      start: "top top",
      end: resolvedEnd,
      scrub: 0.5,
      pin: !isMobile,
    };

    const handle = builderRef.current({
      isMobile,
      prefersReducedMotion,
      scrollTrigger,
    });

    return () => {
      handle?.scrollTrigger?.kill();
      handle?.kill();
    };
  }, [triggerRef, pinDuration, mobileBreakpoint, enabled]);
}
