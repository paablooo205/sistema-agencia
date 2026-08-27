# CONTEXTO.md — Estado del Cinematic Web Engine

Última actualización: 2026-08-27, fin de la sesión de montaje de
infraestructura. Este archivo existe para que una sesión de Claude Code
nueva pueda leerlo y retomar exactamente donde lo dejamos, sin tener que
reconstruir el hilo de decisiones desde cero.

**Si estás retomando esto**: lee este archivo entero antes de tocar nada.
La sección "Siguiente paso" al final es literalmente lo próximo a hacer.

## Qué es esto

Cinematic Web Engine: sistema de agentes especializados (vía Claude Code)
para construir webs cinematográficas/inmersivas (Next.js, GSAP,
ScrollTrigger, Lenis, Three.js/R3F cuando aplique) a partir de un brief en
lenguaje natural. El usuario actúa como director creativo, no como
programador. Visión completa y spec original de agentes en
`docs/cinematic-web-engine-vision.md` y `docs/spec-sistema-agentes.md`.

Esta sesión (y las que la precedieron sobre este tema) **no construyen la
web de ningún cliente** — solo el motor/infraestructura compartida.

## Qué está construido y funcionando

### 1. `_sistema/` (esta carpeta) — repo git local, 5 commits

```
_sistema/
├── CLAUDE.md                          ← reglas globales (stack, SEO, anti-AI-slop, gobernanza)
├── CONTEXTO.md                        ← este archivo
├── docs/
│   ├── cinematic-web-engine-vision.md
│   ├── spec-sistema-agentes.md
│   └── superpowers/specs/
│       └── 2026-08-27-component-library-design.md   ← spec aprobado, ver sección "A medias"
├── component-library/README.md        ← solo documentación todavía, sin código (ver "A medias")
├── motion-recipes/README.md           ← solo documentación todavía, sin recetas escritas
└── reference-library/README.md        ← solo documentación todavía, vacía de contenido
```

### 2. Plugin `cinematic-web-engine` — `~/.claude/skills/cinematic-web-engine/`

**Esto NO está dentro de `_sistema/` ni bajo git** — vive en la carpeta de
skills de usuario de Claude Code, fuera de cualquier proyecto, para estar
disponible en cualquier carpeta de cliente que se abra en este ordenador.

```
cinematic-web-engine/
├── .claude-plugin/plugin.json
└── skills/
    ├── creative-director/SKILL.md
    ├── design-agent/SKILL.md
    ├── motion-agent/SKILL.md
    ├── 3d-agent/SKILL.md
    ├── media-agent/SKILL.md
    ├── frontend-agent/SKILL.md
    ├── performance-agent/SKILL.md
    ├── qa-art-critic/SKILL.md
    └── nuevo-proyecto/SKILL.md        ← disable-model-invocation: true (solo invocación explícita)
```

**Verificado funcionando de extremo a extremo** en `_test-cliente/`
(carpeta vacía creada como sandbox de pruebas, hermana de `_sistema/` y
`plantilla_base/` dentro de `Proyectos/`): la skill se invocó como
`/cinematic-web-engine:nuevo-proyecto`, Creative Director leyó el brief,
interpretó el encuadre y **se detuvo a pedir confirmación** antes de pasar
a Design Agent — exactamente la disciplina de bloqueo por pasos que pedía
el diseño original. El brief de prueba (cafetería) se descartó, no se
llegó a confirmar el encuadre ni a invocar Design Agent.

### 3. Variable de entorno `CINEMATIC_ENGINE_HOME`

Fijada a nivel de usuario en Windows (`[Environment]::SetEnvironmentVariable`,
scope `User`) apuntando a la ruta absoluta de `_sistema/`. Las 9 skills del
plugin la usan para resolver `component-library/`, `motion-recipes/`,
`reference-library/` y `CLAUDE.md` desde cualquier carpeta de cliente.
**Confirmado que funciona** tras cerrar y reabrir VSCode del todo (abrir
solo una terminal nueva dentro de la misma ventana de VSCode NO basta,
porque el proceso padre ya tenía el entorno cacheado desde antes del
`setx`).

## Decisiones tomadas y por qué

- **Env var, no ruta absoluta hardcodeada**, para referenciar
  `component-library/`, `motion-recipes/`, `reference-library/` y
  `CLAUDE.md` desde el plugin. Motivo: portabilidad — el plugin no debería
  llevar cosido el path de un usuario concreto.
- **`.claude/skills/<nombre>/` vía `claude plugin init`**, no un plugin de
  marketplace. `claude plugin init` escanea directamente en
  `~/.claude/skills/<nombre>/`, que se auto-carga como
  `<nombre>@skills-dir` en cualquier sesión futura — soluciona "instalar a
  nivel de usuario" sin pasos extra de `claude plugin install`.
- **`skills/`, no `commands/`, para `nuevo-proyecto`**. Descubrimos
  (contrastado contra la documentación oficial, no supuesto) que dentro de
  un plugin `commands/` es solo el formato legado de definir skills como
  archivo plano — la doc recomienda explícitamente `skills/` para plugins
  nuevos. Todo son skills; no hay un mecanismo de "slash command" distinto
  dentro de un plugin.
