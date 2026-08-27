# Component Library — ProductReveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `component-library/` from a documentation-only folder into a
working Next.js app that demonstrates one real cinematic component,
`ProductReveal` (a scroll-pinned, rotating product image), plus its
corresponding motion recipe.

**Architecture:** Scaffold a standard Next.js 15 App Router project with
`create-next-app` (this gets TypeScript, Tailwind v4, ESLint and a correct
`.gitignore` for free), add GSAP + Lenis on top, wire a `LenisProvider`
into the root layout so `Lenis` drives `ScrollTrigger.update`, then build
`ProductReveal` as a client component using `ScrollTrigger`'s free `pin` +
`scrub` to rotate an image via CSS `transform`. `ProductReveal`'s public
prop signature includes `mode: "css3d" | "sequence"` from day one — only
`"css3d"` is implemented; `"sequence"` type-checks and falls back safely,
so the signature never has to change later.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript (strict),
Tailwind CSS v4, GSAP + ScrollTrigger (core, free), `lenis`, npm.

**Spec:** `docs/superpowers/specs/2026-08-27-component-library-design.md`

## Global Constraints

- Stack is fixed to Next.js 15 / React 19 / TypeScript strict / Tailwind
  v4 / GSAP + ScrollTrigger (core plugin only, no paid GSAP plugins) /
  `lenis` / npm — no other dependency without spec justification.
- No shadcn/ui in this pass — reserved for non-cinematic UI per
  `CLAUDE.md`.
- `.gitignore` must exist and exclude `node_modules/`, `.next/`, `.env*`
  before the first commit of the scaffold.
- No automated test framework/tests in this pass (explicit YAGNI in the
  spec) — verification is TypeScript compilation, `next build`, and a
  manual browser walkthrough.
