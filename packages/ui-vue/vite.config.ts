import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// See packages/vue/vite.config.ts for why Vite library mode (not tsup) and why a per-file
// `.d.ts` tree (not a single rolled-up file).
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
      external: ['vue', 'jalali-js', '@jalali-js/i18n', '@jalali-js/vue'],
    },
  },
});
