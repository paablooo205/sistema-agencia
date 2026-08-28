# CONTEXTO.md — Estado de este worktree (debugging de ProductReveal)

Última actualización: 2026-08-28, sesión de debugging de la rotación de
`ProductReveal`. **Este archivo es propio de este worktree**
(`.claude/worktrees/component-library-product-reveal/`, rama
`worktree-component-library-product-reveal`) — no es el `CONTEXTO.md` de
`_sistema/` en `master`, que sigue reflejando el estado general del
Cinematic Web Engine y no se ha tocado. Si estás retomando esto, lee este
archivo entero antes de tocar nada; la sección "Siguiente paso al
retomar" es literalmente lo primero que hay que mirar.

## Qué es esto

Esta rama implementó `ProductReveal` (componente cinematográfico de
`component-library/`, ver `docs/superpowers/plans/2026-08-27-component-library-product-reveal.md`
para el plan original de 7 tareas, ya completado vía
subagent-driven-development con revisión final limpia). Después de esa
implementación, el usuario reportó que la rotación se veía con tirones /
saltos / incompleta al probarla en el navegador, y desde entonces la
sesión ha sido debugging puro, ronda a ronda, con disciplina estricta de
"diagnóstico primero, hipótesis marcadas como tal, nada se aplica como
fix confirmado sin evidencia".

## Fixes confirmados y ya commiteados en esta rama

- **`f4f85e7`** — `rotationRange` por defecto cambiado de `[-15, 15]` a
  `[0, 30]`. Motivo confirmado con logs reales (`liveRotateYDeg`): con
  `scrub` ligado al progreso del pin, el valor "from" es lo que se ve
  desde el primer instante — un rango centrado en 0 hace que el objeto
  nunca se muestre de frente, arranca ya girado a un extremo. El barrido
  total (30°) no cambió, solo el punto de anclaje.
- **`09591c9`** — `pinDuration` por defecto cambiado de `"+=1000"` a
  `500` (número, no cadena), y ahora se divide a la mitad en móvil junto
  con `rotationRange` (mismo criterio: mantener la misma velocidad
  angular, menos rotación total). Motivo confirmado por cálculo: a
  1000px/30°, un gesto de scroll normal (200-500px) solo cubría 20-50%
  del giro — exactamente el síntoma de "gira suave pero no llega al
  final" que reportó el usuario.

Ambos fixes están documentados también en `motion-recipes/product-rotation.md`
(secciones Parámetros y Comportamiento móvil) y comentados en el propio
código como `CONFIRMED FIX (not a hypothesis)`.

## Hipótesis SIN confirmar — siguen en el árbol de trabajo, NO commiteadas

Todo esto vive solo en el working tree de
`component-library/src/components/cinematic/ProductReveal.tsx` (y
`lenis-provider.tsx`, commit `82f232b`, ese sí ya commiteado — ver más
abajo). **No hacer commit de nada de esta sección todavía** — el usuario
lo pidió explícitamente así al cerrar la sesión de hoy.

1. **`scrub: 0.5`** en vez de `scrub: true` — hipótesis para amortiguar
   un salto brusco reportado inicialmente (franja diagonal fina). Marcada
   `HYPOTHESIS, NOT CONFIRMED` en el código. Pendiente de que el usuario
   la verifique visualmente en navegador.
2. **`perspective: "1200px"` + `transformStyle: "preserve-3d"`** en el
   `<section>` padre, y **`backfaceVisibility: "hidden"`** en el `<img>`
   — hipótesis para el mismo salto (objeto apareciendo "de canto"). Ya se
   descartó que esto pudiera romper el `pinType` de GSAP (comprobado
   contra la fuente de `ScrollTrigger.js`: la detección de `pinType` no
   inspecciona `perspective`/`transform`/`will-change` del propio
   elemento). Sigue sin confirmarse visualmente.
3. Todo el resto de instrumentación temporal (`markers: true`, logs en
   `onEnter`/`onUpdate`, contador de renders, el log de "tween target
   values" con `fromDeg`/`toDeg`/`isMobile`/`windowInnerWidth`) — pura
   diagnosis, no cambia comportamiento, pero tampoco está commiteada.

`lenis-provider.tsx` SÍ tiene un fix ya commiteado (`82f232b`):
`ScrollTrigger.refresh()` tras montar Lenis, para recalcular posiciones
de pin una vez el scroll suave está activo (los efectos de hijo corren
antes que los del padre, así que `ProductReveal` crea su pin antes de que
`LenisProvider` termine de montarse).

## Duda abierta — candidata más fuerte para la próxima ronda

**Sospecha sin confirmar**: que el navegador del usuario lleva varias
rondas evaluando `isMobile = true` porque `window.innerWidth` nunca
volvió a confirmarse por encima de `mobileBreakpoint` (768px) tras
ajustes de DevTools/zoom — lo cual explicaría *completamente* el "gira
apenas unos grados" sin que ninguna de las hipótesis de arriba tenga
nada que ver: con `isMobile = true`, `fromDeg/toDeg` salen `[0, 15]` en
vez de `[0, 30]`, simplemente porque se está tomando la rama de móvil,
no porque el tween esté mal.

## Siguiente paso al retomar (literal, lo primero que hay que mirar)

1. Reload completo de `http://localhost:3000/product-reveal` con la
   consola abierta (el servidor de dev puede necesitar reinicio — revisar
   qué proceso tiene el puerto 3000 antes de arrancar otro, esta sesión
   acumuló varios procesos huérfanos de `next dev` a lo largo de las
   rondas).
2. Leer **una sola línea**: `[ProductReveal debug] tween target values
   (one-time):` — trae `windowInnerWidth`, `mobileBreakpointUsed`,
   `isMobile`, `fromDeg`, `toDeg` juntos. Esto resuelve la duda abierta
   antes que ninguna otra cosa:
   - Si `windowInnerWidth < 768` → la causa es el viewport/DevTools, no
     el componente. Ensanchar la ventana (o cerrar/desacoplar DevTools) y
     repetir la prueba visual antes de tocar nada más.
   - Si `windowInnerWidth >= 768` y aun así `isMobile: true` o
     `fromDeg/toDeg` no son `[0, 30]` → eso sí sería un bug real en la
     lógica de `ProductReveal`, a investigar desde cero.
3. Solo después de descartar eso: retomar la verificación visual de las
   hipótesis de `scrub`/`perspective`/`backface-visibility` pendientes,
   y decidir si se confirman (documentar como fix real, commit propio,
   igual que `rotationRange`/`pinDuration`) o se revierten.
4. Una vez cerrado todo lo anterior: limpiar toda la instrumentación
   temporal (`console.log`, `markers: true`, contador de renders) antes
   del commit final de esta ronda de debugging — nada de eso debe llegar
   a la versión "limpia" del componente.
