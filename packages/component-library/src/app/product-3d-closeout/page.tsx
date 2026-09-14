import type { Metadata } from "next";
import { Product3DCloseout } from "@/components/cinematic/Product3DCloseout";

export const metadata: Metadata = {
  title: "Product3DCloseout — Component Library",
  description:
    "Demo de Product3DCloseout: un producto 3D crece y viaja a una esquina, el fondo funde a su color, una palabra aparece letra a letra, y un footer entra desde los bordes.",
};

// Todo el contenido de abajo (nav, redes, contacto, copyright) es
// placeholder para la demo — component-library no lleva copy de cliente.
export default function Product3DCloseoutDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Product3DCloseout</h1>
        <p className="text-lg">Scroll para ver la secuencia de cierre ↓</p>
      </section>
      <Product3DCloseout
        modelSrc="/models/botella_fanta.glb"
        backgroundTintColor="#16A34A"
        footerNavLinks={[
          { label: "Productos", href: "#" },
          { label: "Historia", href: "#" },
          { label: "Contacto", href: "#" },
        ]}
        footerSocialLinks={[
          { label: "Instagram", href: "#" },
          { label: "X / Twitter", href: "#" },
          { label: "TikTok", href: "#" },
        ]}
        footerContactLines={["hola@ejemplo.com", "+34 900 000 000"]}
        footerCopyright="© 2026 Nombre de marca — contenido de ejemplo, no final"
      />
    </main>
  );
}
