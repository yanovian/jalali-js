import { describe, expect, it } from 'vitest';

import { holidayDayAriaLabel, holidayDayChrome, holidayDayTip } from './day-tip.js';

describe('holidayDayTip', () => {
  it('lists one holiday name', () => {
    expect(holidayDayTip({ year: 1403, month: 1, day: 1 }, { locale: 'en', region: 'IR' })).toBe(
      'Nowruz',
    );
  });

  it('joins more than one holiday on the same day', () => {
    expect(holidayDayTip({ year: 1403, month: 1, day: 13 }, { locale: 'en', region: 'IR' })).toBe(
      'Sizdah Bedar · Shahadat-e Imam Ali',
    );
  });

  it('appends the closed label when the day is blocked', () => {
    expect(
      holidayDayTip(
        { year: 1403, month: 1, day: 1 },
        { locale: 'en', region: 'IR', closed: true, closedLabel: 'Closed' },
      ),
    ).toBe('Nowruz · Closed');
  });

  it('returns undefined when there is no holiday tip', () => {
    expect(
      holidayDayTip({ year: 1403, month: 2, day: 10 }, { locale: 'en', region: 'IR' }),
    ).toBeUndefined();
  });
});

describe('holidayDayChrome', () => {
  const options = { locale: 'en' as const, region: 'IR' as const, closedLabel: 'Closed' };
  const nowruz = { year: 1403, month: 1, day: 1 };

  it('builds tip and aria for holiday, closed holiday, and plain day', () => {
    expect(
      holidayDayChrome(
        '1 Farvardin 1403',
        { date: nowruz, isHoliday: true, isSelectable: true },
        options,
      ),
    ).toEqual({ tip: 'Nowruz', ariaLabel: '1 Farvardin 1403. Nowruz' });
    expect(
      holidayDayChrome(
        '1 Farvardin 1403',
        { date: nowruz, isHoliday: true, isSelectable: false },
        options,
      ),
    ).toEqual({ tip: 'Nowruz · Closed', ariaLabel: '1 Farvardin 1403. Nowruz · Closed' });
    expect(
      holidayDayChrome(
        '1 Farvardin 1403',
        { date: nowruz, isHoliday: false, isSelectable: true },
        options,
      ),
    ).toEqual({ ariaLabel: '1 Farvardin 1403' });
  });
});

describe('holidayDayAriaLabel', () => {
  it('keeps the date label when there is no tip', () => {
    expect(holidayDayAriaLabel('1 Farvardin 1403', undefined)).toBe('1 Farvardin 1403');
  });
});
