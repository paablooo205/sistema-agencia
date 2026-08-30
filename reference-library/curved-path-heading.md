# curved-path-heading

- Style: Bold / geométrico contemporáneo
- Industry: Genérico — visto en un cierre tipo CTA ("Ready to Rise"), sector no identificable en el recorte.
- Motion: El titular no es una línea recta — el texto sigue una **trayectoria curva ascendente** (las letras van rotando/desplazándose hacia arriba siguiendo un arco, como si la frase "trepara" por una curva) en vez de estar centrado en una caja rectangular. Probablemente un motion-path de GSAP (`MotionPathPlugin`, de pago) o un cálculo manual de posición/rotación por carácter a lo largo de un arco SVG.
- Scroll type: No determinable desde una captura estática — podría ser scroll-scrub (el texto "sube" la curva a medida que se hace scroll) o solo una composición estática con la tipografía ya curvada.
- Animation type: Texto sobre trayectoria curva — variante tipográfica de un reveal, no un reveal palabra a palabra como `TextReveal`.
- 3D: No.
- Transition: N/A — no se observa transición entre estados en las capturas disponibles.
- Typography: Sans bold geométrica, muy grande, sin serifas — el peso tipográfico es el protagonista, la curva es el "truco" que lo saca de lo esperado.
- Storytelling: Un titular de cierre/CTA con más energía que un titular plano — la curva sugiere "elevación" (coherente con "Rise"), texto y forma cuentan lo mismo.
- Useful for: Un titular de cierre puntual (no para cuerpo de texto ni para todos los títulos de la página) donde la propia palabra tiene relación con la curva (aquí: "Rise" = subir).
- Avoid when: `CLAUDE.md` exige justificar cada movimiento — un titular curvado sin ninguna relación semántica con "curva/elevación/movimiento" sería decoración tipográfica gratuita. Si el proyecto usa GSAP core (sin plugins de pago), verificar antes si el efecto es viable sin `MotionPathPlugin` (posición/rotación por carácter calculada a mano es una alternativa).
- Source: Capturas de pantalla proporcionadas por el usuario (30-08-2026), sitio no identificado por URL — sin marca visible en el recorte. Sin verificar en vivo.
