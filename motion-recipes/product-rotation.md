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
"atascada", peor experiencia que en desktop) y reduce el `rotationRange`
a la mitad, para que la rotación siga siendo visible sin depender del pin.
Si `prefers-reduced-motion` está activo, no hay pin ni rotación en ningún
tamaño de pantalla: el objeto se muestra estático.
