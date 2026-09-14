"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type CinematicSceneTag = "section" | "article" | "div";
export type CinematicSceneEnter = "none" | "fade-up";

export interface CinematicSceneProps {
  children: ReactNode;
  as?: CinematicSceneTag;
  minHeight?: string;
  enter?: CinematicSceneEnter;
  className?: string;
}

const DEFAULT_MIN_HEIGHT = "100vh";
const DEFAULT_ENTER: CinematicSceneEnter = "none";

export function CinematicScene({
  children,
  as = "section",
  minHeight = DEFAULT_MIN_HEIGHT,
  enter = DEFAULT_ENTER,
  className,
}: CinematicSceneProps) {
  const sceneRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const content = contentRef.current;
    // `enter` defaults to "none" — CLAUDE.md's anti-slop rules call out
    // generic fade-ins repeated on every section as something to avoid by
    // default. This scene never animates unless a caller opts in.
    if (!scene || !content || enter === "none") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // The animated element is a separate inner wrapper, never `scene`
    // itself — `scene` is only ever read from, as the stable
    // ScrollTrigger `trigger`. An earlier version animated `scene`
    // directly while also using it as its own trigger: since `y`
    // is a transform and ScrollTrigger measures the trigger's position
    // via getBoundingClientRect() (which reflects active transforms),
    // that created a feedback loop between "how revealed the section is"
    // and "where its own start/end scroll positions are calculated to
    // be" — the animation never visibly progressed. ParallaxImage and
    // TextReveal already avoid this (trigger = outer section, animated
    // target = inner img/words); this mirrors that.
    const tween = gsap.fromTo(
      content,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: scene,
          start: "top 90%",
          end: "top 50%",
          scrub: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [enter]);

  // createElement instead of JSX for the dynamic tag: JSX tries to
  // intersect prop/ref types across every member of the "section" |
  // "article" | "div" union (each wants a differently-typed HTMLElement
  // subclass ref), which collapses children/style/etc. to `never`.
  // createElement's typing doesn't do that narrowing.
  return createElement(
    as,
    {
      ref: sceneRef,
      className: ["flex items-center justify-center", className]
        .filter(Boolean)
        .join(" "),
      style: { minHeight },
    },
    createElement("div", { ref: contentRef }, children)
  );
}
