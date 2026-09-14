# Component Library Monorepo Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `_sistema/` en un monorepo con npm workspaces, moviendo `component-library/` a `packages/component-library/` como paquete real e instalable, y `clientes/` a `apps/clientes/`, sin romper el historial de git ni las skills del plugin `cinematic-web-engine` que dependen de `$CINEMATIC_ENGINE_HOME/component-library/`.

**Architecture:** `_sistema/` gana un `package.json` raíz con `"workspaces": ["packages/*", "apps/clientes/*"]`. `packages/component-library/` sigue siendo la misma app Next.js de siempre (showcase con sus 7 demo pages intacto) pero además expone un barrel `src/index.ts` y un campo `exports` en su `package.json`, de modo que cualquier paquete del workspace puede hacer `import { X } from "@sistema/component-library"`. `motion-recipes/` y `reference-library/` NO se mueven — no son paquetes de código, son documentación consultada por los agentes vía ruta de archivo, y moverlas no resuelve nada del ADR.

**Tech Stack:** npm workspaces (decisión ya tomada — no pnpm/yarn), Next.js App Router + TypeScript strict (`moduleResolution: "bundler"`, ya configurado así en `component-library/tsconfig.json`, compatible con resolución vía `exports`).

**Spec:** `docs/superpowers/decisions/2026-08-30-component-library-distribution-gap.md` (el ADR que esta migración resuelve — Tarea 10 lo actualiza).

## Global Constraints

- No renombrar ni reescribir el `ProductReveal.tsx`/`Product3DCloseout.tsx`/etc. — cero cambios funcionales a los componentes, solo dónde viven y cómo se exportan.
- Todo movimiento de carpeta con `git mv`, nunca borrar+recrear — cada `git mv` va en su propio commit, sin mezclar con otros cambios, para que git detecte el rename al 100% de similitud.
- `motion-recipes/`, `reference-library/`, `CLAUDE.md`, `CONTEXTO.md`, `docs/` se quedan en la raíz de `_sistema/` — no son parte de este movimiento.
- Ningún agente hace merge a `main` (regla de `CLAUDE.md`) — este plan termina en una rama propia con un PR abierto, no con un merge.
- Trabajo reversible en cada paso: si algo falla a mitad, `git log` debe permitir identificar exactamente qué commit revertir sin perder los demás.

---

### Task 0: Rama de trabajo dedicada

Esta es una reestructuración de carpetas que rompe temporalmente las rutas que usan las 8 skills del plugin (`$CINEMATIC_ENGINE_HOME/component-library/`) hasta la Tarea 9. Aislarla en su propia rama evita que `master` quede en un estado roto a mitad de la migración, y da un PR limpio para que la apruebes tú.

**Files:** ninguno — solo git.

- [ ] **Step 1: Confirmar árbol de trabajo limpio**

```bash
git status --short
```

Expected: sin salida, o solo `clientes/` si aún no se ha creado nada ahí (ver Tarea 0.5). Si hay cambios sin commitear de otra tarea, parar y resolver antes de continuar.

- [ ] **Step 2: Crear la rama**

```bash
git checkout -b refactor/component-library-monorepo
```

Expected: `Switched to a new branch 'refactor/component-library-monorepo'`.

---

### Task 1: `package.json` raíz con workspaces

**Files:**
- Create: `package.json` (raíz de `_sistema/`)
- Modify: `.gitignore` (raíz) — añadir `/node_modules` (hoy no ignora nada a nivel raíz; una vez haya workspaces, `npm install` crea `node_modules/` en la raíz con los symlinks de los paquetes)

**Interfaces:**
- Produces: el nombre del workspace root (`"sistema"`), usado solo internamente por npm — ningún paquete importa desde él.

- [ ] **Step 1: Crear `package.json` en la raíz**

```json
{
  "name": "sistema",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/clientes/*"
  ]
}
```

Nota: `apps/clientes/*` no dará error aunque `apps/clientes/_prueba-1/` no tenga su propio `package.json` (solo tiene `design-bible.md` y `motion-bible.md`) — npm workspaces ignora silenciosamente las carpetas sin `package.json` dentro de un patrón glob, no falla el install.