- `ProductReveal`'s prop signature (including `mode?: "css3d" |
  "sequence"`) is final for this pass — `"sequence"` must type-check and
  never throw, even though it isn't implemented yet.
- `alt` is a required prop with no empty default (accessibility rule from
  `component-library/README.md`).
- Components must respect `prefers-reduced-motion` and document/implement
  a distinct mobile behavior — never assume desktop-reduced is enough.
- Animate GPU-friendly properties (`transform`) — never `top`/`margin`.
- Motion recipes follow the exact section format in
  `motion-recipes/README.md` (Propósito / Cuándo usarla / Cuándo NO usarla
  / Implementación / Parámetros / Rendimiento / Comportamiento móvil).

---

## Task 1: Scaffold the Next.js app

**Files:**
- Create: everything `create-next-app` generates under `component-library/`
  (`package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`,
  `.gitignore`, `eslint.config.mjs`, `src/app/layout.tsx`,
  `src/app/page.tsx`, `src/app/globals.css`, `public/*`)
- Modify: `component-library/README.md` (preserved through the scaffold,
  restored after)

**Interfaces:**
- Produces: a buildable Next.js app at `component-library/` with
  TypeScript strict mode, Tailwind v4 (`@tailwindcss/postcss`) already
  wired into `globals.css`, and a `.gitignore` that excludes
  `node_modules/`, `.next/`, `.env*`.

- [ ] **Step 1: Preserve the existing README before scaffolding**

`create-next-app` checks that its target directory is empty (or contains
only a small allowlist of files like `.git`/`LICENSE`) before scaffolding
— `README.md` is not on that allowlist, and neither would a `README.md.bak`
left inside the same directory. Move the file one level up, out of
`component-library/` entirely, not just to a `.bak` name in place.

Run:
```bash
cd "component-library"
mv README.md ../README.md.component-library.bak
```

- [ ] **Step 2: Run create-next-app non-interactively**

Run (from inside `component-library/`, target `.` so it scaffolds in
place):
```bash
npx --yes create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

Expected: command completes without prompting (all decision flags were
passed), `npm install` runs as part of it, and the directory now contains
`package.json`, `tsconfig.json`, `src/app/`, `public/`, `.gitignore`,
`node_modules/`.

- [ ] **Step 3: Confirm .gitignore excludes the right things**

Run:
```bash
grep -E "node_modules|\.next|\.env" .gitignore
```

Expected: matches for `node_modules`, `.next` (or `/.next/`), and an
`.env*` pattern all appear. If any is missing, add it manually to
`.gitignore` before continuing — do not proceed to a commit without this.

- [ ] **Step 4: Restore the original README, then remove the backup**

The generated `README.md` will be replaced with real content in Task 6
(after the app and recipe exist to document), so for now just restore the
original so nothing is lost:

Run:
```bash
mv README.md README.md.bak.generated
mv ../README.md.component-library.bak README.md
```

Keep `README.md.bak.generated` around only until Task 6 is done (it gets
deleted there, not before).

- [ ] **Step 5: Verify the scaffold builds**

Run:
```bash
npm run build
```

Expected: build succeeds (`Compiled successfully`), no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add component-library/
git commit -m "chore: scaffold component-library as a Next.js app"
```

---

## Task 2: Add GSAP and Lenis

**Files:**
- Modify: `component-library/package.json`, `component-library/package-lock.json`

**Interfaces:**
- Consumes: the buildable scaffold from Task 1.
- Produces: `gsap` and `lenis` available as importable packages for Task 3
  and Task 4.

- [ ] **Step 1: Install the packages**

Run (from inside `component-library/`):
```bash
npm install gsap lenis
```

Expected: both added to `dependencies` in `package.json`.

- [ ] **Step 2: Verify the build still passes**

Run:
```bash
npm run build
```

Expected: build succeeds — nothing imports these packages yet, this just
confirms the install didn't break anything.

- [ ] **Step 3: Commit**

```bash
git add component-library/package.json component-library/package-lock.json
git commit -m "chore: add gsap and lenis dependencies"
```

---

## Task 3: Add LenisProvider and wire it into the root layout

**Files:**
- Create: `component-library/src/lib/lenis-provider.tsx`
- Modify: `component-library/src/app/layout.tsx`

**Interfaces:**
- Consumes: `gsap`, `gsap/ScrollTrigger`, `lenis` (Task 2).
- Produces: `LenisProvider` (named export, React component taking
  `{ children: React.ReactNode }`), mounted once at the root layout so
  every page underneath gets smooth scroll synced with `ScrollTrigger`.
  `ProductReveal` (Task 4) relies on `ScrollTrigger` being driven by this
  provider — it does not create its own scroll loop.

- [ ] **Step 1: Write lenis-provider.tsx**

Create `component-library/src/lib/lenis-provider.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);

    function syncLenisWithGsapTicker(time: number) {
      lenis.raf(time * 1000);
    }

    gsap.ticker.add(syncLenisWithGsapTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(syncLenisWithGsapTicker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 2: Wire it into the root layout**

Open `component-library/src/app/layout.tsx` (generated by `create-next-app`
in Task 1) and replace its full contents with:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LenisProvider } from "@/lib/lenis-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cinematic Web Engine — Component Library",
  description:
    "Showcase de componentes cinematográficos reutilizables del Cinematic Web Engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build and boot**

Run:
```bash
npm run build
```
Expected: succeeds, no type errors.

Run (background, then check, then stop):
```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
kill %1
```
Expected: prints `200`.

- [ ] **Step 4: Commit**

```bash
git add component-library/src/lib/lenis-provider.tsx component-library/src/app/layout.tsx
git commit -m "feat: wire Lenis smooth scroll into ScrollTrigger via LenisProvider"
```

---

## Task 4: Build the ProductReveal component

**Files:**
- Create: `component-library/src/components/cinematic/ProductReveal.tsx`

**Interfaces:**
- Consumes: `gsap`, `gsap/ScrollTrigger` (Task 2); relies on
  `ScrollTrigger.update` already being driven by `LenisProvider` (Task 3).
- Produces: `ProductReveal` (named export) and `ProductRevealMode`,
  `ProductRevealProps` (named type exports) from
  `@/components/cinematic/ProductReveal`, consumed by the demo page in
  Task 5. Signature:
  ```ts
  type ProductRevealMode = "css3d" | "sequence";
  interface ProductRevealProps {
    src: string;
    alt: string;
    mode?: ProductRevealMode; // default "css3d"
    rotationRange?: [number, number]; // default [-15, 15]
    pinDuration?: string | number; // default "+=1000"
    className?: string;
  }
  function ProductReveal(props: ProductRevealProps): JSX.Element;
  ```

- [ ] **Step 1: Write the component**

Create `component-library/src/components/cinematic/ProductReveal.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type ProductRevealMode = "css3d" | "sequence";

export interface ProductRevealProps {
  src: string;
  alt: string;
  mode?: ProductRevealMode;
  rotationRange?: [number, number];
  pinDuration?: string | number;
  className?: string;
}

const MOBILE_BREAKPOINT = 768;
const DEFAULT_ROTATION_RANGE: [number, number] = [-15, 15];
const DEFAULT_PIN_DURATION = "+=1000";

/**
 * "sequence" (frame-scrubbing) is not implemented yet. The prop exists so
 * ProductReveal's public signature doesn't change when it is added later —
 * until then it falls back to "css3d" instead of throwing.
 */
