import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Component Library</h1>
      <Link href="/product-reveal" className="underline">
        ProductReveal demo
      </Link>
    </main>
  );
}
