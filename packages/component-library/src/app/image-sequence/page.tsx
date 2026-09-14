import type { Metadata } from "next";
import { ImageSequence } from "@/components/cinematic/ImageSequence";

export const metadata: Metadata = {
  title: "ImageSequence — Component Library",
  description:
    "Demo de ImageSequence: secuencia de 60 frames controlada por scroll, generada a partir de botella_fanta.glb.",
};

export default function ImageSequenceDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">ImageSequence</h1>
        <p className="text-lg">Scroll para ver la secuencia de frames ↓</p>
      </section>
      <ImageSequence
        basePath="/sequences/botella-360"
        frameCount={120}
        alt="Botella girando 360°, secuencia de 120 frames generada a partir de botella_fanta.glb"
      />
      <section className="min-h-screen" />
    </main>
  );
}
