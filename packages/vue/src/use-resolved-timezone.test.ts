// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';

// jsdom always defines `window`, so resolveTimeZone()'s SSR-vs-client branch (verified directly
// under Node, with no window, in packages/core's timezone.test.ts) cannot be observed from
// here. What this composable adds on top of that function is the "re-resolve after mount"
// mechanism (onMounted, Vue's equivalent of React's post-mount effect), so that is what gets
// tested here, with resolveTimeZone mocked to return two different values on its first and
// second call. onMounted needs an active component instance, so this mounts a tiny host
// component rather than calling the composable bare.
vi.mock('jalali-js', () => ({
  resolveTimeZone: vi.fn().mockReturnValueOnce('UTC').mockReturnValue('Asia/Tehran'),
}));

describe('useResolvedTimeZone', () => {
  it('re-resolves after mount, moving from the first-render value to the post-mount one', async () => {
    const { useResolvedTimeZone } = await import('./use-resolved-timezone.js');
    const Host = defineComponent({
      setup() {
        const timeZone = useResolvedTimeZone('auto');
        return () => h('span', timeZone.value);
      },
    });
    const wrapper = mount(Host);
    await nextTick();
    expect(wrapper.text()).toBe('Asia/Tehran');
  });

  it('passes an explicit timezone straight through', async () => {
    vi.resetModules();
    vi.doMock('jalali-js', () => ({
      resolveTimeZone: vi.fn((tz: string) => tz),
    }));
    const { useResolvedTimeZone } = await import('./use-resolved-timezone.js');
    const Host = defineComponent({
      setup() {
        const timeZone = useResolvedTimeZone('Europe/London');
        return () => h('span', timeZone.value);
      },
    });
    const wrapper = mount(Host);
    await nextTick();
    expect(wrapper.text()).toBe('Europe/London');
  });
});
