# ADR: CRM externo vía Twenty, no CRM propio

Fecha: 2026-08-27
Estado: Aceptada — pendiente de implementación.

## Contexto

La Fase 2 del roadmap de negocio preveía construir un módulo de CRM propio
(`/modules/crm`) dentro del backend multi-tenant, junto al resto de
agentes definidos en `docs/spec-sistema-agentes.md`. Se sustituye ese
módulo por integración con **Twenty** ([twentyhq/twenty](https://github.com/twentyhq/twenty)),
un CRM open source completo, en vez de construir y mantener una solución
propia desde cero.

## Qué es Twenty

Aplicación independiente (NestJS + React + PostgreSQL + Redis +
almacenamiento S3-compatible) — **no** es una librería que se importe
dentro de un proyecto. Se despliega como servicio aparte y expone API
GraphQL y REST para que el resto del sistema la consuma.

## Restricción de licencia (crítica — no omitir en implementaciones futuras)

Twenty se distribuye bajo **AGPL-3.0**. Decisión explícita: se usa **sin
modificar su código fuente**, integrado exclusivamente por API.

**No se toca ni se forkea el código de Twenty bajo ningún concepto.**
Modificar su código y ofrecerlo a clientes por red obligaría, bajo
AGPL-3.0, a publicar el código modificado — incompatible con el modelo de
producto empaquetado del negocio. Cualquier necesidad futura de
personalización debe resolverse vía su API (custom objects, webhooks,
API GraphQL/REST), nunca editando su repositorio.

## Patrón de integración

- **Una única instancia de Twenty** desplegada en infraestructura propia
  — no una instancia por cliente.
- Uso del **sistema nativo de workspaces de Twenty** para dar un workspace
  por cliente dentro de esa única instancia.
- Las webs de cliente consumen la **API** de Twenty (leads, contactos,
  pipeline, etc.).
- **Ninguna interfaz de Twenty se embebe** dentro de las webs de cliente —
  la UI de Twenty es una herramienta interna/del cliente, aparte de la web
  pública que se le entrega.

## Alcance

Esta decisión es infraestructura de negocio aparte del Cinematic Web
Engine y de sus 8 agentes (plugin `cinematic-web-engine`) — corresponde al
**paquete estándar** (webs con CRM), no al paquete cinemático premium. No
requiere cambios en `CLAUDE.md`, `docs/cinematic-web-engine-vision.md`,
`docs/spec-sistema-agentes.md` ni en el pipeline
`/cinematic-web-engine:nuevo-proyecto`.

## Estado

Decisión tomada. Pendiente de implementación: despliegue de la instancia
de Twenty, definición del flujo de creación de workspace por cliente, e
integración de las webs de cliente contra su API.