- [ ] **Step 2: Añadir `/node_modules` a `.gitignore` raíz**

Editar `.gitignore` (raíz), añadiendo al final:

```
node_modules/
```

- [ ] **Step 3: Crear `README.md` en la raíz, documentando el flujo de instalación único**

**Files:**
- Create: `README.md` (raíz de `_sistema/`)

No existía README en la raíz hasta ahora (el único `README.md` del repo era el de `component-library/`, ahora `packages/component-library/README.md`). Contenido:

```markdown
# _sistema — Cinematic Web Engine (monorepo)

Monorepo con npm workspaces. Contiene el motor compartido
(`packages/component-library/`) y los proyectos de cliente
(`apps/clientes/<nombre>/`) que lo consumen.

## Instalación

Un único comando, ejecutado **desde la raíz** de `_sistema/`:

```bash
npm install
```

Esto instala las dependencias de **todos** los workspaces a la vez —
`packages/component-library/` y cualquier app dentro de
`apps/clientes/<nombre>/` que tenga su propio `package.json` — en un
único `node_modules/` en la raíz (con symlinks internos por paquete) y
un único `package-lock.json`, también en la raíz.

**No ejecutar `npm install` dentro de una subcarpeta** (ej.
`cd packages/component-library && npm install`). Crearía un
`node_modules/` y un `package-lock.json` propios de esa subcarpeta,
duplicados y potencialmente desincronizados del lockfile raíz — rompe
la deduplicación que da sentido al workspace. Si ves un
`package-lock.json` o un `node_modules/` dentro de `packages/*` o
`apps/clientes/*/`, es una señal de que esto pasó por error.

## Comandos por workspace

Desde la raíz, dirigidos con `--workspace` (o `-w`):

```bash
npm run dev --workspace=@sistema/component-library
npm run build --workspace=@sistema/component-library
npm install <paquete> --workspace=@sistema/component-library
```

O, igual de válido, entrando a la carpeta del paquete y ejecutando el
script normal (`cd packages/component-library && npm run dev`) — la
única operación que nunca debe hacerse desde dentro de una subcarpeta
es `npm install` sin flags, por la razón de arriba.
```

- [ ] **Step 4: Commit**

```bash
git add package.json .gitignore README.md
git commit -m "Add root package.json with npm workspaces (packages/*, apps/clientes/*)"
```

---

### Task 2: Mover `component-library/` → `packages/component-library/`

**Files:**
- Move (git mv): `component-library/` → `packages/component-library/` (todo el árbol, tal cual — sin tocar ni un archivo dentro en este mismo commit)

- [ ] **Step 1: Crear la carpeta padre `packages/`**

No hace falta crearla a mano — `git mv` la crea al vuelo si el destino no existe.

- [ ] **Step 2: Mover con git mv**

```bash
git mv component-library packages/component-library
```

Expected: sin error. `git status` debe mostrar cada archivo como renombrado (`R`), no como borrado+añadido.

- [ ] **Step 3: Verificar que git detectó el rename al 100%**

```bash
git status --short | head -5
git diff --cached --stat | tail -3
```

Expected: las líneas empiezan con `R  component-library/... -> packages/component-library/...`. El `--stat` no debe mostrar inserciones/borrados de contenido, solo el resumen de renombrados.

- [ ] **Step 4: Commit — solo el movimiento, nada más**

```bash
git commit -m "Move component-library/ to packages/component-library/ for npm workspaces"
```

- [ ] **Step 5: Confirmar que el historial sigue siendo trazable**

```bash
git log --follow --oneline -- packages/component-library/src/components/cinematic/ProductReveal.tsx | head -5
```

Expected: aparecen los commits antiguos de `ProductReveal.tsx` (p. ej. `5c03110`, `f4f85e7`, `09591c9`...) con la ruta nueva — confirma que `--follow` atraviesa el rename.

---

