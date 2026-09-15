import type { Metadata } from "next";
import { VideoScrub } from "@/components/cinematic/VideoScrub";

export const metadata: Metadata = {
  title: "VideoScrub — Component Library",
  description:
    "Demo de VideoScrub: video.currentTime controlado por el progreso de scroll (pin + coalescencia de seeks), frame estático en mobile y prefers-reduced-motion.",
};

// Vídeo local, NO comiteado al repo (ver .gitignore) — 40MB/4K, sin
// ffmpeg disponible en el entorno de build para comprimirlo, sin Git
// LFS configurado en este repo. Suministrado directamente por el
// usuario en public/; fuente y licencia sin confirmar por escrito, no
// asumidas. Cualquiera que clone el repo necesita su propio vídeo en
// esta misma ruta para que esta demo cargue algo.
const VIDEO_SRC = "/17186323-uhd_3840_2160_30fps.mp4";

export default function VideoScrubDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">VideoScrub</h1>
        <p className="max-w-md text-lg">
          Scroll para controlar el vídeo directamente por posición de scroll ↓ —
          en móvil y con &quot;prefers-reduced-motion: reduce&quot; verás un
          fotograma fijo, no el scrub.
        </p>
      </section>
      <VideoScrub
        src={VIDEO_SRC}
        alt="Vídeo de demostración de VideoScrub (asset local de prueba, no incluido en el repo)"
      />
      <section className="min-h-screen" />
    </main>
  );
}
