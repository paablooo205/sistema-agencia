import type { Metadata } from "next";
import { TextMask } from "@/components/cinematic/TextMask";

export const metadata: Metadata = {
  title: "TextMask — Component Library",
  description:
    "Demo de TextMask: revelado de texto vía máscara de gradiente (borde suave), ligado al progreso de scroll, en cuatro direcciones configurables.",
};

const DIRECTIONS = [
  { direction: "left" as const, text: "Revelado desde la izquierda" },
  { direction: "right" as const, text: "Revelado desde la derecha" },
  { direction: "top" as const, text: "Revelado desde arriba" },
  { direction: "bottom" as const, text: "Revelado desde abajo" },
];

export default function TextMaskDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">TextMask</h1>
        <p className="max-w-md text-lg">
          Scroll para revelar cada titular ↓ — borde suave con degradado, no
          un corte duro como ClipPathReveal.
        </p>
      </section>
      {DIRECTIONS.map(({ direction, text }) => (
        <TextMask
          key={direction}
          direction={direction}
          text={text}
          className="px-6 text-5xl font-semibold sm:text-6xl"
        />
      ))}
      <section className="min-h-screen" />
    </main>
  );
}