### Task 3: Mover `clientes/` → `apps/clientes/`

El plan del usuario nombra `apps/clientes/` como destino explícito — `clientes/_prueba-1/` (hoy solo `design-bible.md` y `motion-bible.md`, sin código) se mueve con el mismo criterio de la Tarea 2.

**Files:**
- Move (git mv): `clientes/` → `apps/clientes/`

- [ ] **Step 1: Mover con git mv**

```bash
git mv clientes apps/clientes
```

- [ ] **Step 2: Verificar rename**

```bash
git status --short
```

Expected: `R  clientes/_prueba-1/design-bible.md -> apps/clientes/_prueba-1/design-bible.md` y lo mismo para `motion-bible.md`.

- [ ] **Step 3: Commit**

```bash
git commit -m "Move clientes/ to apps/clientes/ for npm workspaces"
```

---

### Task 4: `packages/component-library/package.json` — nombre y exports

**Files:**
- Modify: `packages/component-library/package.json`
- Delete: `packages/component-library/package-lock.json` (queda obsoleto — con workspaces, el lockfile único vive en la raíz)

**Interfaces:**
- Produces: el specifier `"@sistema/component-library"` que la Tarea 3 (respuesta a la pregunta 3 del usuario) y cualquier app cliente futura usarán como nombre de dependencia.

- [ ] **Step 1: Editar `name`, añadir `main`/`types`/`exports`**

En `packages/component-library/package.json`, cambiar:

```json
{
  "name": "component-library",
```

por:

```json
{
  "name": "@sistema/component-library",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
```

El resto del archivo (`version`, `private`, `scripts`, `dependencies`, `devDependencies`) no cambia. `private: true` se queda — no bloquea el consumo dentro del workspace, solo impide un `npm publish` accidental al registro público.

- [ ] **Step 2: Borrar el lockfile anidado, ya redundante**

```bash
git rm packages/component-library/package-lock.json
```

(Se regenera un único lockfile en la raíz en la Tarea 6.)

- [ ] **Step 3: Commit**

```bash
git add packages/component-library/package.json
git commit -m "Rename component-library package to @sistema/component-library, add exports"
```

---

### Task 5: Barrel `src/index.ts` — qué exporta realmente el paquete

Hoy no existe ningún archivo que reexporte los 7 componentes juntos — cada uno se importa por su ruta interna. El barrel es lo que hace posible `import { TextReveal } from "@sistema/component-library"` en vez de conocer la ruta de archivo interna del paquete.

**Files:**
- Create: `packages/component-library/src/index.ts`

**Interfaces:**
- Consumes: los `export function`/`export interface`/`export type` ya existentes en cada componente (verificados en disco, no inventados):
  - `ProductReveal.tsx`: `ProductReveal`, `ProductRevealProps`, `ProductRevealMode`
  - `Product3DCloseout.tsx`: `Product3DCloseout`, `Product3DCloseoutProps`, `Product3DCloseoutMaterialOverride`, `Product3DCloseoutLink`
  - `CinematicScene.tsx`: `CinematicScene`, `CinematicSceneProps`, `CinematicSceneTag`, `CinematicSceneEnter`
  - `ParallaxImage.tsx`: `ParallaxImage`, `ParallaxImageProps`
  - `TextReveal.tsx`: `TextReveal`, `TextRevealProps`, `TextRevealTag`
  - `ImageSequence.tsx`: `ImageSequence`, `ImageSequenceProps`
  - `BrandReveal.tsx`: `BrandReveal`, `BrandRevealProps`, `BrandRevealTag`
- Produces: el punto de entrada público único del paquete.

- [ ] **Step 1: Escribir el barrel**

