# Cinematic Web Engine — Reglas del sistema

Este documento es la fuente de verdad para todos los agentes que trabajan
dentro de este sistema y en cualquier proyecto de cliente que lo use como
motor compartido. Contexto completo de visión y arquitectura en `docs/`.

## Rol de cada parte

- **Tú (usuario)**: director creativo y supervisor. Tomas las decisiones
  creativas y apruebas cada entrega. No programas.
- **Claude Code / agentes**: diseñan, desarrollan, animan, revisan y pulen
  siguiendo el pipeline de `/nuevo-proyecto`. Proponen, nunca deciden solos
  lo que se publica.

## Stack

- Next.js (App Router)
- React + TypeScript (strict)
- Tailwind CSS + shadcn/ui como base de componentes UI no cinematográficos
- GSAP + GSAP ScrollTrigger para animación scroll-driven
- Lenis para smooth scroll
- Three.js / React Three Fiber solo cuando el proyecto lo justifique
- Canvas / WebGL para secuencias de imágenes y efectos que lo requieran

No introducir dependencias fuera de este stack sin que quede justificado en
el Design Bible o Motion Bible del proyecto.

## Reglas de SEO y semántica

- HTML semántico real: `<header>`, `<main>`, `<nav>`, `<section>`,
  `<article>`, `<footer>` — nunca todo en `<div>`.
- Jerarquía de encabezados coherente (un solo `<h1>` por página, sin saltar
  niveles).
- Metadatos (`title`, `description`, Open Graph) definidos por página, nunca
  genéricos ni copiados entre clientes.
- `alt` text descriptivo y real en toda imagen con contenido informativo;
  `alt=""` explícito en imágenes puramente decorativas.
- Contenido crítico para SEO no debe depender solo de animaciones JS para
  aparecer en el DOM (evitar que el texto principal solo exista tras una
  animación de scroll que un crawler no ejecuta).

## Anti-AI-slop

Evitar por defecto, salvo que el Design Bible lo pida explícitamente y
justifique por qué encaja con la marca:

- Gradientes genéricos de fondo (morado-azul, "SaaS gradient mesh").
- Glassmorphism innecesario (blur + transparencia sin motivo funcional).
- Exceso de cards para todo (usar composición editorial, no "todo en tarjetas").
- Exceso de `border-radius` uniforme aplicado a todo por defecto.
- Fade-ins genéricos repetidos en cada sección sin relación con el contenido.
- Layouts de landing SaaS genérica (hero centrado + 3 cards + logos + CTA).
- Animar un elemento simplemente porque técnicamente se puede.
- Usar Three.js/WebGL cuando no aporta valor narrativo o de marca.

## Filosofía de scroll y animación

El scroll es una herramienta narrativa, no un efecto decorativo. Cada
animación debe poder responder a: ¿qué está contando esta transición sobre
el contenido o la marca? Si la respuesta es "nada, solo se mueve", no se
implementa.

Debe existir intención: ritmo, anticipación, transición, pausa, escala,
profundidad, jerarquía. Ver `docs/cinematic-web-engine-vision.md` para el
detalle completo de esta filosofía.

## Gobernanza y permisos

- Ningún agente automático hace **merge a `main`** ni **despliega a
  producción**. Todo agente propone (rama, informe, borrador); la
  aprobación y el merge/deploy los da siempre una persona.
- El Creador/Frontend Agent trabaja en su propia rama o sandbox, nunca
  directo sobre `main`.
- Cambios de esquema de datos o de aislamiento entre tenants requieren el
  visto bueno del Auditor RLS antes de considerarse mergeables (cuando ese
  agente exista en el proyecto — ver `docs/spec-sistema-agentes.md`, fase
  posterior).

## Pipeline de proyecto

El punto de entrada para un proyecto de cliente nuevo es la skill
`/cinematic-web-engine:nuevo-proyecto` (invocación explícita — no se
dispara sola por contexto). Las 8 skills de agente y esta skill de
pipeline viven en el plugin `cinematic-web-engine`
(`~/.claude/skills/cinematic-web-engine/`), no en esta carpeta — están
disponibles en cualquier proyecto abierto en este ordenador. Ningún paso
del pipeline avanza al siguiente sin que el paso anterior esté resuelto y
haya dejado su output documentado.

Ese plugin depende de la variable de entorno `CINEMATIC_ENGINE_HOME`
apuntando a esta carpeta (`_sistema/`), para poder leer este `CLAUDE.md`
y las tres bibliotecas de abajo desde cualquier carpeta de cliente.

## Documentos de referencia

- `docs/cinematic-web-engine-vision.md` — visión completa del sistema,
  filosofía de diseño y técnica.
- `docs/spec-sistema-agentes.md` — especificación de agentes, inputs,
  outputs, permisos y coordinación.
- `component-library/README.md` — biblioteca de componentes cinematográficos.
- `motion-recipes/README.md` — biblioteca de recetas de animación.
- `reference-library/README.md` — biblioteca de referencias visuales/técnicas.
