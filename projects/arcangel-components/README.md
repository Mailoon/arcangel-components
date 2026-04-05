# arcangel-components

Biblioteca de componentes **Angular** (standalone) para formularios y UI: botones, campos de texto, selector de fechas, tablas, stepper, dropdown y searchable select, entre otros. En `peerDependencies` el rango es **`>=19.0.0 <23.0.0`** (cualquier **19, 20, 21 o 22** que exista en ese intervalo); no es “solo existen esas versiones”, es **lo que el paquete declara como compatible**. Se construye y prueba sobre todo con **Angular 21** aquí — conviene probar en tu app si usas otra major.

El paquete npm se publica **sin scope** (`arcangel-components`). Más adelante podéis volver a un nombre scoped (`@org/arcangel-components`) si creáis la organización en npm.

## Qué incluye la librería


| Área                  | Contenido                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Botón**             | `button-component` — variantes, tamaños, iconos, estados, `routerLink` / `href`, plantillas de etiqueta.                  |
| **Input**             | `input-component` — misma línea visual que el botón, CVA, iconos, `shape` / `shapeClass`, Tailwind en el wrapper.         |
| **Date picker**       | `date-picker-component` — calendario personalizable (mes/año con dropdown), valor `YYYY-MM-DD`, CVA, `autoFlipPlacement`. |
| **Dropdown**          | `dropdown-component` — lista desplegable con `DropdownItem`, `autoFlipPlacement`, integración con `ButtonComponent`.      |
| **Searchable select** | `searchable-select-component` — CVA, multiselección, filtro lazy, scroll infinito.                                        |
| **Tabla / card**      | `table-component`, `card-component`, `table-responsive-component`, `paginator-component`.                                 |
| **Stepper**           | `stepper-component` — pasos, botones e iconos configurables.                                                              |
| **Otros**             | Tipos exportados (`DropdownItem`, `TableHeader`, etc.) desde el mismo paquete.                                            |


Los estilos de muchos componentes usan **clases Tailwind** en plantillas y getters; la aplicación consumidora debe incluir esas rutas en `tailwind.config` (ver abajo).

## Requisitos en el proyecto consumidor

### Obligatorio

- **Angular** `>=19.0.0 <23.0.0` en `@angular/common`, `@angular/core` y `@angular/forms` (mismas majors entre sí). Cuando salga **Angular 23+**, habrá que subir el límite superior en el `package.json` de la librería y publicar una versión nueva si quieres seguir sin avisos de peer deps.
- **@angular/forms** — necesario para `formControl` / `ngModel` en input, date-picker y searchable select.
- **Tailwind CSS** configurado con `content` que incluya el paquete instalado, más los tokens de animación/sombra que usa la librería:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './node_modules/arcangel-components/fesm2022/**/*.mjs',
  ],
  theme: {
    extend: {
      // Animación de entrada para paneles flotantes (dropdown, searchable-select, date-picker)
      keyframes: {
        'arc-popover-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'arc-popover-in': 'arc-popover-in 150ms ease-out',
      },
      // Sombra de paneles flotantes
      boxShadow: {
        'arc-panel': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
};
```

Si usas **pnpm** o carpetas anidadas, ajusta la ruta hasta el `.mjs` del paquete. El objetivo es que Tailwind **escanee** el bundle publicado donde van las cadenas de clases.

### Opcional (según lo que uses)

- **Angular Material** y fuentes **Material Icons** — solo si usas `mat-icon` o estilos de la demo con Material.
- **@angular/router** — si usas `routerLink` en `button-component`.
- **@angular/cdk** — no es dependencia directa de esta librería salvo que tu app ya lo use por otros motivos.

## Instalación

```bash
npm install arcangel-components
```

### Tamaño del `.tgz` (`npm pack`)

Con un build limpio suele quedar en torno a **~76 kB** comprimido y **5 archivos** (README, FESM, map, tipos, `package.json`). Si ves **~150 kB** y **el doble de `.mjs`/`.d.ts`**, casi seguro en `dist/.../fesm2022/` había **restos de un build anterior** con otro nombre de bundle. **Borra** `dist/arcangel-components`, ejecuta de nuevo `ng build arcangel-components` y vuelve a empaquetar. El `package.json` de la librería limita `files` a `arcangel-components.*` para no incluir basura aunque quede en disco.

Publicación: **solo** entra en npm el contenido de `dist/arcangel-components` (campo `files`). La **demo-app** y el resto del monorepo **no** se publican.

Desde la raíz del monorepo también podés usar `npm run publish:lib` (compila y publica esa carpeta).

```bash
ng build arcangel-components
cd dist/arcangel-components
npm publish
```

Los paquetes **sin scope** son públicos por defecto en el registry npm. Si más adelante usáis un scope (`@org/...`), hace falta `--access public` la primera vez o `publishConfig.access` en el `package.json`.

## Uso básico

```typescript
import { Component } from '@angular/core';
import { InputComponent } from 'arcangel-components';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [InputComponent],
  template: `<input-component placeholder="Texto" variant="outline" [fullWidth]="true" />`,
})
export class ExampleComponent {}
```

Importa el resto de componentes desde el mismo entry `arcangel-components` (ver `public-api.ts` del repositorio).
