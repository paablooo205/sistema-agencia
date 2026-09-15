import type { Metadata } from "next";
import { HorizontalGallery } from "@/components/cinematic/HorizontalGallery";

export const metadata: Metadata = {
  title: "HorizontalGallery — Component Library",
  description:
    "Demo de HorizontalGallery: fila de imágenes a pantalla completa, desplazamiento horizontal ligado al progreso vertical de scroll (pin + translateX), swipe nativo en mobile, grid estático con prefers-reduced-motion.",
};

// Placeholders de color sólido + número — no hay fotos reales todavía,
// documentado explícitamente (mismo criterio que la demo de
// ParallaxImage). Sustituir por fotografía real de cliente antes de
// reutilizar este patrón en producción.
const IMAGES = [
  {
    src: "/gallery-placeholder-1.svg",
    alt: "Placeholder de galería 1 (color terracota)",
    caption: "Placeholder 1 — sustituir por foto real",
  },
  {
    src: "/gallery-placeholder-2.svg",
    alt: "Placeholder de galería 2 (color oliva)",
    caption: "Placeholder 2 — sustituir por foto real",
  },
  {
    src: "/gallery-placeholder-3.svg",
    alt: "Placeholder de galería 3 (color azul oscuro)",
  },
  {
    src: "/gallery-placeholder-4.svg",
    alt: "Placeholder de galería 4 (color mostaza)",
    caption: "Placeholder 4 — sustituir por foto real",
  },
  {
    src: "/gallery-placeholder-5.svg",
    alt: "Placeholder de galería 5 (color verde azulado)",
  },
  {
    src: "/gallery-placeholder-6.svg",
    alt: "Placeholder de galería 6 (color ciruela)",
    caption: "Placeholder 6 — sustituir por foto real",
  },
];

export default function HorizontalGalleryDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">HorizontalGallery</h1>
        <p className="max-w-md text-lg">
          Scroll para desplazar la fila horizontalmente ↓ — en móvil, desliza
          con el dedo en vez de hacer scroll vertical. Activa
          &quot;prefers-reduced-motion: reduce&quot; en DevTools para ver el
          grid estático.
        </p>
      </section>
      <HorizontalGallery images={IMAGES} />
      <section className="min-h-screen" />
    </main>
  );
}
