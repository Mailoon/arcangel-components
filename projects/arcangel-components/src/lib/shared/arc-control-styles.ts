import {
  COMPACT_ACTION_BTN_BASE,
  COMPACT_ACTION_BTN_DISABLED,
} from './overlay-styles';

export type ButtonLikeVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'warning'
  | 'success';

export type ButtonLikeSize = 'sm' | 'md' | 'lg';

export type ButtonLikeShape = 'rounded' | 'rounded-md' | 'rounded-lg' | 'pill' | 'square';

/**
 * Paleta unificada (guía visual): carbón, navy, teal, contorno sólido / discontinuo, degradados.
 * Valores arbitrarios para que funcionen en apps consumidoras sin extender `theme` en Tailwind.
 */
const VARIANT_CLASSES: Record<ButtonLikeVariant, string> = {
  primary: 'bg-[#0a1628] text-white hover:brightness-110 ',
  secondary: 'bg-[#1e3a8a] text-white hover:brightness-110 ',
  outline: 'border-2 border-[#0a1628] text-[#0a1628] bg-white hover:bg-slate-50 ',
  ghost: 'border-2 border-dashed border-[#0a1628] text-[#0a1628] bg-transparent hover:bg-slate-50 ',
  danger: 'bg-gradient-to-r from-slate-500 to-orange-500 text-white hover:opacity-95 ',
  warning: 'bg-gradient-to-r from-[#0a1628] to-slate-500 text-white hover:opacity-95 ',
  success: 'bg-[#0d9488] text-white hover:brightness-110 ',
};

const SIZE_CLASSES: Record<ButtonLikeSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const SHAPE_CLASSES: Record<ButtonLikeShape, string> = {
  rounded: 'rounded',
  'rounded-md': 'rounded-md',
  'rounded-lg': 'rounded-lg',
  pill: 'rounded-full',
  square: 'rounded-none',
};

export function getButtonLikeVariantClasses(variant: ButtonLikeVariant): string {
  return VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary;
}

/** Texto claro sobre fondo oscuro o degradado (p. ej. placeholder en input). */
export function variantUsesLightForeground(variant: ButtonLikeVariant): boolean {
  return variant !== 'outline' && variant !== 'ghost';
}

/** Acciones compactas en tabla / card (subconjunto de variantes). */
export function getCompactActionVariantClasses(variant?: string): string {
  const v = variant ?? 'ghost';
  const allowed: ButtonLikeVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
  const key = (allowed as string[]).includes(v) ? (v as ButtonLikeVariant) : 'ghost';
  return getButtonLikeVariantClasses(key).trim();
}

/** Clases completas para el botón de acción compacto (base + variante). */
export function getCompactActionButtonClasses(variant?: string): string {
  return `${COMPACT_ACTION_BTN_BASE} ${getCompactActionVariantClasses(variant)}`;
}

/** Clases completas para el estado disabled del botón de acción compacto. */
export const COMPACT_ACTION_DISABLED_CLASSES =
  `${COMPACT_ACTION_BTN_BASE} ${COMPACT_ACTION_BTN_DISABLED}`;

export function getButtonLikeSizeClasses(size: ButtonLikeSize): string {
  return SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
}

export function getButtonLikeShapeClasses(shape: ButtonLikeShape): string {
  return SHAPE_CLASSES[shape] ?? SHAPE_CLASSES.rounded;
}

/**
 * Si `shapeClass` tiene texto, sustituye por completo el redondeo del `shape` (p. ej. `rounded-2xl` o `rounded-t-lg rounded-b-none`).
 */
export function resolveButtonLikeShapeClasses(shape: ButtonLikeShape, shapeClass?: string | null): string {
  const o = shapeClass?.trim();
  if (o) return o;
  return getButtonLikeShapeClasses(shape);
}
