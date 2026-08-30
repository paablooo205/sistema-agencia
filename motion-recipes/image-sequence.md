# image-sequence

## Propósito
Dar la sensación de un objeto girando/animándose de verdad (fotograma a
fotograma real, no una rotación 3D en vivo) cuya reproducción está
controlada por la posición de scroll — el usuario "gira" el objeto con
el propio gesto de scroll en vez de ver una animación con su propio
tiempo. Es la técnica que `ProductReveal` documentó como `mode:
"sequence"` desde su primera pasada pero nunca implementó
(`product-rotation.md`) — este componente es esa implementación,
generalizada como pieza propia en vez de un modo de `ProductReveal`.

## Cuándo usarla
Cuando se necesita mostrar un giro/cambio completo (360° u otro) con
más fidelidad visual de la que da una rotación 3D en vivo — por
ejemplo, si el objeto tiene material/iluminación que no se puede
replicar bien en tiempo real, o si no se dispone de un motor 3D en el
proyecto y aun así se quiere el efecto de "objeto que gira con el
scroll".

## Cuándo NO usarla
- Si ya existe el modelo 3D real y el proyecto usa Three.js/R3F en otras
  escenas: renderizarlo en vivo da el mismo efecto narrativo con
  muchísimo menos peso de red (un `.glb` de cientos de KB frente a
  decenas de imágenes) — `Product3DCloseout` es un ejemplo de componente
  que ya hace esto, aunque como parte de una secuencia mucho más
  específica que una simple rotación (`ThreeScene`, un contenedor 3D
  genérico para el caso simple, sigue pendiente). `ImageSequence` tiene
  sentido cuando NO se puede o no interesa renderizar 3D en vivo (ej.
  secuencia grabada de un objeto real, no generado).
- Si el objeto no tiene un lado "interesante" que justifique el giro
  completo — mismo criterio que `product-rotation.md`.

## Implementación
Implementado por `ImageSequence`
(`component-library/src/components/cinematic/ImageSequence.tsx`).

- Precarga **todos** los frames al montar (para esta secuencia de
  ejemplo: 120 frames, ~3.5MB combinados — precargar antes de habilitar
  el scrub evita que el usuario pueda hacer scroll a un frame que
  todavía no ha cargado). El frame 0 se pinta en cuanto está listo, sin
  esperar al resto, para que haya algo visible mientras termina de
  cargar. **Confirmado por lectura de código** (no solo intención): el
  efecto que crea el `ScrollTrigger`/tween está condicionado a
  `if (loadedCount < frameCount) return` — el tween no existe hasta que
  termina de cargar el último frame, así que no hay forma de que el
  scroll llegue a pedir un frame todavía no cargado.
- Primera pasada con 60 frames (6°/frame) se notó con saltos en scroll
  rápido — subido a 120 frames (3°/frame) tras esa verificación visual.
  Si 120 sigue sin ser suficiente, el siguiente paso es más frames, no
  tocar el mecanismo de precarga (que ya se confirmó correcto).
- Render en `<canvas>` (no `<img>`): cada frame se dibuja con
  `drawImage` sobre el mismo canvas, limpiando el frame anterior — así
  no hay N elementos `<img>` compitiendo, solo el canvas se repinta.
- `pin: true` en desktop (como `ProductReveal`) — el objeto debe quedarse
  fijo en pantalla mientras "gira" con el scroll, igual que un producto
  protagonista.
- `scrub: 0.5` (no `scrub: true`) — **con pin, sí aplica el mismo
  razonamiento que en `ProductReveal`**: el salto de renderizado que
  `scrub: 0.5` compensa ahí está ligado a que el pin se enganche, no a
  la naturaleza de la animación. `CinematicScene` copió `scrub: 0.5` sin
  tener pin y fue un error real (documentado y corregido en esa misma
  sesión) — aquí sí hay pin, así que la reutilización es correcta, no
  el mismo fallo repetido.
- El índice de frame se redondea (`Math.round`) en cada `onUpdate` —
  GSAP anima un valor `frame` continuo (0 a `frameCount - 1`), pero el
  array de imágenes necesita un índice entero.

## Parámetros
- `basePath`, `frameCount` — obligatorios, sin default con sentido.
- `alt` — obligatorio (igual que `ProductReveal`), sin valor vacío por
  defecto: un `<canvas>` no tiene texto alternativo nativo, se aplica
  vía `role="img"` + `aria-label`.
- `frameNamePrefix` (`"frame-"`), `frameExtension` (`"png"`), `zeroPad`
  (`3`) — coinciden con el naming que genera
  `scripts/generate-frame-sequence.mjs` (`frame-001.png`...`frame-060.png`).
- `pinDuration?: string | number` — default `1200`. **Sin verificar
  visualmente todavía** (a diferencia de `product-rotation.md`, cuyo
  `500` ya está confirmado en navegador) — 60 frames son muchos más
  fotogramas que repartir que el barrido de 30° de `ProductReveal`, así
  que arranca más alto como primera estimación, pendiente de ajustar
  con el mismo criterio ya usado ahí: si se siente "atascado", reducir
  antes que tocar cualquier otra cosa.
- `staticFrameIndex?: number` — default `0`. Frame mostrado cuando
  `prefers-reduced-motion` está activo.
- `mobileBreakpoint?: number` — default `768`, mismo criterio que el
  resto de la librería.

## Rendimiento
Coste de red concentrado al inicio (precarga completa antes de
habilitar el scrub) en vez de repartido — es una decisión consciente:
prioriza que el scrub nunca muestre un hueco/frame vacío, a costa de un
posible retraso inicial en secuencias muy pesadas. Para secuencias mucho
más grandes que esta (60 frames, ~1.9MB), reconsiderar una estrategia de
precarga progresiva en vez de "todo o nada" — no implementado aquí
porque no hacía falta con este volumen.

`drawImage` sobre un único canvas es más barato que animar N elementos
`<img>` con opacidad, y evita layout thrashing (el canvas no cambia de
tamaño en cada frame una vez fijado en el primer draw).

## Comportamiento móvil
Mismo criterio que `ProductReveal`: sin `pin` por debajo de
`mobileBreakpoint` (el scroll pineado se siente "atascado" en móvil) y
`pinDuration` a la mitad cuando es un número plano — mantiene la misma
velocidad de reproducción (frames por píxel de scroll) con menos
distancia total, para que el barrido complete dentro de la ventana
natural en que la sección es visible sin pin.

Si `prefers-reduced-motion` está activo, se muestra un único frame
estático (`staticFrameIndex`) en cualquier tamaño de pantalla, sin pin
ni scrub.
