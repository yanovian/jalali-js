export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  // @jalali-js/vue and its workspace dependencies (packages/core, packages/i18n) are consumed
  // straight from TypeScript source; this tells Nuxt's build (Vite-based, unlike Next.js's
  // Turbopack) to transpile them instead of treating them as pre-built external packages.
  build: {
    transpile: ['jalali-js', '@jalali-js/i18n', '@jalali-js/vue'],
  },
  css: ['@jalali-js/vue/date-picker.css'],
});
