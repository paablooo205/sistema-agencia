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

| Componente | Propósito |
|---|---|
| `CinematicScene` | Contenedor base de una escena cinematográfica dentro del scroll. **Nota de fricción real** (detectada en el test end-to-end `clientes/_prueba-1`, Nortea): el componente fuerza `items-center justify-center` en su propia base, sin ningún prop que permita cambiar la alineación interna. Al reutilizarlo con una composición asimétrica (anclaje arriba-izquierda en vez de centrado), hubo que forzar la sobrescritura con el modificador `!important` de Tailwind (`!items-start !justify-start`) vía la prop `className` — funciona, pero es un parche, no una API limpia. Si se vuelve a tocar este componente, considerar añadir un prop `align?` (o similar) en vez de depender de que quien lo consuma sepa recurrir a `!important`. No corregido todavía — solo documentado. |
| `PinnedScene` | Escena fijada (pin) durante un tramo de scroll. |
| `ParallaxImage` | Imagen con profundidad/movimiento relativo al scroll. |
| `ScrollImage` | Imagen cuyo estado (escala, posición, crop) evoluciona con el scroll. |
| `ScrollText` | Texto cuyo comportamiento evoluciona con el scroll. |
| `TextReveal` | Revelado progresivo de texto. |
| `TextMask` | Texto revelado/oculto mediante máscara. |
| `HorizontalGallery` | Sección de scroll horizontal. |
| `VideoScrub` | Vídeo controlado por posición de scroll. |
| `ImageSequence` | Secuencia de imágenes (frames) controlada por scroll. |
| `ProductReveal` | Aparición progresiva de un producto/objeto protagonista. |
| `ClipPathReveal` | Revelado mediante `clip-path`. |
| `PageTransition` | Transición entre páginas/vistas. |
| `ThreeScene` | Contenedor genérico de escena Three.js/R3F (cargar un `.glb`, cámara/luz por defecto, rotación simple ligada a scroll). Pendiente — no confundir con `Product3DCloseout` (abajo), que es una secuencia compuesta mucho más específica construida aparte, no una implementación de este componente genérico. |
| `Product3DCloseout` | Secuencia de cierre de marca en 3D: un producto (`.glb`) rota, crece y viaja de esquina a esquina del encuadre mientras el fondo de la sección funde a su color y una palabra se revela letra a letra, flotando como un globo, antes de que el producto se desvanezca. Pensada como momento final de página, no como contenedor 3D reutilizable de propósito general (para eso, `ThreeScene`, todavía pendiente). Implementado (`src/components/cinematic/Product3DCloseout.tsx`), demo en `/product-3d-closeout`. |
| `ParticleScene` | Sistema de partículas. |

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
   import { TextReveal, ParallaxImage, ProductReveal } from "@sistema/component-library";
   import type { TextRevealProps } from "@sistema/component-library";
   ```