```typescript
export { ProductReveal } from "./components/cinematic/ProductReveal";
export type {
  ProductRevealProps,
  ProductRevealMode,
} from "./components/cinematic/ProductReveal";

export { Product3DCloseout } from "./components/cinematic/Product3DCloseout";
export type {
  Product3DCloseoutProps,
  Product3DCloseoutMaterialOverride,
  Product3DCloseoutLink,
} from "./components/cinematic/Product3DCloseout";

export { CinematicScene } from "./components/cinematic/CinematicScene";
export type {
  CinematicSceneProps,
  CinematicSceneTag,
  CinematicSceneEnter,
} from "./components/cinematic/CinematicScene";

export { ParallaxImage } from "./components/cinematic/ParallaxImage";
export type { ParallaxImageProps } from "./components/cinematic/ParallaxImage";

export { TextReveal } from "./components/cinematic/TextReveal";
export type {
  TextRevealProps,
  TextRevealTag,
} from "./components/cinematic/TextReveal";

export { ImageSequence } from "./components/cinematic/ImageSequence";
export type { ImageSequenceProps } from "./components/cinematic/ImageSequence";

export { BrandReveal } from "./components/cinematic/BrandReveal";
export type {
  BrandRevealProps,
  BrandRevealTag,
} from "./components/cinematic/BrandReveal";
```

Nota: incluye `BrandReveal` aunque no estaba en tu lista de verificación de la pregunta 5 — es un componente terminado más (`docs`/README ya lo documentan), y dejarlo fuera del barrel sería una omisión arbitraria. Si prefieres que el barrel solo cubra los 6 que nombraste, dímelo antes de aprobar y se quita esa entrada.

- [ ] **Step 2: Commit**

```bash
git add packages/component-library/src/index.ts
git commit -m "Add barrel export for @sistema/component-library's 7 components"
```

---

### Task 6: Instalar el workspace y verificar el linking

**Files:**
- Create (generado por npm, no a mano): `package-lock.json` (raíz)
- Delete (ya no existe tras la Tarea 2): `packages/component-library/node_modules/` — queda huérfano hasta que se reinstale desde la raíz

- [ ] **Step 1: Borrar node_modules antiguo del paquete (quedó en la ruta vieja, npm lo va a recrear en la raíz)**

En Windows, usar el mismo truco de `robocopy /MIR` que se usó para el worktree si `rm -rf` falla por rutas largas:

```powershell
$target = "packages\component-library\node_modules"
if (Test-Path $target) {
  $empty = New-Item -ItemType Directory -Path "$env:TEMP\empty_$(Get-Random)" -Force
  robocopy $empty.FullName $target /MIR /NFL /NDL /NJH /NJS | Out-Null
  Remove-Item $target -Force -Recurse -ErrorAction SilentlyContinue
  Remove-Item $empty.FullName -Force -Recurse
}
```

- [ ] **Step 2: Instalar desde la raíz**

```bash
npm install
```

Expected: sin errores. Crea `node_modules/` y `package-lock.json` en la raíz, con `node_modules/@sistema/component-library` como symlink a `packages/component-library`.

- [ ] **Step 3: Verificar el symlink del workspace**

```bash
npm ls --workspaces
```

Expected: lista `@sistema/component-library@0.1.0` como workspace reconocido, sin errores de resolución.

```bash
ls -la node_modules/@sistema/ 2>&1
```

Expected (Git Bash): `component-library -> ../../packages/component-library` (o equivalente junction en Windows).

- [ ] **Step 4: Commit el lockfile raíz**

```bash
git add package-lock.json
git commit -m "Generate root package-lock.json for the npm workspace"
```

---

### Task 7: Actualizar `CLAUDE.md` y las 8 skills del plugin

**Por qué es necesario (pregunta 4):** `CINEMATIC_ENGINE_HOME` sigue apuntando exactamente igual a `_sistema/` — eso NO cambia, porque `_sistema/` sigue siendo la carpeta que contiene `CLAUDE.md`, `motion-recipes/`, `reference-library/` (ninguno se movió). Lo que sí rompe es cualquier referencia **literal** a la subruta `component-library/` dentro de esa carpeta, porque ahora vive en `packages/component-library/`. Verificado por grep: 8 archivos de skill (`~/.claude/skills/cinematic-web-engine/skills/*/SKILL.md`) más `CLAUDE.md` en la raíz usan esa subruta literal.

