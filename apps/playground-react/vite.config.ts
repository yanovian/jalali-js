import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Under `make dev`, the docs site proxies /playground/react/ here, so the app
// must use that base. Preview and e2e keep the root base.
const base = process.env.JALALI_PLAYGROUND_DEV === '1' ? '/playground/react/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 4001,
    strictPort: true,
  },
});
