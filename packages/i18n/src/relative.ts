import type { AnyCalendarDate, DiffUnit } from 'jalali-js';
import { diffDates } from 'jalali-js';
import type { LocalePack, RelativeUnitForms } from './locale.js';
import { formatNumber, type NumeralStyle } from './numerals.js';

export interface FormatRelativeOptions {
  /** Latin digits or the locale's native digits. Default: the locale's `defaultNumerals`. */
  numerals?: NumeralStyle;
}

const UNITS: readonly DiffUnit[] = ['year', 'month', 'week', 'day'];

/**
 * Pick the largest whole unit between `from` and `to`. Year, then month, then
 * week, then day. A zero day gap is "today".
 */
function relativeAmount(
  from: AnyCalendarDate,
  to: AnyCalendarDate,
): { unit: DiffUnit; value: number } {
  for (const unit of UNITS) {
    if (unit === 'day') break;
    const value = diffDates(from, to, unit, from.system);
    if (Math.abs(value) >= 1) return { unit, value };
  }
  return { unit: 'day', value: diffDates(from, to, 'day', from.system) };
}

function fill(template: string, n: string): string {
  return template.replaceAll('{n}', n);
}

function pickForm(forms: RelativeUnitForms, count: number): string {
  return count === 1 ? forms.one : forms.other;
}

/**
 * Format how `from` sits relative to `to` in `locale`.
 *
 * - `from` earlier than `to`: past ("3 days ago", "۳ روز پیش")
 * - `from` later than `to`: future ("in 2 months", "۲ ماه بعد")
 * - same day: `locale.relative.today`
 *
 * Unit selection uses `diffDates()` from `jalali-js`. Digits follow `numerals`.
 */
export function formatRelative(
  from: AnyCalendarDate,
  to: AnyCalendarDate,
  locale: LocalePack,
  options: FormatRelativeOptions = {},
): string {
  if (from.system !== to.system) {
    throw new Error(
      `formatRelative() needs the same calendar system on both dates (got "${from.system}" and "${to.system}").`,
    );
  }

  const { unit, value } = relativeAmount(from, to);
  if (unit === 'day' && value === 0) return locale.relative.today;

  const count = Math.abs(value);
  const numerals = options.numerals ?? locale.defaultNumerals;
  const n = formatNumber(count, numerals, locale.digits);
  const forms = value < 0 ? locale.relative.past[unit] : locale.relative.future[unit];
  return fill(pickForm(forms, count), n);
}
