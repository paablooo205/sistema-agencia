# ADR: cómo un proyecto de cliente consume component-library — sin resolver

Fecha: 2026-08-30
Estado: **Pendiente** — parche temporal aplicado solo para completar la
prueba end-to-end `_prueba-1`. No es la decisión de arquitectura
definitiva. La decisión real se toma como tarea propia, deliberada, antes
de crear el primer cliente real (no ficticio).

## Contexto

Durante la primera ejecución real del pipeline `/nuevo-proyecto`
(`clientes/_prueba-1/`, cliente ficticio "Nortea"), el Frontend Agent
llegó al paso de implementar la web del cliente y se encontró con que el
propio pipeline asume algo que no existe:

> Frontend Agent — Input: "Plantilla base del sistema" + `component-library/`.

Ninguna de las dos piezas está en el estado que esa frase asume:

1. **No existe una plantilla base cinematográfica.**
   `Proyectos/_plantilla-base/` existe, pero es una plantilla genérica de
   negocio (Next.js + shadcn/ui + multi-tenant + RLS) sin ninguna relación
   con el Cinematic Web Engine — sin GSAP, sin ScrollTrigger, sin Lenis,
   sin `component-library/`. `Proyectos/plantilla_base/` está
   prácticamente vacía (solo `node_modules`, sin código).
2. **`component-library/` es una app Next.js standalone, no un paquete.**
   No hay workspace/monorepo que permita a otro proyecto en disco
   (`clientes/<nombre>/`) hacer `import { TextReveal } from
   "component-library"` de forma limpia. Es su propia app con su propio
   `package.json`, pensada hasta ahora como showcase/demo de cada
   componente, no como dependencia instalable.

Esto ya estaba señalado como decisión aplazada en
`docs/superpowers/specs/2026-08-27-component-library-design.md`
("Alternativas descartadas: Plantilla aparte + librería aparte...
descartado para esa pasada, se decide más adelante"). `_prueba-1` es la
primera vez que ese "más adelante" se topa con la realidad.

## Parche aplicado en `_prueba-1` (temporal, no normativo)

Para no bloquear la prueba end-to-end del pipeline, se optó por la opción
más simple de las tres barajadas con el usuario:

- Se clona la app Next.js de `component-library/` (con Lenis/GSAP/
  ScrollTrigger ya cableados) dentro de `clientes/_prueba-1/`.
- Se copian ahí, como archivos duplicados (no importados), los
  componentes reutilizados en este proyecto: `BrandReveal`, `TextReveal`,
  `ParallaxImage`, `CinematicScene`.

Esto es **duplicación de código real**, aceptada explícitamente por el
usuario como parche solo para esta prueba — no se debe repetir sin más en
el primer cliente real sin haber resuelto este ADR primero.

## Opciones evaluadas (ninguna descartada ni elegida como definitiva todavía)

1. **Copiar `component-library/` como base por proyecto** (la aplicada en
   `_prueba-1`). Cero infraestructura nueva, funciona hoy mismo. Coste:
   cada cliente diverge de `component-library/` en el momento de copiarse
   — una mejora/fix en `ProductReveal.tsx` después no llega a los
   clientes ya creados sin sincronización manual. Escala mal con más de
   un cliente activo.
2. **npm workspaces (monorepo ligero)**. `Proyectos/` (o `_sistema/` +
   `clientes/`) como workspace de npm, con `component-library/` como
   paquete local del que los proyectos de cliente dependen de verdad
   (import limpio, una sola fuente de verdad). Más trabajo de
   infraestructura ahora (estructura de carpetas, configuración de
   workspace, decidir si `_sistema/` y `clientes/` pueden convivir en un
   mismo workspace dado que viven en repos Git separados). Resuelve el
   problema de raíz para todos los clientes futuros, no solo el actual.
3. **Construir dentro de `component-library/`** (p. ej. `/nortea` como
   ruta más de esa misma app). Cero gimnasia de infraestructura, import
   directo sin copiar nada. Pero mezcla código de cliente con la
   librería compartida — contradice la separación que el propio
   `component-library/README.md` da por hecha ("componentes reutilizables
   entre proyectos de cliente", no "proyectos de cliente viven aquí").

## Por qué no se decide aquí

Cualquiera de las tres tiene implicaciones que van más allá de este
proyecto de prueba (estructura de repos, si `clientes/` debe ser su
propio repo Git o varios, cómo se versiona `component-library/` si hay
varios clientes en distintos puntos de un posible cambio breaking). Se
trata como decisión de arquitectura aparte, no como algo que un Frontend
Agent deba improvisar en medio de la implementación de un cliente
concreto — que es exactamente lo que pasó aquí, y por eso queda anotado
como hueco, no como precedente a repetir.

## Estado

Sin resolver. Bloquea: que el patrón usado en `_prueba-1` se convierta en
la forma "normal" de trabajar sin más discusión. No bloquea: seguir
completando la prueba `_prueba-1` con el parche ya aplicado, puesto que
es una prueba de pipeline, no un cliente real en producción.
