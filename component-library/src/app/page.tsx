import Link from "next/link";

const DEMOS = [
  { href: "/product-reveal", label: "ProductReveal demo" },
  { href: "/product-3d-closeout", label: "Product3DCloseout demo" },
  { href: "/cinematic-scene", label: "CinematicScene demo" },
  { href: "/parallax-image", label: "ParallaxImage demo" },
  { href: "/text-reveal", label: "TextReveal demo" },
  { href: "/brand-reveal", label: "BrandReveal demo" },
  { href: "/image-sequence", label: "ImageSequence demo" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Component Library</h1>
      {DEMOS.map(({ href, label }) => (
        <Link key={href} href={href} className="underline">
          {label}
        </Link>
      ))}
    </main>
  );
}
