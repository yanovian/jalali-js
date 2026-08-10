import { expect, test } from '@playwright/test';

import { expectScreenshot } from './expect-screenshot.js';

// playground-next exercises @jalali-js/react under real SSR and hydration (see its own
// page.tsx); it has no locale/theme demo matrix of its own like playground-react/-vue do, so
// this is one full-page smoke screenshot confirming SSR-rendered markup and post-hydration
// markup match visually (no flash of unstyled/unhydrated content).
test('playground-next renders and hydrates', async ({ page }) => {
  await page.goto('http://localhost:4003/');
  await expect(page.getByTestId('stored-value')).toBeVisible();
  await expectScreenshot(page, 'playground-next.png', { fullPage: true });
});
