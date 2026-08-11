import { expect, type Locator, type Page } from '@playwright/test';

const PHONE = { width: 375, height: 812 } as const;

const PHONE_SECTIONS = [
  'inline-calendar',
  'range-picker',
  'time-picker',
  'time-range-picker',
  'event-calendar',
] as const;

const PICKER_ROOT =
  '[data-jalali-calendar-root], [data-jalali-datepicker-root], [data-jalali-timepicker-root], [data-jalali-timerangepicker-root]';

type Rgb = [number, number, number];

/** WCAG contrast ratio for two sRGB colors. */
function contrastRatio(fg: Rgb, bg: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const luminance = ([r, g, b]: Rgb) =>
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Read CSS variables as rgb triples. The browser expands `#fff`, `var(...)`,
 * and other forms, so the test does not need its own color parser.
 */
async function themeRgb(root: Locator, names: readonly string[]): Promise<Record<string, Rgb>> {
  return root.evaluate((el, vars) => {
    const styles = getComputedStyle(el);
    const probe = document.createElement('div');
    el.appendChild(probe);
    const out: Record<string, [number, number, number]> = {};
    for (const name of vars) {
      probe.style.color = styles.getPropertyValue(name).trim();
      const match = getComputedStyle(probe).color.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (!match) throw new Error(`Cannot resolve ${name}`);
      out[name] = [Number(match[1]), Number(match[2]), Number(match[3])];
    }
    probe.remove();
    return out;
  }, names);
}

async function expectFitsPhone(target: Locator, label: string): Promise<void> {
  const box = await target.boundingBox();
  expect(box, `${label} should be visible on phone`).toBeTruthy();
  expect(box!.width, `${label} should fit the phone width`).toBeLessThanOrEqual(PHONE.width + 1);
}

function expectMinContrast(fg: Rgb, bg: Rgb, min: number, label: string): void {
  expect(contrastRatio(fg, bg), label).toBeGreaterThanOrEqual(min);
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
    const root = page.getByTestId(testId).locator(PICKER_ROOT).first();
    await root.scrollIntoViewIfNeeded();
    await expectFitsPhone(root, testId);
  }

  const darkRoot = page.getByTestId('inline-calendar').locator('[data-jalali-calendar-root]');
  const dark = await themeRgb(darkRoot, [
    '--jalali-bg',
    '--jalali-fg',
    '--jalali-muted-fg',
    '--jalali-border',
    '--jalali-holiday-fg',
    '--jalali-event-bg',
    '--jalali-event-fg',
  ]);
  expectMinContrast(dark['--jalali-fg'], dark['--jalali-bg'], 4.5, 'dark fg');
  expectMinContrast(dark['--jalali-muted-fg'], dark['--jalali-bg'], 4.5, 'dark muted');
  expectMinContrast(dark['--jalali-border'], dark['--jalali-bg'], 3, 'dark border');
  expectMinContrast(dark['--jalali-holiday-fg'], dark['--jalali-bg'], 4.5, 'dark holiday');
  expectMinContrast(dark['--jalali-event-fg'], dark['--jalali-event-bg'], 4.5, 'dark event');

  const today = darkRoot.locator('[data-jalali-calendar-day][data-today]').first();
  if (await today.count()) {
    await expect(today).toHaveCSS('box-shadow', /inset/);
  }

  await page.goto(lightBaseUrl);
  const lightRoot = page.getByTestId('inline-calendar').locator('[data-jalali-calendar-root]');
  const light = await themeRgb(lightRoot, [
    '--jalali-bg',
    '--jalali-fg',
    '--jalali-muted-fg',
    '--jalali-border',
  ]);
  expectMinContrast(light['--jalali-fg'], light['--jalali-bg'], 4.5, 'light fg');
  expectMinContrast(light['--jalali-muted-fg'], light['--jalali-bg'], 4.5, 'light muted');
  expectMinContrast(light['--jalali-border'], light['--jalali-bg'], 3, 'light border');

  const focusRing = await lightRoot.evaluate((el) =>
    getComputedStyle(el).getPropertyValue('--jalali-focus-ring').trim(),
  );
  expect(focusRing.length).toBeGreaterThan(0);

  await expectFitsPhone(
    page.getByTestId('grid-en-jalali').locator('[data-jalali-datepicker-input]'),
    'date picker input',
  );
}
