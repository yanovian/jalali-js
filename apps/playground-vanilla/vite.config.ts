import { defineConfig } from 'vite';

const base = process.env.JALALI_PLAYGROUND_DEV === '1' ? '/playground/vanilla/' : '/';

export default defineConfig({
  base,
  server: {
    port: 4005,
    strictPort: true,
  },
});
