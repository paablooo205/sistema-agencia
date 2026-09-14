import type { Metadata } from "next";
import { Footer } from "@/components/cinematic/Footer";

export const metadata: Metadata = {
  title: "Footer — Component Library",
  description:
    "Demo de Footer: índice editorial configurable por props, con wordmark de marca gigante en dos tratamientos (ghost/solid) y sin animación por defecto.",
};

const NAV_COLUMNS = [
  {
    title: "Sitio",
    links: [
      { label: "Inicio", href: "#" },
      { label: "Producto", href: "#" },
      { label: "Historia", href: "#" },
      { label: "Contacto", href: "#" },
    ],
  },
  {
    title: "Producto",
    links: [
      { label: "Catálogo", href: "#" },
      { label: "Origen", href: "#" },
      { label: "Sostenibilidad", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", href: "#" },
      { label: "Términos", href: "#" },
    ],
  },
];

const CONTACT_PEOPLE = [
  {
    name: "Marta Solís",
    role: "Ventas",
    phone: "+34 600 000 000",
    email: "marta@ejemplo.com",
  },
  {
    name: "Iker Zabala",
    role: "Prensa",
    email: "prensa@ejemplo.com",
  },
];

// Minimal inline SVGs — the component takes `icon: ReactNode`, so any
// client's own icon system (or none) works without this library pulling
// in an icon-library dependency.
const InstagramIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const LinkedinIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 10v7M7 7v.01M11 17v-4.5c0-1.5 1-2.5 2.5-2.5S16 11 16 12.5V17M11 10v7" />
  </svg>
);

export default function FooterDemoPage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Footer</h1>
        <p className="text-lg">
          Scroll para ver los dos tratamientos del wordmark ↓
        </p>
      </section>

      <p className="px-6 pt-12 text-sm opacity-60 sm:px-10">
        brandMarkTreatment=&quot;ghost&quot; (default)
      </p>
      <Footer
        brandName="Nortea"
        navColumns={NAV_COLUMNS}
        contactGeneral={{ phone: "+34 900 000 000", email: "hola@nortea.com" }}
        contactPeople={CONTACT_PEOPLE}
        socialLinks={[
          { label: "Instagram", href: "#", icon: InstagramIcon },
          { label: "LinkedIn", href: "#", icon: LinkedinIcon },
        ]}
        copyrightText="© 2026 Nortea"
        legalLinks={[
          { label: "Privacidad", href: "#" },
          { label: "Términos", href: "#" },
        ]}
      >
        <p className="text-sm italic opacity-70">
          Tueste de precisión, lote a lote — sin dos cosechas iguales.
        </p>
      </Footer>

      <section className="min-h-[60vh]" />

      <p className="px-6 pt-12 text-sm opacity-60 sm:px-10">
        brandMarkTreatment=&quot;solid&quot;, enter=&quot;fade-up&quot;
      </p>
      <Footer
        brandName="Nortea"
        brandMarkTreatment="solid"
        enter="fade-up"
        navColumns={NAV_COLUMNS.slice(0, 2)}
        contactGeneral={{ email: "hola@nortea.com" }}
        socialLinks={[{ label: "Instagram", href: "#", icon: InstagramIcon }]}
        copyrightText="© 2026 Nortea"
        className="bg-neutral-900 text-neutral-50"
      />
    </main>
  );
}
