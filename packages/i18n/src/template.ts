import type { AnyCalendarDate, CalendarDate, CalendarSystem } from 'jalali-js';
import { dayOfWeek, getCalendarEngine } from 'jalali-js';
import type { LocalePack } from './locale.js';
import { formatNumber, type NumeralStyle } from './numerals.js';

/**
 * The template tokens `format()` and `parseTemplate()` understand. Listed longest first, so
 * the tokenizer never reads `MMMM` as two `MM`s. Text between tokens passes through as-is.
 */
const TOKENS = ['YYYY', 'MMMM', 'dddd', 'MMM', 'ddd', 'MM', 'DD', 'M', 'D'] as const;
type Token = (typeof TOKENS)[number];

type Part = { kind: 'token'; token: Token } | { kind: 'literal'; text: string };

type NumberField = 'year' | 'month' | 'day';

/** The numeric tokens, with the digit counts `parseTemplate()` accepts for each. */
const NUMBER_TOKENS: Partial<Record<Token, { field: NumberField; min: number; max: number }>> = {
  YYYY: { field: 'year', min: 4, max: 4 },
  MM: { field: 'month', min: 2, max: 2 },
  M: { field: 'month', min: 1, max: 2 },
  DD: { field: 'day', min: 2, max: 2 },
  D: { field: 'day', min: 1, max: 2 },
};

function tokenize(template: string): Part[] {
  const parts: Part[] = [];
  let index = 0;
  while (index < template.length) {
    const token = TOKENS.find((candidate) => template.startsWith(candidate, index));
    if (token) {
      parts.push({ kind: 'token', token });
      index += token.length;
      continue;
    }
    const char = template[index] as string;
    const last = parts[parts.length - 1];
    if (last?.kind === 'literal') last.text += char;
    else parts.push({ kind: 'literal', text: char });
    index += 1;
  }
  return parts;
}

/** Renders `date` through a token template. Called by `format()` when `options.template` is set. */
export function formatTemplate(
  date: AnyCalendarDate,
  locale: LocalePack,
  template: string,
  numerals: NumeralStyle,
): string {
  const monthNames = locale.monthNames[date.system];
  const number = (value: number, width: number) =>
    formatNumber(value, numerals, locale.digits, width);
  const weekdayName = (style: 'long' | 'short') =>
    locale.weekdayNames[style][dayOfWeek(date, date.system)] ?? '';

  return tokenize(template)
    .map((part) => {
      if (part.kind === 'literal') return part.text;
      switch (part.token) {
        case 'YYYY':
          return number(date.year, 4);
        case 'MM':
          return number(date.month, 2);
        case 'M':
          return number(date.month, 0);
        case 'DD':
          return number(date.day, 2);
        case 'D':
          return number(date.day, 0);
        case 'MMMM':
          return monthNames.long[date.month - 1] ?? '';
        case 'MMM':
          return monthNames.short[date.month - 1] ?? '';
        case 'dddd':
          return weekdayName('long');
        case 'ddd':
          return weekdayName('short');
      }
    })
    .join('');
}

export interface ParseTemplateOptions {
  /** Which calendar system the input's fields are in. Default: `'jalali'`. */
  system?: CalendarSystem;
}

/**
 * Reads digits at `pos`, in Latin or in `digits` (a locale's native set). Accepts between
 * `min` and `max` digit characters, reading greedily.
 */
function readNumber(
  input: string,
  pos: number,
  min: number,
  max: number,
  digits: readonly string[],
): { value: number; next: number } | null {
  let value = 0;
  let count = 0;
  while (count < max && pos + count < input.length) {
    const char = input[pos + count] as string;
    const digit = char >= '0' && char <= '9' ? char.charCodeAt(0) - 48 : digits.indexOf(char);
    if (digit < 0) break;
    value = value * 10 + digit;
    count += 1;
  }
  return count >= min ? { value, next: pos + count } : null;
}

/** Matches the longest of `names` at `pos`. Longest wins when one name prefixes another. */
function matchName(
  input: string,
  pos: number,
  names: readonly string[],
): { index: number; next: number } | null {
  let best: { index: number; next: number } | null = null;
  names.forEach((name, index) => {
    if (!name || !input.startsWith(name, pos)) return;
    if (!best || pos + name.length > best.next) best = { index, next: pos + name.length };
  });
  return best;
}

/**
 * Strictly parses `input` against a token template, the reverse of `format()` with
 * `options.template`. Returns `null` when the input does not match the template's exact
 * shape, when a field repeats with a different value, when the date does not exist, or when
 * a weekday name does not match the parsed date.
 *
 * Digits are accepted in Latin or in `locale`'s native set. The template must produce a
 * year, a month, and a day.
 */
export function parseTemplate(
  input: string,
  template: string,
  locale: LocalePack,
  options: ParseTemplateOptions = {},
): CalendarDate | null {
  const system = options.system ?? 'jalali';
  const monthNames = locale.monthNames[system];
  const fields: Partial<Record<NumberField, number>> = {};
  let weekday: number | undefined;
  let pos = 0;

  const assign = (field: NumberField, value: number): boolean => {
    if (fields[field] !== undefined && fields[field] !== value) return false;
    fields[field] = value;
    return true;
  };

  for (const part of tokenize(template)) {
    if (part.kind === 'literal') {
      if (!input.startsWith(part.text, pos)) return null;
      pos += part.text.length;
      continue;
    }
    const numeric = NUMBER_TOKENS[part.token];
    if (numeric) {
      const read = readNumber(input, pos, numeric.min, numeric.max, locale.digits);
      if (!read || !assign(numeric.field, read.value)) return null;
      pos = read.next;
      continue;
    }
    const isMonth = part.token === 'MMMM' || part.token === 'MMM';
    const names = isMonth
      ? monthNames[part.token === 'MMMM' ? 'long' : 'short']
      : locale.weekdayNames[part.token === 'dddd' ? 'long' : 'short'];
    const match = matchName(input, pos, names);
    if (!match) return null;
    if (isMonth) {
      if (!assign('month', match.index + 1)) return null;
    } else {
      if (weekday !== undefined && weekday !== match.index) return null;
      weekday = match.index;
    }
    pos = match.next;
  }

  if (pos !== input.length) return null;
  const { year, month, day } = fields;
  if (year === undefined || month === undefined || day === undefined) return null;

  const engine = getCalendarEngine(system);
  if (month < 1 || month > engine.monthsInYear) return null;
  if (day < 1 || day > engine.daysInMonth(year, month)) return null;

  const date: CalendarDate = { precision: 'date', system, year, month, day };
  if (weekday !== undefined && dayOfWeek(date, system) !== weekday) return null;
  return date;
}
