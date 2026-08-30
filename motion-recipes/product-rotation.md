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
  `[0, 30]`. Un barrido pequeño (30° totales) lee como "objeto que se
  puede apreciar desde otro ángulo"; barridos grandes (90°+) leen como
  giro completo y necesitan `mode: "sequence"` para no verse plano/falso.
  **El rango arranca en 0° (de frente), no está centrado en 0** — con
  `scrub` ligado directamente al progreso del pin, el valor "from" del
  rango es lo que se ve nada más aparecer el objeto (incluso antes de
  que el pin se active), así que un rango centrado en 0 (p. ej. `[-15,
  15]`, la elección original de esta pasada) hace que el objeto nunca se
  muestre de frente — empieza ya girado hacia un extremo, contradiciendo
  el "aparición Y rotación progresiva" del objetivo de este componente.
- `pinDuration?: string | number` — largo del tramo pineado en unidades de
  `ScrollTrigger` `end`, default `500` (500px de scroll; antes `1000`).
  Con `ease: "none"`, el barrido de 30° se reparte linealmente sobre esa
  distancia: a 1000px salían 0.03°/px, y una rueda de ratón (~100-120px
  por click) o un gesto de scroll normal (~200-500px) solo cubrían entre
  el 20% y el 50% del giro — además de ser el 40-55% de todo el scroll de
  esta demo para un detalle pensado como sutil, no como pieza central. A
  500px, un gesto normal-alto lo completa sin sentirse instantáneo ni
  eterno.
- `mobileBreakpoint?: number` — ancho en px por debajo del cual se aplica
  el comportamiento móvil (sin `pin`, `rotationRange` a la mitad), default
  `768`.

## Rendimiento
Coste bajo: una sola imagen, una propiedad animada (`transform`), sin
recálculo de layout. Riesgo principal es un `pinDuration` demasiado largo,
que hace que la sección se sienta "atascada" — si el usuario se queja de
que el scroll "no avanza", reducir `pinDuration` antes que tocar nada más.

## Comportamiento móvil
Por debajo de 768px de ancho, `ProductReveal` desactiva el `pin` (el
scroll pineado en móvil suele sentirse como que la página se ha quedado
"atascada", peor experiencia que en desktop) y reduce a la mitad tanto
`rotationRange` como `pinDuration` (solo cuando `pinDuration` es un
número — un valor de cadena tipo `"+=800"` no se puede dividir sin
parsear la expresión de `ScrollTrigger`, así que un `pinDuration`
personalizado en formato cadena queda igual en móvil y desktop).

Reducir ambos a la vez mantiene la misma velocidad angular (grados por
px) que en desktop — mismo "ritmo" de giro, menos rotación total — y es
importante precisamente porque en móvil no hay pin: la sección se mueve
con el scroll en vez de quedarse fija en pantalla, así que si
`pinDuration` se quedara igual que en desktop (pensado para una rotación
sostenida con el objeto inmóvil), el giro podría seguir a mitad de camino
cuando la sección ya ha salido de la pantalla. Con la distancia también
reducida, el giro se completa cómodamente dentro de la ventana natural en
la que la sección es visible mientras pasa por el viewport.

Si `prefers-reduced-motion` está activo, no hay pin ni rotación en ningún
tamaño de pantalla: el objeto se muestra estático.
