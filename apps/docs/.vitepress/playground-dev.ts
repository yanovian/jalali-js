import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, normalize, sep } from 'node:path';
import type { Plugin, ProxyOptions } from 'vite';

/** Proxy /playground/{name} to each Vite playground during `make dev`. */
export function playgroundDevProxy(): Record<string, string | ProxyOptions> | undefined {
  if (process.env.JALALI_PLAYGROUND_DEV !== '1') return undefined;
  // Use localhost (not 127.0.0.1): Vite may listen on IPv6 ::1 only.
  return {
    '/playground/react': {
      target: 'http://localhost:4001',
      changeOrigin: true,
      ws: true,
    },
    '/playground/vue': {
      target: 'http://localhost:4002',
      changeOrigin: true,
      ws: true,
    },
    '/playground/vanilla': {
      target: 'http://localhost:4005',
      changeOrigin: true,
      ws: true,
    },
  };
}

/**
 * Serve embedded playground files from public/ during `make docs-dev`, including
 * directory URLs that need index.html. VitePress routing would otherwise soft-404.
 */
export function playgroundPublicPlugin(docsRoot: string): Plugin {
  const publicRoot = join(docsRoot, 'public');

  return {
    name: 'jalali-playground-public',
    configureServer(server) {
      if (process.env.JALALI_PLAYGROUND_DEV === '1') return;

      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split('?')[0] ?? '';
        if (!raw.startsWith('/playground/')) return next();

        const rel = decodeURIComponent(raw.replace(/^\//, ''));
        const candidate = normalize(join(publicRoot, rel));
        if (!candidate.startsWith(publicRoot + sep) && candidate !== publicRoot) {
          return next();
        }

        let file = candidate;
        try {
          if (existsSync(file) && statSync(file).isDirectory()) {
            file = join(file, 'index.html');
          }
        } catch {
          return next();
        }

        if (!existsSync(file) || !statSync(file).isFile()) return next();

        const type = file.endsWith('.html')
          ? 'text/html; charset=utf-8'
          : file.endsWith('.js')
            ? 'text/javascript; charset=utf-8'
            : file.endsWith('.css')
              ? 'text/css; charset=utf-8'
              : file.endsWith('.svg')
                ? 'image/svg+xml'
                : 'application/octet-stream';
        res.statusCode = 200;
        res.setHeader('content-type', type);
        res.end(readFileSync(file));
      });
    },
  };
}
