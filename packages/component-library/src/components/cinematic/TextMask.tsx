"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type TextMaskDirection = "left" | "right" | "top" | "bottom";

export interface TextMaskProps {
  text: string;
  direction?: TextMaskDirection;
  className?: string;
}

const DEFAULT_DIRECTION: TextMaskDirection = "left";
// Width, in percentage points, of the soft transition band at the
// moving edge — the whole reason this component exists instead of just
// using ClipPathReveal on text. Not visually tuned yet; first guess,
// same as every other timing/shape constant in this library.
const FEATHER = 15;

const GRADIENT_ANGLE: Record<TextMaskDirection, string> = {
  left: "to right",
  right: "to left",
  top: "to bottom",
  bottom: "to top",
};

// stop: 0 (fully hidden) -> STOP_MAX (fully revealed, see below). Opaque
// region grows from the leading edge, with a FEATHER-wide soft fade at
// its trailing boundary — that fade band is a real mask-image gradient
// (continuous alpha), not clip-path's boolean geometric cut, which is
// the entire point of this component over ClipPathReveal.
//
// FIXED (was a known-and-confirmed bug, not just a caveat): an earlier
// version tweened stop only up to 100, which left the trailing FEATHER%
// permanently mid-fade even at "fully revealed" — confirmed live, the
// last letters in left/right reveals never finished appearing. Only
// three gradient stops now (no explicit trailing `transparent 100%`) —
// CSS extends the last stop's color for whatever position range remains
// beyond it, so once opaqueEnd reaches 100 the entire visible 0-100%
// area reads as solid black (fully opaque), not fading toward an
// unreachable 100%.
function maskGradient(direction: TextMaskDirection, stop: number): string {
  const opaqueEnd = Math.max(stop - FEATHER, 0);
  return `linear-gradient(${GRADIENT_ANGLE[direction]}, black 0%, black ${opaqueEnd}%, transparent ${stop}%)`;
}

export function TextMask({
  text,
  direction = DEFAULT_DIRECTION,
  className,
}: TextMaskProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // No mask ever applied via style if this is true — content stays at
    // its natural, fully-visible DOM state. Same reasoning as
    // ClipPathReveal: nothing critical depends on JS running to exist
    // in the DOM, and reduced motion gets the full content for free
    // instead of a separate "undo the mask" branch.
    if (prefersReducedMotion) return;

    function applyMask(stop: number) {
      const gradient = maskGradient(direction, stop);
      content!.style.setProperty("-webkit-mask-image", gradient);
      content!.style.setProperty("mask-image", gradient);
    }
    content.style.setProperty("-webkit-mask-repeat", "no-repeat");
    content.style.setProperty("mask-repeat", "no-repeat");
    content.style.setProperty("-webkit-mask-size", "100% 100%");
    content.style.setProperty("mask-size", "100% 100%");

    // GSAP doesn't natively interpolate mask-image gradient strings the
    // way it does clip-path/inset() — animating a plain {stop} proxy and
    // rebuilding the gradient in onUpdate is the same pattern already
    // used for ImageSequence's {frame} and VideoScrub's {progress}.
    //
    // Tweens to 100 + FEATHER, not 100 — that overshoot is what makes
    // maskGradient's fix above actually land: opaqueEnd only reaches 100
    // (fully opaque, no lingering fade) once `stop` itself reaches
    // 100 + FEATHER.
    const state = { stop: 0 };
    const tween = gsap.to(state, {
      stop: 100 + FEATHER,
      ease: "none",
      onUpdate: () => applyMask(state.stop),
      scrollTrigger: {
        trigger: section,
        start: "top 95%",
        // A bit further than ClipPathReveal's own tuned "center center"
        // — live feedback wanted slightly more time to read the reveal
        // for text specifically, without going back to the "too slow,
        // doesn't finish" overcorrection from that same tuning round.
        end: "bottom 70%",
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [direction]);

  return (
    <section
      ref={sectionRef}
      className={[
        "relative flex min-h-screen items-center justify-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 ref={contentRef} className="text-center">
        {text}
      </h2>
    </section>
  );
}
