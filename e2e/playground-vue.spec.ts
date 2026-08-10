import { expect, test } from '@playwright/test';

import { expectScreenshot } from './expect-screenshot.js';

// Mirrors playground-react.spec.ts's section list and naming, on purpose: both bindings render
// the same configs, so a reviewer comparing the two PR screenshot grids side by side sees
// matching filenames.
const SECTIONS = [
  { testId: 'grid-en-jalali', name: 'grid-en-jalali.png' },
  { testId: 'grid-fa-jalali', name: 'grid-fa-jalali.png' },
  { testId: 'grid-ps-jalali', name: 'grid-ps-jalali.png' },
  { testId: 'dropdown', name: 'dropdown.png' },
  { testId: 'gregorian', name: 'gregorian.png' },
  { testId: 'inline-calendar', name: 'inline-calendar.png' },
  { testId: 'range-picker', name: 'range-picker.png' },
  { testId: 'time-picker', name: 'time-picker.png' },
  { testId: 'datetime-picker', name: 'datetime-picker.png' },
  { testId: 'time-range-picker', name: 'time-range-picker.png' },
  { testId: 'event-calendar', name: 'event-calendar.png' },
  { testId: 'event-calendar-week', name: 'event-calendar-week.png' },
  { testId: 'event-calendar-day', name: 'event-calendar-day.png' },
  { testId: 'selection-rules', name: 'selection-rules.png' },
  { testId: 'holidays', name: 'holidays.png' },
  { testId: 'custom-theme', name: 'custom-theme.png' },
] as const;

test.describe('playground-vue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4002/');
  });

  for (const { testId, name } of SECTIONS) {
    test(`section: ${testId}`, async ({ page }) => {
      await expectScreenshot(page.getByTestId(testId), name);
    });
  }

  test('calendar grid, opened', async ({ page }) => {
    // Screenshot the popover itself, not the section it opens from: see the matching comment
    // in playground-react.spec.ts.
    const section = page.getByTestId('grid-en-jalali');
    await section.getByRole('combobox').click();
    const popover = section.getByRole('dialog');
    await expect(popover).toBeVisible();
    await expectScreenshot(popover, 'calendar-grid-open.png');
  });

  test('custom CSS override actually applies, not just looks unchanged', async ({ page }) => {
    // See the matching comment in playground-react.spec.ts: a screenshot diff only proves the
    // render changed, not that a specific configured value took effect.
    const root = page.getByTestId('custom-theme').locator('[data-jalali-datepicker-root]');
    const input = page.getByTestId('custom-theme').locator('[data-jalali-datepicker-input]');

    await expect(root).toHaveCSS('--jalali-primary', '#c026d3');
    await expect(root).toHaveCSS('--jalali-bg', '#fdf4ff');
    await expect(root).toHaveCSS('--jalali-radius', '20px');
    await expect(input).toHaveCSS('border-radius', '20px');
  });
});
