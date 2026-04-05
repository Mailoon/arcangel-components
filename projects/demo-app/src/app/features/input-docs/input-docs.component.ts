import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { InputComponent } from '@arcange/components/input';
import { DocHighlightedCodeComponent } from '../../shared/doc-highlighted-code/doc-highlighted-code.component';

@Component({
  standalone: true,
  selector: 'app-input-docs',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatIconModule,
    InputComponent,
    DocHighlightedCodeComponent,
  ],
  templateUrl: './input-docs.component.html',
  styleUrls: ['./input-docs.component.css'],
})
export class InputDocsComponent {
  readonly emailControl = new FormControl('hola@ejemplo.com', { nonNullable: true });
  readonly searchControl = new FormControl('', { nonNullable: true });

  /** Fragmentos para copiar; el valor del control en vivo va aparte en la demo. */
  readonly code = {
    variants: `<input-component
  placeholder="Outline (por defecto)"
  variant="outline"
  [fullWidth]="true">
</input-component>

<input-component
  placeholder="Primary"
  variant="primary"
  [fullWidth]="true">
</input-component>

<input-component
  placeholder="Ghost"
  variant="ghost"
  [fullWidth]="true">
</input-component>`,

    shapes: `<input-component placeholder="rounded (4px)" shape="rounded" variant="outline" [fullWidth]="true"></input-component>

<input-component placeholder="rounded-md" shape="rounded-md" variant="outline" [fullWidth]="true"></input-component>

<input-component placeholder="rounded-lg" shape="rounded-lg" variant="outline" [fullWidth]="true"></input-component>

<input-component placeholder="pill" shape="pill" variant="outline" [fullWidth]="true"></input-component>

<input-component placeholder="square" shape="square" variant="outline" [fullWidth]="true"></input-component>`,

    shapeClass: `<input-component
  placeholder="Redondeo totalmente custom"
  shape="rounded"
  shapeClass="rounded-t-2xl rounded-b-md"
  variant="outline"
  [fullWidth]="true">
</input-component>`,

    icons: `<input-component
  placeholder="Buscar…"
  variant="outline"
  [fullWidth]="true"
  leftIconClass="material-icons text-gray-500"
  leftIconContent="search">
</input-component>

<input-component
  placeholder="Correo"
  type="email"
  variant="secondary"
  [fullWidth]="true"
  leftIconClass="material-icons text-gray-600"
  leftIconContent="mail"
  rightIconClass="material-icons text-gray-400"
  rightIconContent="check_circle">
</input-component>`,

    matIconTpl: `<!-- En el TS: [leftIconTemplate]="matSearchTpl" -->
<ng-template #matSearchTpl>
  <mat-icon class="!text-xl !w-6 !h-6 text-gray-500">search</mat-icon>
</ng-template>

<input-component
  placeholder="Plantilla izquierda"
  variant="outline"
  [fullWidth]="true"
  [leftIconTemplate]="matSearchTpl">
</input-component>`,

    sizes: `<input-component placeholder="Small" size="sm" variant="outline" [fullWidth]="true"></input-component>
<input-component placeholder="Medium" size="md" variant="outline" [fullWidth]="true"></input-component>
<input-component placeholder="Large" size="lg" variant="outline" [fullWidth]="true"></input-component>`,

    disabled: `<input-component
  placeholder="No editable"
  variant="outline"
  [disabled]="true"
  [fullWidth]="true">
</input-component>`,

    labelModes: `<!-- Por defecto labelMode="outside" -->
<input-component
  label="Correo electrónico"
  labelMode="outside"
  placeholder="nombre@dominio.com"
  type="email"
  variant="outline"
  [fullWidth]="true">
</input-component>

<input-component
  label="Usuario"
  labelMode="inline"
  placeholder="tu nombre"
  variant="outline"
  [fullWidth]="true">
</input-component>

<input-component
  label="Código"
  labelMode="static"
  placeholder="0000"
  variant="outline"
  [fullWidth]="true">
</input-component>

<!-- floating: etiqueta parte dentro, sube SOBRE el wrapper al enfocar -->
<input-component
  label="Descripción"
  labelMode="floating"
  placeholder="Escribe algo…"
  variant="outline"
  [fullWidth]="true">
</input-component>

<!-- overlap: etiqueta flota sobre el borde (estilo Material Design) -->
<input-component
  label="Descripción"
  labelMode="overlap"
  variant="outline"
  [fullWidth]="true">
</input-component>`,

    labelModeImport: `import type { InputLabelMode } from '@arcange/components/input';

readonly modo: InputLabelMode = 'floating';`,

    formControlTs: `readonly searchControl = new FormControl('', { nonNullable: true });`,

    formControlTpl: `<input-component
  [formControl]="searchControl"
  placeholder="Buscar…"
  variant="outline"
  [fullWidth]="true"
  leftIconClass="material-icons text-gray-500"
  leftIconContent="search">
</input-component>`,
  };
}
