import { expect, type Page } from '@playwright/test';

const PHONE = { width: 375, height: 812 } as const;

const PHONE_SECTIONS = [
  'inline-calendar',
  'range-picker',
  'time-picker',
  'time-range-picker',
  'event-calendar',
] as const;

function contrastRatio(fg: string, bg: string): number {
  const toRgb = (value: string): [number, number, number] => {
    const hex = value.trim();
    if (hex.startsWith('#') && hex.length === 7) {
      const n = Number.parseInt(hex.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) throw new Error(`Unsupported color: ${value}`);
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  };
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum = (rgb: [number, number, number]) =>
    0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  const L1 = lum(toRgb(fg));
  const L2 = lum(toRgb(bg));
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Phone-width layout and theme-token contrast checks for Calendar, DatePicker
 * surfaces, RangePicker, time pickers, and EventCalendar.
 */
export async function expectCalendarsPhoneAndTheme(
  page: Page,
  darkBaseUrl: string,
  lightBaseUrl: string,
): Promise<void> {
  await page.setViewportSize(PHONE);

  await page.goto(darkBaseUrl);
  for (const testId of PHONE_SECTIONS) {
    const section = page.getByTestId(testId);
    await section.scrollIntoViewIfNeeded();
    const root = section
      .locator(
        '[data-jalali-calendar-root], [data-jalali-datepicker-root], [data-jalali-timepicker-root], [data-jalali-timerangepicker-root]',
      )
      .first();
    const box = await root.boundingBox();
    expect(box, `${testId} should be visible on phone`).toBeTruthy();
    expect(box!.width, `${testId} should fit the phone width`).toBeLessThanOrEqual(PHONE.width + 1);
  }

  const darkRoot = page.getByTestId('inline-calendar').locator('[data-jalali-calendar-root]');
  const darkTokens = await darkRoot.evaluate((el) => {
    const styles = getComputedStyle(el);
    return {
      bg: styles.getPropertyValue('--jalali-bg').trim(),
      fg: styles.getPropertyValue('--jalali-fg').trim(),
      muted: styles.getPropertyValue('--jalali-muted-fg').trim(),
      border: styles.getPropertyValue('--jalali-border').trim(),
      holiday: styles.getPropertyValue('--jalali-holiday-fg').trim(),
      eventBg: styles.getPropertyValue('--jalali-event-bg').trim(),
      eventFg: styles.getPropertyValue('--jalali-event-fg').trim(),
    };
  });
  expect(contrastRatio(darkTokens.fg, darkTokens.bg)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(darkTokens.muted, darkTokens.bg)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(darkTokens.border, darkTokens.bg)).toBeGreaterThanOrEqual(3);
  expect(contrastRatio(darkTokens.holiday, darkTokens.bg)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(darkTokens.eventFg, darkTokens.eventBg)).toBeGreaterThanOrEqual(4.5);

  const today = darkRoot.locator('[data-jalali-calendar-day][data-today]').first();
  if (await today.count()) {
    const ring = await today.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(ring).toMatch(/inset/);
  }

  await page.goto(lightBaseUrl);
  const lightRoot = page.getByTestId('inline-calendar').locator('[data-jalali-calendar-root]');
  const lightTokens = await lightRoot.evaluate((el) => {
    const styles = getComputedStyle(el);
    return {
      bg: styles.getPropertyValue('--jalali-bg').trim(),
      fg: styles.getPropertyValue('--jalali-fg').trim(),
      muted: styles.getPropertyValue('--jalali-muted-fg').trim(),
      border: styles.getPropertyValue('--jalali-border').trim(),
      focusRing: styles.getPropertyValue('--jalali-focus-ring').trim(),
    };
  });
  expect(contrastRatio(lightTokens.fg, lightTokens.bg)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(lightTokens.muted, lightTokens.bg)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(lightTokens.border, lightTokens.bg)).toBeGreaterThanOrEqual(3);
  expect(lightTokens.focusRing.length).toBeGreaterThan(0);

  const input = page.getByTestId('grid-en-jalali').locator('[data-jalali-datepicker-input]');
  const inputBox = await input.boundingBox();
  expect(inputBox, 'date picker input should be visible on phone').toBeTruthy();
  expect(inputBox!.width).toBeLessThanOrEqual(PHONE.width + 1);
}
