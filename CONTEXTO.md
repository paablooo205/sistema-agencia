# CONTEXTO.md — Estado real de `_sistema/` (component-library)

Última actualización: 2026-08-30. Reemplaza por completo el contenido
anterior de este archivo (una nota de handoff del 2026-08-28 sobre
debugging de `ProductReveal` en el worktree
`.claude/worktrees/component-library-product-reveal/` — ese trabajo ya
se mergeó a `master` hace tiempo y está resuelto, no queda nada abierto
de esa ronda). Si retomas esto, lee esta versión, no confíes en memoria
de una sesión anterior sobre lo que dice este archivo.

Todo el trabajo de hoy ha ocurrido directamente en
`_sistema/component-library/` (el checkout de `master`), no en ningún
worktree — no hay ningún worktree activo relevante ahora mismo.

## Componentes cerrados hoy (construidos, verificados en navegador por
el usuario, commiteados)

- **`CinematicScene`**, **`ParallaxImage`**, **`TextReveal`** — cerrados
  al principio de la sesión de hoy (ver commits `f911128`, `77f6efc`,
  `8ebf350`). `CinematicScene` tiene una fricción real documentada en
  `component-library/README.md`: fuerza `items-center justify-center`
  sin prop de alineación, hubo que forzar con `!important` al reutilizarlo
  con composición asimétrica. No corregido, solo documentado.
- **`BrandReveal`** — reveal de marca al cargar (clip-path + tracking),
  sin scroll. Commit `7d4e1a1`.
- **`ImageSequence`** — secuencia de frames controlada por scroll
  (canvas + `drawImage`, precarga completa antes de habilitar el scrub
  — confirmado por lectura de código, no solo por diseño). Consume la
  secuencia de 120 frames de `botella_fanta.glb` generada con Puppeteer
  (`scripts/generate-frame-sequence.mjs`, `public/sequences/botella-360/`,
  commits `1b19a67` y `b709f27`). Demo en `/image-sequence`. **Está
  construido y commiteado — si alguien dice que sigue pendiente, no es
  cierto a día de hoy, verificar antes de asumirlo.**
- **`Product3DCloseout`** (antes `ThreeScene`) — secuencia de cierre de
  marca en 3D: producto `.glb` rota + crece + viaja de esquina a esquina
  mientras el fondo de la sección funde a `backgroundTintColor` (prop
  nueva, separada de `color` — antes eran el mismo valor) y una palabra
  se revela letra a letra flotando como un globo, antes de que el
  producto se desvanezca. Renombrado desde `ThreeScene` porque ya no
  era un contenedor 3D genérico. Commit `9f7c641`. Demo en
  `/product-3d-closeout`. Fuente actual usada en la demo:
  `botella_fanta.glb`.

## Pendiente real

- **`ThreeScene`** (el nombre, no `Product3DCloseout`) vuelve a estar
  sin construir — su entrada en `component-library/README.md` es de
  nuevo genérica ("contenedor Three.js/R3F simple, rotación ligada a
  scroll"). No confundir con `Product3DCloseout`, que es harina de otro
  costal.
- **Arquitectura de distribución de `component-library/`** — sin
  resolver, ver `docs/superpowers/decisions/2026-08-30-component-library-distribution-gap.md`.
  El proyecto de prueba `clientes/_prueba-1/` (Nortea) sigue usando el
  parche temporal de duplicar componentes en vez de importarlos.
- **"La idea de la chapa"** — el usuario mencionó esto al cerrar la
  sesión de hoy sin describirla; esta sesión no tiene contexto sobre en
  qué consiste, y no se ha inventado nada al respecto. Lo único
  verificado hoy: `botella_fanta.glb` tiene **un único mesh** (`meshes:
  1`, `nodes: 1` en el JSON del propio archivo `.glb`) — no hay ninguna
  pieza separada para una chapa/tapón en el modelo actual, es toda una
  sola geometría. Si la idea depende de tener la chapa como pieza
  independiente (separable, con su propio material/animación), el
  modelo actual no lo permite tal cual — haría falta un `.glb` nuevo con
  esa pieza separada, o descomponer la geometría existente. **Pedir al
  usuario que describa la idea antes de intentar nada aquí.**

## Estado de Git

Rama `master`, 12 commits por delante de `origin/master` y 1 por detrás
(divergencia sin resolver desde antes de hoy, no se ha tocado). Sin
push en toda la sesión de hoy, tal como se ha pedido explícitamente cada
vez. Working tree limpio salvo `.claude/` y `clientes/` (ambos fuera del
control de versiones de este repo a propósito).

Últimos 6 commits (más reciente primero):
```
9f7c641 Rename ThreeScene to Product3DCloseout, restore ThreeScene as generic pending
b709f27 Add ImageSequence component: scroll-scrubbed canvas frame sequence
1b19a67 Add Puppeteer frame-sequence generation tooling, regenerate botella-360 at 120 frames
eb7aee5 Add 8 reference-library entries from user-provided screenshots
e035276 Warn against unprotected text overlays on parallax images
e1ec6d7 Record component-library distribution architecture as an open ADR
```

## Siguiente paso al retomar

1. Si vas a tocar `Product3DCloseout`: leerlo entero primero, tiene
   varias decisiones no triviales (por qué no hay compensación de
   cámara, por qué `scrub: 0.5` sí aplica aquí y no en `CinematicScene`,
   por qué el material lleva `transparent: true`).
2. Si el usuario menciona "la chapa": pedir que la describa antes de
   escribir código — no hay contexto previo que inferir.
3. La divergencia con `origin/master` (12/1) sigue sin resolverse — no
   es urgente pero conviene saber que está ahí antes de cualquier
   `push`/`pull`.
