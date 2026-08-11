import type { CalendarSystem, DiffUnit } from 'jalali-js';

/** A calendar system's month names, in the two styles `format()` can pick between. */
export interface MonthNames {
  /** 12 entries, index 0 is month 1 (matching a `CalendarDate.month` value of 1). */
  readonly long: readonly string[];
  readonly short: readonly string[];
}

/** One and other forms for a relative unit. `{n}` is the formatted count. */
export interface RelativeUnitForms {
  readonly one: string;
  readonly other: string;
}

/** Relative display phrases for `formatRelative()`. */
export interface RelativeForms {
  readonly today: string;
  readonly past: Record<DiffUnit, RelativeUnitForms>;
  readonly future: Record<DiffUnit, RelativeUnitForms>;
}

/**
 * A language's weekday names. Weekday names do not depend on which calendar system a date is
 * expressed in ("Monday" names the same day regardless of whether you write its date in Jalali
 * or Gregorian), so this sits at the locale level, not per calendar system.
 *
 * Index 0 is Sunday and index 6 is Saturday, matching `Date.prototype.getUTCDay()`'s
 * convention and `dayOfWeek()`'s return value from `jalali-js`.
 */
export interface WeekdayNames {
  readonly long: readonly string[];
  readonly short: readonly string[];
}

/** Accessible names for calendar chrome (nav, dialogs, field labels). */
export interface LocaleUi {
  readonly previousMonth: string;
  readonly nextMonth: string;
  readonly previousYear: string;
  readonly nextYear: string;
  readonly previousYears: string;
  readonly nextYears: string;
  readonly previousWeek: string;
  readonly nextWeek: string;
  readonly previousDay: string;
  readonly nextDay: string;
  readonly chooseMonth: string;
  readonly chooseYear: string;
  readonly chooseDate: string;
  readonly chooseDateAndTime: string;
  readonly chooseDateRange: string;
  readonly month: string;
  readonly year: string;
  readonly day: string;
  readonly hour: string;
  readonly minute: string;
}

/**
 * A complete data file for one language. Adding a locale is adding one more `LocalePack`, with
 * no change to `format()` or any other code (see architecture.md's "Internationalization").
 */
export interface LocalePack {
  /** A BCP 47-ish language tag, e.g. `'en'` or `'fa'`. Not validated; used only as a label. */
  readonly code: string;
  readonly direction: 'ltr' | 'rtl';
  /** The 10 native digit characters, index 0-9. Latin digits are `['0', '1', ..., '9']`. */
  readonly digits: readonly string[];
  /** Which digit style `format()` uses when the caller does not ask for one explicitly. */
  readonly defaultNumerals: 'latin' | 'native';
  /** Joins a weekday name onto the rest of a formatted date, e.g. `', '` or `'، '`. */
  readonly weekdaySeparator: string;
  /** Every calendar system this locale can format. A third calendar (Phase 12) adds a key here. */
  readonly monthNames: Record<CalendarSystem, MonthNames>;
  readonly weekdayNames: WeekdayNames;
  /** Placeholder text for a closed `DatePicker`/`RangePicker` with nothing selected yet, so a
   * consumer who passes no `placeholder` of their own never sees a genuinely blank input. */
  readonly datePickerPlaceholder: string;
  readonly rangePickerPlaceholder: string;
  /** Phrases for `formatRelative()`. */
  readonly relative: RelativeForms;
  /** `aria-label` and similar chrome for pickers and calendars. */
  readonly ui: LocaleUi;
}
