# text-reveal

## Propósito
Revelar un párrafo progresivamente, palabra a palabra, a medida que el
usuario hace scroll — en vez de mostrarlo entero de golpe o con un
fade-in genérico desconectado del gesto de scroll. Da una lectura de
"el contenido se construye mientras avanzas", útil para titulares o
declaraciones de marca que se quieren enfatizar.

## Cuándo usarla
Bloques de texto cortos-medios (una frase o un párrafo breve) que
funcionan como momento editorial dentro del scroll — no para cuerpo de
texto largo, donde forzar la lectura a la velocidad del scroll cansa al
usuario en vez de aportar.

## Cuándo NO usarla
- Texto largo (varios párrafos): el usuario necesita poder leer a su
  propio ritmo, no al del scroll — usar tipografía estática.
- Como fade-in decorativo repetido en cada sección sin relación con el
  contenido — eso es justo lo que `CLAUDE.md` prohíbe por defecto. Aquí
  la animación SÍ tiene relación directa con el contenido (revela el
  propio texto), lo que la justifica; no extender el mismo tratamiento a
  elementos que no sean el texto que se quiere enfatizar.

## Implementación
Implementado por `TextReveal`
(`component-library/src/components/cinematic/TextReveal.tsx`).

- **División de palabras a mano** (`text.split(" ")`, cada palabra
  envuelta en su propio `<span data-reveal-word>`) en vez de `SplitText`
  de GSAP: `SplitText` es un plugin de pago (Club GreenSock) y
  `CLAUDE.md` limita el stack a GSAP core + `ScrollTrigger` (plugin
  gratuito) salvo justificación explícita en el Design/Motion Bible. Para
  un split a nivel de palabra (no de carácter, que sí sería más costoso
  de replicar a mano de forma robusta con saltos de línea), la división
  manual es trivial y evita la dependencia.
- El split ocurre en el render del componente (no dentro de un
  `useEffect`), así las palabras existen como texto real en el HTML
  servido — un crawler o un visitante sin JS ve el párrafo completo,
  cumpliendo la regla de `CLAUDE.md` de no depender solo de animación JS
  para que el contenido crítico exista en el DOM.
- Un único `ScrollTrigger` con `scrub: true` (mismo razonamiento que en
  `parallax.md`: sin `pin`, no hay riesgo del artefacto que motivó
  `scrub: 0.5` en `ProductReveal`, y un reveal ligado a lectura debe
  sentirse acoplado al gesto de scroll, no ir a rastras) anima todas las
  palabras a la vez con `stagger: 1 / wordEls.length`, repartiendo el
  progreso del scroll entre ellas.
- Cada palabra pasa de `{ opacity: 0.15, y: 12 }` a `{ opacity: 1, y: 0 }`
  — opacidad reducida en vez de 0 total: el párrafo se lee ya en su forma
  completa desde el primer instante (como un "fantasma"), reforzando que
  es texto real y no una construcción progresiva desde la nada.

## Parámetros
- `text: string` — contenido a revelar (obligatorio).
- `as?: "p" | "h2" | "h3" | "div"` — etiqueta semántica del contenedor,
  default `"p"`.
- `mobileBreakpoint?: number` — default `768`.
- `wordClassName?: string` — clase aplicada a cada `<span>` de palabra,
  para tipografía/color sin tocar el componente.

## Rendimiento
Coste bajo: solo `opacity`/`transform` por palabra, un único
`ScrollTrigger` por instancia (no uno por palabra). El número de nodos
`<span>` escala con el número de palabras — para párrafos largos (fuera
del caso de uso recomendado, ver "Cuándo NO usarla") esto crecería sin
necesidad.

## Comportamiento móvil
El efecto se mantiene en móvil (sin `pin`, no hay riesgo de "atasco"),
pero el tramo de scroll en el que se completa el reveal es más corto
(`end: "top 35%"` frente a `"top 20%"` en desktop): la relación entre
scroll disponible y contenido visible difiere lo suficiente en móvil
como para que el mismo tramo relativo termine sintiéndose demasiado largo
o demasiado corto según el caso; acortarlo mantiene el reveal completándose
en una ventana de scroll cómoda.

Si `prefers-reduced-motion` está activo, todas las palabras se muestran a
opacidad completa desde el principio, sin animación.
