"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type ClipPathRevealDirection = "left" | "right" | "top" | "bottom";

export interface ClipPathRevealProps {
  children: ReactNode;
  direction?: ClipPathRevealDirection;
  className?: string;
}

const DEFAULT_DIRECTION: ClipPathRevealDirection = "left";

const CLIP_PATHS: Record<
  ClipPathRevealDirection,
  { from: string; to: string }
> = {
  left: { from: "inset(0 100% 0 0)", to: "inset(0 0% 0 0)" },
  right: { from: "inset(0 0 0 100%)", to: "inset(0 0 0 0%)" },
  top: { from: "inset(0 0 100% 0)", to: "inset(0 0 0% 0)" },
  bottom: { from: "inset(100% 0 0 0)", to: "inset(0% 0 0 0)" },
};

export function ClipPathReveal({
  children,
  direction = DEFAULT_DIRECTION,
  className,
}: ClipPathRevealProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // No gsap.set() to hide content first, then check — the content
    // stays at its natural, fully-visible DOM state until (and unless)
    // the tween below actually runs. Matters for two reasons: reduced
    // motion shouldn't need a separate "undo the hidden state" branch,
    // and content critical for SEO/no-JS never depends on a scroll
    // animation to exist in the DOM (CLAUDE.md's own rule).
    if (prefersReducedMotion) return;

    const { from, to } = CLIP_PATHS[direction];

    // Same lesson CinematicScene already documented: trigger = the
    // outer, never-animated section; animated target = the inner
    // wrapper. Animating the trigger element itself feeds its own
    // transform back into ScrollTrigger's position calculation.
    const tween = gsap.fromTo(
      content,
      { clipPath: from },
      {
        clipPath: to,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          // Tuned three times against live feedback: "top 90%" -> "top
          // 50%" (40% of viewport height) was too fast and too narrow a
          // window to notice the reverse un-reveal scrolling back up;
          // widening to "top 95%" -> "top 15%" still finished before the
          // section reached its own centered moment; "bottom 60%"
          // overcorrected the other way, leaving it still unfinished by
          // the time a viewer had scrolled past. Landed on the actual
          // reference point a viewer judges this against — the section
          // centered in the viewport — instead of another guessed
          // percentage: "center center" completes the reveal exactly
          // when the section's center aligns with the viewport's.
          start: "top 95%",
          end: "center center",
          scrub: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [direction]);

  return (
    <section
      ref={sectionRef}
      className={["relative min-h-screen overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div ref={contentRef} className="h-full w-full">
        {children}
      </div>
    </section>
  );
}
