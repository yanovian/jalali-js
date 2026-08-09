# Plan

See [alternatives.md](./alternatives.md) for the vision and the comparison
with other libraries. See [architecture.md](./architecture.md) for the design
behind these decisions. This file shows only the status of each phase.

Phases 0-11 are done. What's left is listed under "Later, not yet scheduled"
below, plus the publishing step `_docs/release-checklist.md` deliberately
leaves undone. Change an item to `[x]` as it lands.

## Phase 0: Repo scaffolding and tooling

- [x] Set up the pnpm workspace layout: `packages/`, `apps/`, `e2e/`,
      `_docs/`. `pnpm-workspace.yaml` covers `packages/*` and `apps/*`.
      `packages/` and `apps/` gain real content starting Phase 1; `e2e/`
      starts Phase 10.
- [x] Add a shared root `tsconfig.json` in strict mode, with project
      references per package. `tsconfig.base.json` holds the shared strict
      options; `tsconfig.json` is an editor-only solution file that packages
      register with as they are added; the `typecheck` script delegates to
      each package's own script, so it works with zero packages too.
- [x] Add an ESLint flat config and Prettier, shared across packages.
- [x] Set up Vitest at the workspace root, so it runs across all packages.
- [x] Add a `LICENSE` file: MIT.
- [x] Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.
- [x] Add `.github/ISSUE_TEMPLATE/` with `bug_report.yml`,
      `feature_request.yml`, and `config.yml`.
- [x] Add `.github/PULL_REQUEST_TEMPLATE.md`.
- [x] Add a `Makefile` with separate `install`, `dev`, `build`, `typecheck`,
      `lint`, `lint-fix`, `format`, `format-check`, `test`, and `test-watch`
      targets, plus one combined `check` target that runs typecheck, lint,
      format-check, and test together. Later phases add more targets, but
      every command a phase needs already has a place to go.
- [x] Add a minimal `ci.yml`: install, typecheck, lint, format-check, and
      unit test, on every push and pull request. This is the only CI setup
      step in this phase. It exists before any calendar logic does, so every
      later phase lands its tests into a pipeline that already runs them,
      instead of waiting for Phase 9 to add checks retroactively.
- [x] Add a pre-commit hook (Husky and lint-staged, or an equivalent) that
      runs ESLint `--fix` and Prettier `--write` on staged files, restages
      the fixed files, and blocks the commit when an error remains that
      `--fix` cannot resolve. Only formatted, lint-clean code reaches a
      commit. Verified directly: a staged file with an unfixable lint error
      blocks the commit, and a fixable formatting issue gets fixed and
      restaged automatically.

## Phase 1: Core Jalali to Gregorian conversion engine (`packages/core`)

- [x] Define the internal `CalendarEngine` interface. This is the seam that
      would let another calendar system plug in later, if real demand ever
      appears (not currently planned; see architecture.md's "Calendar
      systems in scope"), and later an astronomical engine, with no change
      to the public API. `src/calendar-engine.ts`.
- [x] Implement the Jalali leap-year rule (see architecture.md for the
      chosen algorithm). `src/jalali.ts`, a 33-year-cycle arithmetic rule.
      Verified against Node's own ICU (`Intl.DateTimeFormat` with the
      Persian calendar) with zero mismatches across Jalali years -50 to
      3100, both for leap-year classification and for full date
      conversion (see the derivation notes in the module and the test
      fixtures below).
- [x] Implement Gregorian leap-year handling, including the century rule.
      `src/gregorian.ts`.
- [x] Implement `toGregorian()` and `fromGregorian()`. `src/convert.ts`,
      built on each calendar's `CalendarEngine`, converting through a
      shared Julian Day Number.
- [x] Add month-length tables for both calendars. `daysInMonth()` on each
      engine.
- [x] Add round-trip property tests (fast-check) across a wide range of
      years. `gregorian.test.ts`, `jalali.test.ts`, and `convert.test.ts`,
      years -2000 to 3000 (Gregorian) and -1000 to 3000 (Jalali).
- [x] Add boundary tests: year 1, Esfand length in a leap and a non-leap
      year, and Gregorian century-leap edge cases (1900, 2000, 2100).
      `gregorian.test.ts`'s century-boundary cases and `jalali.test.ts`'s
      boundary-case suite.
- [x] Check leap years against an independent, published reference table.
      `jalali.test.ts` embeds a 121-year table (Jalali years 1300-1420)
      sourced directly from ICU's Persian calendar, independent of this
      package's own leap-year formula.

## Phase 2: Precision and timezone data model (`packages/core`)

- [x] Add the `CalendarDate` type: year, month, and day. This is the
      default, with no time part. `src/calendar-date.ts`.
