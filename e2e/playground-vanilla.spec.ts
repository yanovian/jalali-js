import { expect, test } from '@playwright/test';

// Each section is its own named baseline, so a diff in one config (say, RTL Farsi) never masks
// or gets masked by a diff in another; see architecture.md's "Visual regression and PR
// screenshots" for how these baselines are reviewed and updated.
const SECTIONS = [
  { testId: 'grid-en-jalali', name: 'grid-en-jalali.png' },
  { testId: 'grid-fa-jalali', name: 'grid-fa-jalali.png' },
  { testId: 'dropdown', name: 'dropdown.png' },
  { testId: 'gregorian', name: 'gregorian.png' },
  { testId: 'inline-calendar', name: 'inline-calendar.png' },
  { testId: 'range-picker', name: 'range-picker.png' },
  { testId: 'time-picker', name: 'time-picker.png' },
  { testId: 'datetime-picker', name: 'datetime-picker.png' },
  { testId: 'time-range-picker', name: 'time-range-picker.png' },
  { testId: 'selection-rules', name: 'selection-rules.png' },
  { testId: 'holidays', name: 'holidays.png' },
  { testId: 'custom-theme', name: 'custom-theme.png' },
] as const;

test.describe('playground-vanilla', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4005/');
  });

  for (const { testId, name } of SECTIONS) {
    test(`section: ${testId}`, async ({ page }) => {
      await expect(page.getByTestId(testId)).toHaveScreenshot(name);
    });
  }

  test('calendar grid, opened', async ({ page }) => {
    // Screenshot the popover itself, not the section it opens from: the popover is
    // `position: absolute` and pokes outside the section's own box, so a section-scoped
    // screenshot clips it (same as playground-react.spec.ts's own version of this test).
    const section = page.getByTestId('grid-en-jalali');
    await section.getByRole('combobox').click();
    const popover = section.getByRole('dialog');
    await expect(popover).toBeVisible();
    await expect(popover).toHaveScreenshot('calendar-grid-open.png');
  });

  test('custom CSS override actually applies, not just looks unchanged', async ({ page }) => {
    // A screenshot diff only proves the render changed from its baseline; it does not prove a
    // specific configured value took effect. This asserts on the real computed styles instead.
    const root = page.getByTestId('custom-theme').locator('[data-jalali-datepicker-root]');
    const input = page.getByTestId('custom-theme').locator('[data-jalali-datepicker-input]');

    await expect(root).toHaveCSS('--jalali-primary', '#c026d3');
    await expect(root).toHaveCSS('--jalali-bg', '#fdf4ff');
    await expect(root).toHaveCSS('--jalali-radius', '20px');
    await expect(input).toHaveCSS('border-radius', '20px');
  });

  test('no framework runtime: no React/Vue global present', async ({ page }) => {
    const globals = await page.evaluate(() => ({
      react: typeof (window as unknown as { React?: unknown }).React,
      vue: typeof (window as unknown as { Vue?: unknown }).Vue,
      customElementDefined: !!customElements.get('jalali-date-picker'),
    }));
    expect(globals.react).toBe('undefined');
    expect(globals.vue).toBe('undefined');
    expect(globals.customElementDefined).toBe(true);
  });
});
