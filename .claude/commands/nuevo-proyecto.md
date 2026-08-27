---
description: Pipeline completo para arrancar un proyecto de cliente nuevo — Creative Director, Design Agent, Motion Agent, (3D/Media Agent si aplica), Frontend Agent, Performance Agent y QA/Art Critic, en orden estricto y bloqueante, terminando en revisión del usuario.
---

# /nuevo-proyecto

Ejecuta el pipeline completo de creación de una web cinematográfica para un
proyecto de cliente. Se invoca dentro de la carpeta del proyecto (que debe
contener, o recibir en este momento, el brief del cliente).

**Regla general del pipeline**: cada paso es bloqueante. Ningún paso
siguiente arranca sin que el paso anterior haya entregado su output
completo. Si un paso falla o queda incompleto, el pipeline se detiene ahí
y se reporta al usuario — no se salta ni se rellena con suposiciones.

## Pasos

1. **Creative Director** (skill `creative-director`)
   - Si no hay brief en la carpeta del proyecto, pedirlo antes de seguir.
   - Interpreta el brief, define dirección artística de alto nivel, divide
     la web en escenas, y decide qué agentes de este pipeline son
     necesarios para este proyecto en concreto (p. ej. si no hace falta
     3D, se marca como "no aplica" y el paso 4 se salta más adelante).
   - Presenta su interpretación al usuario para confirmar antes de seguir
     — no avanza si el usuario no ha validado el encuadre del proyecto.

2. **Design Agent** (skill `design-agent`)
   - Input: output del paso 1.
   - Genera el Design Bible del proyecto y, como parte del mismo trabajo,
     añade a `reference-library/` cualquier referencia de sector relevante
     que haya investigado.

3. **Motion Agent** (skill `motion-agent`)
   - Input: Design Bible del paso 2.
   - Genera el Motion Bible del proyecto, apoyado en `motion-recipes/`.

4. **3D Agent / Media Agent** (skills `3d-agent`, `media-agent`) — condicional
   - Solo si el Creative Director (paso 1) o el Motion Bible (paso 3)
     señalan escenas que los requieren. Si ninguna escena lo requiere,
     este paso se omite explícitamente (se registra que se omitió y por
     qué, no se ignora en silencio).

5. **Frontend Agent** (skill `frontend-agent`)
   - Input: Design Bible + Motion Bible + entregables de 3D/Media Agent si
     los hubo.
   - Implementa sobre la plantilla base y `component-library/`.
   - Despliega a sandbox/staging. Nunca a producción.

6. **Performance Agent** (skill `performance-agent`)
   - Input: URL del sandbox del paso 5.
   - Audita y corrige. Si tras corregir sigue por debajo del umbral y la
     causa es de diseño/motion, se devuelve al paso 2 o 3 correspondiente
     en vez de forzar una solución fuera de su responsabilidad.

7. **QA / Art Critic** (skill `qa-art-critic`)
   - Input: sandbox ya optimizado + Design Bible + Motion Bible.
   - Genera informe de calidad con puntuación. Si encuentra problemas de
     severidad alta, se devuelve al agente responsable (paso 2, 3 o 5) y
     se repite desde ahí — no se avanza al paso 8 con problemas abiertos
     de severidad alta sin que el usuario lo sepa.

8. **Presentación al usuario**
   - Resume: Design Bible, Motion Bible, informe de Performance, informe
     de QA/Art Critic, y la URL del sandbox.
   - Pide aprobación explícita del usuario.
   - Este comando **no** hace merge a `main` ni despliega a producción en
     ningún caso — eso queda siempre a decisión y ejecución manual del
     usuario, incluso tras la aprobación.
