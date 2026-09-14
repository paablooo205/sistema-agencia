"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);

    function syncLenisWithGsapTicker(time: number) {
      lenis.raf(time * 1000);
    }

    gsap.ticker.add(syncLenisWithGsapTicker);
    gsap.ticker.lagSmoothing(0);

    // ProductReveal (and other consumers) create their ScrollTrigger
    // pins in an effect that runs before this one (child effects fire
    // before the parent's), so their pin start/end positions get
    // calculated before Lenis is actually driving scroll. Refresh once
    // Lenis is wired up so those positions are recalculated against the
    // real scroll driver, not just the native pre-Lenis layout.
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(syncLenisWithGsapTicker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