- [x] Add the `CalendarDateTime` type: adds time, with no timezone.
      `src/calendar-date.ts`.
- [x] Add the `ZonedCalendarDateTime` type: adds an IANA timezone.
      `src/calendar-date.ts`.
- [x] Add the `createCalendar()` factory, with a `precision` option that
      picks one of the tiers above. `src/calendar.ts`, using function
      overloads so each precision's `today()` returns the right type.
- [x] Support `timeZone: 'auto'` through `Intl.DateTimeFormat`.
      `resolveTimeZone()` in `src/timezone.ts`.
- [x] Handle timezone safely under SSR: `'auto'` resolves to UTC during
      server render (detected through `globalThis.window`, so this package
      never needs the DOM lib to compile). The `useResolvedTimeZone()` hook
      itself is a React/Vue binding, so it ships in Phase 5/6; this phase
      ships the SSR-safe primitive (`resolveTimeZone()`) that hook wraps
      (see architecture.md's SSR note).
- [x] Add unit tests for each precision tier and for timezone conversion.
      `calendar.test.ts`, `timezone.test.ts`. The timezone conversion
      (`zonedWallClockToInstant()` / `instantToZonedFields()`) is verified
      against known real-world offsets: a fixed-offset zone (Asia/Tehran,
      UTC+03:30), and a DST-observing zone in both seasons (America/New_York).
      A property test round-trips 1970-2100 across five zones. This work
      also found and fixed a real bug: the offset lookup compared an
      instant against a seconds-only reconstruction of itself, leaking up
      to +/-999ms of truncation noise into the result as a spurious
      fractional-minute offset.
- [x] Add the storage-value contract: each precision tier converts to a
      Gregorian, calendar-agnostic value by default (see architecture.md's
      "Display value against storage value"). `toStorageValue()` in
      `src/storage-value.ts`.
- [x] Add the `valueFormat` option (`gregorian-iso`, `date`, `epoch`,
      `jalali-iso`, `jalali-object`), so an app can opt into a Jalali-native
      stored value when it needs one. `src/storage-value.ts`.
- [x] Add unit tests that confirm the default stored value stays Gregorian
      even when the display locale and calendar are Jalali.
      `storage-value.test.ts`'s "stays Gregorian and calendar-agnostic"
      suite, including a test that the Jalali year (1403) never appears in
      the default output at all.

## Phase 3: Internationalization (`packages/i18n`)

- [x] Add `en` locale data: month names, weekday names, and direction.
      `src/en.ts`. Covers both calendar systems' month names, including
      English transliterations of the Jalali months (Farvardin, Ordibehesht,
      and so on), not only Gregorian ones.
- [x] Add `fa` locale data: month names, weekday names, Persian numerals,
      and right-to-left direction. `src/fa.ts`. Also covers both calendar
      systems, including Persian transliterations of the Gregorian months
      (ژانویه, فوریه, and so on). Persian has no widely standardized
      abbreviated month form the way English does, so `short` reuses `long`
      for month names in this locale; weekday names do have a well-known
      one-letter short form, so those differ.
- [x] Add a `format()` function that reads locale data. `src/format.ts`.
      Depends on `jalali-js` (`packages/core`) for `AnyCalendarDate` and the
      new `dayOfWeek()` helper (below); `packages/core` itself still has
      zero runtime dependencies, so this stays a one-directional
      `i18n -> core` dependency, not a cycle.
- [x] Add display-format presets: long against short, with or without
      weekday, and Persian against Latin digits. `FormatOptions` in
      `src/format.ts`: `style`, `weekday`, `numerals`.
- [x] Design the locale-pack format so a third locale is a data file, with
      no code change. `LocalePack` in `src/locale.ts`; `en.ts` and `fa.ts`
      are both plain data files against that one interface.
- [x] Add unit tests for formatted output per locale, per format preset, and
      for numeral conversion. `format.test.ts`, `numerals.test.ts`.

This phase also added `dayOfWeek()` to `packages/core` (`src/day-of-week.ts`,
not itemized in Phase 1 or 2, since the need for it only became clear once
the `weekday` display preset required knowing which weekday a date falls
on). It derives the weekday from a date's Julian Day Number, so it works for
any calendar system with no extra per-system logic, and is verified against
`Date.prototype.getUTCDay()` across a wide range of random dates.

## Phase 4: Natural language date parsing (`packages/nlp`)

- [x] Define a `parse(input: string, locale)` function that returns a
      `CalendarDate`, or `null` when it cannot read the input. `src/parse.ts`.
      `locale` is `'en' | 'fa' | 'fa-Latn'`, the BCP 47-style tag for
      Finglish (Farsi, Latin script); an options bag adds `system`
      (default `'jalali'`) without disturbing that two-argument shape for
      the common case.
- [x] Add an English word list: relative terms (`today`, `tomorrow`,
      `yesterday`, `next week`) and Jalali month names in English spelling
      (`next Farvardin`). `src/word-list.ts`, reusing `en.monthNames.jalali`
      from `@jalali-js/i18n` rather than a second copy of the same names
      (architecture.md: "next to the locale data it depends on").
- [x] Add a Farsi word list, in Persian script (`امروز`, `فردا`, `دیروز`).
      `src/word-list.ts`. Extended to match English's coverage rather than
      stopping at the three listed words: `هفته آینده`/`هفته بعد` for
      "next week", and `<month> آینده`/`<month> بعد` for "next Farvardin"'s
      Farsi equivalent, in Farsi's own suffix word order (the month name
      first, the "next" marker after).
