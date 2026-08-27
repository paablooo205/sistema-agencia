# Cinematic Web Engine — Visión del sistema

Quiero construir un sistema especializado para crear webs profesionales, inmersivas y cinematográficas mediante Claude Code.

El objetivo es que, en el futuro, yo pueda describir en lenguaje natural la web que quiero y el sistema sea capaz de diseñar, desarrollar, animar, revisar y pulir la web utilizando una arquitectura de agentes especializados.

## Objetivo principal

Crear un Cinematic Web Engine basado en:

- Next.js
- React
- TypeScript
- GSAP
- GSAP ScrollTrigger
- Lenis
- Three.js / React Three Fiber cuando sea necesario
- Canvas / WebGL cuando sea necesario

Claude Code será el principal desarrollador del sistema. Yo actuaré principalmente como director creativo y supervisor, no como programador.

## Concepto

El sistema debe funcionar como una pequeña agencia digital especializada.

Yo doy un brief como:

"Quiero una web para una marca de automóviles eléctricos. Oscura, premium, minimalista y cinematográfica. Quiero que el coche aparezca progresivamente durante el scroll, que haya una escena fijada donde rote y que después la página continúe hacia una galería horizontal."

El sistema debe:

1. Analizar el brief.
2. Definir una dirección artística.
3. Dividir la web en escenas.
4. Diseñar el comportamiento de cada escena.
5. Seleccionar las técnicas y componentes adecuados.
6. Implementar la web.
7. Revisar visualmente el resultado.
8. Revisar responsive y performance.
9. Corregir problemas.
10. Entregar una web terminada y profesional.

## Arquitectura de agentes

No quiero un único agente enorme que tenga que saberlo todo. Quiero varios agentes especializados y coordinados por un Orchestrator / Creative Director.

### 1. Creative Director / Orchestrator

Responsable de coordinar todo el proyecto. Debe: interpretar el brief, definir la dirección artística, dividir la página en escenas, decidir qué agentes son necesarios, coordinar el trabajo, mantener la coherencia global, revisar resultados, solicitar correcciones. No debería encargarse de escribir grandes cantidades de código.

### 2. Design Agent

Especialista en: dirección artística, composición, layout, grids, tipografía, color, spacing, jerarquía visual, diseño editorial, luxury design, minimalismo, brutalismo, diseño experimental, responsive design. Debe generar un Design Bible para cada proyecto.

### 3. Motion Agent

Especialista en: GSAP, ScrollTrigger, Lenis, scroll-driven animation, scrub, pin, parallax, timelines, clip-path, typography animation, image animation, transitions, horizontal scrolling. Debe generar un Motion Bible y utilizar recetas de animación reutilizables.

### 4. 3D Agent

Especialista en: Three.js, React Three Fiber, WebGL, shaders, cámaras, iluminación, partículas, modelos 3D, postprocessing, optimización 3D. Solo debe utilizarse cuando el proyecto realmente lo necesite.

### 5. Media Agent

Especialista en: imágenes, vídeo, Canvas, image sequences, video scrubbing, optimización de assets, formatos, compresión, responsive images, lazy loading.

### 6. Frontend Agent

Responsable de construir la aplicación. Especialista en: Next.js, React, TypeScript, CSS, componentes, arquitectura frontend, accesibilidad, integración de las escenas y animaciones.

### 7. Performance Agent

Debe revisar: FPS, bundle size, imágenes, vídeos, WebGL, memoria, LCP, CLS, INP, rendimiento móvil, carga inicial, coste de las animaciones. Debe proponer y realizar optimizaciones.

### 8. QA / Art Critic Agent

Debe ser extremadamente crítico. No debe asumir que el resultado es bueno. Debe revisar: calidad visual, composición, jerarquía, tipografía, ritmo, coherencia, animaciones, responsive, accesibilidad, posibles errores, sensación de "AI slop". Debe generar un informe con problemas y puntuaciones y solicitar correcciones cuando sea necesario.

## Flujo de trabajo

```
USER BRIEF
    ↓
CREATIVE DIRECTOR
    ↓
DESIGN AGENT
    ↓
MOTION AGENT
    ↓
3D / MEDIA AGENTS (si son necesarios)
    ↓
FRONTEND AGENT
    ↓
PERFORMANCE AGENT
    ↓
QA / ART CRITIC
    ↓
CORRECTIONS
    ↓
FINAL POLISH
    ↓
FINAL WEBSITE
```

