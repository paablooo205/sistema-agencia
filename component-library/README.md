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
| `ThreeScene` | Contenedor de escena Three.js/R3F. Cuando se construya, debe soportar cargar un modelo `.glb` externo (diseñado por el usuario en herramientas como Meshy/Tripo/Sloyd) y rotarlo mediante scroll con React Three Fiber — es la técnica prevista para reemplazar/complementar el modo `mode: "sequence"` pendiente de `ProductReveal` cuando haya modelos 3D reales disponibles. Próximo paso tras cerrar `ProductReveal`, no implementado todavía. |
| `ParticleScene` | Sistema de partículas. |

## Estado

`ProductReveal` está implementado (`src/components/cinematic/
ProductReveal.tsx`), con demo en `/product-reveal`. Resto de componentes
de esta tabla: pendientes.

## Desarrollo

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000` — el índice enlaza a la demo de cada
componente implementado.
