"use client";

import { createElement, useEffect, useRef, type ElementType } from "react";
import gsap from "gsap";

export type BrandRevealTag = "h1" | "h2" | "div";

export interface BrandRevealProps {
  text: string;
  as?: BrandRevealTag;
  className?: string;
}

const DURATION = 1.1;
// Deliberate deceleration, no bounce — a bounce/elastic ease would read
// as playful, which contradicts "tueste de precisión" (precision, not
// warmth-via-whimsy). See motion-recipes/brand-mark-reveal.md.
const EASE = "expo.out";

export function BrandReveal({ text, as = "h1", className }: BrandRevealProps) {
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // One-shot, no ScrollTrigger — this is a load-time brand moment, not
    // a scroll-linked reveal (unlike every other reveal in this library).
    // clip-path wipe + a closing letter-spacing read as an instrument
    // calibrating into focus, distinct from a generic fade/scale-in.
    gsap.set(el, { clipPath: "inset(0 100% 0 0)", letterSpacing: "0.02em" });
    const tween = gsap.to(el, {
      clipPath: "inset(0 0% 0 0)",
      letterSpacing: "0em",
      duration: DURATION,
      ease: EASE,
    });

    return () => {
      tween.kill();
    };
  }, []);

  return createElement(as as ElementType, { ref: elRef, className }, text);
}
