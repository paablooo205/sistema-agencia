import type { Metadata } from "next";
import { ParallaxImage } from "@/components/cinematic/ParallaxImage";

export const metadata: Metadata = {
  title: "ParallaxImage — Component Library",
  description:
    "Demo de ParallaxImage: imagen con profundidad/movimiento relativo al scroll.",
};

export default function ParallaxImageDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">ParallaxImage</h1>
        <p className="text-lg">Scroll para ver la profundidad ↓</p>
      </section>
      <ParallaxImage
        src="/parallax-demo.svg"
        alt="Gráfico de demostración con bandas horizontales para hacer visible el movimiento de profundidad al hacer scroll"
      />
      <section className="min-h-screen" />
    </main>
  );
}
