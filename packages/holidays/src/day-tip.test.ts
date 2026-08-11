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
  it('builds tip and aria label for a holiday cell', () => {
    const chrome = holidayDayChrome(
      'Saturday, 1 Farvardin 1403',
      { date: { year: 1403, month: 1, day: 1 }, isHoliday: true, isSelectable: false },
      { locale: 'en', region: 'IR', closedLabel: 'Closed' },
    );
    expect(chrome.tip).toBe('Nowruz · Closed');
    expect(chrome.ariaLabel).toBe('Saturday, 1 Farvardin 1403. Nowruz · Closed');
  });

  it('skips tip when the day is not a holiday', () => {
    const chrome = holidayDayChrome(
      'Saturday, 1 Farvardin 1403',
      { date: { year: 1403, month: 1, day: 1 }, isHoliday: false, isSelectable: true },
      { locale: 'en', region: 'IR', closedLabel: 'Closed' },
    );
    expect(chrome.tip).toBeUndefined();
    expect(chrome.ariaLabel).toBe('Saturday, 1 Farvardin 1403');
  });
});

describe('holidayDayAriaLabel', () => {
  it('keeps the date label when there is no tip', () => {
    expect(holidayDayAriaLabel('Saturday, 1 Farvardin 1403', undefined)).toBe(
      'Saturday, 1 Farvardin 1403',
    );
  });
});
