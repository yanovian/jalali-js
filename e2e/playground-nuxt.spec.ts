import { expect, test } from '@playwright/test';

import { expectScreenshot } from './expect-screenshot.js';

// Same shape as playground-next.spec.ts: playground-nuxt exercises @jalali-js/vue under real
// SSR and hydration, with no locale/theme demo matrix of its own, so one full-page smoke
// screenshot is the meaningful check here.
test('playground-nuxt renders and hydrates', async ({ page }) => {
  await page.goto('http://localhost:4004/');
  await expect(page.getByTestId('stored-value')).toBeVisible();
  await expectScreenshot(page, 'playground-nuxt.png', { fullPage: true });
});
