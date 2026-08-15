import DefaultTheme from 'vitepress/theme';
import type { EnhanceAppContext, Theme } from 'vitepress';
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client';
import './custom.css';

/**
 * Playgrounds live under /playground/* as static apps, not VitePress pages.
 * Open them in a new tab and cancel the SPA route so the docs 404 never shows.
 */
function bindPlaygroundLinks({ router }: EnhanceAppContext): void {
  if (typeof window === 'undefined') return;
  const previous = router.onBeforeRouteChange;
  router.onBeforeRouteChange = (to) => {
    let path: string;
    try {
      path = new URL(to, window.location.origin).pathname;
    } catch {
      return previous?.(to);
    }
    if (path.startsWith('/playground/')) {
      window.open(to, '_blank', 'noopener,noreferrer');
      return false;
    }
    return previous?.(to);
  };
}

/**
 * TypeDoc API stays English at /api/. Language switch from those pages can land
 * on /fa/api/*. Send that path back to the English API tree.
 */
function bindApiLocaleFallback(): void {
  if (typeof window === 'undefined') return;
  const { pathname } = window.location;
  if (!pathname.startsWith('/fa/api')) return;
  window.location.replace(
    pathname.replace(/^\/fa/, '') + window.location.search + window.location.hash,
  );
}

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    bindPlaygroundLinks(ctx);
    bindApiLocaleFallback();
    enhanceAppWithTabs(ctx.app);
  },
} satisfies Theme;
