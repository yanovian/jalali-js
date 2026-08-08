import { resolveTimeZone } from 'jalali-js';
import { onMounted, ref, type Ref } from 'vue';

/**
 * Resolves `timeZone` (default `'auto'`) the SSR-safe way described in architecture.md: the
 * initial render, on both the server and the client's first (hydrating) pass, reads `'UTC'`
 * for `'auto'`, since `resolveTimeZone()` itself already returns `'UTC'` with no `window`
 * global. Those two renders match, so there is no hydration mismatch. `onMounted` then
 * re-reads the real browser timezone (a client-only lifecycle hook, never called during SSR)
 * and triggers one more render with the corrected value.
 */
export function useResolvedTimeZone(timeZone: 'auto' | string = 'auto'): Ref<string> {
  const resolved = ref(resolveTimeZone(timeZone)) as Ref<string>;

  onMounted(() => {
    resolved.value = resolveTimeZone(timeZone);
  });

  return resolved;
}
