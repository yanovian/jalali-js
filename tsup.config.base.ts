import type { Options } from 'tsup';

/**
 * Shared by every package's own `tsup.config.ts` (core, i18n, nlp, react, ui-react); the Vue
 * packages use Vite library mode instead, since tsup (esbuild) does not understand `.vue` SFCs.
 *
 * `composite`/`incremental` come from `tsconfig.base.json`, where they exist only for the root
 * `tsconfig.json`'s editor-only project references (see architecture.md's "Tooling"); tsup's
 * dts worker misreads that as a real composite build and rejects every source file as "not
 * listed in the file list of project ''". Declaration output does not need incremental/
 * composite build-graph tracking, so both are turned off for this one build. `ignoreDeprecations`
 * silences a `baseUrl` deprecation warning tsup's dts worker triggers internally under
 * TypeScript 6.x, unrelated to anything this repo's own tsconfig files set.
 */
export const baseTsupConfig: Options = {
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  treeshake: true,
  dts: {
    compilerOptions: {
      composite: false,
      incremental: false,
      ignoreDeprecations: '6.0',
    },
  },
};
