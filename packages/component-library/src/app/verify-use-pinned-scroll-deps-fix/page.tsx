"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { usePinnedScroll } from "@/lib/usePinnedScroll";

// Real test case for the 2026-09-15 extraDeps fix (see
// docs/superpowers/decisions/2026-09-15-use-pinned-scroll-deps-array-bug.md).
// `targetRotation` is neither pinDuration nor mobileBreakpoint — it's
// exactly the class of prop that used to NOT retrigger the hook's effect.
// Clicking the button changes it on this already-mounted instance. If the
// fix works, the on-page "builder ran" counter increments and the box's
// rotation target updates WITHOUT touching pinDuration.

function PinnedBox({ targetRotation }: { targetRotation: number }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [runCount, setRunCount] = useState(0);

  usePinnedScroll(
    {
      triggerRef: sectionRef,
      pinDuration: 500,
      extraDeps: [targetRotation],
    },
    (ctx) => {
      // Runs once per mount, then again every time targetRotation changes
      // — that's the fix. Without extraDeps this would only run once,
      // ever, since pinDuration/mobileBreakpoint never change here.
      setRunCount((c) => c + 1);

      const box = boxRef.current;
      if (!box) return null;

      if (ctx.prefersReducedMotion) {
        gsap.set(box, { rotate: targetRotation });
        return null;
      }

      return gsap.fromTo(
        box,
        { rotate: 0 },
        {
          rotate: targetRotation,
          ease: "none",
          scrollTrigger: ctx.scrollTrigger,
        },
      );
    },
  );

  return (
    <section
      ref={sectionRef}
      className="flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-neutral-100"
    >
      <p className="text-sm" data-testid="run-count">
        Builder ejecutado: <strong>{runCount}</strong> {runCount === 1 ? "vez" : "veces"}
        {" — "}targetRotation actual: <strong>{targetRotation}°</strong>
      </p>
      <div
        ref={boxRef}
        className="h-32 w-32 rounded-lg bg-orange-500"
        style={{ willChange: "transform" }}
      />
    </section>
  );
}

export default function VerifyUsePinnedScrollDepsFixPage() {
  const [targetRotation, setTargetRotation] = useState(90);

  return (
    <main>
      <title>Verify usePinnedScroll extraDeps fix</title>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">
          usePinnedScroll — verificación del fix de extraDeps
        </h1>
        <p className="max-w-md text-lg">
          El cuadrado de abajo ya está montado. Cambia el ángulo objetivo
          SIN recargar la página ni tocar pinDuration — si el contador
          &quot;Builder ejecutado&quot; sube, el fix funciona.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTargetRotation((r) => r + 45)}
            className="rounded bg-neutral-900 px-4 py-2 text-white"
          >
            targetRotation += 45°
          </button>
          <button
            type="button"
            onClick={() => setTargetRotation(90)}
            className="rounded border border-neutral-900 px-4 py-2"
          >
            reset a 90°
          </button>
        </div>
        <p className="text-sm opacity-60">Scroll para pinear ↓</p>
      </section>
      <PinnedBox targetRotation={targetRotation} />
      <section className="min-h-screen" />
    </main>
  );
}
