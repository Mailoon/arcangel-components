# Arcange / Arcángel — workspace

Monorepo Angular con la librería **`arcangel-components`** y la aplicación **`demo-app`** (solo para documentación y pruebas locales).

## Solo se publica la librería

- **`demo-app` no forma parte del paquete npm.** No se sube al registry: vive en `projects/demo-app/` y no entra en el tarball.
- Lo publicable es únicamente la salida de **`ng build arcangel-components`**, carpeta **`dist/arcangel-components`**, que contiene solo lo listado en el campo **`files`** del `package.json` de la librería (FESM, tipos, README).
- Este repositorio raíz tiene **`"private": true`**: `npm publish` ejecutado **en la raíz** no publica el workspace completo (npm lo rechaza).
- Para publicar: compilá y subí **solo** esa carpeta, por ejemplo desde la raíz:

```bash
npm run publish:lib
```

(equivalente a `ng build arcangel-components` y luego `npm publish ./dist/arcangel-components`). Requiere `npm login` y permisos en el nombre del paquete.

## Librería publicable

- Código fuente: `projects/arcangel-components/`
- Documentación de consumo: **[projects/arcangel-components/README.md](projects/arcangel-components/README.md)**

## Comandos útiles

```bash
# Compilar solo la librería (salida: dist/arcangel-components)
ng build arcangel-components

# Probar el empaquetado sin publicar
cd dist/arcangel-components && npm pack

# Demo local (no se publica)
ng serve demo-app
```

Nombre y versión en npm: `projects/arcangel-components/package.json`.