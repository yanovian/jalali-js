import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import './custom.css';

/**
 * /playground/* is served by Vite proxy or public files, not by VitePress routes.
 * Client-side navigation would show the docs 404. Force a full page load instead.
 */
function bindPlaygroundFullNavigation(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      let path: string;
      try {
        path = new URL(href, window.location.origin).pathname;
      } catch {
        return;
      }
      if (!path.startsWith('/playground/')) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (anchor.target && anchor.target !== '_self') return;
      event.preventDefault();
      window.location.assign(anchor.href);
    },
    true,
  );
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
  enhanceApp() {
    bindPlaygroundFullNavigation();
    bindApiLocaleFallback();
  },
} satisfies Theme;
