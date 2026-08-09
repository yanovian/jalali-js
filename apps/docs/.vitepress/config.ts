import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'jalali-js',
  description: 'A TypeScript-native Jalali (Persian) calendar library.',
  // GitHub Pages serves a project site (not a custom domain or a <org>.github.io user page)
  // under /<repo-name>/, not /. If pages.yml ever gains a custom domain (a CNAME file), this
  // needs to become '/' to match.
  base: '/jalali-js/',
  cleanUrls: true,
  srcExclude: ['**/README.md'],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/jalali-js/' },
      { text: 'Playground', link: '/playground/react/', target: '_blank' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Core concepts', link: '/guide/core-concepts' },
            { text: 'Display value vs. storage value', link: '/guide/display-vs-storage' },
            { text: 'Configuration and theming', link: '/guide/theming' },
            { text: 'React', link: '/guide/react' },
            { text: 'Vue', link: '/guide/vue' },
            { text: 'Internationalization', link: '/guide/i18n' },
            { text: 'Natural language parsing', link: '/guide/nlp' },
            { text: 'Comparison with alternatives', link: '/guide/comparison' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API reference',
          items: [
            { text: 'jalali-js (core)', link: '/api/jalali-js/' },
            { text: '@jalali-js/i18n', link: '/api/@jalali-js/i18n/' },
            { text: '@jalali-js/nlp', link: '/api/@jalali-js/nlp/' },
            { text: '@jalali-js/react', link: '/api/@jalali-js/react/' },
            { text: '@jalali-js/vue', link: '/api/@jalali-js/vue/' },
            { text: '@jalali-js/ui-react', link: '/api/@jalali-js/ui-react/' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/yanovian/jalali-js' }],
    search: { provider: 'local' },
  },
});
