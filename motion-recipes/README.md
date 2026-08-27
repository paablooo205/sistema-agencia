# Motion Recipe Library

Biblioteca de recetas de animación reutilizables. Motion Agent consulta
esta carpeta antes de diseñar el Motion Bible de un proyecto y añade
recetas nuevas cuando ninguna existente cubre un caso encontrado.

Cada receta vive en su propio archivo (`motion-recipes/<nombre-receta>.md`)
y sigue siempre el mismo formato, para que sea consultable de forma
predecible tanto por Motion Agent como por Frontend Agent.

## Formato obligatorio de cada receta

```markdown
# <nombre-receta>

## Propósito
Qué efecto narrativo o funcional consigue esta receta.

## Cuándo usarla
Situaciones/contenido para los que esta receta encaja.

## Cuándo NO usarla
Casos en los que, aunque técnicamente se podría, no se debe usar
(referencia directa a las reglas anti-AI-slop de CLAUDE.md cuando aplique).

## Implementación
Enfoque técnico (GSAP/ScrollTrigger/Lenis/Three.js), con referencia a
qué componente de component-library/ la implementa.

## Parámetros
Parámetros configurables y sus valores por defecto razonables.

## Rendimiento
Coste esperado (GPU/CPU), riesgos conocidos (jank, layout thrashing) y
cómo mitigarlos.

## Comportamiento móvil
Cómo se adapta o sustituye esta receta en móvil — nunca se asume que el
comportamiento desktop reducido es suficiente.
```

## Recetas previstas (pendientes de documentar)

`image-zoom`, `image-pan`, `image-reveal`, `parallax`, `pinned-scene`,
`horizontal-scroll`, `text-split`, `text-mask`, `clip-path-reveal`,
`video-scrub`, `image-sequence`, `product-rotation`, `3d-camera`,
`3d-object`, `particles`, `page-transition`.

Esta carpeta está vacía de recetas documentadas por ahora — se irán
añadiendo a medida que Motion Agent las use y valide en proyectos reales.
