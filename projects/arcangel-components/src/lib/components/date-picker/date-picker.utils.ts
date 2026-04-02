/** Columna del día en la grilla: 0 = primera columna (domingo o lunes según firstDayOfWeek). */
export function getWeekdayColumn(date: Date, firstDayOfWeek: 0 | 1): number {
  const dow = date.getDay();
  if (firstDayOfWeek === 0) return dow;
  return (dow + 6) % 7;
}

export function dateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function compareDateOnly(a: Date, b: Date): number {
  return dateOnly(a).getTime() - dateOnly(b).getTime();
}

/** Parse estricto `YYYY-MM-DD` en fecha local. */
export function parseISODateLocal(s: string | null | undefined): Date | null {
  if (!s || typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dateOnly(dt);
}

export function formatISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function toDateInput(v: string | Date | null | undefined): Date | null {
  if (v == null) return null;
  if (v instanceof Date) return dateOnly(v);
  return parseISODateLocal(v);
}

export function clampDate(d: Date, min: Date | null, max: Date | null): Date {
  let x = dateOnly(d);
  if (min && compareDateOnly(x, min) < 0) x = dateOnly(min);
  if (max && compareDateOnly(x, max) > 0) x = dateOnly(max);
  return x;
}

export interface DayCell {
  date: Date;
  inMonth: boolean;
  disabled: boolean;
  label: number;
}

/**
 * 6 filas × 7 columnas. `viewMonth0` es mes JS 0–11.
 */
export function buildCalendarWeeks(
  viewYear: number,
  viewMonth0: number,
  firstDayOfWeek: 0 | 1,
  min: Date | null,
  max: Date | null
): DayCell[][] {
  const firstOfMonth = new Date(viewYear, viewMonth0, 1);
  const startCol = getWeekdayColumn(firstOfMonth, firstDayOfWeek);
  const gridStart = new Date(viewYear, viewMonth0, 1 - startCol);
  const weeks: DayCell[][] = [];
  let cursor = dateOnly(gridStart);

  for (let w = 0; w < 6; w++) {
    const row: DayCell[] = [];
    for (let c = 0; c < 7; c++) {
      const inMonth = cursor.getMonth() === viewMonth0 && cursor.getFullYear() === viewYear;
      const dis =
        (min != null && compareDateOnly(cursor, min) < 0) ||
        (max != null && compareDateOnly(cursor, max) > 0);
      row.push({
        date: dateOnly(cursor),
        inMonth,
        disabled: dis,
        label: cursor.getDate(),
      });
      const next = new Date(cursor);
      next.setDate(next.getDate() + 1);
      cursor = dateOnly(next);
    }
    weeks.push(row);
  }
  return weeks;
}

export const DEFAULT_MONTH_LABELS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/** Cortos, orden domingo → sábado (índice = getDay()). */
export const DEFAULT_WEEKDAY_LABELS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function orderWeekdayLabels(firstDayOfWeek: 0 | 1, labels: string[]): string[] {
  if (labels.length !== 7) return labels;
  if (firstDayOfWeek === 0) return [...labels];
  return [...labels.slice(1), labels[0]!];
}
