import { expect, test } from '@playwright/test';

import { expectEventCalendarPhoneLayout } from './event-calendar-phone.js';
import { expectScreenshot } from './expect-screenshot.js';

// Each section is its own named baseline. URL state pins dark + compact + fa so live shell
// controls cannot drift a cell (see playground-shared E2E_DEFAULT_SEARCH).
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

const BASE = 'http://localhost:4001/?dark=1&locale=fa&compact=1';

test.describe('playground-react', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test('demo shell default', async ({ page }) => {
    await expectScreenshot(page.getByTestId('demo-shell'), 'demo-shell.png');
  });

  test('demo shell alt controls', async ({ page }) => {
    await page.goto('http://localhost:4001/?tab=date-picker&locale=en&dark=0&compact=0');
    await expectScreenshot(page.getByTestId('demo-shell'), 'demo-shell-alt.png');
  });

  for (const { testId, name } of SECTIONS) {
    test(`section: ${testId}`, async ({ page }) => {
      await expectScreenshot(page.getByTestId(testId), name);
    });
  }

  test('calendar grid, opened', async ({ page }) => {
    const section = page.getByTestId('grid-en-jalali');
    await section.getByRole('combobox').click();
    const popover = section.getByRole('dialog');
    await expect(popover).toBeVisible();
    await expectScreenshot(popover, 'calendar-grid-open.png');
  });

  test('custom CSS override actually applies, not just looks unchanged', async ({ page }) => {
    const root = page.getByTestId('custom-theme').locator('[data-jalali-datepicker-root]');
    const input = page.getByTestId('custom-theme').locator('[data-jalali-datepicker-input]');

    await expect(root).toHaveCSS('--jalali-primary', '#c026d3');
    await expect(root).toHaveCSS('--jalali-bg', '#fdf4ff');
    await expect(root).toHaveCSS('--jalali-radius', '20px');
    await expect(input).toHaveCSS('border-radius', '20px');
  });

  test('event calendar phone layout', async ({ page }) => {
    await expectEventCalendarPhoneLayout(page, BASE);
  });
});
