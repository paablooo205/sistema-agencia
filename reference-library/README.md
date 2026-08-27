# Reference Library

Biblioteca de referencias visuales y técnicas. Su función es ayudar a
entender cómo y cuándo usar determinados patrones — no es un banco para
copiar diseños, es contexto para diferenciarse con criterio.

Design Agent es el principal responsable de mantener esta biblioteca: la
consulta al investigar un sector nuevo y añade entradas nuevas como parte
de su trabajo en cada proyecto (ver skill `design-agent`). QA/Art Critic
también la consulta para detectar si un resultado se parece demasiado a
las convenciones genéricas del sector en vez de diferenciarse.

## Clasificación

Cada referencia vive en su propio archivo
(`reference-library/<nombre-referencia>.md`) y se clasifica por:

- **Estilo** (luxury, editorial, minimalista, brutalista, experimental...)
- **Industria** (automoción, moda, joyería, tecnología, arquitectura...)
- **Composición** (grid, tipografía protagonista, full-bleed...)
- **Tipo de scroll** (vertical, horizontal, pinned, scrub...)
- **Tipo de animación** (parallax, reveal, transición, secuencia de
  imágenes...)
- **3D** (si aplica: cámara, partículas, producto 3D...)
- **Tipografía** (editorial, display, mono técnico...)
- **Transición** (entre escenas, entre páginas...)
- **Storytelling** (qué narrativa consigue el patrón)

## Formato de cada entrada

```markdown
# <nombre-referencia>

- Style: <estilo(s)>
- Industry: <industria(s)>
- Motion: <resumen del comportamiento de scroll/animación>
- Useful for: <en qué tipo de proyecto encaja>
- Avoid when: <cuándo NO aplica, si es relevante>
- Source: <de dónde viene la referencia, si aplica>
```

Ejemplo (del vision doc del sistema):

```markdown
# luxury-product-reveal

- Style: Luxury / Editorial
- Motion: Pinned product, slow zoom, typography reveal
- Useful for: Automotive, Fashion, Jewelry, Technology
```

Esta carpeta está vacía de contenido real por ahora — solo la estructura.
Se irá poblando proyecto a proyecto.
