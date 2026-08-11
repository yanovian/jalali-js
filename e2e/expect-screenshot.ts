import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';

/** Marks a passed test whose screenshot differed from the baseline (or has none yet). */
export const VISUAL_CHANGE_ANNOTATION = 'visual-change';

const MISSING_BASELINE = /snapshot doesn.t exist/i;

function hasActualImage(info: TestInfo): boolean {
  return info.attachments.some(
    (a) => a.name.includes('actual') || (a.path?.includes('-actual') ?? false),
  );
}

function markVisualChange(info: TestInfo, name: string): void {
  info.annotations.push({ type: VISUAL_CHANGE_ANNOTATION, description: name });
}

/**
 * Playwright 1.62+ can fail a missing baseline without throwing: the matcher
 * passes, then a soft error fails the test. Undo that so new screenshots stay
 * advisory, the same as a pixel mismatch.
 */
function clearMissingBaselineSoftFail(info: TestInfo, errorsBefore: number): boolean {
  const added = info.errors.slice(errorsBefore);
  if (added.length === 0) return false;
  if (!added.every((e) => MISSING_BASELINE.test(e.message ?? ''))) return false;

  info.errors.length = errorsBefore;
  if (errorsBefore === 0) info.status = 'passed';
  // Soft missing-baseline also sets this private flag. Clear it so a later real
  // failure in the same test can still retry on CI.
  (info as TestInfo & { _hasNonRetriableError?: boolean })._hasNonRetriableError = false;
  return true;
}

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
  const info = test.info();
  const errorsBefore = info.errors.length;

  try {
    await expect(target).toHaveScreenshot(name, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const advisory = hasActualImage(info) || MISSING_BASELINE.test(message);
    if (!advisory) throw error;
    markVisualChange(info, name);
    return;
  }

  if (clearMissingBaselineSoftFail(info, errorsBefore)) {
    markVisualChange(info, name);
  }
}
