import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { instantToZonedFields, resolveTimeZone, zonedWallClockToInstant } from './timezone.js';

describe('zonedWallClockToInstant', () => {
  it('converts a fixed-offset timezone correctly (Asia/Tehran, UTC+03:30, no DST since 2022)', () => {
    const instant = zonedWallClockToInstant(
      { year: 2024, month: 7, day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 },
      'Asia/Tehran',
    );
    expect(new Date(instant).toISOString()).toBe('2024-07-01T08:30:00.000Z');
  });

  it('converts a DST-observing timezone correctly in summer (America/New_York, EDT = UTC-4)', () => {
    const instant = zonedWallClockToInstant(
      { year: 2024, month: 7, day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 },
      'America/New_York',
    );
    expect(new Date(instant).toISOString()).toBe('2024-07-01T16:00:00.000Z');
  });

  it('converts a DST-observing timezone correctly in winter (America/New_York, EST = UTC-5)', () => {
    const instant = zonedWallClockToInstant(
      { year: 2024, month: 1, day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 },
      'America/New_York',
    );
    expect(new Date(instant).toISOString()).toBe('2024-01-01T17:00:00.000Z');
  });

  it('treats UTC as a zero offset', () => {
    const instant = zonedWallClockToInstant(
      { year: 2024, month: 1, day: 1, hour: 12, minute: 0, second: 0, millisecond: 0 },
      'UTC',
    );
    expect(new Date(instant).toISOString()).toBe('2024-01-01T12:00:00.000Z');
  });

  it('does not throw for a wall-clock time a DST transition skips over', () => {
    // 2024-03-10 02:30 America/New_York does not exist: clocks spring forward from 02:00 to 03:00.
    expect(() =>
      zonedWallClockToInstant(
        { year: 2024, month: 3, day: 10, hour: 2, minute: 30, second: 0, millisecond: 0 },
        'America/New_York',
      ),
    ).not.toThrow();
  });
});

describe('instantToZonedFields', () => {
  it('round-trips through zonedWallClockToInstant', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: Date.UTC(1970, 0, 1), max: Date.UTC(2100, 0, 1) }),
        fc.constantFrom(
          'UTC',
          'Asia/Tehran',
          'America/New_York',
          'Asia/Tokyo',
          'Pacific/Kiritimati',
        ),
        (instantMs, timeZone) => {
          const fields = instantToZonedFields(instantMs, timeZone);
          const back = zonedWallClockToInstant(fields, timeZone);
          expect(back).toBe(instantMs);
        },
      ),
    );
  });
});

describe('resolveTimeZone', () => {
  it('returns an explicit timezone unchanged', () => {
    expect(resolveTimeZone('Asia/Tehran')).toBe('Asia/Tehran');
  });

  it("resolves 'auto' to UTC outside a browser environment (no window global)", () => {
    // This test runs under Vitest's Node environment, which has no `window` global, the same
    // as a server render. This is exactly the SSR-safety behavior architecture.md documents.
    expect(resolveTimeZone('auto')).toBe('UTC');
  });
});
