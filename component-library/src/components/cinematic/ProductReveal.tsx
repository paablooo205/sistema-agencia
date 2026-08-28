"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type ProductRevealMode = "css3d" | "sequence";

export interface ProductRevealProps {
  src: string;
  alt: string;
  mode?: ProductRevealMode;
  rotationRange?: [number, number];
  pinDuration?: string | number;
  mobileBreakpoint?: number;
  className?: string;
}

const DEFAULT_MOBILE_BREAKPOINT = 768;
// Was [-15, 15]. With scrub tied directly to pin progress, the tween's
// "from" value is what's visible the instant the pin engages (and,
// before that, for the whole time the object is on screen but not yet
// pinned — gsap.fromTo renders the "from" state pre-scroll too). A range
// centered on 0 means the object is never shown facing forward at all;
// it starts already turned to one extreme. The spec calls for
// "aparición Y rotación progresiva" — the object should read as facing
// forward, then turning — so the range now starts at 0° instead of
// being centered on it. Total sweep (30°) is unchanged; only where it's
// anchored changed.
const DEFAULT_ROTATION_RANGE: [number, number] = [0, 30];
const DEFAULT_PIN_DURATION = "+=1000";

/**
 * "sequence" (frame-scrubbing) is not implemented yet. The prop exists so
 * ProductReveal's public signature doesn't change when it is added later —
 * until then it falls back to "css3d" instead of throwing.
 */
function resolveProductRevealMode(mode: ProductRevealMode): "css3d" {
  if (mode === "sequence") {
    console.warn(
      '[ProductReveal] mode="sequence" is not implemented yet — falling back to "css3d".'
    );
    return "css3d";
  }
  return mode;
}

export function ProductReveal({
  src,
  alt,
  mode = "css3d",
  rotationRange = DEFAULT_ROTATION_RANGE,
  pinDuration = DEFAULT_PIN_DURATION,
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  className,
}: ProductRevealProps) {
  resolveProductRevealMode(mode);

  const sectionRef = useRef<HTMLElement | null>(null);
  const objectRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const object = objectRef.current;
    if (!section || !object) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < mobileBreakpoint;
    const [fromDeg, toDeg] = isMobile
      ? [rotationRange[0] / 2, rotationRange[1] / 2]
      : rotationRange;

    const tween = gsap.fromTo(
      object,
      { rotateY: fromDeg },
      {
        rotateY: toDeg,
        ease: "none",
        transformPerspective: 1200,
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: typeof pinDuration === "number" ? `+=${pinDuration}` : pinDuration,
          scrub: true,
          pin: !isMobile,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [rotationRange, pinDuration, mobileBreakpoint]);

  return (
    <section
      ref={sectionRef}
      className={["flex min-h-screen items-center justify-center overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={objectRef}
        src={src}
        alt={alt}
        className="h-auto w-full max-w-sm"
        style={{ willChange: "transform" }}
      />
    </section>
  );
}
