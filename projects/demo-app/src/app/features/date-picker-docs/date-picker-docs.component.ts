import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePickerComponent } from '@arcange/components/date-picker';
import { DocHighlightedCodeComponent } from '../../shared/doc-highlighted-code/doc-highlighted-code.component';

@Component({
  standalone: true,
  selector: 'app-date-picker-docs',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DatePickerComponent, DocHighlightedCodeComponent],
  templateUrl: './date-picker-docs.component.html',
  styleUrls: ['./date-picker-docs.component.css'],
})
export class DatePickerDocsComponent {
  readonly dateControl = new FormControl<string | null>('2025-06-15');
  readonly emptyControl = new FormControl<string | null>(null);

  readonly code = {
    intro: `<!-- Valor: string YYYY-MM-DD o null (vacío). Fechas en hora local. -->
<date-picker-component
  [formControl]="dateControl"
  placeholder="Elegir fecha"
  variant="outline"
  [fullWidth]="true">
</date-picker-component>`,

    emptyTs: `readonly emptyControl = new FormControl<string | null>(null);`,

    emptyTpl: `<date-picker-component
  [formControl]="emptyControl"
  placeholder="Sin fecha"
  variant="outline"
  [fullWidth]="true">
</date-picker-component>`,

    calendarSizes: `<date-picker-component
  placeholder="Calendario pequeño"
  calendarSize="sm"
  variant="primary"
  [fullWidth]="true">
</date-picker-component>

<date-picker-component
  calendarSize="md"
  ...>
</date-picker-component>

<date-picker-component
  calendarSize="lg"
  ...>
</date-picker-component>`,

    minMax: `<date-picker-component
  placeholder="Rango limitado"
  minDate="2025-01-10"
  maxDate="2025-12-20"
  variant="outline"
  [fullWidth]="true">
</date-picker-component>`,

    firstDow: `<date-picker-component
  placeholder="Semana desde domingo"
  [firstDayOfWeek]="0"
  variant="outline"
  [fullWidth]="true">
</date-picker-component>`,

    shapes: `<!-- Mismos presets que input-component -->
<date-picker-component shape="rounded-md" variant="outline" [fullWidth]="true"></date-picker-component>
<date-picker-component shape="pill" variant="primary" [fullWidth]="true"></date-picker-component>

<!-- Radio arbitrario -->
<date-picker-component
  shape="rounded"
  shapeClass="rounded-2xl"
  variant="outline"
  [fullWidth]="true">
</date-picker-component>`,

    triggerStyle: `<!-- Disparador = misma API visual que input (variant, size, iconos, overrides) -->
<date-picker-component
  variant="ghost"
  size="lg"
  [showCalendarIcon]="true"
  rightIconClass="material-icons text-gray-500"
  rightIconContent="event"
  borderClass="border border-dashed border-gray-300"
  [fullWidth]="true">
</date-picker-component>`,
  };
}
