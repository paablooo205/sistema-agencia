# rotating-3d-hud-portfolio

- Style: Sci-fi técnico / minimalista frío
- Industry: Portfolio creativo/técnico (estudio de diseño o dev, marca no identificable en las capturas)
- Motion: Un único objeto 3D abstracto (una especie de cristal/roca facetada, superficie con reflejos irisados) permanece en el centro de la pantalla y **rota/cambia de ángulo según el scroll o la navegación**, en vez de haber una imagen distinta por proyecto de portfolio — el mismo objeto "es" cada proyecto, solo cambia su orientación y la etiqueta HUD que lo acompaña (`PORTFOLIO_CO_02 — OVERPASS`, `PORTFOLIO_CO_03 — ABSTRACT`). En el footer del mismo sitio, un icono social (X/Twitter) está construido como una nube de partículas 3D que se agrupa/dispersa.
- Scroll type: Vertical, probablemente con pin durante el tramo de cada proyecto (el objeto no se desplaza en pantalla, solo rota).
- Animation type: Rotación 3D ligada a scroll + overlay de datos tipo HUD (coordenadas, "TEMP xx.xx", fecha, "CLICK TO EXPLORE") que cambia de valor con cada proyecto — lectura de "instrumento técnico", no de galería de imágenes.
- 3D: Sí — objeto 3D real (probablemente Three.js/R3F), material con reflejo irisado (dieléctrico/prisma), fondo neblinoso gris uniforme sin horizonte definido.
- Transition: Entre proyectos, el objeto gira/cambia de faceta en vez de cortar a una imagen nueva — la transición ES la rotación, no un fundido.
- Typography: Mono técnico para las etiquetas HUD, tracking amplio, todo mayúsculas.
- Storytelling: Cada proyecto de portfolio se lee como una "muestra" o "espécimen" siendo escaneado/rotado por un instrumento, no como una tarjeta de galería — refuerza precisión/tecnicismo sobre el propio contenido de cada proyecto.
- Useful for: Portfolios donde se quiere transmitir precisión técnica o carácter "de laboratorio" — relevante para el vocabulario de `ThreeScene` (rotación de objeto 3D ligada a scroll) que ya existe en `component-library/`, con la capa HUD como posible receta nueva si se reutiliza.
- Avoid when: Portfolio de contenido cálido/editorial (este patrón lee frío y técnico a propósito) — no encaja con direcciones de marca como Nortea (café, cálido-editorial).
- Source: Capturas de pantalla proporcionadas por el usuario (30-08-2026), sitio no identificado por URL — marca no visible en el recorte. Sin verificar en vivo.
