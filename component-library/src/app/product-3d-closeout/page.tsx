import type { Metadata } from "next";
import { Product3DCloseout } from "@/components/cinematic/Product3DCloseout";

export const metadata: Metadata = {
  title: "Product3DCloseout — Component Library",
  description:
    "Demo de Product3DCloseout: un producto 3D crece y viaja de esquina a esquina, el fondo funde a su color, y una palabra aparece letra a letra según se hace scroll.",
};

export default function Product3DCloseoutDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Product3DCloseout</h1>
        <p className="text-lg">Scroll para ver la secuencia de cierre ↓</p>
      </section>
      <Product3DCloseout modelSrc="/models/botella_fanta.glb" />
      <section className="min-h-screen" />
    </main>
  );
}
