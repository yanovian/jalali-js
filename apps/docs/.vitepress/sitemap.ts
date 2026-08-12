export const PLAYGROUND_SITEMAP_PATHS = [
  'playground/react/',
  'playground/vue/',
  'playground/vanilla/',
];

/** TypeDoc symbol pages. Keep package indexes in the sitemap. Drop the rest. */
function isTypeDocSymbolPage(url: string): boolean {
  return /\/(functions|interfaces|type-aliases|variables|classes)\//.test(url);
}

function sitemapRank(url: string): number {
  if (url === '' || url === '/') return 0;
  if (url === 'fa' || url === 'fa/') return 1;
  if (url.startsWith('guide/') || url.startsWith('fa/guide/')) return 2;
  if (url.startsWith('playground/')) return 3;
  if (url.startsWith('api/')) return 4;
  return 5;
}

export function selectSitemapItems<T extends { url: string }>(items: T[]): T[] {
  const pages = items.filter((item) => !isTypeDocSymbolPage(item.url));
  // Playgrounds live under public/, so VitePress does not list them as pages.
  for (const url of PLAYGROUND_SITEMAP_PATHS) {
    pages.push({ url } as T);
  }
  pages.sort((a, b) => sitemapRank(a.url) - sitemapRank(b.url) || a.url.localeCompare(b.url));
  return pages;
}
