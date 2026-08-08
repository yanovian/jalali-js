'use client';

import { useResolvedTimeZone } from '@jalali-js/react';

/**
 * Exercises the SSR-safe timezone resolution from architecture.md's SSR note: the server
 * render (and the client's first, hydrating render) always reads 'UTC' here, since there is no
 * `window` during the server render. An effect then re-resolves the real browser timezone once
 * mounted, and this line updates to that value without a hydration warning.
 */
export function TimezoneDemo() {
  const timeZone = useResolvedTimeZone('auto');
  return (
    <p data-testid="resolved-timezone">
      Resolved timezone (<code>timeZone: &apos;auto&apos;</code>): <strong>{timeZone}</strong>
    </p>
  );
}
