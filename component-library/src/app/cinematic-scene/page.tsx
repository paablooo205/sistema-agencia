import type { Metadata } from "next";
import { CinematicScene } from "@/components/cinematic/CinematicScene";

export const metadata: Metadata = {
  title: "CinematicScene — Component Library",
  description:
    "Demo de CinematicScene: contenedor base de escena, sin animación por defecto y con entrada fade-up opcional.",
};

export default function CinematicSceneDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">CinematicScene</h1>
        <p className="text-lg">Scroll para ver la diferencia ↓</p>
      </section>
      <CinematicScene className="bg-neutral-100 text-neutral-900">
        <p className="text-xl">
          enter=&quot;none&quot; (default) — sin animación, aparece igual que cualquier
          sección.
        </p>
      </CinematicScene>
      <CinematicScene enter="fade-up" className="bg-neutral-900 text-neutral-50">
        <p className="text-xl">
          enter=&quot;fade-up&quot; — opt-in explícito, dispara una vez al entrar en
          viewport.
        </p>
      </CinematicScene>
      <section className="min-h-screen" />
    </main>
  );
}
