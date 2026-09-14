# Motion Bible — Nortea

Paso 3 del pipeline `/nuevo-proyecto`. Input: Design Bible
(`clientes/_prueba-1/design-bible.md`, ya validado). Este documento no
decide paleta/tipografía/composición ni implementa código — solo
comportamiento de scroll/animación por escena.

## Resumen de reutilización (lo que pidió verificar el usuario)

| Escena | Reutiliza | Motion recipe | Nuevo comportamiento |
|---|---|---|---|
| 1. Hero | — | — (propuesta de receta nueva abajo) | Sí — reveal al cargar, sin componente existente que lo cubra |
| 2. Historia | `TextReveal` | `motion-recipes/text-reveal.md` | No — parámetros de la receta tal cual |
| 3. Grano/tueste | `ParallaxImage` | `motion-recipes/parallax.md` | No — parámetros de la receta tal cual, + overlay estático (ver detalle) |
| 4. Cierre | `CinematicScene` (`enter="none"`) | — (por diseño, sin receta: es la ausencia de animación) | No |

3 de 4 escenas reutilizan componente + receta existentes sin modificar su
comportamiento. Solo la escena 1 requiere código nuevo, y es una decisión
ya tomada por el usuario en el paso 1 (Creative Director), no una omisión
de este paso.

## Escena 1 — Hero: "Nortea" al cargar

**No liga a scroll** — decisión ya tomada y aprobada, no se reabre aquí.

- Comportamiento: al montar, `clip-path: inset(0 100% 0 0)` →
  `inset(0 0% 0 0)` (barrido de izquierda a derecha, el nombre se
  "revela" como si un instrumento de precisión lo calibrara a la vista,
  no un fade genérico) combinado con `letter-spacing` que se cierra
  ligeramente durante el barrido (de +0.02em a 0) — un detalle de
  "asentamiento" que refuerza precisión sobre calidez difusa.
- Duración: 1.1s. Easing: `expo.out` (deceleración marcada y confiada,
  sin rebote — un ease elástico/bounce contradiría "precisión").
- Un único disparo (`gsap.to()` en un `useEffect` al montar, sin
  `ScrollTrigger` en absoluto) — coherente con "no debe competir con el
  revelado progresivo de la escena 2": termina antes de que el usuario
  llegue a tocar el scroll.
- Reduced motion: el nombre aparece directamente en su estado final
  (`clip-path` completo, tracking en 0), sin barrido.
- Mobile: mismo comportamiento — no hay pin ni dependencia de scroll que
  ajustar, solo la escala tipográfica (ya resuelta en el Design Bible).

### Propuesta de receta nueva — `brand-mark-reveal` (a formalizar por Frontend Agent al construirlo)

No existe ninguna receta en `motion-recipes/` para un reveal de marca al
cargar sin scroll — las tres existentes (`product-rotation`, `parallax`,
`text-reveal`) son todas scroll-driven por diseño. Especifico aquí el
comportamiento para que Frontend Agent lo implemente y, una vez
construido y verificado visualmente (misma disciplina que
`ProductReveal`/`ParallaxImage`/`TextReveal`), lo formalice como
`motion-recipes/brand-mark-reveal.md` siguiendo el formato Tipo A (técnica
de animación) ya definido en `reference-library/README.md` — mismo
criterio de "no motion sin narrativa": aquí la narrativa es literalmente
"primer momento de la marca", así que sí se justifica.

## Escena 2 — Historia/origen: reutiliza `TextReveal`

Sin cambios sobre `motion-recipes/text-reveal.md`: `scrub: true`, sin
pin, palabras divididas a mano (no SplitText), `start: "top 85%"` /
`end: "top 20%"` en desktop, `"top 35%"` en mobile, opacidad
`0.15 → 1`, `y: 12 → 0`, stagger `1 / nº palabras`.

Restricción que traslado desde la propia receta (`Cuándo NO usarla`):
**el copy de esta escena debe ser corto-medio (una frase o un párrafo
breve), no varios párrafos** — si el contenido de historia/origen que
llega finalmente es más largo, este componente deja de ser el adecuado
(forzar lectura al ritmo del scroll en un texto largo cansa, según la
propia receta) y habría que replantear la escena, no estirar `TextReveal`
más allá de su caso de uso documentado.

## Escena 3 — Grano/tueste: reutiliza `ParallaxImage`

Sin cambios sobre `motion-recipes/parallax.md`: `scrub: true`,
`speed: 0.6` (default ya confirmado visualmente por el usuario), mitad de
velocidad en mobile, imagen dimensionada dinámicamente para que el
`translateY` nunca revele fondo.

Detalle nuevo de esta escena (overlay de ficha técnica en IBM Plex Mono,
del Design Bible): se mantiene **estático**, sin animación propia — la
escena ya tiene un efecto de movimiento (el parallax de la imagen);
animar también el overlay sería apilar movimiento sin aportar nada nuevo
("animar porque se puede", que `CLAUDE.md` descarta). El contraste
estático-sobre-móvil es en sí mismo el recurso editorial (convención de
leyenda/caption fija sobre imagen que se mueve).

## Escena 4 — Cierre: reutiliza `CinematicScene` (`enter="none"`)

Sin comportamiento nuevo — es literalmente el caso de uso por defecto del
componente ("sin animación por defecto"), y coincide con "cierre simple,
sin animación compleja" del brief. No hace falta receta: la ausencia de
animación no es una técnica que documentar, es la ausencia de una.

## Mobile — resumen

Ninguna escena introduce una estrategia mobile nueva más allá de lo que
sus recetas ya documentan (parallax reduce velocidad, text-reveal acorta
distancia de scroll, hero no depende de scroll). Ninguna escena usa `pin`
en este proyecto — así que no hay ningún caso de "desactivar pin en
mobile" que gestionar (a diferencia de `ProductReveal`, que sí lo usa).

## 3D Agent / Media Agent — confirmación explícita (no se omiten en silencio)

- **3D Agent: no aplica.** Ninguna de las 4 escenas usa geometría 3D — la
  escena 1 es tipografía 2D con `clip-path`, la escena 3 es una imagen
  con parallax 2D. Confirmo la decisión del Creative Director, no
  encuentro nada en el análisis de motion que la contradiga.
- **Media Agent: no aplica.** La escena 3 es la única con imagen, y es un
  placeholder sin material real que optimizar — decisión ya tomada en el
  paso 1 y ahora también documentada como caso explícito en la propia
  skill de Media Agent (`skills/media-agent/SKILL.md`), tras el hallazgo
  del paso 1. No hay vídeo en ninguna escena.

## Dependencias

Ninguna nueva. `clip-path` + `letter-spacing` (escena 1) son propiedades
CSS animables nativamente por GSAP core, sin plugin adicional. Todo lo
demás reutiliza patrones ya implementados con GSAP + ScrollTrigger + Lenis.

## Nota de proceso

`motion-recipes/` cubrió 3 de 4 escenas sin fricción — las recetas
existentes fueron suficientes tal cual, sin necesidad de reinterpretarlas
ni forzar nada (a diferencia de lo que pasó con `reference-library/` en
el paso 2). La única escena sin cobertura (hero al cargar) no es un hueco
del sistema — es, correctamente, un caso nuevo que no existía antes de
este proyecto, y el pipeline lo maneja como se supone: se especifica el
comportamiento aquí, se construye en Frontend Agent, y se formaliza como
receta nueva una vez validado — el mismo ciclo por el que ya pasaron
`product-rotation`, `parallax` y `text-reveal`.
