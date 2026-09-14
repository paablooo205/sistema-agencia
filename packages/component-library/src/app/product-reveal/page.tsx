import type { Metadata } from "next";
import { ProductReveal } from "@/components/cinematic/ProductReveal";

export const metadata: Metadata = {
  title: "ProductReveal — Component Library",
  description:
    "Demo de ProductReveal: un producto que rota al hacer scroll, pineado con GSAP ScrollTrigger.",
};

export default function ProductRevealDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">ProductReveal</h1>
        <p className="text-lg">Scroll para ver el producto rotar ↓</p>
      </section>
      <ProductReveal
        src="/product-demo.svg"
        alt="Producto de demostración girando durante el scroll"
      />
      <section className="min-h-screen" />
    </main>
  );
}
