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
// CONFIRMED FIX (not a hypothesis) — was [-15, 15]. With scrub tied
// directly to pin progress, the tween's "from" value is what's visible
// the instant the pin engages (and, before that, for the whole time the
// object is on screen but not yet pinned — gsap.fromTo renders the
// "from" state pre-scroll too). A range centered on 0 means the object
// is never shown facing forward at all; it starts already turned to one
// extreme. The spec calls for "aparición Y rotación progresiva" — the
// object should read as facing forward, then turning — so the range now
// starts at 0° instead of being centered on it. Total sweep (30°) is
// unchanged; only where it's anchored changed.
const DEFAULT_ROTATION_RANGE: [number, number] = [0, 30];
// CONFIRMED FIX (not a hypothesis) — was "+=1000". At 30° total sweep,
// 1000px works out to 0.03°/px: a single wheel notch (~100-120px) only
// covers 3-3.6°, and a normal single scroll gesture (~200-500px) only
// covers 6-15° — 20-50% of the full rotation. 1000px is also 40-55% of
// this whole demo page's entire scrollable distance for one subtle
// rotation detail, not a centerpiece. 500px halves the distance without
// making it feel instantaneous — a normal-to-generous scroll gesture now
// completes it. Kept as a plain number (not a "+=" string) so the
// mobile-halving below can divide it the same way rotationRange is
// halved; the "+=" string form only gets built at the point of use.
const DEFAULT_PIN_DURATION = 500;

/**
 * "sequence" (frame-scrubbing) is not implemented yet. The prop exists so
 * ProductReveal's public signature doesn't change when it is added later —
 * until then it falls back to "css3d" instead of throwing.
 */
function resolveProductRevealMode(mode: ProductRevealMode): "css3d" {
  if (mode === "sequence") {
    console.warn(
      '[ProductReveal] mode="sequence" is not implemented yet — falling back to "css3d".',
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
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < mobileBreakpoint;
    const [fromDeg, toDeg] = isMobile
      ? [rotationRange[0] / 2, rotationRange[1] / 2]
      : rotationRange;

    // CONFIRMED FIX (not a hypothesis) — mobile has no pin (`pin:
    // !isMobile` below), so the section scrolls past the viewport at
    // native speed instead of being held on screen. A `pinDuration` sized
    // for a *held* rotation risks the rotation still being mid-way when
    // the (unpinned, moving) section has already scrolled out of view.
    // Halving it alongside rotationRange keeps the same angular velocity
    // (degrees per px) on both — same "speed", less total rotation, and
    // the shorter distance completes comfortably inside the section's own
    // natural scroll-through window. Only applies when pinDuration is a
    // plain number (the default): a custom string like "+=800" is a
    // relative ScrollTrigger expression we can't safely halve without
    // parsing it, so a caller passing a string opts out of this
    // adjustment and gets the same value on mobile and desktop.
    const resolvedPinDuration =
      isMobile && typeof pinDuration === "number"
        ? pinDuration / 2
        : pinDuration;
    const resolvedEnd =
      typeof resolvedPinDuration === "number"
        ? `+=${resolvedPinDuration}`
        : resolvedPinDuration;

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
          end: resolvedEnd,
          scrub: 0.5,
          pin: !isMobile,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [rotationRange, pinDuration, mobileBreakpoint]);

  return (
    <section
      ref={sectionRef}
      className={[
        "flex min-h-screen items-center justify-center overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={objectRef}
        src={src}
        alt={alt}
        className="h-auto w-full max-w-sm"
        style={{ willChange: "transform", backfaceVisibility: "hidden" }}
      />
    </section>
  );
}