**Files:**
- Modify: `CLAUDE.md` (raíz de `_sistema/`) — línea ~100
- Modify: `C:\Users\X1404\.claude\skills\cinematic-web-engine\skills\nuevo-proyecto\SKILL.md` — línea 82 (descripción) y línea 54 (uso)
- Modify: `C:\Users\X1404\.claude\skills\cinematic-web-engine\skills\design-agent\SKILL.md`
- Modify: `C:\Users\X1404\.claude\skills\cinematic-web-engine\skills\3d-agent\SKILL.md`
- Modify: `C:\Users\X1404\.claude\skills\cinematic-web-engine\skills\frontend-agent\SKILL.md`
- Modify: `C:\Users\X1404\.claude\skills\cinematic-web-engine\skills\media-agent\SKILL.md`

**Nota importante:** estos archivos de skill viven **fuera de este repositorio** (`~/.claude/skills/cinematic-web-engine/` es la caché del plugin, compartida por cualquier proyecto abierto en este ordenador — no está bajo `_sistema/.git`). Editarlos no genera un commit en este repo; es un cambio de sistema, aparte. Este task los edita porque son parte de "que nada quede roto", pero no forman parte del PR de esta migración.

- [ ] **Step 1: `CLAUDE.md` — actualizar la referencia de la tabla de documentos**

Cambiar:
```
- `component-library/README.md` — biblioteca de componentes cinematográficos.
```
por:
```
- `packages/component-library/README.md` — biblioteca de componentes cinematográficos.
```

- [ ] **Step 2: `nuevo-proyecto/SKILL.md` — actualizar la descripción de `CINEMATIC_ENGINE_HOME`**

Cambiar:
```
`CINEMATIC_ENGINE_HOME`, que debe apuntar a la carpeta `_sistema/` del
Cinematic Web Engine (contiene `component-library/`, `motion-recipes/`,
`reference-library/` y `CLAUDE.md`).
```
por:
```
`CINEMATIC_ENGINE_HOME`, que debe apuntar a la carpeta `_sistema/` del
Cinematic Web Engine (contiene `packages/component-library/`,
`motion-recipes/`, `reference-library/` y `CLAUDE.md`).
```

Y en la sección de pipeline (línea 54):
```
   - Implementa sobre la plantilla base y
     `$CINEMATIC_ENGINE_HOME/component-library/`.
```
por:
```
   - Implementa sobre la plantilla base y
     `$CINEMATIC_ENGINE_HOME/packages/component-library/`.
```

- [ ] **Step 3: `design-agent/SKILL.md`, `3d-agent/SKILL.md`, `frontend-agent/SKILL.md`, `media-agent/SKILL.md`**