- **Invocación real: `/cinematic-web-engine:nuevo-proyecto`**, no
  `/nuevo-proyecto` a secas. El namespacing por nombre de plugin es
  obligatorio en el sistema de plugins, no es una elección nuestra.
- **`disable-model-invocation: true` en `nuevo-proyecto`**. Sin esto, al
  ser una skill normal, Claude podría disparar el pipeline completo de 8
  agentes solo por inferencia de contexto (p. ej. el usuario mencionando
  un brief), sin invocación explícita. El resto de skills del pipeline sí
  son model-invocable (así los pasos internos del pipeline las pueden
  encadenar).
- **`design-agent` posee `reference-library/`** (input y output, no solo
  consulta) — decisión explícita del usuario: investigar referencias de
  sector es parte del trabajo de Design Agent, no de un agente aparte.
- **Sin agentes de fase posterior** (Auditor RLS, Performance de
  infraestructura, Triage/SEO/A-B/BI) — se omiten del todo, sin carpetas
  placeholder, porque dependen de clientes reales/infraestructura que no
  existe todavía (Supabase, Vercel).
- **`plantilla_base/` NO es la plantilla del Cinematic Web Engine** —
  descubrimos que es un proyecto ya existente sin relación
  (`handball-club-pwa`: Vite + React 19 + Supabase + react-router, para un
  club de balonmano). La skill `frontend-agent` menciona "plantilla base
  del sistema" de forma genérica; a día de hoy **no existe ninguna
  plantilla Next.js/GSAP/Lenis real en `Proyectos/`** — ver "A medias".
- **`component-library/` será en sí misma una app Next.js** (no un paquete
  separado de una plantilla aparte), decidido explícitamente por el
  usuario para no duplicar esfuerzo montando dos proyectos Next.js sin
  tener aún un cliente real que lo justifique. Ver spec para el detalle.
- **Alcance de la primera pasada de componentes: solo 3** —
  `CinematicScene`, `ParallaxImage`, `TextReveal` — de los 15 previstos en
  el README, elegidos por cubrir los patrones más comunes sin
  sobre-invertir antes de validar el setup contra un cliente real.
- **Sin shadcn/ui todavía** en `component-library/`: el `CLAUDE.md` lo
  reserva para componentes UI no cinematográficos; ninguno de los 3
  primeros lo necesita.
- **`TextReveal` sin el plugin `SplitText` de GSAP** (que requiere licencia
  Club GreenSock) — se divide el texto en spans a mano para no introducir
  una dependencia de pago.
- **Sin tests automatizados en la primera pasada de componentes** (YAGNI)
  — verificación manual en navegador (`npm run dev` + mirar cada demo
  page) porque no hay lógica compleja más allá de props → comportamiento
  visual.

## A medias (lo importante)

**`component-library/` sigue siendo solo un README.** El spec de diseño
para la primera pasada (3 componentes + 2 motion-recipes) está **escrito,
autorrevisado y aprobado por el usuario en chat**, en
`docs/superpowers/specs/2026-08-27-component-library-design.md` — pero
**no se ha escrito ni una línea de código todavía**. No existe
`package.json`, no hay proyecto Next.js scaffolded, no hay componentes
`.tsx`, no hay recetas en `motion-recipes/`.

`_test-cliente/` está vacía y limpia (el brief de prueba de la cafetería
no dejó rastro) — lista para usarse de nuevo cuando haya un
`component-library/` real que probar desde un proyecto de cliente.

## Siguiente paso (literal, lo próximo a hacer)

Seguíamos el proceso arquitectónico completo de la skill de brainstorming
(`superpowers:brainstorming`), que para este spec exige:

1. ~~Diseño presentado y aprobado en chat~~ ✔ hecho
2. ~~Spec escrito, autorrevisado y commiteado~~ ✔ hecho
   (`docs/superpowers/specs/2026-08-27-component-library-design.md`,
   commit `e0cd917`)
3. **Pendiente**: el usuario revisa el spec escrito (se le pidió
   explícitamente, no ha respondido todavía cuando se escribió este
   CONTEXTO.md)
4. **Siguiente acción de Claude**: en cuanto el usuario confirme el spec
   (o pida cambios y se re-revise), invocar la skill
   `superpowers:writing-plans` para generar el plan de implementación —
   **no** implementar directamente sin pasar por ese plan, es la regla
   dura de la skill de brainstorming para el camino arquitectónico.
5. Tras el plan: implementar (scaffold Next.js en `component-library/`,
   los 3 componentes, el `LenisProvider`, las 3 demo pages, actualizar
   `component-library/README.md`, escribir `parallax.md` y
   `text-reveal.md` en `motion-recipes/`), verificar con `npm run dev` en
   el navegador, commitear.
6. Después de eso: el usuario quiere ver un ejemplo real (un proyecto de
   cliente de prueba usando `/cinematic-web-engine:nuevo-proyecto` de
   verdad) — sus palabras fueron "cuando esté todo veremos un ejemplo".
