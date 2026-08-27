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
| `CinematicScene` | Contenedor base de una escena cinematográfica dentro del scroll. |
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
| `ThreeScene` | Contenedor de escena Three.js/R3F. |
| `ParticleScene` | Sistema de partículas. |

Esta carpeta está vacía de implementación por ahora — se irá poblando a
medida que cada componente se construya y valide en un proyecto real.
