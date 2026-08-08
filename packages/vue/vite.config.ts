import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// Vite library mode, not tsup: tsup (esbuild) has no `.vue` SFC support. `vite-plugin-dts`
// emits one `.d.ts` per source file (not a single rolled-up file the way tsup's dts worker does
// for the other packages): rolling up into one file needs `@microsoft/api-extractor`, an extra
// heavy dependency this package does not otherwise need, and a per-file `.d.ts` tree is an
// equally valid, widely-used package shape. `exclude` keeps test files out of that tree; they
// would otherwise get their own `.d.ts` too, since `tsconfig.json`'s `include: ["src"]` covers
// them alongside real source.
export default defineConfig({
  plugins: [vue(), dts({ exclude: ['src/**/*.test.ts'] })],
  build: {
    sourcemap: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['vue', 'jalali-js', '@jalali-js/i18n'],
    },
  },
});
