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
