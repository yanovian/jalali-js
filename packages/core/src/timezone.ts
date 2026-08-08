export interface WallClockFields {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

/**
 * The offset (in minutes, positive east of UTC) that `timeZone` observes at `instantMs`. Reads
 * this from Intl's own timezone database rather than reimplementing IANA tzdata, since Intl
 * already carries the authoritative, kept-up-to-date rules (including DST transitions).
 */
export function getOffsetMinutes(instantMs: number, timeZone: string): number {
  // Intl.DateTimeFormat has no millisecond field, so both sides of the comparison below are
  // floored to the second first. Comparing the untouched instantMs against a second-only
  // reconstruction would leak up to +/-999ms of truncation noise into the result as a spurious
  // fractional-minute "offset".
  const instantSeconds = Math.floor(instantMs / 1000) * 1000;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instantSeconds));

  const field: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') field[part.type] = part.value;
  }

  // hourCycle: 'h23' can still report "24" for midnight in some engines; normalize to 0.
  const hour = Number(field.hour) === 24 ? 0 : Number(field.hour);
  const asUtc = Date.UTC(
    Number(field.year),
    Number(field.month) - 1,
    Number(field.day),
    hour,
    Number(field.minute),
    Number(field.second),
  );
  return (asUtc - instantSeconds) / 60_000;
}

/**
 * Converts wall-clock fields observed in `timeZone` to the UTC instant they represent, in
 * epoch milliseconds. Uses a two-pass offset lookup so a DST transition on the day in question
 * does not throw off the result: the first pass estimates the offset assuming the wall clock
 * was UTC, then a second pass re-reads the offset at that estimated instant and corrects for
 * it. This is the same technique used by other timezone-aware date libraries; there is no
 * single correct answer for a wall-clock time that a DST transition skips over entirely, but
 * this never throws or produces `NaN` for one.
 */
export function zonedWallClockToInstant(fields: WallClockFields, timeZone: string): number {
  const guessUtc = Date.UTC(
    fields.year,
    fields.month - 1,
    fields.day,
    fields.hour,
    fields.minute,
    fields.second,
    fields.millisecond,
  );
  const firstOffset = getOffsetMinutes(guessUtc, timeZone);
  const firstInstant = guessUtc - firstOffset * 60_000;
  const secondOffset = getOffsetMinutes(firstInstant, timeZone);
  if (secondOffset === firstOffset) return firstInstant;
  return guessUtc - secondOffset * 60_000;
}

/** The wall-clock fields that `instantMs` reads as in `timeZone`. */
export function instantToZonedFields(instantMs: number, timeZone: string): WallClockFields {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instantMs));

  const field: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') field[part.type] = part.value;
  }

  const hour = Number(field.hour) === 24 ? 0 : Number(field.hour);
  return {
    year: Number(field.year),
    month: Number(field.month),
    day: Number(field.day),
    hour,
    minute: Number(field.minute),
    second: Number(field.second),
    // Intl.DateTimeFormat has no millisecond field; recover it from the instant directly.
    millisecond: ((instantMs % 1000) + 1000) % 1000,
  };
}

/**
 * Resolves `'auto'` to a real IANA timezone name, or returns an already-explicit name as-is.
 *
 * This is SSR-safe by construction: with no `window` global (a server render, in Node, in any
 * framework), `'auto'` resolves to `'UTC'` rather than the server machine's own timezone.
 * Resolving the server's real timezone here would bake a value into server-rendered output
 * that the client almost certainly disagrees with, causing a hydration mismatch. A framework
 * binding's `useResolvedTimeZone()`-style hook re-calls this function after mount, when
 * `window` is defined, to pick up the browser's real timezone.
 */
export function resolveTimeZone(timeZone: 'auto' | string): string {
  if (timeZone !== 'auto') return timeZone;
  // Checked through `globalThis` rather than a bare `window` reference, so this package's
  // types stay Node/ES2022-only and never require the DOM lib just to compile.
  const hasWindow = typeof (globalThis as { window?: unknown }).window !== 'undefined';
  if (!hasWindow) return 'UTC';
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
