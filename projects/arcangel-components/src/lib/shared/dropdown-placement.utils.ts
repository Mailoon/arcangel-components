import type { DropdownPlacement } from '../components/dropdown/dropdown-component';

const DEFAULT_MARGIN = 8;

/**
 * Decide si el panel debe abrirse por encima o por debajo del disparador según espacio en viewport.
 */
export function resolveVerticalSide(
  triggerRect: DOMRectReadOnly,
  panelHeight: number,
  viewportHeight: number,
  margin = DEFAULT_MARGIN,
  preferred: 'bottom' | 'top' = 'bottom'
): 'bottom' | 'top' {
  const spaceBelow = viewportHeight - triggerRect.bottom - margin;
  const spaceAbove = triggerRect.top - margin;
  const ph = Math.max(panelHeight, 1);

  const pickBottomFirst = () => {
    if (spaceBelow >= ph) return 'bottom';
    if (spaceAbove >= ph) return 'top';
    return spaceBelow >= spaceAbove ? 'bottom' : 'top';
  };

  const pickTopFirst = () => {
    if (spaceAbove >= ph) return 'top';
    if (spaceBelow >= ph) return 'bottom';
    return spaceAbove >= spaceBelow ? 'top' : 'bottom';
  };

  return preferred === 'top' ? pickTopFirst() : pickBottomFirst();
}

/**
 * Alineación horizontal: si no cabe alineando a la izquierda del trigger, usar `end`.
 */
export function resolveHorizontalAlign(
  triggerRect: DOMRectReadOnly,
  panelWidth: number,
  viewportWidth: number,
  margin = DEFAULT_MARGIN
): 'start' | 'end' {
  const pw = Math.max(panelWidth, 1);
  if (triggerRect.left + pw <= viewportWidth - margin) return 'start';
  if (triggerRect.right - pw >= margin) return 'end';
  return triggerRect.left < viewportWidth - triggerRect.right ? 'start' : 'end';
}

/** Combina lado vertical y alineación horizontal en un `DropdownPlacement`. */
export function resolveAutoDropdownPlacement(
  triggerRect: DOMRectReadOnly,
  panelRect: DOMRectReadOnly | null,
  panelWidthFallback: number,
  panelHeightFallback: number,
  viewportWidth: number,
  viewportHeight: number,
  preferredPlacement: DropdownPlacement,
  margin = DEFAULT_MARGIN
): DropdownPlacement {
  const preferredVertical: 'bottom' | 'top' = preferredPlacement.startsWith('top') ? 'top' : 'bottom';
  const ph = panelRect?.height ?? panelHeightFallback;
  const pw = panelRect?.width ?? panelWidthFallback;
  const v = resolveVerticalSide(triggerRect, ph, viewportHeight, margin, preferredVertical);
  const h = resolveHorizontalAlign(triggerRect, pw, viewportWidth, margin);
  return `${v}-${h}` as DropdownPlacement;
}

export function placementToPositionClasses(p: DropdownPlacement): string {
  const map: Record<DropdownPlacement, string> = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1',
  };
  return map[p] ?? map['bottom-start'];
}
