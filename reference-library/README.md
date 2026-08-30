# Reference Library

Biblioteca de referencias visuales y técnicas. Su función es ayudar a
entender cómo y cuándo usar determinados patrones — no es un banco para
copiar diseños, es contexto para diferenciarse con criterio.

Design Agent es el principal responsable de mantener esta biblioteca: la
consulta al investigar un sector nuevo y añade entradas nuevas como parte
de su trabajo en cada proyecto (ver skill `design-agent`). QA/Art Critic
también la consulta para detectar si un resultado se parece demasiado a
las convenciones genéricas del sector en vez de diferenciarse.

## Dos tipos de referencia

Esta carpeta guarda dos tipos de referencia distintos, que **no** comparten
el mismo molde de campos. Mezclarlos en una sola plantilla obligaba a
rellenar campos que no aplicaban con `N/A` — se detectó como fricción real
en el primer proyecto que usó esta carpeta de verdad (`_prueba-1`) y se
corrigió aquí en vez de dejarlo para más adelante.

- **Tipo A — Técnica de animación**: un patrón de scroll/motion concreto
  (pin, parallax, reveal, secuencia de imágenes...). Típicamente
  investigado/añadido por Motion Agent, o por Design Agent cuando el
  patrón visual y el técnico van de la mano.
- **Tipo B — Identidad de marca/sector**: paleta, tipografía, composición
  y tono de un sector o marca — sin comportamiento de scroll asociado.
  Típicamente investigado/añadido por Design Agent al estudiar el sector
  de un cliente nuevo.

Antes de añadir una entrada, decide cuál de los dos tipos es — el nombre
del archivo no lo indica, pero el propio contenido de la entrada debe
dejarlo claro por el conjunto de campos que usa.

## Clasificación — Tipo A (técnica de animación)

- **Estilo** (luxury, editorial, minimalista, brutalista, experimental...)
- **Industria** (automoción, moda, joyería, tecnología, arquitectura...)
- **Tipo de scroll** (vertical, horizontal, pinned, scrub...)
- **Tipo de animación** (parallax, reveal, transición, secuencia de
  imágenes...)
- **3D** (si aplica: cámara, partículas, producto 3D...)
- **Transición** (entre escenas, entre páginas...)

### Formato

```markdown
# <nombre-referencia>

- Style: <estilo(s)>
- Industry: <industria(s)>
- Motion: <resumen del comportamiento de scroll/animación>
- Scroll type: <vertical / horizontal / pinned / scrub...>
- Animation type: <parallax / reveal / transición / secuencia...>
- 3D: <si aplica, o "No aplica">
- Transition: <si aplica, o "No aplica">
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

## Clasificación — Tipo B (identidad de marca/sector)

- **Estilo** (luxury, editorial, minimalista, brutalista, experimental...)
- **Industria** (automoción, moda, joyería, tecnología, arquitectura...)
- **Composición** (grid, jerarquía tipográfica, ritmo de sección,
  full-bleed vs. columna constreñida...)
- **Paleta** (tonos concretos y su uso — no solo "cálido"/"oscuro")
- **Tipografía** (editorial, display, mono técnico, pairing...)
- **Storytelling** (qué narrativa/tono transmite el patrón)

### Formato

```markdown
# <nombre-referencia>

- Style: <estilo(s)>
- Industry: <industria(s)>
- Composition: <grid, jerarquía, ritmo de sección>
- Palette: <tonos y su uso>
- Typography: <tratamiento tipográfico>
- Storytelling: <qué narrativa/tono consigue>
- Useful for: <en qué tipo de proyecto encaja>
- Avoid when: <cuándo NO aplica, si es relevante>
- Source: <de dónde viene la referencia, si aplica>
```

No lleva `Motion`, `Scroll type`, `Animation type`, `3D` ni `Transition`
— si una referencia de identidad de marca SÍ trae opiniones de motion
(poco común, pero posible), se documenta como una entrada Tipo A aparte
que referencia a esta, no forzando ambos moldes en un solo archivo.

Esta carpeta se irá poblando proyecto a proyecto — Design Agent añade
Tipo B al investigar sector; Motion Agent (u ocasionalmente Design Agent)
añade Tipo A al encontrar un patrón de scroll/animación reutilizable.
