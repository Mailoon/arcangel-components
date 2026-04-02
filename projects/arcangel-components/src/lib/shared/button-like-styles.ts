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

const VARIANT_CLASSES: Record<ButtonLikeVariant, string> = {
  primary: 'bg-blue-600 text-white ',
  secondary: 'bg-gray-200 text-gray-800 ',
  outline: 'border border-blue-600 text-blue-600 bg-transparent',
  ghost: 'bg-transparent text-gray-800',
  danger: 'bg-red-600 text-white',
  warning: 'bg-yellow-500 text-white',
  success: 'bg-green-600 text-white',
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

/**
 * Mismas bases de color que el botón, pero `focus-within:ring-*` para envolver un `<input>`.
 */
export function getInputWrapperVariantClasses(variant: ButtonLikeVariant): string {
  return getButtonLikeVariantClasses(variant).replace(/focus:ring-/g, 'focus-within:ring-');
}
