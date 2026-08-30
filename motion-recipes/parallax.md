# parallax

## Propósito
Dar sensación de profundidad entre una imagen y su entorno haciendo que se
desplace a distinta velocidad que el resto del contenido mientras el
usuario hace scroll, en vez de moverse solidaria con la página.

## Cuándo usarla
Imágenes editoriales o de ambiente que acompañan contenido (no un producto
protagonista — para eso está `product-rotation`), donde la profundidad
relativa aporta una lectura más cinematográfica que una imagen estática.

## Cuándo NO usarla
- Imágenes muy pequeñas o en grid denso: el desplazamiento relativo apenas
  se nota y solo añade coste de scroll sin beneficio perceptible.
- Si el layout ya depende de que la imagen no se mueva de su caja (por
  ejemplo, alineada a pixel con texto adyacente) — el parallax por diseño
  desplaza la imagen dentro de su contenedor.

## Implementación
Implementado por `ParallaxImage`
(`component-library/src/components/cinematic/ParallaxImage.tsx`).

- Sin `pin`: la sección se desplaza con el scroll de forma normal: solo la
  imagen interior se anima.
- `scrub: true` (no un valor numérico con lag) — a diferencia de
  `ProductReveal`, aquí no hay un `pin` que pueda generar el salto de
  renderizado que `scrub: 0.5` compensaba allí. Un parallax necesita
  sentirse acoplado 1:1 al gesto de scroll del usuario para leerse como
  "profundidad relativa al movimiento" — un scrub con inercia se sentiría
  como la imagen yendo a rastras detrás del scroll, no como una capa a
  distinta profundidad.
- La imagen se renderiza más alta que su sección contenedora (exactamente
  el recorrido total en px, repartido mitad arriba/mitad abajo, calculado
  en el propio componente a partir de `speed` y la altura real de la
  sección) para que el `translateY` nunca revele el fondo de la sección
  detrás de ella, sea cual sea el valor de `speed`.
- `gsap.fromTo(img, { y: -travel/2 }, { y: travel/2, scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } })`.

## Parámetros
- `speed?: number` — fracción de la altura de la sección que recorre la
  imagen de punta a punta, default `0.6` (antes `0.3`: en la primera
  verificación visual resultó demasiado sutil para notarse — el rango de
  scroll activo de `"top bottom"` a `"bottom top"` cubre ~2x la altura de
  la sección, así que un `speed` bajo se reparte en un desplazamiento por
  píxel de scroll muy pequeño). Valores típicos entre `0.3` (sutil) y
  `0.8` (marcado); por encima empieza a sentirse como que la imagen
  "flota" fuera de su caja en vez de tener profundidad.
- La imagen de demo (`parallax-demo.svg`) usa bandas horizontales de
  contraste en vez de un gráfico plano/abstracto — con `object-cover`,
  una imagen sin detalle direccional (como el icono usado en la primera
  versión de la demo) apenas deja notar el desplazamiento aunque el
  cálculo sea correcto; esto no es un parámetro del componente, es una
  guía para elegir buenas imágenes de verificación/demo.
- `mobileBreakpoint?: number` — default `768`, mismo criterio que el resto
  de la librería.

## Rendimiento
Coste bajo: una propiedad animada (`transform: translateY`), sin pin ni
recálculo de layout durante el scroll (el alto/`top` de la imagen se
calculan una vez al montar, no en cada frame). Igual que en `ProductReveal`,
se usan propiedades GPU-friendly.

## Comportamiento móvil
A diferencia de `ProductReveal`, el parallax **no se desactiva** en móvil
(no hay `pin`, así que no existe el riesgo de que la página se sienta
"atascada"). En su lugar, `speed` se reduce a la mitad por debajo de
`mobileBreakpoint`: en pantallas pequeñas el recorrido total de scroll de
una sección es proporcionalmente menor, así que el mismo `speed` que en
desktop produciría un desplazamiento relativo más brusco respecto al
espacio disponible; reducirlo mantiene la misma sensación de profundidad
sutil en vez de un movimiento exagerado.

Si `prefers-reduced-motion` está activo, la imagen se muestra estática
(el recorte/tamaño se sigue ajustando para que encaje bien en su caja,
pero sin animación de scroll).
