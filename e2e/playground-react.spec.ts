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
});
