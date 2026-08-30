# horizontal-3d-object-gallery

- Style: Editorial técnico / catálogo
- Industry: Demo de librería técnica ("smoothy" — herramienta de slider/scroll configurable, no un cliente real) — patrón válido igualmente como referencia de interacción.
- Motion: Galería horizontal de objetos 3D renderizados (comida en este caso: tarta, tostada, pescado) sobre tarjetas de color plano, cada una **rotando individualmente** mientras la galería se desplaza en horizontal — no es una imagen estática por tarjeta, cada objeto gira sobre sí mismo de forma continua/ligada a interacción.
- Scroll type: Horizontal (scroll o drag), con numeración tipo catálogo (`0000`, `0001`...) marcando la posición dentro de la galería.
- Animation type: Rotación 3D continua por objeto + desplazamiento horizontal de la galería — combina `HorizontalGallery` (pendiente en `component-library/README.md`) con un patrón de rotación 3D simple por objeto (`ThreeScene`, el contenedor 3D genérico, sigue pendiente — no confundir con `Product3DCloseout`, que ya existe pero implementa una secuencia mucho más específica, no rotación simple reutilizable), aplicado a varios objetos a la vez en vez de uno solo protagonista.
- 3D: Sí — objetos 3D reales por tarjeta (probablemente Three.js/R3F), fondo de color plano por tarjeta (naranja, amarillo/magenta, cian), sin iluminación de estudio elaborada.
- Transition: Ninguna entre tarjetas más allá del propio scroll horizontal — no hay fundido, la rotación individual es continua incluso cuando la tarjeta no está centrada.
- Typography: Mono técnico para etiquetas ("VERSION 0.0.35", numeración, nombre entre comillas tipo `"CAKE SLICE"`), precio a la derecha — tratamiento de ficha de catálogo/inventario.
- Storytelling: Cada objeto se presenta como una pieza de catálogo técnico (numerada, con versión, con precio) más que como una imagen de producto tradicional — encaja con marcas que quieren leerse como sistema/catálogo, no como escaparate.
- Useful for: Si un proyecto necesita mostrar varios productos 3D a la vez (no uno solo como `ProductReveal`) — sería una extensión razonable de `ThreeScene` (pendiente) combinada con `HorizontalGallery` (pendiente) en vez de un componente nuevo desde cero, ambos previstos en `component-library/README.md`.
- Avoid when: Solo hay un producto protagonista (ahí `ProductReveal` ya cubre el caso 2D, y `Product3DCloseout` el caso 3D con una secuencia de cierre compuesta) o el proyecto no tiene varios modelos 3D reales disponibles.
- Source: Capturas de pantalla proporcionadas por el usuario (30-08-2026) — marca visible en pantalla: "smoothy" (nombre de librería/herramienta, visible en el propio sitio como demo). URL no proporcionada, sin verificar en vivo.
