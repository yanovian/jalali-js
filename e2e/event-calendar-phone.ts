import { expect, type Page } from '@playwright/test';

import { expectScreenshot } from './expect-screenshot.js';

const PHONE = { width: 375, height: 812 } as const;

const VIEWS = [
  { testId: 'event-calendar', name: 'event-calendar-phone.png' },
  { testId: 'event-calendar-week', name: 'event-calendar-week-phone.png' },
  { testId: 'event-calendar-day', name: 'event-calendar-day-phone.png' },
] as const;

/** Phone-width EventCalendar checks shared by the React, Vue, and vanilla playgrounds. */
export async function expectEventCalendarPhoneLayout(page: Page, baseUrl: string): Promise<void> {
  await page.setViewportSize(PHONE);
  await page.goto(baseUrl);

  for (const { testId, name } of VIEWS) {
    const section = page.getByTestId(testId);
    await section.scrollIntoViewIfNeeded();
    const root = section.locator('[data-jalali-eventcalendar-root]');
    const box = await root.boundingBox();
    expect(box, `${testId} root should be visible`).toBeTruthy();
    expect(box!.width).toBeLessThanOrEqual(PHONE.width);

    if (testId !== 'event-calendar') {
      const period = section.locator('[data-jalali-eventcalendar-period]');
      await expect(period).toBeVisible();
      await expect(period).toHaveAttribute('tabindex', '0');
      const overflowX = await period.evaluate((el) => getComputedStyle(el).overflowX);
      expect(['auto', 'scroll', 'overlay']).toContain(overflowX);
      const timed = section.locator('[data-jalali-eventcalendar-timed]');
      await expect(timed).toHaveAttribute('tabindex', '0');
    }

    await expectScreenshot(section, name);
  }
}
