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

    return () => {
      gsap.ticker.remove(syncLenisWithGsapTicker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
