import { Directive, Input, TemplateRef } from '@angular/core';
import type { ButtonLikeVariant, ButtonLikeSize, ButtonLikeShape } from './arc-control-styles';

/**
 * Clase base abstracta para todos los controles interactivos de la librería
 * (button, input, dropdown, searchable-select, date-picker).
 *
 * Centraliza las declaraciones `@Input()` de estilo/apariencia comunes y
 * el helper `resolveHoverClass()` para normalizar clases hover.
 *
 * El decorador `@Directive()` es necesario para que el compilador de Angular
 * reconozca los `@Input()` heredados en modo de compilación parcial (ng-packagr).
 */
@Directive()
export abstract class ArcControlBase {
  @Input() variant: ButtonLikeVariant = 'primary';
  @Input() shape: ButtonLikeShape = 'rounded';
  @Input() size: ButtonLikeSize = 'md';
  @Input() fullWidth = false;

  @Input() leftIconClass = '';
  @Input() rightIconClass = '';
  @Input() leftIconTemplate?: TemplateRef<unknown>;
  @Input() rightIconTemplate?: TemplateRef<unknown>;

  @Input() backgroundClass = '';
  @Input() textClass = '';
  @Input() borderClass = '';
  @Input() hoverClass = '';
  @Input() customClass = '';

  @Input() disabled = false;

  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() tooltip?: string;

  /**
   * Normaliza el valor de `hoverClass`: si ya tiene el prefijo `hover:` lo deja tal cual,
   * si no lo tiene lo añade. Devuelve cadena vacía si el input está vacío.
   */
  protected resolveHoverClass(): string {
    const h = this.hoverClass?.trim();
    if (!h) return '';
    return h.startsWith('hover:') ? h : `hover:${h}`;
  }
}
