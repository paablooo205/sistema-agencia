# Decision log: bug de array de dependencias en `usePinnedScroll` — resuelto

Fecha: 2026-09-15
Estado: **Resuelto**

## Qué pasó

Al migrar `ProductReveal`, `Product3DCloseout` e `ImageSequence` a
`usePinnedScroll` (2026-09-14), se perdió silenciosamente parte del
comportamiento reactivo que cada uno tenía en su `useEffect` original.

Antes de la migración, cada componente tenía su propio array de
dependencias, con sus props específicas incluidas:

- `ProductReveal`: `[rotationRange, pinDuration, mobileBreakpoint]`
- `ImageSequence`: `[loadedCount, frameCount, pinDuration, mobileBreakpoint, staticFrameIndex]`
- `Product3DCloseout`: `[tiltDeg, tiltAxis, pinDuration, mobileBreakpoint, startScale, endScale, cornerOffsetX, cornerOffsetY, backgroundTintColor, sectionRef, wordContainerRef, footerRef, scene]`

`usePinnedScroll` centraliza el efecto con un array de dependencias
**fijo**: `[triggerRef, pinDuration, mobileBreakpoint, enabled]`. Tras la
migración, un cambio en `rotationRange`, `frameCount`/`staticFrameIndex`,
o `tiltDeg`/`startScale`/`endScale`/`cornerOffsetX`/`cornerOffsetY`/
`backgroundTintColor` — **sin que `pinDuration` o `mobileBreakpoint`
cambiaran a la vez** — ya no recreaba el tween/timeline. Una instancia ya
montada que recibiera un valor nuevo de esas props en un re-render seguía
animando con el valor viejo indefinidamente.

## Por qué no se detectó antes de fusionar

Toda la verificación de la migración (build, lint, `curl` a las rutas de
demo, HTML sin marcadores de error) confirmaba que el código compilaba y
servía correctamente — nada de eso ejercita el caso "una prop cambia en
una instancia ya montada", porque ninguna demo de este repo pasa esas
props como estado dinámico; todas usan literales estáticos en JSX. El
bug quedó señalado como "riesgo conocido, sin resolver" en un resumen de
chat de una sesión anterior, sin ningún rastro en el código ni en
`docs/` — se detectó en revisión, no por una prueba real.

## Opciones evaluadas

1. **`extraDeps: unknown[]` en las opciones del hook** — el caller pasa
   sus propias dependencias reactivas, que el hook añade a su array
   interno de `useEffect`.
2. **Que el propio `builder` se re-invoque en cada render relevante sin
   depender del array de dependencias del efecto**, comparando
   manualmente si el resultado cambió.

## Decisión: Opción 1 (`extraDeps`)

La Opción 2 exigiría ejecutar el `builder` en cada render solo para
comparar su resultado — anula la razón de envolver esto en un efecto
(evitar recrear un `gsap.timeline`/`Tween` costoso en cada render), y un
`gsap.core.Timeline`/`Tween` no tiene una noción natural de "igualdad"
contra la que comparar dos resultados.

La Opción 1 es el patrón que React documenta para hooks personalizados
que envuelven `useEffect`: aceptar un array de dependencias del caller y
añadirlo al array interno — el mismo contrato que `useEffect`, `useMemo`
y `useCallback` ya exponen de base (longitud estable entre renders,
comparación por `Object.is` de cada entrada). Pone la responsabilidad
donde debe estar: el componente que usa el hook es quien sabe qué props
lee su propio `builder`, no el hook adivinándolo.

## Implementación

- `usePinnedScroll` (`packages/component-library/src/lib/usePinnedScroll.ts`):
  nueva opción `extraDeps?: unknown[]` (default `[]`), spreadeada al
  final del array de dependencias del `useEffect` interno. Documentado
  con comentario en el propio código, no solo aquí.
- `ProductReveal`: `extraDeps: [rotationRange]`.
- `ImageSequence`: `extraDeps: [frameCount, staticFrameIndex]` (`loadedCount`
  ya estaba cubierto de facto por `enabled`).
- `Product3DCloseout`: `extraDeps: [tiltDeg, tiltAxis, startScale, endScale, cornerOffsetX, cornerOffsetY, backgroundTintColor, wordContainerRef, footerRef, scene]`
  — paridad completa con el array de dependencias original, salvo
  `pinDuration`/`mobileBreakpoint`/`sectionRef` (=`triggerRef`), ya
  cubiertos nativamente por el hook.

## Verificación

Demo real en `/verify-use-pinned-scroll-deps-fix`
(`packages/component-library/src/app/verify-use-pinned-scroll-deps-fix/page.tsx`):
una instancia ya montada de una sección pineada, con un botón que cambia
`targetRotation` (ajeno a `pinDuration`/`mobileBreakpoint`) vía
`setState`, y un contador visible en pantalla de cuántas veces se
reconstruyó el tween. Confirma sin ambigüedad si el efecto se re-ejecuta
al cambiar una prop ajena a `pinDuration`/`mobileBreakpoint` — build y
lint verificados en verde; la confirmación interactiva (clicar el botón
y ver el contador subir) requiere abrir la demo en un navegador real, no
solo `curl` (el conteo empieza en 0 en el HTML pre-renderizado porque
`useEffect` nunca corre en el servidor — solo sube tras la hidratación
en el cliente).
