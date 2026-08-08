// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// jsdom always defines `window`, so resolveTimeZone()'s SSR-vs-client branch (verified directly
// under Node, with no window, in packages/core's timezone.test.ts) cannot be observed from
// here. What this hook adds on top of that function is the "re-resolve after mount" mechanism,
// so that is what gets tested here, with resolveTimeZone mocked to return two different values
// on its first and second call.
vi.mock('jalali-js', () => ({
  resolveTimeZone: vi.fn().mockReturnValueOnce('UTC').mockReturnValue('Asia/Tehran'),
}));

describe('useResolvedTimeZone', () => {
  it('re-resolves after mount, moving from the first-render value to the post-mount one', async () => {
    const { useResolvedTimeZone } = await import('./use-resolved-timezone.js');
    const { result } = renderHook(() => useResolvedTimeZone('auto'));
    await waitFor(() => expect(result.current).toBe('Asia/Tehran'));
  });

  it('passes an explicit timezone straight through', async () => {
    vi.resetModules();
    vi.doMock('jalali-js', () => ({
      resolveTimeZone: vi.fn((tz: string) => tz),
    }));
    const { useResolvedTimeZone } = await import('./use-resolved-timezone.js');
    const { result } = renderHook(() => useResolvedTimeZone('Europe/London'));
    await waitFor(() => expect(result.current).toBe('Europe/London'));
  });
});
