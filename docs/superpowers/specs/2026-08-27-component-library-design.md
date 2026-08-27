# Component Library — primera pasada (diseño)

Fecha: 2026-08-27
Estado: aprobado por el usuario en chat, incluyendo cambio de alcance a
ProductReveal como único componente de esta pasada.

## Contexto

`component-library/` y `motion-recipes/` existían hasta ahora solo como
`README.md` (convenciones y lista de componentes/recetas previstas, sin
código). No existe ningún proyecto Next.js/GSAP/Lenis en `Proyectos/` que
pueda hospedar componentes reales: `plantilla_base/` es un proyecto
existente no relacionado (una PWA de Vite/React/Supabase para un club de
balonmano, `handball-club-pwa`), no la plantilla cinematográfica que
`frontend-agent` asume.

Este spec cubre la primera pasada real: convertir `component-library/` en
una app Next.js funcional con `ProductReveal`, y documentar su receta de
animación correspondiente en `motion-recipes/`.

## Objetivo

Tener una base de componentes cinematográficos real, ejecutable y
verificada visualmente — no solo documentada — que sirva de:
1. Showcase/demo de `ProductReveal`, con una página por componente a
   medida que se añadan más.
2. Punto de partida que `frontend-agent` pueda copiar/clonar como arranque
   de un proyecto de cliente nuevo, hasta que exista una plantilla base
   separada (decisión explícita: no se construye una plantilla aparte en
   esta pasada — ver "Alternativas descartadas").

## Alcance de esta pasada

**Cambio de alcance decidido por el usuario tras la primera revisión**: en
vez de los 3 componentes originalmente propuestos (más sencillos), la
primera pasada real es un único componente — `ProductReveal` — por ser el
efecto que motivó el proyecto (objeto que rota al hacer scroll) y para
validar el pipeline completo con el componente que más importa, no con el
más simple.

- `ProductReveal` — aparición y rotación progresiva de un producto/objeto
  protagonista, pineado durante un tramo de scroll.

Sin dependencia técnica bloqueante de los otros componentes: no necesita
`CinematicScene` como wrapper ni `ImageSequence`/pipeline de vídeo — ver
"Especificación de componentes" para el porqué (elección de `mode:
"css3d"` frente a `"sequence"`).

Fuera de alcance en esta pasada (quedan en el README como pendientes):
`CinematicScene`, `ParallaxImage`, `TextReveal`, `PinnedScene`,
`HorizontalGallery`, `ScrollImage`, `ScrollText`, `TextMask`, `VideoScrub`,
`ImageSequence`, `ClipPathReveal`, `PageTransition`, `ThreeScene`,
`ParticleScene`.

## Stack y setup

- Next.js 15 (App Router), React 19, TypeScript estricto, `src/`.
- Tailwind CSS v4 (misma versión que `plantilla_base/`, que ya usa
  `@tailwindcss/postcss` — evita introducir una versión distinta sin
  motivo).
- GSAP + `ScrollTrigger` (plugin core, gratuito).
- `lenis` (paquete npm actual; sucesor de `@studio-freight/lenis`).
- **No** se instala shadcn/ui en esta pasada: el `CLAUDE.md` del sistema
  lo reserva para "componentes UI no cinematográficos" (botones, forms) y
  `ProductReveal` no lo necesita. Se añade cuando haga falta.
- Gestor de paquetes: npm (consistente con `plantilla_base/`).
- **`.gitignore` se crea como primer paso del scaffold**, antes del primer
  `npm install` — el repo `_sistema/` no tiene ningún `.gitignore` todavía
  en ningún nivel (confirmado antes de esta pasada). Debe excluir como
  mínimo `node_modules/`, `.next/`, `.env*`, y los artefactos habituales
  de build de Next.js. Verificar su contenido antes del primer commit del
  scaffold, no después.

## Estructura de directorios

```
component-library/
├── .gitignore                           ← creado antes del primer npm install
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← índice con enlace a la demo
│   │   └── product-reveal/page.tsx
│   ├── components/cinematic/
│   │   └── ProductReveal.tsx
│   └── lib/
│       └── lenis-provider.tsx          ← sincroniza Lenis con ScrollTrigger.update
├── package.json, tsconfig.json, tailwind config, postcss config
└── README.md                           ← actualizado: instrucciones de dev + convenciones ya existentes
```

## Especificación de componentes

### `ProductReveal`
- Aparición y rotación progresiva de un producto/objeto protagonista,
  pineado (`ScrollTrigger` `pin: true`, plugin core gratuito) durante un
  tramo de scroll.
