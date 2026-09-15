"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { usePinnedScroll } from "@/lib/usePinnedScroll";

export interface VideoScrubProps {
  src: string;
  alt: string;
  pinDuration?: string | number;
  mobileBreakpoint?: number;
  staticTime?: number;
  className?: string;
}

const DEFAULT_PIN_DURATION = 2400;
const DEFAULT_MOBILE_BREAKPOINT = 768;
const DEFAULT_STATIC_TIME = 0;
// Below this, a re-seek wouldn't land on a visibly different frame
// anyway — skip it instead of thrashing the seek pipeline for it.
// Widened from an initial 0.05 after live testing showed residual
// stutter even with the coalesce-to-latest controller working
// correctly — the actual ceiling on smoothness here is the source
// video's own keyframe interval (GOP size), not request volume: each
// seek to a non-keyframe position decodes from the last keyframe
// forward, which takes real time on a densely-encoded, full-4K file.
// Fewer, slightly coarser seek requests reduces how often that
// decode chain gets triggered — this doesn't fix the ceiling, it
// just requests less against it.
const SEEK_EPSILON = 0.15;

// Coalesce-to-latest seeking: the scrub tween below can call this up to
// ~60 times/second, but each browser seek is async (decode to the
// nearest keyframe, then forward) — not instant. Queuing every value
// backs up the pipeline and shows up as stutter/lag. This keeps only
// the most recent requested time and applies it the instant the
// previous seek actually finishes, so playback always converges to
// wherever the user's scroll position currently is, never a backlog.
function createSeekController(video: HTMLVideoElement) {
  let seeking = false;
  let pending: number | null = null;

  function request(time: number) {
    if (Math.abs(video.currentTime - time) < SEEK_EPSILON) return;
    if (seeking) {
      pending = time;
      return;
    }
    seeking = true;
    video.currentTime = time;
  }

  function handleSeeked() {
    seeking = false;
    if (pending !== null) {
      const next = pending;
      pending = null;
      request(next);
    }
  }

  video.addEventListener("seeked", handleSeeked);
  return {
    request,
    destroy: () => video.removeEventListener("seeked", handleSeeked),
  };
}

export function VideoScrub({
  src,
  alt,
  pinDuration = DEFAULT_PIN_DURATION,
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  staticTime = DEFAULT_STATIC_TIME,
  className,
}: VideoScrubProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const seekControllerRef = useRef<ReturnType<typeof createSeekController> | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Seek controller's lifecycle is the video element's, not the scrub
  // tween's — it needs to keep listening across tween
  // recreations (mobile/reduced-motion toggling at runtime, a resize
  // crossing mobileBreakpoint, etc.), not be torn down and rebuilt with
  // them.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const controller = createSeekController(video);
    seekControllerRef.current = controller;
    return () => {
      controller.destroy();
      seekControllerRef.current = null;
    };
  }, []);

  // Preload gate — scrubbing can jump to any point, not just play
  // forward, so this needs every byte available before scrub starts, not
  // just "enough to play through at current rate". First version polled
  // video.buffered waiting for the browser to reach ~100% on its own —
  // wrong in practice: browsers are conservative buffering video that's
  // paused and not in active playback (confirmed live: a 40MB/15s file
  // stalled at 88% and never progressed further, so the gate never
  // opened). Fetching the whole file ourselves and handing the browser a
  // blob URL sidesteps that heuristic entirely — once assigned, every
  // byte is already local, so there's nothing left to (not) buffer.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setIsReady(false);
    let cancelled = false;
    let objectUrl: string | null = null;

    fetch(src)
      .then((res) => res.blob())
      .then((blob) => {
        if (cancelled || !video) return;
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
        video.addEventListener(
          "loadedmetadata",
          () => {
            if (!cancelled) setIsReady(true);
          },
          { once: true },
        );
      })
      .catch(() => {
        // Leaves isReady false — the static first-frame/no-video fallback
        // stands in for a failed fetch rather than a broken scrub.
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  usePinnedScroll(
    {
      triggerRef: sectionRef,
      pinDuration,
      mobileBreakpoint,
      enabled: isReady,
      extraDeps: [staticTime],
    },
    (ctx) => {
      const video = videoRef.current;
      const seekController = seekControllerRef.current;
      if (!video || !video.duration || !seekController) return null;

      // No native touch equivalent worth building for "scrub a video by
      // scrolling" (unlike HorizontalGallery's swipe), and mobile makes
      // both bandwidth (buffering the full duration over cellular) and
      // seek reliability worse — the exact problem this component exists
      // to manage carefully, just harder. Static frame instead, same as
      // reduced motion — not the pin-disabled partial-animation fallback
      // the rest of this library uses on mobile.
      if (ctx.isMobile || ctx.prefersReducedMotion) {
        video.pause();
        video.currentTime = Math.min(Math.max(staticTime, 0), video.duration);
        return null;
      }

      const state = { progress: 0 };
      return gsap.to(state, {
        progress: 1,
        ease: "none",
        onUpdate: () => seekController.request(state.progress * video.duration),
        scrollTrigger: ctx.scrollTrigger,
      });
    },
  );

  return (
    <section
      ref={sectionRef}
      className={[
        "relative flex min-h-screen items-center justify-center overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* No `src` here on purpose — set imperatively once the fetch-and-blob
          effect above resolves, so the browser never starts its own
          parallel network load of the raw URL alongside our fetch. */}
      <video
        ref={videoRef}
        data-testid="video-scrub-video"
        aria-label={alt}
        muted
        playsInline
        className="h-full w-full object-cover"
      />
    </section>
  );
}
