import { expect, test, type Locator, type Page } from '@playwright/test';

/** Marks a passed test whose screenshot differed from the baseline (or has none yet). */
export const VISUAL_CHANGE_ANNOTATION = 'visual-change';

/**
 * Compare a screenshot to its baseline. A pixel mismatch or a missing baseline
 * is advisory: the test stays green, Playwright keeps the image attachments,
 * and a `visual-change` annotation tells `scripts/visual-comment.mjs` to show
 * them. A capture failure (timeout, missing element) still fails the test.
 */
export async function expectScreenshot(
  target: Page | Locator,
  name: string,
  options?: { fullPage?: boolean },
): Promise<void> {
  try {
    await expect(target).toHaveScreenshot(name, options);
  } catch (error) {
    const hasActual = test.info().attachments.some((a) => a.name.endsWith('-actual.png'));
    if (!hasActual) throw error;

    test.info().annotations.push({
      type: VISUAL_CHANGE_ANNOTATION,
      description: name,
    });
  }
}
