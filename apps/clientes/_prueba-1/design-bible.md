# Design Bible — Nortea

Paso 2 del pipeline `/nuevo-proyecto`. Input: interpretación del Creative
Director (aprobada). Este documento fija dirección artística concreta —
no timelines ni parámetros de animación (Motion Agent) ni implementación
(Frontend Agent).

## Referencias de sector consultadas

Investigación de sector documentada en
`$CINEMATIC_ENGINE_HOME/reference-library/`:

- [`specialty-coffee-editorial-precision.md`](../../_sistema/reference-library/specialty-coffee-editorial-precision.md) —
  estructura/composición de sitios de tostadores editoriales-minimalistas.
- [`warm-neutral-editorial-palette.md`](../../_sistema/reference-library/warm-neutral-editorial-palette.md) —
  patrón de paleta/tipografía cálida-pero-precisa.

Ambas nuevas — `reference-library/` estaba vacía antes de este proyecto.

## Paleta

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#241C18` | Fondo base, casi negro cálido |
| `--color-bg-alt` | `#2E2420` | Fondo de sección alterna / paneles |
| `--color-text-primary` | `#F3E9DC` | Texto principal sobre fondo oscuro |
| `--color-text-secondary` | `#C9B8A4` | Texto secundario, metadatos, captions |
| `--color-accent` | `#B8703F` | Acento — uso deliberadamente escaso (subrayados, marcas de detalle, CTA), nunca como fondo grande |
| `--color-line` | `#4A3B31` | Líneas divisorias finas entre secciones |

Sin gradientes. Sin glassmorphism. El contraste alto entre
`--color-bg`/`--color-text-primary` hace el trabajo visual, no un efecto
de superficie.

## Tipografía

- **Display/titulares — Fraunces** (serif variable, alto carácter
  editorial). Usada grande y con peso variable en el hero y los titulares
  de sección — es la pieza que lee "editorial", no "startup".
- **Cuerpo/UI — IBM Plex Sans**. Elegida específicamente por su carácter
  técnico/de precisión (diseñada para claridad técnica) — refuerza
  "tueste de precisión" en vez de una geométrica genérica (Inter, Geist,
  etc., que ya usa la plantilla por defecto y que aquí NO encaja con la
  personalidad de marca).
- **Metadatos técnicos (origen, fecha de tueste, lote) — IBM Plex Mono**,
  en mayúsculas pequeñas con tracking amplio — tratamiento tipo "ficha
  técnica de producto", refuerza precisión sin caer en iconografía
  rústica.

Ambas familias están disponibles en Google Fonts, cargables vía
`next/font/google` — mismo mecanismo que ya usa `component-library`
(sustituye a Geist Sans/Mono del layout actual, no lo añade encima).

## Grid y composición

- Grid editorial asimétrico, no centrado-genérico: márgenes generosos,
  columnas de texto más estrechas que el ancho completo de la escena
  (lectura tipo revista, no full-width de borde a borde para el copy).
- Escala tipográfica con saltos grandes entre display y cuerpo — la
  jerarquía se lee sin depender de color o iconos.
- Ritmo de sección: full-bleed (foto de escena 3) alternando con columna
  de texto constreñida (escenas 2 y 4) — variación de composición entre
  escenas, no la misma plantilla repetida.
- Nada de "hero centrado + 3 cards + logos + CTA" — cada escena tiene su
  propia composición, coherente con que son 4 momentos narrativos
  distintos, no secciones intercambiables.

## Por escena

1. **Hero** — nombre "Nortea" en Fraunces, muy grande, composición
   asimétrica (no centrado a piñón). Un primer momento de marca, sin
   competir con nada más en pantalla — espacio negativo generoso.
2. **Historia/origen** — columna de texto constreñida en IBM Plex Sans,
   `--color-text-primary` sobre `--color-bg`, ancho de línea cómodo para
   lectura progresiva (relevante para Motion Agent: el texto debe poder
   leerse cómodo scene por scene, no en una sola línea gigante).
3. **Grano/tueste** — imagen full-bleed (placeholder marcado como tal —
   sin foto real de este cliente ficticio) con metadatos tipo ficha
   técnica en IBM Plex Mono superpuestos (origen, tueste, fecha) como
   detalle editorial, no como leyenda de producto genérica.
4. **Cierre** — columna de texto simple, `--color-bg-alt` para
   diferenciarla visualmente del resto sin necesitar animación: ubicación
   y horario en IBM Plex Sans, quizás con acento `--color-accent` en un
   único detalle (p. ej. un guión o marca tipográfica), nada más.

## Responsive

- Mobile: la escala tipográfica del hero se reduce pero mantiene
  Fraunces — nunca cae a una sans genérica en mobile por "simplicidad".
- Columnas de texto (escenas 2, 4) pasan a ancho completo con márgenes
  reducidos, no se comprime la escala tipográfica agresivamente.
- Escena 3 (parallax): comportamiento de scroll en mobile es
  responsabilidad de Motion Agent (`motion-recipes/parallax.md` ya
  documenta el criterio: reduce velocidad, no desactiva) — aquí solo se
  fija que la composición full-bleed se mantiene en mobile.

## Dependencias

Ninguna nueva. Fraunces/IBM Plex Sans/IBM Plex Mono se cargan vía
`next/font/google`, ya en uso en `component-library` para Geist — mismo
mecanismo, solo cambia la familia.

## Contenido pendiente (cliente ficticio)

- Foto de grano/proceso de tueste (escena 3): no existe, placeholder a
  definir por Frontend Agent, marcado explícitamente como no-final.
- Dirección exacta y horario (escena 4): no provistos en el brief — texto
  de relleno claramente marcado como placeholder, no contenido final.

---

## Nota de proceso — honestidad sobre el formato de reference-library

Se pidió explícitamente prestar atención a si el formato/criterio de
`reference-library/README.md` se siguió tal cual o hubo que improvisar.
Respuesta honesta: **el formato se siguió, pero no encaja limpiamente**.

El README define 9 campos de clasificación (Style, Industry, Motion,
Useful for, Avoid when, más Composition/Scroll type/Animation type/3D/
Typography/Transition/Storytelling mencionados en la sección de
clasificación). El único ejemplo dado en el propio README
(`luxury-product-reveal`) es una referencia de **patrón de animación**
concreto (pin, zoom, reveal tipográfico) — tiene sentido que "Motion",
"Scroll type" y "Transition" sean centrales ahí.

Las dos referencias que este proyecto necesitaba no son patrones de
animación — son referencias de **identidad visual/sector** (paleta,
tipografía, composición de marca). Para esas, "Scroll type", "Animation
type" y "Transition" no aplican de verdad — tuve que marcarlos como
`N/A` en vez de rellenarlos con algo forzado. El formato no distingue
explícitamente entre "referencia de técnica de motion" y "referencia de
dirección de marca/sector" — ambas viven en la misma carpeta con la misma
plantilla, y la plantilla está sesgada hacia la primera.

Esto no me impidió hacer el trabajo, pero si `reference-library/` va a
acumular más entradas de este segundo tipo (probable — Design Agent
investiga sector en cada proyecto, no solo Motion Agent investiga
técnicas), merece la pena que el README distinga los dos casos o marque
qué campos son opcionales según el tipo de referencia, en vez de que cada
agente decida por su cuenta qué dejar en `N/A`.
