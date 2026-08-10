import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const base = process.env.JALALI_PLAYGROUND_DEV === '1' ? '/playground/vue/' : '/';

export default defineConfig({
  base,
  plugins: [vue()],
  server: {
    port: 4002,
    strictPort: true,
  },
});
