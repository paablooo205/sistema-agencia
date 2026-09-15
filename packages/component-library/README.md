# Component Library

Biblioteca de componentes cinematográficos reutilizables entre proyectos
de cliente. Filosofía: componentes fiables + libertad creativa — Frontend
Agent no debe reinventar cada animación desde cero, debe componer a partir
de aquí.

Un componente solo entra en esta biblioteca cuando está construido y
probado; hasta entonces vive dentro del proyecto de cliente que lo
originó.

## Convenciones

- **Configurable por props/JSON, nunca hardcodeado a un cliente.** Ningún
  componente aquí debe contener copy, imágenes, colores o textos de un
  cliente concreto.
- Recibe contenido y parámetros desde fuera (props, JSON de configuración),
  nunca los asume por defecto de un proyecto específico.
- Debe funcionar con la capa de smooth scroll (Lenis) y ScrollTrigger del
  sistema sin configuración adicional específica de proyecto.
- Accesible por defecto: no romper foco, lectura de pantalla ni navegación
  por teclado por el hecho de tener animación.
- Estrategia mobile explícita: no asumir que el comportamiento desktop
  "reducido" sirve para móvil — cada componente documenta su
  comportamiento en ambos.
- Animaciones con GPU-friendly properties (`transform`, `opacity`) como
  primera opción.

## Componentes previstos

