import type { Metadata } from "next";
import { ThreeScene } from "@/components/cinematic/ThreeScene";

export const metadata: Metadata = {
  title: "ThreeScene — Component Library",
  description:
    "Demo de ThreeScene: un modelo 3D con inclinación base fija que gira 360° sobre su eje Y al hacer scroll.",
};

export default function ThreeSceneDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">ThreeScene</h1>
        <p className="text-lg">Scroll para ver el modelo girar ↓</p>
      </section>
      <ThreeScene
        modelSrc="/models/botella_fanta.glb"
        materialOverride={{ color: "#c9c9c9", metalness: 0.15, roughness: 0.45 }}
      />
      <section className="min-h-screen" />
    </main>
  );
}
