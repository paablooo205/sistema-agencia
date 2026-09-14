"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface ImageSequenceProps {
  basePath: string;
  frameCount: number;
  alt: string;
  frameNamePrefix?: string;
  frameExtension?: string;
  zeroPad?: number;
  pinDuration?: string | number;
  mobileBreakpoint?: number;
  staticFrameIndex?: number;
  className?: string;
}

const DEFAULT_FRAME_NAME_PREFIX = "frame-";
const DEFAULT_FRAME_EXTENSION = "png";
const DEFAULT_ZERO_PAD = 3;
// A full sequence (120 frames in this project's case) carries a lot
// more to scrub through than ProductReveal's 30° sweep (which settled
// on 500px) — a first guess, not yet visually tuned. See
// motion-recipes/image-sequence.md.
const DEFAULT_PIN_DURATION = 1200;
const DEFAULT_MOBILE_BREAKPOINT = 768;
const DEFAULT_STATIC_FRAME_INDEX = 0;

function frameUrl(
  basePath: string,
  prefix: string,
  index: number,
  pad: number,
  ext: string,
) {
  return `${basePath}/${prefix}${String(index).padStart(pad, "0")}.${ext}`;
}

function drawFrame(
  canvas: HTMLCanvasElement | null,
  img: HTMLImageElement | undefined,
) {
  if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
  if (
    canvas.width !== img.naturalWidth ||
    canvas.height !== img.naturalHeight
  ) {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
}

export function ImageSequence({
  basePath,
  frameCount,
  alt,
  frameNamePrefix = DEFAULT_FRAME_NAME_PREFIX,
  frameExtension = DEFAULT_FRAME_EXTENSION,
  zeroPad = DEFAULT_ZERO_PAD,
  pinDuration = DEFAULT_PIN_DURATION,
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  staticFrameIndex = DEFAULT_STATIC_FRAME_INDEX,
  className,
}: ImageSequenceProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  // Preload every frame once — 60 frames at this sequence's size is
  // ~1.9MB total, small enough to load upfront rather than streaming
  // frame-by-frame, which would risk scrubbing onto an unloaded frame.
  useEffect(() => {
    let cancelled = false;
    setLoadedCount(0);
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = frameUrl(basePath, frameNamePrefix, i, zeroPad, frameExtension);
      img.onload = () => {
        if (!cancelled) setLoadedCount((c) => c + 1);
      };
      images.push(img);
    }
    imagesRef.current = images;
    return () => {
      cancelled = true;
    };
  }, [basePath, frameCount, frameNamePrefix, frameExtension, zeroPad]);

  // Paint frame 0 as soon as it's available, so something is visible
  // before the rest of the sequence finishes preloading.
  useEffect(() => {
    if (loadedCount > 0) drawFrame(canvasRef.current, imagesRef.current[0]);
  }, [loadedCount]);

  useEffect(() => {
    if (loadedCount < frameCount) return;
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      const index = Math.min(Math.max(staticFrameIndex, 0), frameCount - 1);
      drawFrame(canvasRef.current, imagesRef.current[index]);
      return;
    }

    const isMobile = window.innerWidth < mobileBreakpoint;
    const resolvedPinDuration =
      isMobile && typeof pinDuration === "number"
        ? pinDuration / 2
        : pinDuration;
    const resolvedEnd =
      typeof resolvedPinDuration === "number"
        ? `+=${resolvedPinDuration}`
        : resolvedPinDuration;

    const state = { frame: 0 };
    const tween = gsap.to(state, {
      frame: frameCount - 1,
      ease: "none",
      onUpdate: () =>
        drawFrame(
          canvasRef.current,
          imagesRef.current[Math.round(state.frame)],
        ),
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: resolvedEnd,
        // Same reasoning as ProductReveal: this pins the section (on
        // desktop), and scrub: 0.5 is what avoided the pin-engage render
        // jump there. Unlike CinematicScene (no pin — scrub: 0.5 was a
        // mistake copied from here without the pin that justified it),
        // this component does pin, so the same fix applies for real.
        scrub: 0.5,
        pin: !isMobile,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [
    loadedCount,
    frameCount,
    pinDuration,
    mobileBreakpoint,
    staticFrameIndex,
  ]);

  return (
    <section
      ref={sectionRef}
      className={[
        "flex min-h-screen items-center justify-center overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className="max-h-[70vh] w-auto max-w-full"
      />
    </section>
  );
}
