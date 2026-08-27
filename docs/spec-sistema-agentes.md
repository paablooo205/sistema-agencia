# Especificación del sistema de agentes — Cinematic Web Engine

Documento de referencia fijado antes de empezar a construir. Responde a las 10 preguntas de diseño acordadas.

## 1. Agentes del sistema

**Núcleo (desde el día 1):**
- Agente Creador
- Agente de Benchmark de Referencia
- Auditor de Seguridad y RLS
- Agente de Performance

**Fase posterior (solo con clientes reales y volumen):**
- Agente de Triage de Soporte
- Agente de SEO Evolutivo
- Agente de Testing A/B
- Agente de BI Predictivo

**Orquestador:** Claude Code, no es un agente más de la lista — dirige y reparte trabajo al resto.

## 2. Skill de cada agente (una responsabilidad única por agente)

| Agente | Responsabilidad |
|---|---|
| Creador | Traducir la especificación en código sobre la plantilla base |
| Benchmark | Extraer patrones de UX de referencias del sector |
| Auditor RLS | Verificar aislamiento de datos entre tenants |
| Performance | Verificar velocidad/accesibilidad y corregir cuellos de botella |
| Triage | Diagnosticar incidencias reportadas y proponer parche |
| SEO Evolutivo | Detectar oportunidades de keywords y redactar borradores de blog |
| Testing A/B | Detectar fricción en páginas y proponer variantes |
| BI Predictivo | Analizar comportamiento de visitantes y generar informes |

## 3. Input de cada agente

- Creador: ficha de especificación + informe de Benchmark + CLAUDE.md + plantilla base
- Benchmark: sector/nicho del cliente (solo eso, sin contexto de la web aún inexistente)
- Auditor RLS: diff del esquema SQL nuevo/modificado
- Performance: URL del sandbox desplegado
- Triage: reporte del cliente + logs de Vercel/Supabase/Resend (24-48h)
- SEO Evolutivo: sector del cliente + contenido ya publicado
- Testing A/B: métricas de tráfico/rebote de una página
- BI Predictivo: logs de comportamiento de visitantes

## 4. Output de cada agente

- Creador: rama con el código + resumen de decisiones tomadas
- Benchmark: informe corto de patrones que funcionan / errores a evitar (nunca código)
- Auditor RLS: pass/fail + lista de brechas; bloquea merge si falla
- Performance: puntuación antes/después + lista de cambios
- Triage: diagnóstico + rama con parche propuesto, aprobación de un clic
- SEO Evolutivo: borradores Markdown/MDX, nunca publicados directamente
- Testing A/B: variantes + significancia estadística, nunca despliega solo
- BI Predictivo: informe de perfiles/comportamiento, no decide producto

## 5. Herramientas y permisos

Regla general: lectura amplia, escritura acotada a su propia rama/sandbox, **ningún agente automático tiene permiso de merge a `main` ni despliegue a producción** — ese paso lo da siempre una persona. Se implementa vía `--allowedTools` en cada invocación headless de Claude Code.

- Creador: código en su worktree, npm/git, MCP de Supabase/Vercel para consultar (no desplegar)
- Benchmark: navegador para capturas/análisis visual, respeta robots.txt, sin scraping masivo
- Auditor RLS: lectura de esquema SQL, queries de prueba en sandbox
- Performance: Lighthouse CI contra el sandbox
- Triage: logs (Vercel/Supabase API), código en rama propia

## 6. Documentos compartidos

- `CLAUDE.md` / `AGENTS.md`: reglas de estilo, SEO y estructura — fuente de verdad común
- Ficha de especificación del proyecto en curso
- Informe de Benchmark, incorporado a la especificación antes de construir
- Tabla `agent_findings` en Supabase: registro histórico compartido de resultados de QA
- Design tokens de la plantilla (preset shadcn, paleta base)

## 7. Componentes del Cinematic Web Engine

- `CinematicScroll`: canvas + GSAP ScrollTrigger, secuencia de imágenes sincronizada al scroll
- Pipeline de preprocesado de vídeo (ffmpeg): convierte el vídeo del cliente en frames optimizados (WebP/AVIF, varias resoluciones), una vez por cliente
- `FramePreloader`: precarga progresiva de frames
- `ParallaxSection`: bloques con profundidad/movimiento al scroll
- `ScrollProgress`: indicador visual de progreso (opcional)
- Capa de configuración por props/JSON — nunca hardcodeado, reutilizable entre clientes

## 8. Coordinación desde Claude Code

- **Interactiva** (con el usuario delante): Claude Code como orquestador reparte subtareas a subagentes internos en la misma sesión, para trabajo exploratorio o que requiere criterio humano en tiempo real.
- **Programada** (sin el usuario delante): cada agente de QA/soporte se dispara vía GitHub Actions (`schedule` o en cada PR) como invocación headless independiente (`claude -p`), con presupuesto y permisos propios. Se comunican entre sí a través de los documentos compartidos (punto 6), no por conversación directa.
- Punto de entrada único: comando `/nueva-web`, que dispara la cadena Benchmark → Creador → Auditor RLS → Performance, en ese orden, antes de la revisión humana final.

## 9. QA automático

1. El Creador despliega a sandbox/staging (nunca directo a producción)
2. Auditor RLS corre contra el sandbox — si falla, se detiene
3. Performance corre Lighthouse — si baja de umbral, reescribe y repite
4. Checks de build/lint en cada PR (GitHub Actions)
5. Solo si todo pasa, el PR queda listo para revisión humana — único paso que decide el merge a `main` y el despliegue a producción

## 10. Evitar la "web de IA genérica"

- El informe de Benchmark es para diferenciar, no para copiar: identificar qué es común en el sector y evitarlo salvo que sea una convención esperada por el usuario final
- Variación real en la librería de componentes: varias variantes de hero, testimonios, distribución de contenido — nunca un único layout fijo
- Múltiples presets de diseño (Vega, Nova, Maia, Lyra, Sera...) asignados según personalidad de marca del brief, no siempre el mismo por defecto
- Contenido real del cliente, no relleno genérico — si falta información, el agente debe marcarlo como pendiente, no inventar copy de plantilla
- Checklist de diferenciación antes de dar la web por terminada, comparando contra el informe de Benchmark
- Revisión humana como última capa: la señal de "esto huele a IA" debe retroalimentar el CLAUDE.md para no repetirse
