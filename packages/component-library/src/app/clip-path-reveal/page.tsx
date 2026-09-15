import type { Metadata } from "next";
import { ClipPathReveal } from "@/components/cinematic/ClipPathReveal";

export const metadata: Metadata = {
  title: "ClipPathReveal — Component Library",
  description:
    "Demo de ClipPathReveal: revelado de contenido arbitrario vía clip-path, ligado al progreso de scroll (sin pin), en cuatro direcciones configurables.",
};

// Reutiliza los placeholders de color de HorizontalGallery — sin generar
// assets nuevos.
const DIRECTIONS = [
  {
    direction: "left" as const,
    src: "/gallery-placeholder-1.svg",
    label: "left",
  },
  {
    direction: "right" as const,
    src: "/gallery-placeholder-2.svg",
    label: "right",
  },
  {
    direction: "top" as const,
    src: "/gallery-placeholder-3.svg",
    label: "top",
  },
  {
    direction: "bottom" as const,
    src: "/gallery-placeholder-4.svg",
    label: "bottom",
  },
];

export default function ClipPathRevealDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">ClipPathReveal</h1>
        <p className="max-w-md text-lg">
          Scroll para revelar cada sección ↓ — cuatro direcciones distintas, una
          por sección, para comparar.
        </p>
      </section>
      {DIRECTIONS.map(({ direction, src, label }) => (
        <ClipPathReveal key={direction} direction={direction}>
          <div className="relative flex h-screen items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Placeholder de ClipPathReveal, dirección "${label}"`}
              className="h-full w-full object-cover"
            />
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded bg-black/70 px-3 py-1 font-mono text-sm text-white">
              direction=&quot;{label}&quot;
            </p>
          </div>
        </ClipPathReveal>
      ))}
      <section className="min-h-screen" />
    </main>
  );
}
