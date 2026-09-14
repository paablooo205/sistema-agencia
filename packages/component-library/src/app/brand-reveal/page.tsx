import type { Metadata } from "next";
import { BrandReveal } from "@/components/cinematic/BrandReveal";

export const metadata: Metadata = {
  title: "BrandReveal — Component Library",
  description:
    "Demo de BrandReveal: nombre de marca revelándose al cargar la página, sin depender de scroll.",
};

export default function BrandRevealDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-50">
        <BrandReveal
          text="Nortea"
          className="text-7xl font-semibold tracking-tight"
        />
        <p className="text-lg text-neutral-400">
          Recarga la página para ver el reveal — no depende de scroll ↻
        </p>
      </section>
    </main>
  );
}
