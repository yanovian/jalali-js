import { expect, test } from '@playwright/test';

// Mirrors playground-react.spec.ts's section list and naming, on purpose: both bindings render
// the same configs, so a reviewer comparing the two PR screenshot grids side by side sees
// matching filenames.
const SECTIONS = [
  { testId: 'grid-en-jalali', name: 'grid-en-jalali.png' },
  { testId: 'grid-fa-jalali', name: 'grid-fa-jalali.png' },
  { testId: 'dropdown', name: 'dropdown.png' },
  { testId: 'gregorian', name: 'gregorian.png' },
  { testId: 'inline-calendar', name: 'inline-calendar.png' },
  { testId: 'range-picker', name: 'range-picker.png' },
] as const;

test.describe('playground-vue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4002/');
  });

  for (const { testId, name } of SECTIONS) {
    test(`section: ${testId}`, async ({ page }) => {
      await expect(page.getByTestId(testId)).toHaveScreenshot(name);
    });
  }

  test('calendar grid, opened', async ({ page }) => {
    // Screenshot the popover itself, not the section it opens from: see the matching comment
    // in playground-react.spec.ts.
    const section = page.getByTestId('grid-en-jalali');
    await section.getByRole('combobox').click();
    const popover = section.getByRole('dialog');
    await expect(popover).toBeVisible();
    await expect(popover).toHaveScreenshot('calendar-grid-open.png');
  });
});
