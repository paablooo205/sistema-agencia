"use client";

import { createElement, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type TextRevealTag = "p" | "h2" | "h3" | "div";

export interface TextRevealProps {
  text: string;
  as?: TextRevealTag;
  mobileBreakpoint?: number;
  className?: string;
  wordClassName?: string;
}

const DEFAULT_MOBILE_BREAKPOINT = 768;

export function TextReveal({
  text,
  as: Tag = "p",
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  className,
  wordClassName,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  // Split once per `text` change, in render (not in an effect) — the real
  // words stay in the server-rendered HTML as actual text nodes, so
  // crawlers and no-JS visitors see the full content, not just whatever
  // GSAP builds client-side. See CLAUDE.md's SEO rule against content that
  // only exists after a scroll animation runs.
  const words = useMemo(() => text.split(" "), [text]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wordEls =
      container.querySelectorAll<HTMLElement>("[data-reveal-word]");
    if (wordEls.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < mobileBreakpoint;

    gsap.set(wordEls, { opacity: 0.15, y: 12 });
    const tween = gsap.to(wordEls, {
      opacity: 1,
      y: 0,
      ease: "none",
      stagger: 1 / wordEls.length,
      scrollTrigger: {
        trigger: container,
        start: "top 85%",
        // Shorter completion distance on mobile: viewport scroll distance
        // per pixel of content differs enough from desktop that the same
        // "top 20%" end would either finish too early or drag on relative
        // to how much of the paragraph is still on screen.
        end: isMobile ? "top 35%" : "top 20%",
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [mobileBreakpoint, words]);

  // createElement instead of JSX for the dynamic tag — see the same note
  // in CinematicScene.tsx.
  return createElement(
    Tag,
    { ref: containerRef, className },
    words.map((word, i) =>
      createElement(
        "span",
        { key: i, "data-reveal-word": true, className: wordClassName },
        word,
        i < words.length - 1 ? " " : "",
      ),
    ),
  );
}