export function resolveProductRevealMode(mode: ProductRevealMode): "css3d" {
  if (mode === "sequence") {
    console.warn(
      '[ProductReveal] mode="sequence" is not implemented yet — falling back to "css3d".'
    );
    return "css3d";
  }
  return mode;
}

export function ProductReveal({
  src,
  alt,
  mode = "css3d",
  rotationRange = DEFAULT_ROTATION_RANGE,
  pinDuration = DEFAULT_PIN_DURATION,
  className,
}: ProductRevealProps) {
  resolveProductRevealMode(mode);

  const sectionRef = useRef<HTMLElement | null>(null);
  const objectRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const object = objectRef.current;
    if (!section || !object) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const [fromDeg, toDeg] = isMobile
      ? [rotationRange[0] / 2, rotationRange[1] / 2]
      : rotationRange;

    const tween = gsap.fromTo(
      object,
      { rotateY: fromDeg },
      {
        rotateY: toDeg,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: pinDuration,
          scrub: true,
          pin: !isMobile,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [rotationRange, pinDuration]);

  return (
    <section
      ref={sectionRef}
      className={["flex min-h-screen items-center justify-center overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={objectRef}
        src={src}
        alt={alt}
        className="h-auto w-full max-w-sm"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      />
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run (from inside `component-library/`):
```bash
npx tsc --noEmit
```

Expected: no errors. This is the check that the `mode` union, the
`resolveProductRevealMode` return-narrowing to `"css3d"`, and the
`rotationRange`/`pinDuration` types are all consistent — there is no
automated test suite in this pass (explicit YAGNI in the spec), so this
type-check plus the manual browser walkthrough in Task 7 is the
verification for this component.

- [ ] **Step 3: Commit**

```bash
git add component-library/src/components/cinematic/ProductReveal.tsx
git commit -m "feat: add ProductReveal component with css3d rotation and sequence fallback"
```

---

## Task 5: Demo pages and placeholder asset

**Files:**
- Create: `component-library/public/product-demo.svg`
- Modify: `component-library/src/app/page.tsx`
- Create: `component-library/src/app/product-reveal/page.tsx`

**Interfaces:**
- Consumes: `ProductReveal` from
  `@/components/cinematic/ProductReveal` (Task 4).
- Produces: a working `/` index page linking to `/product-reveal`, and a
  working `/product-reveal` demo page — the pages Task 7's manual
  walkthrough exercises.

- [ ] **Step 1: Add a generic placeholder product asset**

Create `component-library/public/product-demo.svg` (a plain geometric
placeholder — not tied to any client, per `component-library/README.md`'s
"nunca contenido de un cliente concreto" rule):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect x="40" y="40" width="320" height="320" rx="24" fill="#1a1a1a" />
  <circle cx="200" cy="200" r="110" fill="none" stroke="#f5f5f5" stroke-width="6" />
  <rect x="160" y="120" width="80" height="160" rx="12" fill="#f5f5f5" />
</svg>
```

- [ ] **Step 2: Write the index page**

Replace `component-library/src/app/page.tsx` (generated in Task 1) with:

```tsx
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
```

- [ ] **Step 3: Write the ProductReveal demo page**

Create `component-library/src/app/product-reveal/page.tsx`:

```tsx
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
      <section className="flex min-h-screen items-center justify-center">
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
```

- [ ] **Step 4: Verify build and smoke-test both routes**

Run:
```bash
npm run build
```
Expected: succeeds, no type errors.

Run (background, then check, then stop):
```bash
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/product-reveal
kill %1
```
Expected: both print `200`.

- [ ] **Step 5: Commit**

```bash
git add component-library/public/product-demo.svg component-library/src/app/page.tsx component-library/src/app/product-reveal/
git commit -m "feat: add index and ProductReveal demo pages"
```

---

## Task 6: Update documentation

**Files:**
- Modify: `component-library/README.md` (restore + update, replacing
  `README.md.bak.generated` from Task 1)
- Create: `motion-recipes/product-rotation.md`

**Interfaces:**
- Consumes: nothing code-level — pure documentation.
- Produces: docs consumed by future sessions and by Motion/Frontend
  agents per `docs/spec-sistema-agentes.md`.

- [ ] **Step 1: Update component-library/README.md**

The file currently (after Task 1's restore) has the original
pre-scaffold content. Update it to also document that the app is now
real and how to run it. Replace the last paragraph ("Esta carpeta está
vacía de implementación...") with:

```markdown
## Estado

`ProductReveal` está implementado (`src/components/cinematic/
ProductReveal.tsx`), con demo en `/product-reveal`. Resto de componentes
de esta tabla: pendientes.

## Desarrollo

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000` — el índice enlaza a la demo de cada
componente implementado.
```

Then delete the generated-scaffold backup, it's no longer needed:
```bash
rm component-library/README.md.bak.generated
```

- [ ] **Step 2: Write motion-recipes/product-rotation.md**

Create `motion-recipes/product-rotation.md`:

```markdown
# product-rotation

## Propósito
Comunicar que un producto/objeto es el protagonista de la escena
haciéndolo girar progresivamente mientras el usuario hace scroll, en vez
de mostrarlo estático. Da sensación de "presentación" del objeto.

## Cuándo usarla
Producto físico o virtual que es el foco central de una sección (moda,
tecnología, automoción, joyería) y donde ver el objeto desde varios
ángulos aporta información o deseo de marca.

## Cuándo NO usarla
- Si el objeto no tiene un lado "interesante" que justifique rotarlo —
  rotar por rotar es "animar porque técnicamente se puede", prohibido por
  `CLAUDE.md`.
- Si ya hay una galería de producto con múltiples fotos reales: no
  dupliques la función con una rotación sintética de baja fidelidad.

## Implementación
Implementado por `ProductReveal`
(`component-library/src/components/cinematic/ProductReveal.tsx`).

- `mode: "css3d"` (implementado): un único `<img>` rotado con
  `transform: rotateY()`, `scrollTrigger` con `pin: true` y `scrub: true`
  (plugin core de GSAP, sin coste de licencia). El pin fija la sección
  mientras dura el tramo de scroll (`pinDuration`); dentro de ese tramo,
  el ángulo de rotación interpola linealmente (`ease: "none"`) entre
  `rotationRange[0]` y `rotationRange[1]`.
- `mode: "sequence"` (no implementado todavía): frame-scrubbing real —
  N fotogramas del objeto girando de verdad, dibujados en `<canvas>` según
  la posición de scroll. Requiere el pipeline de preprocesado de vídeo
  (ffmpeg) descrito en `docs/spec-sistema-agentes.md` y no existe código
  para él en esta pasada; pasar `mode="sequence"` hoy hace fallback a
  `"css3d"` con un `console.warn`.

## Parámetros
- `rotationRange?: [number, number]` — grados de rotación, default
  `[-15, 15]`. Un rango pequeño (15-20°) lee como "objeto que se puede
  apreciar desde otro ángulo"; rangos grandes (90°+) leen como giro
  completo y necesitan `mode: "sequence"` para no verse plano/falso.
- `pinDuration?: string | number` — largo del tramo pineado en unidades de
  `ScrollTrigger` `end`, default `"+=1000"` (1000px de scroll).

## Rendimiento
Coste bajo: una sola imagen, una propiedad animada (`transform`), sin
recálculo de layout. Riesgo principal es un `pinDuration` demasiado largo,
que hace que la sección se sienta "atascada" — si el usuario se queja de
que el scroll "no avanza", reducir `pinDuration` antes que tocar nada más.

## Comportamiento móvil
Por debajo de 768px de ancho, `ProductReveal` desactiva el `pin` (el
scroll pineado en móvil suele sentirse como que la página se ha quedado
"atascada", peor experiencia que en desktop) y reduce el `rotationRange`
a la mitad, para que la rotación siga siendo visible sin depender del pin.
Si `prefers-reduced-motion` está activo, no hay pin ni rotación en ningún
tamaño de pantalla: el objeto se muestra estático.
```

- [ ] **Step 3: Commit**

```bash
git add component-library/README.md motion-recipes/product-rotation.md
git commit -m "docs: document ProductReveal in component-library README and product-rotation recipe"
```

---

## Task 7: Manual verification pass

**Files:** none (verification only — fixes, if any are found, are small
edits to files from Tasks 4-5, committed separately with a description of
what was wrong).

**Interfaces:** none — this task consumes the finished app from Tasks 1-6
and produces a pass/fail confirmation of the spec's Verificación section.

- [ ] **Step 1: Start the dev server**

Run (from inside `component-library/`):
```bash
npm run dev
```

- [ ] **Step 2: Check the default (css3d) rotation in the browser**

Open `http://localhost:3000/product-reveal`. Scroll down slowly through
the `ProductReveal` section.

Expected: the section pins (stays fixed) for a stretch of scroll while the
placeholder square/circle image visibly rotates; no layout shift, no
console errors in devtools.

- [ ] **Step 3: Check prefers-reduced-motion**

In Chrome DevTools: Rendering tab → "Emulate CSS media feature
prefers-reduced-motion" → `reduce`. Reload `/product-reveal` and scroll
through the same section again.

Expected: the section does not pin, the image does not rotate — it just
scrolls past statically.

- [ ] **Step 4: Check the mobile breakpoint**

In DevTools, set prefers-reduced-motion back to "No emulation", then open
device toolbar and set viewport width to 375px (or any value < 768).
Reload and scroll through the section.

Expected: no pin (the page scrolls through the section normally), but the
image still visibly rotates a smaller amount as it passes.

- [ ] **Step 5: Check the mode="sequence" fallback**

Temporarily edit
`component-library/src/app/product-reveal/page.tsx`, add `mode="sequence"`
to the `<ProductReveal>` call:
```tsx
<ProductReveal
  src="/product-demo.svg"
  alt="Producto de demostración girando durante el scroll"
  mode="sequence"
/>
```
Reload `/product-reveal`.

Expected: the terminal running `npm run dev` (or the browser console)
prints `[ProductReveal] mode="sequence" is not implemented yet — falling
back to "css3d".`, and the rotation still works exactly as in Step 2 — no
crash, no blank section.

Then revert the edit (remove `mode="sequence"`) — the demo page must ship
using the default mode.

- [ ] **Step 6: Stop the dev server and confirm no leftover diff**

Run:
```bash
kill %1 2>/dev/null || true
git status
```
Expected: clean (the `mode="sequence"` edit from Step 5 was reverted, so
there should be no pending changes from this task).

- [ ] **Step 7: If any check in Steps 2-5 failed, fix and re-verify**

If a check failed, make the minimal fix in the relevant file from Task 4
or Task 5, re-run Steps 1-6 for the affected check, then commit the fix
separately:
```bash
git add component-library/
git commit -m "fix: <describe what the manual verification caught>"
```
If everything passed on the first try, there is nothing to commit for
this task — it's a pure verification gate.

---

## Self-Review Notes

- **Spec coverage:** `.gitignore` requirement → Task 1 Step 3. Scope
  change to `ProductReveal`-only → Tasks 1-6 build only that component.
  `mode` prop with `"sequence"` fallback → Task 4. Mobile breakpoint +
  `prefers-reduced-motion` → Task 4 implementation, Task 7 Steps 3-4
  verify them. Motion recipe format → Task 6 Step 2 matches
  `motion-recipes/README.md`'s required headings exactly. No automated
  tests (YAGNI) → no test files anywhere in this plan, verification is
  `tsc`/`build`/manual browser pass.
- **Placeholder scan:** no TBD/"add error handling"/"similar to Task N" —
  every step has literal file content.
- **Type consistency:** `ProductRevealMode`, `ProductRevealProps`,
  `resolveProductRevealMode` names and signatures match between Task 4's
  "Interfaces" block and its Step 1 code, and Task 5 only imports
  `ProductReveal` (not the type exports), which matches what Task 5's demo
  page actually uses.
