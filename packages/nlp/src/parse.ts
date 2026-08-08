import type { CalendarDate, CalendarSystem } from 'jalali-js';
import { addDays, createCalendar } from 'jalali-js';
import type { NlpLocale, WordList } from './word-list.js';
import { getWordList } from './word-list.js';

export interface ParseOptions {
  /** Which calendar system the result is expressed in. Default: 'jalali'. */
  system?: CalendarSystem;
}

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

function matchesAny(normalized: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => normalize(phrase) === normalized);
}

function toCalendarDate(
  fields: { year: number; month: number; day: number },
  system: CalendarSystem,
): CalendarDate {
  return { precision: 'date', system, ...fields };
}

// "next <month>" (English: prefix) or "<month> آینده" / "<month> ayande" (Farsi and Finglish:
// suffix). The target year is this year if the named month has not started yet, or next year
// if it already has (or is the current month): "next" means the upcoming occurrence, not the
// one already under way. The day is fixed at 1, the same convention "next Monday" uses for
// "which day inside that period" when none is given.
function matchNextMonth(
  normalized: string,
  words: WordList,
  today: CalendarDate,
): CalendarDate | null {
  for (const marker of words.nextMonthMarkers) {
    const normalizedMarker = normalize(marker);
    let candidate: string | undefined;
    if (words.nextMonthOrder === 'prefix' && normalized.startsWith(`${normalizedMarker} `)) {
      candidate = normalized.slice(normalizedMarker.length + 1);
    } else if (words.nextMonthOrder === 'suffix' && normalized.endsWith(` ${normalizedMarker}`)) {
      candidate = normalized.slice(0, normalized.length - normalizedMarker.length - 1);
    }
    if (candidate === undefined) continue;

    const monthIndex = words.monthNames.findIndex((variants) =>
      matchesAny(candidate as string, variants),
    );
    if (monthIndex === -1) continue;

    const month = monthIndex + 1;
    const year = month > today.month ? today.year : today.year + 1;
    return toCalendarDate({ year, month, day: 1 }, today.system);
  }
  return null;
}

/**
 * Reads a natural language date phrase in the given input style and returns the calendar date
 * it names, or `null` when the phrase is not one this parser recognizes. This covers a fixed,
 * testable set of relative terms and month phrases (see architecture.md's "Natural language
 * date parsing"); it is not a general natural language engine.
 */
export function parse(
  input: string,
  locale: NlpLocale,
  options: ParseOptions = {},
): CalendarDate | null {
  const system = options.system ?? 'jalali';
  const words = getWordList(locale);
  const normalized = normalize(input);
  if (normalized === '') return null;

  const today = createCalendar({ system }).today();

  if (matchesAny(normalized, words.today)) return today;
  if (matchesAny(normalized, words.tomorrow))
    return toCalendarDate(addDays(today, 1, system), system);
  if (matchesAny(normalized, words.yesterday))
    return toCalendarDate(addDays(today, -1, system), system);
  if (matchesAny(normalized, words.nextWeek))
    return toCalendarDate(addDays(today, 7, system), system);

  return matchNextMonth(normalized, words, today);
}
