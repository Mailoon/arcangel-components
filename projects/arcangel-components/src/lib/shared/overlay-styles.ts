/**
 * Helpers compartidos para overlays flotantes (dropdown, searchable-select, date-picker).
 * Devuelven strings de clases Tailwind para mantener un único origen de verdad.
 */

/** Contenedor raíz: posiciona el panel relativo al trigger. */
export function getOverlayContainerClasses(fullWidth: boolean, open: boolean): string {
  return [
    open ? 'relative z-20' : 'relative z-0',
    fullWidth ? 'block w-full' : 'inline-block',
  ].join(' ');
}

/** Panel flotante absoluto (la lista desplegable). */
export function getOverlayPanelClasses(opts?: { maxHeight?: string; minWidth?: string }): string {
  const maxH = opts?.maxHeight ?? 'max-h-64';
  const minW = opts?.minWidth ?? 'min-w-full';
  return [
    'absolute z-[1050]',
    minW,
    maxH,
    'overflow-y-auto',
    'bg-white border border-gray-200 rounded-md',
    'shadow-arc-panel',
    'py-1',
    'animate-arc-popover-in',
  ].join(' ');
}

/** Ítem de lista dentro del panel. */
export function getOverlayItemClasses(opts?: {
  disabled?: boolean;
  focused?: boolean;
  divided?: boolean;
}): string {
  const { disabled = false, focused = false, divided = false } = opts ?? {};
  return [
    'flex items-center gap-2 px-3 py-2 text-sm leading-5 text-gray-700 cursor-pointer whitespace-nowrap transition-colors duration-150',
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-gray-100',
    focused && !disabled ? 'bg-blue-50' : '',
    divided ? 'mt-1 pt-2 border-t border-gray-200' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Separador de grupo dentro del panel. */
export const OVERLAY_DIVIDER_CLASSES = 'h-px my-1 bg-gray-200';

/** Etiqueta del ítem (ocupa el espacio sobrante). */
export const OVERLAY_ITEM_LABEL_CLASSES = 'flex-1 min-w-0';

/** Placeholder invisible que ocupa el mismo espacio que el chevron. */
export const CHEVRON_PLACEHOLDER_CLASSES = 'inline-block w-4 h-4 shrink-0';

/** Clases del SVG chevron, rotando cuando el panel está abierto. */
export function getChevronClasses(open: boolean): string {
  return [
    'w-5 h-5 shrink-0 block',
    'origin-[50%_50%] transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
    open ? 'rotate-180' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Clases base para botones compactos de acción (usados en card y table). */
export const COMPACT_ACTION_BTN_BASE =
  'inline-flex items-center gap-1 px-2 py-1 text-[0.8125rem] border-none rounded cursor-pointer transition-colors duration-150';

/** Clases para el estado disabled del botón de acción compacto. */
export const COMPACT_ACTION_BTN_DISABLED = 'opacity-50 cursor-not-allowed';
