"use client";

import { useRef } from "react";
import gsap from "gsap";
import { usePinnedScroll } from "@/lib/usePinnedScroll";

// Metadata can't be exported from a client component — this route only
// exists to prove the hook works in isolation, so it isn't linked from
// the main index; a plain <title> below covers the tab instead.

function PinnedBox() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  usePinnedScroll({ triggerRef: sectionRef, pinDuration: 500 }, (ctx) => {
    const box = boxRef.current;
    if (!box) return null;

    if (ctx.prefersReducedMotion) {
      gsap.set(box, { rotate: 180, scale: 1.4 });
      return null;
    }

    return gsap.fromTo(
      box,
      { rotate: 0, scale: 1 },
      {
        rotate: 180,
        scale: 1.4,
        ease: "none",
        scrollTrigger: ctx.scrollTrigger,
      },
    );
  });

  return (
    <section
      ref={sectionRef}
      className="flex min-h-screen items-center justify-center overflow-hidden bg-neutral-100"
    >
      <div
        ref={boxRef}
        className="h-32 w-32 rounded-lg bg-orange-500"
        style={{ willChange: "transform" }}
      />
    </section>
  );
}

export default function PinnedScrollHookDemoPage() {
  return (
    <main>
      <title>usePinnedScroll — Component Library</title>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">usePinnedScroll</h1>
        <p className="text-lg">
          Sección construida desde cero con el hook, no un componente existente
          — scroll para pinear y ver el cuadrado rotar/escalar ↓
        </p>
      </section>
      <PinnedBox />
      <section className="min-h-screen" />
    </main>
  );
}