No quiero que Claude empiece directamente a programar después de recibir un brief. Primero debe existir un plan.

## Sistema de componentes

Biblioteca reutilizable de componentes cinematográficos: CinematicScene, PinnedScene, ParallaxImage, ScrollImage, ScrollText, TextReveal, TextMask, HorizontalGallery, VideoScrub, ImageSequence, ProductReveal, ClipPathReveal, PageTransition, ThreeScene, ParticleScene.

Estos componentes deben estar construidos y probados antes de reutilizarlos. Filosofía: componentes fiables + libertad creativa. No quiero que Claude tenga que reinventar cada animación desde cero.

## Motion Recipe Library

Biblioteca de recetas reutilizables: image-zoom, image-pan, image-reveal, parallax, pinned-scene, horizontal-scroll, text-split, text-mask, clip-path-reveal, video-scrub, image-sequence, product-rotation, 3d-camera, 3d-object, particles, page-transition.

Cada receta debe documentar: propósito, cuándo utilizarla, cuándo NO utilizarla, implementación, parámetros, rendimiento, comportamiento móvil.

## Reference Library

Biblioteca de referencias visuales y técnicas, clasificadas por: estilo, industria, composición, tipo de scroll, tipo de animación, 3D, tipografía, transición, storytelling.

Ejemplo:

**Luxury Product Reveal**
- Style: Luxury / Editorial
- Motion: Pinned product, slow zoom, typography reveal
- Useful for: Automotive, Fashion, Jewelry, Technology

Las referencias deben ayudar a Claude a comprender cómo y cuándo utilizar determinados patrones.

## Skills

Inicialmente: cinematic-design, scroll-storytelling, gsap, scrolltrigger, lenis, threejs, webgl, typography-motion, responsive-motion, media-animation, performance, quality-control, anti-ai-slop.

Cada skill debe contener instrucciones prácticas y criterios claros.

## Design Bible

Cada proyecto debe generar un documento que defina: dirección artística, estética, paleta, tipografía, grid, spacing, composición, ritmo visual, comportamiento responsive, escenas, referencias.

## Motion Bible

Cada proyecto debe definir: escenas, duración de cada escena, elementos fijados, comportamiento del scroll, timelines, animaciones, transiciones, velocidades, easing, interacción entre escenas, comportamiento móvil.

## Anti-AI-Slop

El sistema debe evitar automáticamente: gradientes genéricos, glassmorphism innecesario, exceso de cards, exceso de border-radius, animaciones aleatorias, fade-ins genéricos en todas las secciones, diseños SaaS genéricos, exceso de efectos, animar todo simplemente porque se puede, usar Three.js cuando no aporta valor.

Las animaciones deben tener intención narrativa y relación con el contenido.

## Filosofía de diseño

La prioridad no es "hacer una web con muchas animaciones". La prioridad es crear una experiencia visual coherente en la que el scroll sea parte del storytelling.

La web debe sentirse como una experiencia cinematográfica, no como una landing convencional con animaciones añadidas.

Debe existir: ritmo, anticipación, transición, pausa, escala, profundidad, jerarquía, narrativa visual.

## Filosofía técnica

Priorizar: rendimiento, accesibilidad, responsive real, código mantenible, componentes reutilizables, separación de responsabilidades, animaciones GPU-friendly, transform y opacity cuando sea posible, lazy loading, optimización de imágenes y vídeo, progressive enhancement.

Desktop y móvil no deben considerarse simplemente la misma web reducida. Las animaciones deben poder tener estrategias diferentes según dispositivo.

## Objetivo final

Llegar a un sistema donde pueda decir:

"Crea una web cinematográfica para una marca de arquitectura japonesa, minimalista, oscura y editorial. Quiero seis escenas, una galería horizontal, una secuencia de imágenes controlada por scroll y una escena 3D final."

Y el sistema sea capaz de: Brief → Creative Direction → Design → Motion Planning → Component Selection → Implementation → Visual QA → Performance QA → Corrections → Final Website.

El sistema debe estar diseñado para que Claude Code construya la mayor parte de la infraestructura, componentes, skills, documentación y código, mientras que el usuario toma las decisiones creativas y valida el resultado.