- [x] Add a Finglish word list, Farsi words in Latin letters (`emrooz`,
      `farda`, `dirooz`), with common spelling variants for each word.
      `src/word-list.ts`. Month names reuse the same English
      transliterations as the English word list (`Farvardin`, and so on):
      those already are Finglish spellings, not English words, so writing
      them twice would only be able to drift out of sync.
- [x] Add unit tests for each input style, and for invalid or unclear input.
      `parse.test.ts`.

This phase also added `addDays()` to `packages/core` (`src/date-math.ts`,
needed for "tomorrow", "yesterday", and "next week"). It moves along a
date's Julian Day Number, so it is correct across a month or year boundary
for either calendar system with no extra per-system logic.

## Phase 5: React bindings (`packages/react`)

- [x] Confirm the default `DatePicker` UI variant (calendar-grid popup
      against dropdowns; see architecture.md's open decisions) before this
      phase starts. Calendar-grid popup is the default; `variant:
'dropdown'` ships alongside it, both in this phase (see
      architecture.md's "Configuration and theming").
- [x] Add the `useCalendar` hook. `src/use-calendar.ts`.
- [x] Add headless component primitives: data attributes and class hooks
      for styling. `src/Calendar.tsx` (the month grid) and
      `src/calendar-grid.ts` (the grid's pure data logic, tested on its
      own). `[data-jalali-calendar-*]` attributes throughout, no required
      CSS.
- [x] Add a default-styled `DatePicker` component built on the headless
      primitives, so a consumer gets a usable picker with no custom styling.
      `src/DatePicker.tsx` (grid variant, wraps `Calendar` in a popover) and
      `src/DropdownDateFields.tsx` (dropdown variant). `src/date-picker.css`
      is the optional default stylesheet, themed through CSS custom
      properties, imported separately (`@jalali-js/react/date-picker.css`)
      so it stays opt-in.
- [x] Wire the `DatePicker`'s `onChange` value to the Phase 2 storage-value
      contract, and expose the `valueFormat` option. `onChange` fires with
      both the shaped value and the raw `CalendarDate`. Both variants share
      this wiring.
- [x] Expose a `displayFormat` prop, using the Phase 3 format presets.
- [x] Scaffold `apps/playground-react` (Vite and React) to exercise the
      hook and components. Builds cleanly (`vite build`); exercises both
      `DatePicker` variants, both locales, both calendar systems, and
      `useCalendar` directly.
- [x] Scaffold `apps/playground-next`, a real Next.js app, and confirm the
      SSR timezone handling from Phase 2. Verified against the actual
      production build output, not just a unit test: `next build`
      statically prerenders the page, and the prerendered HTML reads
      `Resolved timezone (timeZone: 'auto'): UTC`, matching architecture.md's
      SSR design (no `window` during server render). Building this app
      surfaced a real Turbopack limitation (Turbopack does not resolve a
      `.js`-suffixed relative import to the `.ts` file that exists on disk,
      for a package's internal files); see architecture.md's Tooling
      section for the webpack-based fix. Also added `useResolvedTimeZone`,
      the hook version of Phase 2's `resolveTimeZone()`, in
      `src/use-resolved-timezone.ts`.
- [x] Add component tests with Vitest and Testing Library, including a test
      that the emitted value stays Gregorian by default while the display
      shows Jalali. `Calendar.test.tsx`, `DatePicker.test.tsx`,
      `use-calendar.test.tsx`, `use-resolved-timezone.test.tsx`. Building
      `DatePicker.test.tsx` surfaced two real bugs, both fixed: an
      unanchored test regex matching more grid cells than intended, and
      `vi.useFakeTimers()` (faking all timer APIs, not just `Date`) hanging
      `userEvent`'s internal timing.

## Phase 6: Vue bindings (`packages/vue`)

- [x] Add the `useCalendar` composable. `src/use-calendar.ts`. Returns a
      `date` ref (not a `[date, setDate]` pair like React's hook): idiomatic
      Vue reads and writes the ref directly.
- [x] Add headless component primitives: scoped slots for styling.
      `src/Calendar.vue`, built on `buildCalendarGrid()` (moved to
      `packages/core` this phase; see below). A `day` scoped slot lets a
      consumer replace the cell markup outright, alongside the same
      `[data-jalali-calendar-*]` attributes React's binding uses, for a
      consumer who only wants to restyle rather than replace.
- [x] Add a default-styled `DatePicker` component built on the headless
      primitives, so a consumer gets a usable picker with no custom styling.
      `src/DatePicker.vue` (grid variant, wraps `Calendar` in a popover) and
      `src/DropdownDateFields.vue` (dropdown variant). `src/date-picker.css`
      is the same stylesheet content as `@jalali-js/react`'s, since both
      bindings share the same `[data-jalali-*]` attribute names.
- [x] Wire the `DatePicker`'s `v-model` value to the Phase 2 storage-value
      contract, and expose the `valueFormat` option. `v-model` carries the
      _storage_ value (shaped by `valueFormat`), not the raw `CalendarDate`,
      so it is an effective write channel: picking a date updates the bound
      value, but the component does not read a value back in (inverting
      every `valueFormat` back to a date is out of scope); a `defaultDate`
      prop seeds the initial selection instead, the same split React's
      `defaultDate`/`onChange` design already uses.
- [x] Expose a `displayFormat` prop, using the Phase 3 format presets.
- [x] Scaffold `apps/playground-vue` (Vite and Vue) to exercise the
      composable and components. Builds cleanly (`vite build`); exercises
      both `DatePicker` variants, both locales, both calendar systems, and
      `useCalendar` directly.
- [x] Scaffold `apps/playground-nuxt`, a real Nuxt app, and confirm the SSR
      timezone handling from Phase 2. Verified against the actual built
      output, not just a unit test: `nuxt build` produces a real Nitro
      server, which was started and curled directly; the response HTML
      reads `Resolved timezone (timeZone: 'auto'): UTC`, matching
      architecture.md's SSR design. Unlike Next.js/Turbopack (Phase 5),
      Nuxt's Vite-based build needed no extension-resolution workaround,
      only `build.transpile` in `nuxt.config.ts` (see architecture.md's
      Tooling section).
- [x] Add component tests with Vitest and Testing Library, including a test
      that the emitted value stays Gregorian by default while the display
      shows Jalali. `Calendar.test.ts`, `DatePicker.test.ts`,
      `use-calendar.test.ts`, `use-resolved-timezone.test.ts`, using
      `@vue/test-utils` rather than `@testing-library/vue` (see
      architecture.md's Tooling section for why).

This phase also moved `buildCalendarGrid()`/`nextMonth()`/`previousMonth()`
from `packages/react` into `packages/core`: the computation touches no
framework API, and `packages/vue` needed the identical logic, so writing it
once and importing it from both bindings was safer than a second copy that
could drift. This also gave the logic its own direct, property-based test
suite (`packages/core/src/calendar-grid.test.ts`) for the first time; Phase
5 had only exercised it indirectly, through React component tests.

This phase also found and fixed a real gap in the pre-commit hook itself:
`lint-staged`'s file glob (in the root `package.json`) did not include
`.vue`, so adding `packages/vue` meant the hook silently skipped linting and
formatting every `.vue` file. Fixed by adding `.vue` to the glob, then
verified directly the same way Phase 0 verified the hook originally:
staging a `.vue` file with an unfixable lint error and confirming the
commit is blocked.

## Phase 7: Theming and configurability

- [x] Define a CSS custom-property theming contract for the headless
      components and the default `DatePicker` from Phases 5 and 6. Both
      `date-picker.css` files already expressed every rule through
      `--jalali-*` variables (Phases 5/6); this phase extended the set with
      spacing/sizing variables (`--jalali-gap`, `--jalali-input-padding`,
      `--jalali-popover-padding`, `--jalali-day-min-size`) so a theme can
      override layout, not only color, and wrote up the full variable table
      in architecture.md's "Theming contract".
- [x] Add the optional `packages/ui-react` and `packages/ui-vue`: a range
      picker, an inline calendar, and extra themes, built on the same
      headless primitives. Two packages, not one `packages/ui`: a UI
      component is framework-specific by nature, the same reason `react`
      and `vue` are separate packages (see architecture.md's "Package
      layout"). `RangePicker` (`RangePicker.tsx`/`.vue`) renders its own
      grid via `buildCalendarGrid()` rather than reusing `Calendar`, since
      range state (start/end/in-between/hover-preview) does not fit
      `Calendar`'s single-selection `data-selected`; it does reuse the new
      `compareDates()` core utility (`packages/core/src/date-math.ts`) for
      range comparisons. `InlineCalendar` is `Calendar` re-exported under a
      more discoverable name, no separate implementation. `themes/dark.css`
      and `themes/compact.css` ship in both packages, identical between
      React and Vue by design (same `[data-jalali-*]` attributes).
- [x] Add the `variant: 'dropdown'` option to `DatePicker`, alongside the
      v1 calendar-grid default. Done in Phase 5/6, not this phase: both
      `DatePicker.tsx` and `DatePicker.vue` already shipped the dropdown
      variant when `DatePicker` itself was built.
- [x] Document the visual configuration matrix: locale, direction,
      precision, display format, picker variant, and theme. See
      architecture.md's "Visual configuration matrix". `playground-react`
      and `playground-vue` were updated to exercise `InlineCalendar` and
      `RangePicker`, and to import `dark.css` + `compact.css` together to
      demonstrate composing themes.

## Phase 8: Build and release pipeline

- [x] Add a `tsup` (or Vite library mode) build config per package: ESM,
      CJS, and `.d.ts` output. `tsup` for `core`, `i18n`, `nlp`, `react`,
      `ui-react` (`tsup.config.base.ts` at the repo root, shared by all
      five, rather than five near-identical copies); Vite library mode
      (`@vitejs/plugin-vue` plus `vite-plugin-dts`) for `vue` and `ui-vue`,
      since tsup's esbuild core has no `.vue` SFC support. Every package's
      top-level `main`/`types`/`exports` still point at `src/index.ts`
      after this phase, unchanged from before it; only `publishConfig`
      points at `dist`, since npm and pnpm both merge `publishConfig` over
      the top-level fields specifically at publish time. This keeps the
      "no build needed before `tsc --noEmit`" property from Phase 0-7
      intact after adding a real build, rather than trading it away:
      verified directly by deleting every `dist/` directory in the repo
      and confirming `pnpm typecheck` still passed across all 11 packages
      and apps. See architecture.md's "Tooling" for the two tsup dts-worker
      fixes this needed (`composite`/`incremental` off, and
      `ignoreDeprecations: '6.0'`).
- [x] Confirm tree-shaking with a real bundler probe, and mark `sideEffects:
false` where true. `scripts/treeshake-probe.mjs` (`pnpm probe:treeshake`,
      `make probe-treeshake`) bundles a probe entry importing only
      `createCalendar` from the real built `jalali-js` output and asserts
      7 other real, unreached exports get dropped, while one reached,
      jalali-specific constant survives, so the check cannot pass on a
      broken or empty bundle. Confirmed it fails when it should too: the
      same probe with tree-shaking turned off leaks a marker back in.
      `jalali-js`/`@jalali-js/i18n`/`@jalali-js/nlp` are `"sideEffects":
false`; `@jalali-js/react`/`@jalali-js/vue`/`@jalali-js/ui-react`/
      `@jalali-js/ui-vue` use `"sideEffects": ["*.css"]`, since each ships
      a CSS file meant to be imported for its side effect.
- [x] Add a `size-limit` bundle-size budget on `packages/core`. Root
      `package.json`'s `"size-limit"` field, checked against
      `packages/core/dist/index.js` (`pnpm size`, `make size`). Budget: 6
      KB minified and brotli-compressed, against a measured baseline of
      2.05 KB, roughly 3x headroom. Verified the gate fails shut: set to a
      limit `size-limit` could not meet, confirmed a non-zero exit with the
      real overage reported, then restored the real budget.
- [x] Set up Changesets for versioning across the monorepo.
      `.changeset/config.json`: `access: "public"`, `baseBranch: "master"`
      (this repo's real default branch, matching `ci.yml`, not `main`),
      `@changesets/changelog-github` pointed at `yanovian/jalali-js`, and
      the four playground apps `ignore`d (private demo apps, never
      published). Root scripts: `changeset`, `version-packages`
      (`changeset version`), `release` (`pnpm build && changeset publish`).
- [x] Add `release.yml`: the Changesets bot opens or updates a "Version
      Packages" pull request. Merging it publishes to npm and cuts a GitHub
      release. Uses `changesets/action@v1`, triggered on push to `master`;
      `version` runs `pnpm version-packages`, `publish` runs `pnpm release`
      so every package is actually rebuilt before anything ships.

## Phase 9: Expand continuous integration

`ci.yml` already runs install, typecheck, lint, format-check, and unit tests,
since Phase 0. This phase adds the checks that only make sense once there is
more to build: a full build, a bundle-size budget, and the surrounding
audit and maintenance workflows.

- [x] Add a build step to `ci.yml` that builds every package. "Build
      packages" (`pnpm --filter "./packages/**" build`).
- [x] Add a step that builds all four playground apps: `playground-react`,
      `playground-vue`, `playground-next`, and `playground-nuxt`. This
      catches a break specific to Next.js or Nuxt. "Build playground apps"
      (`pnpm --filter "./apps/**" build`), its own named step so a
      Next.js/Nuxt-specific break is visible on its own, not folded into
      one opaque "build everything" line.
- [x] Add a bundle-size check step that fails the build when `size-limit`'s
      budget is exceeded. "Check bundle size" (`pnpm size`), run after the
      packages build so `packages/core/dist` already exists.
- [x] Add `license-audit.yml`, reusing the org's existing license-audit
      action. `yanovian/open-license-auditor@v1`, confirmed against
      `yanovian/chrome-ext-tabby`'s own workflow (the real action name and
      shape, not guessed): `fail-on: critical`, `severity-filter: both`, no
      config file needed (every default license bucket already fits a
      plain npm workspace).
- [x] Add `update-dependencies-non-breaking.yml` (monthly).
      `yanovian/update-dependencies-action@v1`,
      `update-strategy: non-breaking`, 1st of every month at 03:00 UTC.
      Needs a `PAT_TOKEN` repo secret (not the default `GITHUB_TOKEN`, which
      cannot trigger this repo's own `ci.yml` on the pull request it opens).
- [x] Add `update-dependencies-breaking.yml` (once every 6 months as it is
      breaking potentially change with 30 days offset).
      `yanovian/update-dependencies-action@v1`,
      `update-strategy: breaking`, `min-release-age-days: 30`, January 1st
      and July 1st at 05:00 UTC (this repo's own, slower cadence than
      `yanovian/chrome-ext-tabby`'s monthly use of the same action, on
      purpose: Changesets-driven, hand-reviewed releases warrant more time
      between breaking bumps than a continuously-shipped browser
      extension). Same `PAT_TOKEN` requirement as the non-breaking workflow.
- [x] Add `prune-old-actions.yaml` (scheduled cleanup).
      `yanovian/prune-old-actions@v1`, daily, `days-ago: 30`, matching the
      org's other repos exactly.
- [x] Add a peer-dependency compatibility matrix job: build, typecheck, and
      test each playground app against every major version of its
      underlying framework that is still under active support/maintenance
      (React, Vue, Next.js, Nuxt; the exact version list, e.g. React 18 and
      19, Vue 2 and 3, Next's last two or three majors, Nuxt's last two, is
      chosen at implementation time from each project's own support
      policy, not fixed here, since it goes stale otherwise). One GitHub
      Actions matrix job per `{app, framework version}` cell, all running
      in parallel, so this stays fast despite the combinatorial version
      count (see architecture.md's CI/CD pipeline for why this is a
      deliberate, scoped exception to this pipeline's usual no-matrix
      style). `compat-matrix.yml` plus `scripts/compat-override.mjs`
      (writes the matrix cell's version into `pnpm.overrides`, so pnpm
      resolves it workspace-wide, including packages that only declare the
      framework as a `peerDependency`). Matrix today: React 18 and 19; Vue
      3 only (Vue 2 reached end-of-life 2023-12-31 and is excluded on
      purpose); Next.js 15 and 16; Nuxt 3 and 4. Verified the override
      mechanism for real: forced React down to 18 locally, confirmed
      `packages/react`'s and `packages/ui-react`'s full test suites (30
      tests) and `playground-react`'s typecheck/build all passed against
      it, then restored `package.json`/`pnpm-lock.yaml` to their
      unmodified state.
- [x] Route every CI workflow step through `make <target>` instead of a raw
      `pnpm` command, wherever a Makefile target exists for what that step
      does, so a contributor can reproduce a CI failure locally with the
      exact same command. Added `install-frozen`, `build-packages`,
      `build-apps`, `app-typecheck`, `app-build`, and `test-paths`
      (the last three parameterized, for `compat-matrix.yml`'s dynamic
      matrix: `make app-typecheck APP=playground-react`, `make test-paths
PATHS="packages/react packages/ui-react"`) to the Makefile to cover
      every step that did not already have a target. Two narrow exceptions,
      both documented directly in the workflow files and in architecture.md's
      "Makefile" section: `release.yml`'s `changesets/action` inputs name
      exact pnpm scripts for the action itself to run, not `make release`
      (which is a deliberately different, dry-run-only local preview); and
      `compat-matrix.yml`'s post-override install stays `pnpm install
--no-frozen-lockfile` directly, since letting the lockfile move to
      match a dynamically-written override has no equivalent a contributor
      would run by hand.

## Phase 10: Visual e2e tests and PR screenshot bot

- [x] Add a Playwright config that targets all four playground apps,
      including `playground-next` and `playground-nuxt`. `playwright.config.ts`
      (repo root, `testDir: 'e2e'`): a `webServer` array builds and starts
      all four apps (ports 4001-4004; each app's own `preview`/`start`
      script) before any test runs.
- [x] Add cross-browser coverage: Chromium, Firefox, and WebKit (Playwright's
      three engines, covering Chrome/Edge, Firefox, and Safari's rendering
      engine without needing real per-OS browser installs). Runs as its own
      matrix dimension, in parallel per browser, alongside the visual
      matrix below. Three `projects` in `playwright.config.ts`; `e2e.yml`
      runs one job per browser (`make test-e2e-project PROJECT=...`).
- [x] Add the screenshot capture matrix: locale, precision, theme, and
      browser (from the cross-browser job above). `e2e/playground-react.spec.ts`
      and `e2e/playground-vue.spec.ts` screenshot each `data-testid`
      section of the playground page (locale x calendar system x picker
      variant: grid English/Jalali, grid Farsi/Jalali, dropdown, Gregorian,
      inline calendar, range picker), plus the opened calendar-grid
      popover itself; `e2e/playground-next.spec.ts` and
      `e2e/playground-nuxt.spec.ts` each take one full-page screenshot
      (they exist to prove SSR/hydration, not to re-demonstrate the
      locale/system/variant matrix the other two already cover). Browser
      comes for free: Playwright suffixes every baseline filename with the
      project name and platform. Theme is whichever theme the playground
      already ships with (dark + compact, see Phase 7); no runtime
      theme-toggle exists to make theme a true fourth matrix axis, and
      building one was out of scope here.
- [x] Add one smoke screenshot per `{app, framework version}` cell from
      Phase 9's peer-dependency compatibility matrix, so a maintainer can
      see whether a framework upgrade broke rendering, not only whether the
      build succeeded, feeding the same PR comment grid as the main visual
      matrix. Extended `compat-matrix.yml`: after building and typechecking
      each cell, a "Smoke screenshot" step starts that cell's app and
      captures one full-page screenshot with the `playwright screenshot`
      CLI (chromium only; the axis under test here is the framework
      version, not the browser). Feeds a separate PR comment
      ("Compatibility matrix smoke screenshots", not literally the same
      comment as the main visual suite: merging them needs cross-workflow
      artifact lookups across two separate workflow files, not worth the
      complexity for two clearly-titled comments on the same PR instead).
- [x] Add a publish step that commits screenshots to an orphan
      `visual-snapshots` branch, for linkable raw URLs. Accumulates under
      `pr-<number>/` (a real commit per run, never force-pushed), so an
      older PR's comment keeps linking to real images. Both `e2e.yml` and
      `compat-matrix.yml` publish here (the latter under `pr-<number>/compat/`).
- [x] Add a PR comment bot, using `actions/github-script`, that posts or
      updates one comment with the image grid, covering every matrix above.
      `scripts/visual-comment.mjs` reads each browser's Playwright JSON
      report and picks one image per **changed** screenshot test only (a
      passing test has no attachment in that report at all, so there is
      nothing to show for it beyond a pass count); every image is
      captioned `{app} — {test name} — {browser}` directly above it, with
      baseline/new/diff shown side by side for a real change. Verified
      against a real forced pixel diff, not just read: copied a different
      baseline over one screenshot, confirmed `toHaveScreenshot()` failed
      with real attachments, and confirmed the script produced correctly
      captioned, correctly copied images before restoring the baseline.
- [x] Add a baseline diff check that fails the build on an unacknowledged
      visual change, and passes when the PR updates the baseline with the
      change. Baselines are not committed to `master` at all (`.gitignore`
      excludes `e2e/**/*-snapshots/`, `test-results/`, `playwright-report/`,
      the same "no binary images in `master`'s history" reasoning that
      already applied to PR-run screenshots): they live on their own
      orphan `visual-baselines` branch, force-pushed as a single commit
      each time (no history kept; only the current baseline is ever
      meaningful), restored into place before each `e2e.yml` run. "The PR
      updates the baseline" means a maintainer runs the new
      `update-visual-baselines.yml` (`workflow_dispatch`, run from the
      PR's branch) once they have reviewed the diff in the PR comment;
      that regenerates every screenshot and force-replaces
      `visual-baselines`, after which `e2e.yml` passes on that PR. A repo
      with no `visual-baselines` branch yet fails every screenshot test
      until a maintainer runs this once, an expected one-time bootstrap
      step, not a bug.
- [x] Found and fixed a real bug while building this: an opened calendar
      popover is `position: absolute` and pokes outside its parent
      section's own box, so screenshotting the section clipped the
      popover to a two-line sliver instead of showing the actual grid.
      Fixed by screenshotting the popover element itself
      (`page.getByRole('dialog')`) instead of its ancestor section, in
      both `playground-react.spec.ts` and `playground-vue.spec.ts`.

## Phase 11: Docs site and v1.0 release

- [x] Scaffold `apps/docs` (VitePress). Real guide content, not stubs: getting
      started, core concepts, display value vs. storage value, configuration
      and theming, React, Vue, i18n, NLP, and a comparison with alternatives
      (adapted from `_docs/alternatives.md`'s own table). Every code example
      checked against real source before being written, not from memory.
- [x] Generate the API reference from the `core`, `i18n`, `nlp`, `react`,
      and `vue` package types. `apps/docs/scripts/build-api.mjs`
      (`typedoc` + `typedoc-plugin-markdown` + `typedoc-vitepress-theme`),
      run automatically before `docs-dev`/`docs-build`, never committed
      (regenerated from the real types every build, like `packages/*/dist/`).
      Also covers `ui-react`, beyond the original list. `vue` needed a
      second, separately scoped TypeDoc run for its plain-TypeScript
      composables only: TypeDoc's TypeScript-compiler-based parser cannot
      parse `.vue` SFCs at all (confirmed directly, not assumed, by trying
      the full run with `vue` included and reading the resulting
      `TS2307: Cannot find module './Calendar.vue'` errors), so the `.vue`
      component APIs (`Calendar`, `DatePicker`, `DropdownDateFields`,
      `RangePicker`, `InlineCalendar`) are hand-documented on `guide/vue.md`
      instead, the same way the wider Vue ecosystem documents SFC component
      APIs. Found and fixed a real bug this way: a JSDoc comment's literal
      `"next <month>"` placeholder text broke the VitePress build (parsed
      as an unclosed HTML/Vue tag); fixed at the source
      (`packages/nlp/src/word-list.ts`), not papered over in the docs
      tooling.
- [x] Add `pages.yml`: deploy the docs and playground site to GitHub Pages.
      Builds the docs site, builds `playground-react` and `playground-vue`
      at their embedded subpaths (`/playground/react/`, `/playground/vue/`,
      via a new `make app-build-at-base` target), merges both into the docs
      build output, deploys with the official
      `configure-pages`/`upload-pages-artifact`/`deploy-pages` actions.
      `playground-next`/`playground-nuxt` stay CI-only (GitHub Pages is
      static-only; they're SSR apps, already covered by `ci.yml`,
      `compat-matrix.yml`, and `e2e.yml`). Verified directly, not just
      built: served the merged output locally at the real deployment path
      (`/jalali-js/...`), confirmed every route and asset resolves, and
      screenshotted the embedded playground to confirm it actually renders,
      correctly themed, not only that the files exist.
- [x] Run the v1.0 release checklist and review the changelog.
      `_docs/release-checklist.md`: engineering readiness, package
      readiness, documentation readiness, and the operational prerequisites
      (`NPM_TOKEN`, `PAT_TOKEN`, GitHub Pages enabled) nothing in this repo
      can verify or set up by itself. Two real gaps found and fixed while
      writing it: the root `README.md` still said "Phase 0 done, calendar
      logic not started," badly stale against the repo's actual state; and
      none of the 7 publishable packages had their own `README.md` (npm's
      registry page reads a package's own README, not the repo root's) —
      all 7 now have one. Publishing itself (adding a `major`-bump
      changeset per package, merging the resulting "Version Packages" pull
      request) is deliberately not done as part of this phase: a real,
      irreversible, public action belongs to whoever owns that decision,
      made on purpose, not as a side effect of finishing a checklist.

## Later, not yet scheduled

- A minimal fake `CalendarEngine` implementation, exercised only in
  `packages/core`'s own test suite, to confirm the interface generalizes
  beyond Jalali and Gregorian without shipping and maintaining a real
  second calendar system (see architecture.md's "Calendar systems in
  scope" for why a full second calendar, previously planned as its own
  phase, was cut instead).
- Any other calendar system (ISO week-date, Hebrew, or otherwise), added
  only if real user demand appears. Not a committed phase: `jalali-js` is
  named after, and scoped to, the Jalali calendar; Gregorian is in scope
  only because the storage-value contract structurally needs it, not
  because more calendars are a goal on their own.
- More locales beyond `en` and `fa`.
- An astronomical (vernal-equinox-based) conversion engine, as an opt-in
  next to the arithmetic default.
