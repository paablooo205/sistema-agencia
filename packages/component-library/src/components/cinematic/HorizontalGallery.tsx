"use client";

import { useRef } from "react";
import gsap from "gsap";
import { usePinnedScroll } from "@/lib/usePinnedScroll";

export interface HorizontalGalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface HorizontalGalleryProps {
  images: HorizontalGalleryImage[];
  pinDuration?: string | number;
  mobileBreakpoint?: number;
  className?: string;
}

// Scrubs (images.length - 1) full viewport-widths of horizontal travel —
// more images means more distance to cover for the same pinDuration
// unless a caller retunes it. A first guess, not yet visually tuned,
// same caveat as ImageSequence's own default.
const DEFAULT_PIN_DURATION = 2000;
const DEFAULT_MOBILE_BREAKPOINT = 768;

export function HorizontalGallery({
  images,
  pinDuration = DEFAULT_PIN_DURATION,
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  className,
}: HorizontalGalleryProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);

  usePinnedScroll(
    {
      triggerRef: sectionRef,
      pinDuration,
      mobileBreakpoint,
      extraDeps: [images.length],
    },
    (ctx) => {
      const row = rowRef.current;
      if (!row) return null;

      // Mobile gets native swipe scroll instead (see the row's own
      // overflow-x-auto/snap classes below) — deliberately not the
      // pin-disabled partial-animation fallback the rest of this library
      // uses on mobile. A gallery has an actual native touch equivalent
      // the other components don't, so no tween, no transform here.
      if (ctx.isMobile) return null;

      // Reduced motion: every image stays visible via the row's own
      // md:motion-reduce:grid override below — the content itself
      // (which images exist) shouldn't disappear just because the
      // motion does. No tween, so translateX never fights that layout.
      if (ctx.prefersReducedMotion) return null;

      const distance = (images.length - 1) * window.innerWidth;
      if (distance <= 0) return null;

      return gsap.fromTo(
        row,
        { x: 0 },
        {
          x: -distance,
          ease: "none",
          scrollTrigger: ctx.scrollTrigger,
        },
      );
    },
  );

  return (
    <section ref={sectionRef} className={["overflow-hidden", className].filter(Boolean).join(" ")}>
      <div
        ref={rowRef}
        className="flex h-screen w-full snap-x snap-mandatory overflow-x-auto md:snap-none md:overflow-hidden md:motion-reduce:grid md:motion-reduce:h-auto md:motion-reduce:grid-cols-3 md:motion-reduce:gap-4 md:motion-reduce:overflow-visible md:motion-reduce:p-6"
        style={{ willChange: "transform" }}
      >
        {images.map((image, i) => (
          <figure
            key={`${image.src}-${i}`}
            className="h-screen w-screen flex-none snap-start md:motion-reduce:h-auto md:motion-reduce:w-auto md:motion-reduce:snap-align-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover md:motion-reduce:h-auto"
            />
            {image.caption && (
              <figcaption className="mt-2 px-4 text-sm opacity-70 md:motion-reduce:px-0">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
