"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number;
  mobileBreakpoint?: number;
  className?: string;
}

const DEFAULT_SPEED = 0.6;
const DEFAULT_MOBILE_BREAKPOINT = 768;
// Halved, not disabled — unlike a pinned section, an un-pinned parallax
// image doesn't "stick" the page on mobile, so there's no UX reason to
// turn it off outright. See motion-recipes/parallax.md.
const MOBILE_SPEED_FACTOR = 0.5;

export function ParallaxImage({
  src,
  alt,
  speed = DEFAULT_SPEED,
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  className,
}: ParallaxImageProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    const isMobile = window.innerWidth < mobileBreakpoint;
    const resolvedSpeed = isMobile ? speed * MOBILE_SPEED_FACTOR : speed;

    // Peak-to-peak vertical travel, as a fraction (`speed`) of the
    // section's own rendered height. The image is sized exactly this much
    // taller than its section (split top/bottom) so the translate never
    // reveals the section's background behind it, at any speed value.
    const travel = section.offsetHeight * resolvedSpeed;
    img.style.top = `-${travel / 2}px`;
    img.style.height = `calc(100% + ${travel}px)`;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const tween = gsap.fromTo(
      img,
      { y: -travel / 2 },
      {
        y: travel / 2,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [speed, mobileBreakpoint]);

  return (
    <section
      ref={sectionRef}
      className={["relative min-h-screen overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      />
    </section>
  );
}
