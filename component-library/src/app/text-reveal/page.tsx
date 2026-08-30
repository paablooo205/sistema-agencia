import type { Metadata } from "next";
import { TextReveal } from "@/components/cinematic/TextReveal";

export const metadata: Metadata = {
  title: "TextReveal — Component Library",
  description:
    "Demo de TextReveal: revelado progresivo de texto, palabra a palabra, ligado al scroll.",
};

const DEMO_TEXT =
  "Este párrafo se revela palabra a palabra a medida que haces scroll, en vez de aparecer entero de golpe. El efecto está ligado directamente a la posición de scroll, no a una animación con retardo.";

export default function TextRevealDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">TextReveal</h1>
        <p className="text-lg">Scroll para revelar el texto ↓</p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-8">
        <TextReveal
          text={DEMO_TEXT}
          className="max-w-2xl text-3xl font-medium leading-snug"
        />
      </section>
      <section className="min-h-screen" />
    </main>
  );
}