| Componente          | Propósito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CinematicScene`    | Contenedor base de una escena cinematográfica dentro del scroll. **Nota de fricción real** (detectada en el test end-to-end `clientes/_prueba-1`, Nortea): el componente fuerza `items-center justify-center` en su propia base, sin ningún prop que permita cambiar la alineación interna. Al reutilizarlo con una composición asimétrica (anclaje arriba-izquierda en vez de centrado), hubo que forzar la sobrescritura con el modificador `!important` de Tailwind (`!items-start !justify-start`) vía la prop `className` — funciona, pero es un parche, no una API limpia. Si se vuelve a tocar este componente, considerar añadir un prop `align?` (o similar) en vez de depender de que quien lo consuma sepa recurrir a `!important`. No corregido todavía — solo documentado. |
| `PinnedScene`       | Escena fijada (pin) durante un tramo de scroll.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `ParallaxImage`     | Imagen con profundidad/movimiento relativo al scroll.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `ScrollImage`       | Imagen cuyo estado (escala, posición, crop) evoluciona con el scroll.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `ScrollText`        | Texto cuyo comportamiento evoluciona con el scroll.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `TextReveal`        | Revelado progresivo de texto.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `TextMask`          | Texto revelado/oculto mediante máscara.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `HorizontalGallery` | Fila de imágenes a pantalla completa; el progreso vertical de scroll (vía `usePinnedScroll`) se traduce en `translateX`. Evaluado y descartado usar `smooothy` (librería de slider drag/swipe con momentum/snap) — resuelve un problema distinto (input directo del usuario) al de este componente (progreso de scroll traducido), así que se construyó a mano con GSAP, sin dependencia nueva. Mobile: scroll horizontal nativo con swipe (`overflow-x-auto` + `snap-x`), no el mecanismo de pin desactivado que usan el resto de componentes — una galería sí tiene equivalente táctil nativo, a diferencia de una rotación 3D. `prefers-reduced-motion`: grid estático con las 6 imágenes visibles (no solo la primera) vía `motion-reduce:grid`, porque el contenido es el propio conjunto de imágenes. Primer componente construido consumiendo `usePinnedScroll` desde el principio, no migrado después. Implementado (`src/components/cinematic/HorizontalGallery.tsx`), demo en `/horizontal-gallery` con 6 placeholders de color (sin fotos reales todavía, documentado como tal en la demo). |
| `VideoScrub`        | Vídeo controlado por posición de scroll (`video.currentTime = progress * duration`). Alcance deliberadamente más estrecho que `ImageSequence` — evaluado antes de construir: el buscado preciso en `<video>` es menos fiable entre navegadores que dibujar en `<canvas>`, la razón por la que `ethicallifeworld.com`/`munrooftoprome.com` (ya en `reference-library`) usan secuencias de imágenes, no vídeo real, para este efecto. Caso de uso real: vídeo/metraje real más largo donde exportar a miles de frames no es viable en peso ni en generación — no "audio relevante" (descartado: el propio mecanismo de scrub hace el audio ininteligible con cualquier implementación, no es un problema de ingeniería a resolver; el componente va siempre muteado). Mitiga la fiabilidad de seek con un controlador de coalescencia-al-último-valor (nunca encola seeks, siempre converge a la posición de scroll más reciente) y un gate de precarga que exige el buffer completo antes de habilitar el scrub (`video.buffered` cubre toda la duración, no solo lo necesario para reproducir hacia delante). Mobile: fotograma estático, sin intento de scroll-scrub — a diferencia de `HorizontalGallery`, aquí no hay equivalente táctil nativo que valga la pena construir, y mobile empeora tanto el ancho de banda como la fiabilidad de seek. Implementado (`src/components/cinematic/VideoScrub.tsx`), demo en `/video-scrub` con un vídeo local de prueba (40MB/4K, suministrado por el usuario, **no comiteado al repo** — ver `.gitignore` — sin `ffmpeg` disponible para comprimirlo ni Git LFS configurado en este repo; cualquiera que clone el repo necesita su propio vídeo en esa ruta para ver la demo cargar algo). |
| `ImageSequence`     | Secuencia de imágenes (frames) controlada por scroll.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `ProductReveal`     | Aparición progresiva de un producto/objeto protagonista.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `ClipPathReveal`    | Revelado mediante `clip-path`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `PageTransition`    | Transición entre páginas/vistas.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `ThreeScene`        | Contenedor genérico de escena Three.js/R3F (cargar un `.glb`, cámara/luz por defecto, rotación simple ligada a scroll). Pendiente — no confundir con `Product3DCloseout` (abajo), que es una secuencia compuesta mucho más específica construida aparte, no una implementación de este componente genérico.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `Product3DCloseout` | Secuencia de cierre de marca en 3D: un producto (`.glb`) rota, crece y viaja de esquina a esquina del encuadre mientras el fondo de la sección funde a su color y una palabra se revela letra a letra, flotando como un globo, antes de que el producto se desvanezca. Pensada como momento final de página, no como contenedor 3D reutilizable de propósito general (para eso, `ThreeScene`, todavía pendiente). Implementado (`src/components/cinematic/Product3DCloseout.tsx`), demo en `/product-3d-closeout`.                                                                                                                                                                                                                                                                      |
| `ParticleScene`     | Sistema de partículas.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `Footer`            | No estaba en la lista original — hallazgo de la revisión de `reference-library` (`oversized-wordmark-footer.md`). Índice editorial configurable (columnas de navegación, contacto general + contacto por persona, redes, slot de personalidad libre vía `children`, legal/copyright), con el nombre de marca en tipografía gigante detrás del contenido en dos tratamientos — `"ghost"` (bajo contraste, opacidad como mecanismo de seguridad) o `"solid"` (alto contraste, seguro por reserva de espacio propio en vez de opacidad). Sin animación por defecto, `enter="fade-up"` opcional. Implementado (`src/components/cinematic/Footer.tsx`), demo en `/footer`.                                                                                                                   |

## Hooks

| Hook              | Propósito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `usePinnedScroll` | Extrae la parte del patrón "pin + scroll" que `ProductReveal`, `Product3DCloseout` e `ImageSequence` implementaban cada uno por separado, de forma idéntica: el check de `prefers-reduced-motion`, el cálculo de `isMobile`/`pinDuration`/`end`, la forma del `scrollTrigger` (`{trigger, start: "top top", end, scrub: 0.5, pin: !isMobile}`) y el ciclo de efecto+cleanup. Deliberadamente **no** decide qué se anima ni cómo — cada consumidor real anima algo distinto (un elemento DOM, propiedades de un objeto Three.js mezcladas con varios subárboles DOM, o un número JS puro que dirige un `<canvas>`), así que ese trabajo se le pasa a un `builder` que el hook invoca dentro de su propio efecto. Elegido hook en vez de componente-contenedor precisamente porque `Product3DCloseout` anima un objeto Three.js que vive dentro de un componente hijo (`<Model>`, dentro de `<Canvas><Suspense>`), varios niveles de React por debajo del `<section>` que actuaría como `trigger` — un componente-contenedor solo podría exponer ese timeline hacia sus hijos vía Context, maquinaria extra para lo que un hook da llamándolo donde ya vive el ref real. Implementado (`src/lib/usePinnedScroll.ts`), demo aislada en `/pinned-scroll-hook` (no enlazada desde el índice — es una prueba del hook por sí solo, no una demo de componente). **`ProductReveal`, `Product3DCloseout` e `ImageSequence` ya migrados** (2026-09-14). **Riesgo conocido, sin resolver** (ver comentario en el propio código): el efecto interno del hook solo se re-ejecuta cuando cambian `triggerRef`/`pinDuration`/`mobileBreakpoint`/`enabled` — si una instancia ya montada recibe un valor distinto de otra prop que el `builder` de un consumidor captura (p. ej. `rotationRange`, `startScale`, `tiltDeg`), el tween/timeline sigue corriendo con el valor viejo hasta que el efecto se re-dispare por otra razón. Nunca observado porque cada demo de este repo pasa props como literales estáticos, pero es un gap real si algún caller llega a pasar un valor que cambie entre re-renders de una instancia ya montada. |

## Estado

`ProductReveal` está implementado (`src/components/cinematic/
ProductReveal.tsx`), con demo en `/product-reveal`. Resto de componentes
de esta tabla: pendientes.

## Desarrollo

Este paquete vive dentro del workspace de npm de `_sistema/` — instalar
**desde la raíz del repo** (`npm install`), nunca desde aquí dentro. Ver
`README.md` de la raíz para el detalle del flujo de instalación.

Para levantar el servidor de desarrollo de este paquete en concreto:

```bash
npm run dev --workspace=@sistema/component-library
```

(equivalente a `cd packages/component-library && npm run dev`, si ya se
instaló desde la raíz).

Abrir `http://localhost:3000` — el índice enlaza a la demo de cada
componente implementado.

## Cómo consumirlo desde un proyecto de cliente

El paquete se publica dentro del workspace como `@sistema/component-library`,
con un barrel (`src/index.ts`) que reexporta todos los componentes
terminados. Un proyecto de cliente nuevo en `apps/clientes/<nombre>/`:

1. Declara la dependencia en su propio `package.json`:

   ```json
   {
     "dependencies": {
       "@sistema/component-library": "*"
     }
   }
   ```

   Necesario explícitamente — npm workspaces solo crea el symlink para las
   dependencias que cada paquete declara, no automáticamente por vivir en
   el mismo repo.

2. Añade `transpilePackages` en su `next.config.ts`, porque el paquete se
   consume como código fuente TypeScript sin compilar, no como un `dist/`:

   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     transpilePackages: ["@sistema/component-library"],
   };

   export default nextConfig;
   ```

3. Importa directamente desde el paquete, sin conocer su ruta interna:

   ```typescript
   import {
     TextReveal,
     ParallaxImage,
     ProductReveal,
   } from "@sistema/component-library";
   import type { TextRevealProps } from "@sistema/component-library";
   ```
