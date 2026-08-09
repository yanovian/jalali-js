#!/usr/bin/env node
// Generates apps/docs/api/, the API reference VitePress serves under /api/. Not committed (see
// apps/docs/.gitignore): regenerated from the 5 packages' own types on every docs build, so it
// can never drift from the real public API the way hand-written reference pages would.
//
// Two separate TypeDoc runs, not one: `core`, `i18n`, `nlp`, `react`, and `ui-react` are plain
// TypeScript/TSX and convert cleanly together in TypeDoc's own multi-package "packages" mode.
// `vue` cannot join that run: its main entry point (src/index.ts) re-exports `.vue` SFCs, and
// TypeDoc's TypeScript-compiler-based parser has no `.vue` support at all, SFC or otherwise
// (this is a real TypeDoc limitation, not a config mistake, confirmed by trying the packages
// run with vue included and reading the resulting TS2307 "cannot find module './Calendar.vue'"
// errors directly). `vue`'s plain-TypeScript composables (`useCalendar`,
// `useResolvedTimeZone`) still convert fine on their own, scoped via tsconfig.vue-api.json's
// `files` list so the whole package's `src/` (which still includes the unparseable .vue
// re-exports in index.ts) never enters the TypeScript program in the first place. The `.vue`
// component APIs themselves (Calendar, DatePicker, DropdownDateFields, RangePicker,
// InlineCalendar) are hand-documented in guide/vue.md instead, the same as how the wider Vue
// ecosystem documents SFC component APIs (VueUse, Vuetify): there is no robust, general
// TypeDoc-for-SFCs tool to reach for here.
import { execFileSync } from 'node:child_process';

const typedoc = (args) =>
  execFileSync('pnpm', ['exec', 'typedoc', ...args], { stdio: 'inherit', shell: false });

typedoc([]); // reads apps/docs/typedoc.json: core, i18n, nlp, react, ui-react, merged into api/

typedoc([
  '--entryPointStrategy',
  'resolve',
  '--entryPoints',
  '../../packages/vue/src/use-calendar.ts',
  '--entryPoints',
  '../../packages/vue/src/use-resolved-timezone.ts',
  '--tsconfig',
  'tsconfig.vue-api.json',
  '--out',
  'api/@jalali-js/vue',
  '--plugin',
  'typedoc-plugin-markdown',
  '--plugin',
  'typedoc-vitepress-theme',
  '--readme',
  'none',
]);