En cada uno, sustituir toda ocurrencia literal de `$CINEMATIC_ENGINE_HOME/component-library/` por `$CINEMATIC_ENGINE_HOME/packages/component-library/`. Son sustituciones de texto simples, una por archivo (confirmado por grep — cada uno tiene exactamente una ocurrencia de este patrón, salvo `frontend-agent/SKILL.md` que además tiene una mención sin el prefijo `$CINEMATIC_ENGINE_HOME/` en prosa ("No reinventa componentes que ya existen en `component-library/`") — esa mención en prosa no es una ruta literal, se puede dejar igual o actualizar por claridad, a discreción.

- [ ] **Step 4: Verificar que no queda ninguna referencia rota**

```bash
grep -rl '\$CINEMATIC_ENGINE_HOME/component-library' ~/.claude/skills/cinematic-web-engine/ 2>&1
```

Expected: sin resultados (todas ya apuntan a `packages/component-library/`).

- [ ] **Step 5: Commit (solo la parte de este repo — `CLAUDE.md`)**

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md reference doc path after component-library move"
```

---

### Task 8: Verificación end-to-end — pregunta 5

**Files:** ninguno nuevo — solo comandos de verificación.

**Interfaces:**
- Consumes: los 7 componentes exportados en la Tarea 5, las 7 demo pages ya existentes en `packages/component-library/src/app/*/page.tsx` (`product-reveal`, `product-3d-closeout`, `cinematic-scene`, `parallax-image`, `text-reveal`, `brand-reveal`, `image-sequence`).

- [ ] **Step 1: Build de todo el workspace**

```bash
npm run build --workspace=@sistema/component-library
```

Expected: `Compiled successfully`, sin errores de TypeScript ni de resolución de módulos (esto ya prueba que el paquete se compila con su nueva ubicación y su nuevo `package.json`).

- [ ] **Step 2: Lint**

```bash
npm run lint --workspace=@sistema/component-library
```

Expected: sin errores nuevos (los mismos que había antes de mover nada, si los había).

- [ ] **Step 3: Levantar el dev server**

```bash
npm run dev --workspace=@sistema/component-library
```

Dejar corriendo en background.

- [ ] **Step 4: Cargar cada una de las 6 demo pages que pediste verificar, una por una, en el navegador**

- `http://localhost:3000/product-reveal` → ProductReveal debe rotar/aparecer igual que antes de mover nada.
- `http://localhost:3000/product-3d-closeout` → Product3DCloseout debe cargar el `.glb` (`public/models/botella_fanta.glb`) y ejecutar su secuencia completa (escala, esquina a esquina, palabra revelada).
- `http://localhost:3000/cinematic-scene` → CinematicScene con su fade-up opt-in.
- `http://localhost:3000/parallax-image` → ParallaxImage con su profundidad de scroll.
- `http://localhost:3000/text-reveal` → TextReveal palabra a palabra.
- `http://localhost:3000/image-sequence` → ImageSequence debe seguir leyendo los 120 frames de `public/sequences/botella-360/` (verificar que `next.config.ts`/rutas de `public/` no se rompieron al mover la carpeta — `public/` se movió entera junto con el resto, así que las rutas relativas `/sequences/botella-360/frame-XXX.png` no cambian).

Para cada una: sin errores en la consola del navegador, sin 404 de assets, animación completa igual que en la sesión de verificación anterior a esta migración.

- [ ] **Step 5: Confirmar por qué no se verifica `BrandReveal` aquí**

No estaba en tu lista de 6 — se deja fuera de esta verificación explícita aunque esté en el barrel (Tarea 5). Si quieres que se añada a la lista de verificación, dímelo.

- [ ] **Step 6: Parar el dev server**

```bash
# Ctrl+C en la terminal donde corre npm run dev
```

- [ ] **Step 7: Si todo lo anterior pasó, no hay commit en este task — es solo verificación. Si algo falló, volver a la tarea correspondiente, arreglar, y repetir desde el Step 1.**

---

### Task 9: Sintaxis exacta de import para un cliente nuevo — pregunta 3 (documentación, no código nuevo)

No se crea ningún proyecto de cliente real en este plan — eso es trabajo del primer cliente real, no de esta migración de infraestructura. Esto documenta la sintaxis exacta que ese futuro proyecto usará, y dónde queda registrada.

**Files:**
- Modify: `packages/component-library/README.md` — añadir una sección "Cómo consumirlo desde un proyecto de cliente"

- [ ] **Step 1: Qué necesita el `package.json` del cliente nuevo**

En `apps/clientes/<nombre-cliente>/package.json`, bajo `dependencies`:

```json
{
  "dependencies": {
    "@sistema/component-library": "*"
  }
}
```

Necesario explícitamente: npm workspaces crea el symlink solo para las dependencias declaradas — sin esta línea, aunque el paquete exista en el workspace, `npm install` no lo enlaza dentro de `apps/clientes/<nombre-cliente>/node_modules` (ni falla — simplemente no lo resuelve como dependencia de ese paquete).

- [ ] **Step 2: Qué necesita el `next.config.ts` del cliente nuevo**

`@sistema/component-library` se resuelve como código fuente TypeScript sin compilar (el `exports` de la Tarea 4 apunta a `.ts`/`.tsx`, no a un `dist/` compilado) — Next.js necesita que se le diga explícitamente que lo transpile:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sistema/component-library"],
};

export default nextConfig;
```

- [ ] **Step 3: Sintaxis de import en el código del cliente**

```typescript
import { TextReveal, ParallaxImage, ProductReveal } from "@sistema/component-library";
import type { TextRevealProps } from "@sistema/component-library";
```

Un solo import, sin conocer la ruta interna del paquete — exactamente el import limpio que el ADR (Opción 2) prometía frente al parche de `_prueba-1` (componentes duplicados por copia).

- [ ] **Step 4: Commit**

```bash
git add packages/component-library/README.md
git commit -m "Document how a client project imports from @sistema/component-library"
```

---

### Task 10: Resolver el ADR

**Files:**
- Modify: `docs/superpowers/decisions/2026-08-30-component-library-distribution-gap.md`

- [ ] **Step 1: Cambiar el `Estado` del encabezado**

Cambiar:
```
Estado: **Pendiente** — parche temporal aplicado solo para completar la
prueba end-to-end `_prueba-1`. No es la decisión de arquitectura
definitiva. La decisión real se toma como tarea propia, deliberada, antes
de crear el primer cliente real (no ficticio).
```
por:
```
Estado: **Resuelto** (2026-09-14) — Opción 2 (npm workspaces) implementada
en `docs/superpowers/plans/2026-09-14-component-library-monorepo-migration.md`.
```

- [ ] **Step 2: Añadir sección de resolución al final del archivo**

Añadir, después de la sección "## Estado" existente:

```markdown
## Resolución (2026-09-14)

Se eligió la **Opción 2 (npm workspaces)** de las tres barajadas arriba.

- `_sistema/` es ahora un monorepo con npm workspaces
  (`"workspaces": ["packages/*", "apps/clientes/*"]` en el `package.json`
  raíz).
- `component-library/` se movió a `packages/component-library/` (con
  `git mv`, historial preservado) y ahora se publica dentro del workspace
  como `@sistema/component-library`, con un barrel `src/index.ts` y
  `exports` en su `package.json`.
- `clientes/` se movió a `apps/clientes/` por el mismo criterio.
- Un proyecto de cliente nuevo declara `"@sistema/component-library": "*"`
  como dependencia y `transpilePackages: ["@sistema/component-library"]`
  en su `next.config.ts` — desde ahí, `import { TextReveal } from
  "@sistema/component-library"` es un import real, no una copia.
- El parche de `_prueba-1` (componentes duplicados por copia) queda
  confirmado como no repetible: el primer cliente real usa el import de
  workspace, no una copia.
- `motion-recipes/` y `reference-library/` no se movieron — no son
  paquetes de código, y el problema que resolvía este ADR era
  específicamente la distribución de `component-library/`.

Detalle completo de la migración (tareas, comandos, verificación) en
`docs/superpowers/plans/2026-09-14-component-library-monorepo-migration.md`.
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/decisions/2026-08-30-component-library-distribution-gap.md
git commit -m "Resolve component-library distribution ADR: npm workspaces monorepo"
```

---

### Task 11: Abrir el PR (no merge)

Por la regla de gobernanza de `CLAUDE.md` — el merge a `master` lo decides tú, no este plan.

- [ ] **Step 1: Push de la rama**

```bash
git push -u origin refactor/component-library-monorepo
```

- [ ] **Step 2: Abrir el PR**

```bash
gh pr create --base master --head refactor/component-library-monorepo \
  --title "Monorepo: mover component-library a packages/, clientes a apps/" \
  --body "Implementa la Opción 2 del ADR de distribución (npm workspaces). Ver docs/superpowers/plans/2026-09-14-component-library-monorepo-migration.md para el detalle completo de cada paso y su verificación."
```

(Si `gh` no está disponible en el entorno que ejecute esto, igual que en la sesión anterior — dar el link que devuelve `git push` para abrirlo manualmente.)

- [ ] **Step 3: Recordatorio explícito — no fusionar**

Este PR queda abierto para tu revisión. Ningún agente lo fusiona a `master` sin tu aprobación explícita.