- Implementación de esta pasada: `transform: rotateY()/rotateX()` sobre el
  objeto, con scrub ligado al progreso del pin (GPU-friendly, sin
  `top`/`margin`).
- Props:
  - `src` (obligatorio)
  - `alt` (obligatorio, sin default vacío)
  - `mode?: "css3d" | "sequence"` (default `"css3d"`) — **firma
    definitiva desde esta pasada**, pensada para no romperse cuando se
    implemente el modo `"sequence"` (frame-scrubbing) más adelante. Si se
    pasa `"sequence"` antes de que exista esa implementación, el
    componente hace fallback a `"css3d"` y emite un `console.warn` claro
    indicando que `"sequence"` todavía no está implementado — nunca falla
    en silencio ni lanza una excepción que rompa el render.
  - `rotationRange?` (grados, tupla `[min, max]`, default documentado en
    el recipe) — solo aplica a `mode: "css3d"`.
  - `pinDuration?` (largo del tramo de scroll pineado, default
    documentado en el recipe).
  - `className?`.
- `mode: "sequence"` (frame-scrubbing con `<canvas>`, pipeline ffmpeg) NO
  se implementa en esta pasada — ver "Fuera de alcance". Solo existe como
  valor válido del tipo y como rama de fallback, para que la interfaz
  pública del componente no cambie cuando se añada.
- Estrategia móvil: por debajo de un breakpoint configurable (default
  768px, consistente con el resto de la librería) reduce o desactiva el
  pin/rotación — documentado en el recipe `product-rotation.md`.
- Respeta `prefers-reduced-motion`: si está activo, el objeto se muestra
  estático (sin pin ni rotación).

## Motion recipes

Se documenta 1 receta en `motion-recipes/`, siguiendo el formato ya
definido en `motion-recipes/README.md` (Propósito / Cuándo usarla / Cuándo
NO usarla / Implementación / Parámetros / Rendimiento / Comportamiento
móvil):

- `product-rotation.md` — corresponde a `ProductReveal`, `mode: "css3d"`.
  Cuando se implemente `mode: "sequence"` en una pasada futura, se
  documenta como sección adicional de esta misma receta (no una receta
  nueva, es la misma técnica de producto con otra implementación).

`parallax.md` y `text-reveal.md` se escriben cuando se construyan
`ParallaxImage` y `TextReveal`, no en esta pasada.

## Verificación

Antes del primer commit del scaffold: confirmar que `.gitignore` existe y
excluye `node_modules/`, `.next/` y `.env*`.

Antes de dar la pasada por terminada: `npm run dev` y comprobar en el
navegador la demo page `/product-reveal` — confirmar que la rotación se ve
con `mode: "css3d"`, que pasar `mode: "sequence"` cae a `"css3d"` con el
warning esperado en consola (sin excepción ni pantalla rota), que no hay
errores de consola, y una pasada rápida de responsive (mobile width) para
confirmar que la estrategia móvil documentada se respeta visualmente.

No se añaden tests automatizados en esta pasada (YAGNI): no hay lógica
compleja más allá de props → comportamiento visual, y la verificación
manual en navegador ya cubre lo que un test unitario aportaría aquí.

## Alternativas descartadas

- **Plantilla aparte + librería aparte**: construir primero una
  `plantilla_base_cinematic/` limpia y luego una `component-library/`
  instalable dentro de ella. Descartado por el usuario para esta pasada:
  más trabajo ahora sin necesidad inmediata, ya que no hay un cliente
  real todavía esperando esa separación.
- **Solo código sin demo ejecutable**: escribir los `.tsx` sueltos sin
  proyecto que los ejecute. Descartado: no se podría verificar
  visualmente nada hasta el primer cliente real, lo que viola la
  filosofía de "componentes fiables y probados antes de reutilizarse" del
  `component-library/README.md`.

## Fuera de alcance (explícito)

- Los otros 14 componentes listados en `component-library/README.md`
  (incluye `CinematicScene`, `ParallaxImage` y `TextReveal`, pospuestos
  desde el alcance original de esta pasada).
- `mode: "sequence"` de `ProductReveal` (frame-scrubbing con `<canvas>` +
  pipeline ffmpeg) — el prop y el fallback existen ya, la implementación
  real no.
- Las 14 recetas restantes listadas en `motion-recipes/README.md`.
- Cualquier trabajo sobre `reference-library/` (no toca en esta pasada).
- Una plantilla base Next.js separada para clientes reales — se decide
  más adelante si `component-library/` sigue haciendo también de starter,
  o si se separan cuando aparezca el primer cliente real.
