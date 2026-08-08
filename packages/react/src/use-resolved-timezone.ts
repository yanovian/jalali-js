import { resolveTimeZone } from 'jalali-js';
import { useEffect, useState } from 'react';

/**
 * Resolves `timeZone` (default `'auto'`) the SSR-safe way described in architecture.md: the
 * initial render, on both the server and the client's first (hydrating) pass, reads `'UTC'`
 * for `'auto'`, since `resolveTimeZone()` itself already returns `'UTC'` with no `window`
 * global. Those two renders match, so there is no hydration mismatch. An effect then re-reads
 * the real browser timezone after mount (`window` is always defined by then) and triggers one
 * more render with the corrected value.
 */
export function useResolvedTimeZone(timeZone: 'auto' | string = 'auto'): string {
  const [resolved, setResolved] = useState(() => resolveTimeZone(timeZone));

  useEffect(() => {
    setResolved(resolveTimeZone(timeZone));
  }, [timeZone]);

  return resolved;
}
