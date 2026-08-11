import { describe, expect, it } from 'vitest';

import { en, fa, localePackFor, ps, type LocaleCode, type LocaleUi } from './index.js';

const UI_KEYS = [
  'previousMonth',
  'nextMonth',
  'previousYear',
  'nextYear',
  'previousYears',
  'nextYears',
  'previousWeek',
  'nextWeek',
  'previousDay',
  'nextDay',
  'chooseMonth',
  'chooseYear',
  'chooseDate',
  'chooseDateAndTime',
  'chooseDateRange',
  'month',
  'year',
  'day',
  'hour',
  'minute',
  'closedDay',
] as const satisfies ReadonlyArray<keyof LocaleUi>;

describe('locale ui chrome', () => {
  it.each(['en', 'fa', 'ps'] as LocaleCode[])('%s pack has every ui string', (code) => {
    const ui = localePackFor(code).ui;
    for (const key of UI_KEYS) {
      expect(ui[key].length, key).toBeGreaterThan(0);
    }
  });

  it('keeps English control names stable for tests and defaults', () => {
    expect(en.ui.previousMonth).toBe('Previous month');
    expect(en.ui.chooseYear).toBe('Choose year');
    expect(en.ui.hour).toBe('Hour');
  });

  it('localizes fa and ps chrome away from English', () => {
    expect(fa.ui.previousMonth).not.toBe(en.ui.previousMonth);
    expect(ps.ui.chooseDate).not.toBe(en.ui.chooseDate);
  });
});
