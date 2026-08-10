import { expect, test } from '@playwright/test';

// Each section is its own named baseline, so a diff in one config (say, RTL Farsi) never masks
// or gets masked by a diff in another; see architecture.md's "Visual regression and PR
// screenshots" for how these baselines are reviewed and updated.
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

test.describe('playground-react', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4001/');
  });

  for (const { testId, name } of SECTIONS) {
    test(`section: ${testId}`, async ({ page }) => {
      await expect(page.getByTestId(testId)).toHaveScreenshot(name);
    });
  }

  test('calendar grid, opened', async ({ page }) => {
    // The sections above capture each config's closed, default appearance; this one confirms
    // the actual calendar grid itself (month header, weekday row, RTL/LTR, dark+compact theme)
    // still renders correctly, the highest-value single screenshot in this file. Screenshot the
    // popover itself, not the section it opens from: the popover is `position: absolute` and
    // pokes outside the section's own box, so a section-scoped screenshot clips it.
    const section = page.getByTestId('grid-en-jalali');
    await section.getByRole('combobox').click();
    const popover = section.getByRole('dialog');
    await expect(popover).toBeVisible();
    await expect(popover).toHaveScreenshot('calendar-grid-open.png');
  });

  test('custom CSS override actually applies, not just looks unchanged', async ({ page }) => {
    // A screenshot diff only proves the render changed from its baseline; it does not prove a
    // specific configured value took effect. This asserts on the real computed styles instead,
    // so a broken override (say, a CSS specificity regression that lets the default value win)
    // fails with a clear "expected X, got Y" instead of a pixel diff that could be misread as
    // an unrelated visual regression.
    const root = page.getByTestId('custom-theme').locator('[data-jalali-datepicker-root]');
    const input = page.getByTestId('custom-theme').locator('[data-jalali-datepicker-input]');

    await expect(root).toHaveCSS('--jalali-primary', '#c026d3');
    await expect(root).toHaveCSS('--jalali-bg', '#fdf4ff');
    await expect(root).toHaveCSS('--jalali-radius', '20px');

    // The custom property is only half the proof; confirm a rule that consumes it actually
    // resolved to the overridden value, not the library's own default.
    await expect(input).toHaveCSS('border-radius', '20px');
  });
});
