# Component Library — primera pasada (diseño)

Fecha: 2026-08-27
Estado: aprobado por el usuario en chat, pendiente de revisión del spec.

## Contexto

`component-library/` y `motion-recipes/` existían hasta ahora solo como
`README.md` (convenciones y lista de componentes/recetas previstas, sin
código). No existe ningún proyecto Next.js/GSAP/Lenis en `Proyectos/` que
pueda hospedar componentes reales: `plantilla_base/` es un proyecto
existente no relacionado (una PWA de Vite/React/Supabase para un club de
balonmano, `handball-club-pwa`), no la plantilla cinematográfica que
`frontend-agent` asume.

Este spec cubre la primera pasada real: convertir `component-library/` en
una app Next.js funcional con 3 componentes, y documentar sus recetas de
animación correspondientes en `motion-recipes/`.

## Objetivo

Tener una base de componentes cinematográficos real, ejecutable y
verificada visualmente — no solo documentada — que sirva de:
1. Showcase/demo de cada componente (una página por componente).
2. Punto de partida que `frontend-agent` pueda copiar/clonar como arranque
   de un proyecto de cliente nuevo, hasta que exista una plantilla base
   separada (decisión explícita: no se construye una plantilla aparte en
   esta pasada — ver "Alternativas descartadas").

## Alcance de esta pasada

3 componentes, elegidos por cubrir los patrones más comunes sin
sobre-invertir antes de validar el setup contra un cliente real:

- `CinematicScene` — contenedor estructural de escena (no anima).
- `ParallaxImage` — imagen con profundidad relativa al scroll.
- `TextReveal` — revelado progresivo de texto al entrar en viewport.

Fuera de alcance en esta pasada (quedan en el README como pendientes):
`PinnedScene`, `HorizontalGallery`, `ScrollImage`, `ScrollText`,
`TextMask`, `VideoScrub`, `ImageSequence`, `ProductReveal`,
`ClipPathReveal`, `PageTransition`, `ThreeScene`, `ParticleScene`.

## Stack y setup

- Next.js 15 (App Router), React 19, TypeScript estricto, `src/`.
- Tailwind CSS v4 (misma versión que `plantilla_base/`, que ya usa
  `@tailwindcss/postcss` — evita introducir una versión distinta sin
  motivo).
- GSAP + `ScrollTrigger` (plugin core, gratuito).
- `lenis` (paquete npm actual; sucesor de `@studio-freight/lenis`).
- **No** se instala shadcn/ui en esta pasada: el `CLAUDE.md` del sistema
  lo reserva para "componentes UI no cinematográficos" (botones, forms) y
  ninguno de los 3 componentes de esta pasada lo necesita. Se añade
  cuando haga falta.
- Gestor de paquetes: npm (consistente con `plantilla_base/`).

## Estructura de directorios

```
component-library/
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← índice con enlaces a cada demo
│   │   ├── cinematic-scene/page.tsx
│   │   ├── parallax-image/page.tsx
│   │   └── text-reveal/page.tsx
│   ├── components/cinematic/
│   │   ├── CinematicScene.tsx
│   │   ├── ParallaxImage.tsx
│   │   └── TextReveal.tsx
│   └── lib/
│       └── lenis-provider.tsx          ← sincroniza Lenis con ScrollTrigger.update
├── package.json, tsconfig.json, tailwind config, postcss config
└── README.md                           ← actualizado: instrucciones de dev + convenciones ya existentes
```

## Especificación de componentes

### `CinematicScene`
- Contenedor estructural de una escena dentro del scroll.
- Props: `children`, `className?`, `minHeight?` (default `100vh`),
  `background?` (color o clase).
- No anima nada por sí mismo — lo usan `ParallaxImage`/`TextReveal` por
  dentro o alrededor.

### `ParallaxImage`
- Imagen con desplazamiento relativo al scroll, implementado con
  `transform` (GPU-friendly, no `top`/`margin`).
- Props: `src`, `alt` (obligatorio, sin default vacío), `speed?` (default
  `0.3`, rango recomendado documentado en el recipe), `className?`.
- Estrategia móvil: por debajo de un breakpoint configurable (default
  768px) reduce el desplazamiento o lo desactiva, documentado en el
  recipe `parallax.md`.
- Respeta `prefers-reduced-motion`: si está activo, no aplica
  desplazamiento.

### `TextReveal`
- Revela el texto progresivamente cuando entra en el viewport.
- Props: `children` (string o nodo simple), `className?`, `stagger?`
  (default razonable documentado en el recipe).
- Implementación: divide el texto en `span`s manualmente (sin depender
  del plugin `SplitText` de GSAP, que requiere licencia Club GreenSock) —
  decisión explícita para no introducir una dependencia de pago.
- Respeta `prefers-reduced-motion`: si está activo, el texto aparece
  directamente sin animación.

## Motion recipes

Se documentan 2 recetas en `motion-recipes/`, siguiendo el formato ya
definido en `motion-recipes/README.md` (Propósito / Cuándo usarla / Cuándo
NO usarla / Implementación / Parámetros / Rendimiento / Comportamiento
móvil):

- `parallax.md` — corresponde a `ParallaxImage`.
- `text-reveal.md` — corresponde a `TextReveal`.

`CinematicScene` no genera receta: es un contenedor estructural, no una
técnica de animación.

## Verificación

Antes de dar la pasada por terminada: `npm run dev` y comprobar en el
navegador cada una de las 3 demo pages (`/cinematic-scene`,
`/parallax-image`, `/text-reveal`) — confirmar que la animación se ve, que
no hay errores de consola, y una pasada rápida de responsive (mobile
width) para confirmar que las estrategias móviles documentadas se
respetan visualmente.

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

- Los otros 12 componentes listados en `component-library/README.md`.
- Las 14 recetas restantes listadas en `motion-recipes/README.md`.
- Cualquier trabajo sobre `reference-library/` (no toca en esta pasada).
- Una plantilla base Next.js separada para clientes reales — se decide
  más adelante si `component-library/` sigue haciendo también de starter,
  o si se separan cuando aparezca el primer cliente real.
