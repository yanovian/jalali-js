# Plan

See [alternatives.md](./alternatives.md) for the vision and the goals. See
[architecture.md](./architecture.md) for the design behind these decisions.
This file shows only the status of each phase.

Change an item to `[x]` as it lands. See "Later, not yet scheduled" for
work that has no phase yet.

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

Revised after v0.1.0, during Phase 12: the Finglish input style
(`fa-Latn`) was removed. Finglish is wrong and a bad practice: it works
against the language. English input accepts the transliterated month
names (`Mehr`, `Aban`, `Azar`); Farsi input uses Persian script.
`NlpLocale` is now `'en' | 'fa' | 'ps'`. Breaking change, recorded in
`CHANGELOG.md`.

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
- [x] Set up versioning across the monorepo, and `release.yml`, triggered
      by a pushed tag matching `v*.*.*`, matching the org's own
      tag-triggered release convention: `pnpm version <bump>`, extended
      across every package under `packages/*` via `pnpm --filter
"./packages/**" exec`, since plain `pnpm version` only bumps one
      `package.json` at a time. Every package starts at the same version
      and always gets the same bump, so they stay in sync with no extra
      bookkeeping. `make release-patch`/`-minor`/`-major` run `make
check`, bump, commit, tag, and push with `--follow-tags`, all locally,
      all in one command: no manual version number or tag, ever.
      `release.yml` re-runs the checks, builds, publishes each package to
      npm (skipping any already published at that version, so a partial
      failure is safe to retry), and creates one GitHub release with
      `softprops/action-gh-release`'s auto-generated notes. Both
      `tag-release` and the publish step refuse to redo work that already
      happened: `HEAD` already tagged means nothing to release, and a
      package already on npm at that version gets skipped, not
      re-published.
- [x] This went through two earlier designs before landing here, both
      worth recording since they were real, considered trade-offs, not
      just discarded drafts. The first used Changesets, since this repo
      has 7 independently-nameable packages, and Changesets is the
      standard tool for that; `changesets/action@v1` handled npm
      publishing and, in one revision, per-package GitHub releases
      sourced from each package's own `CHANGELOG.md`. That broke down for
      a reason worth stating plainly: `@changesets/changelog-github`
      (later swapped for the git-only `@changesets/cli/changelog`) needed
      a `GITHUB_TOKEN` to generate changelogs locally, and a maintainer
      release run failed on exactly that, with no way to create one
      without a personal access token they were not able to use. Once
      forced to remove that dependency, the actual value Changesets added
      over plain `pnpm version` shrank to "independent per-package
      version numbers," a feature this repo does not use: every package
      here already always ships together, at the same number, so nothing
      was actually lost moving to the simpler mechanism, and one more
      dependency, the `.changeset/` directory, and a hand-written
      changeset-generation script all went away with it.

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
      action. `yanovian/open-license-auditor@v1`, confirmed against a real
      usage of it elsewhere in the org (the real action name and shape,
      not guessed): `fail-on: critical`, `severity-filter: both`, no
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
      and July 1st at 05:00 UTC (this repo's own, slower cadence than the
      org's more common monthly use of the same action, on
      purpose: a deliberately, hand-released library warrants more time
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
      every step that did not already have a target. One narrow exception,
      documented directly in the workflow file and in architecture.md's
      "Makefile" section: `compat-matrix.yml`'s post-override install
      stays `pnpm install --no-frozen-lockfile` directly, since letting
      the lockfile move to match a dynamically-written override has no
      equivalent a contributor would run by hand. `release.yml` (Phase 8)
      later added `publish-packages`, so every one of its own steps also
      routes through `make`, with no exception of its own.

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
      captioned `{app}, {test name}, {browser}` directly above it, with
      baseline/new/diff shown side by side for a real change. Verified
      against a real forced pixel diff, not just read: copied a different
      baseline over one screenshot, confirmed `toHaveScreenshot()` failed
      with real attachments, and confirmed the script produced correctly
      captioned, correctly copied images before restoring the baseline.
- [x] Add a baseline diff check that surfaces an unacknowledged visual
      change for review, and catches up automatically once that change
      merges. Baselines are not committed to `master` at all (`.gitignore`
      excludes `e2e/**/*-snapshots/`, `test-results/`, `playwright-report/`,
      the same "no binary images in `master`'s history" reasoning that
      already applied to PR-run screenshots). They live on their own
      orphan `visual-baselines` branch, force-pushed as a single commit
      each time (no history kept; only the current baseline is ever
      meaningful), restored into place before each `e2e.yml` run. Revised
      after Phase 11 from a manual design: `update-visual-baselines.yml`
      first shipped as `workflow_dispatch` only, run by hand from a PR's
      branch once a maintainer had reviewed its diff comment. That manual
      step was never actually run, so the repo shipped Phase 11 with no
      working baseline at all. Fixed by triggering the same workflow on
      every push to `master` instead, so it keeps `visual-baselines`
      current with zero manual steps. A PR that intentionally changes
      rendering keeps showing "changed" screenshots for as long as it
      stays open; the baseline only catches up after merge. That is
      expected: the reviewer's job is to look at the diff images in the
      PR comment and merge on that judgment, the same as any other code
      review, not to chase a green check first. `workflow_dispatch` still
      stays available too, for the one-time bootstrap on a repo with no
      `visual-baselines` branch yet.

      Revised again after that: triggering directly on `push: branches:

[master]`ran this workflow in parallel with`ci.yml`on the same
      commit, a real problem, not just wasted CI minutes, since a commit
      that failed typecheck, lint, or test could still become the
      accepted baseline. Fixed by chaining it to`ci.yml` instead
      (`workflow_run`, `types: [completed]`, gated on
      `github.event.workflow_run.conclusion == 'success'`), checked out
      at the exact commit `ci.yml` validated
      (`github.event.workflow_run.head_sha`), so only a commit that
actually passed CI ever gets baselined.

- [x] Found and fixed a real bug while building this: an opened calendar
      popover is `position: absolute` and pokes outside its parent
      section's own box, so screenshotting the section clipped the
      popover to a two-line sliver instead of showing the actual grid.
      Fixed by screenshotting the popover element itself
      (`page.getByRole('dialog')`) instead of its ancestor section, in
      both `playground-react.spec.ts` and `playground-vue.spec.ts`.
- [x] Added after Phase 11, on request: a `custom-theme` playground
      section and matching functional test in both spec files, so a
      consumer-style CSS override (not one of the shipped theme files)
      gets checked too, not just the default look. A screenshot alone
      only proves the render changed, not that a specific configured
      value took effect, so each spec file also asserts on the real
      computed styles (`toHaveCSS`). Building this found a real bug in
      the first draft: the override was set as an inline style on a
      wrapping element, and it silently lost to `dark.css`, since CSS
      custom properties give a direct match on the element itself
      priority over any inherited value, regardless of specificity or
      import order. Fixed by scoping the override under a parent class
      instead (`.custom-theme-scope [data-jalali-datepicker-root]`), the
      pattern architecture.md's "Theming contract" already documented.
      Verified directly: read the computed `--jalali-primary` value in
      chromium, firefox, and webkit before and after the fix, confirmed
      all three failed the same way on the inline-style draft and passed
      once scoped correctly.

## Phase 11: Docs site and initial release

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
      built: served the merged output locally at the real deployment path,
      confirmed every route and asset resolves, and screenshotted the
      embedded playground to confirm it actually renders, correctly themed,
      not only that the files exist. The docs site now uses the custom
      domain root at `https://jalali-js.yanovian.com/` (`base: '/'`).
- [x] Run the release checklist (`_docs/release-checklist.md`, a one-time
      gate for the first release; deleted after v0.0.1 shipped, as the
      document itself instructed, so it could not go stale): engineering
      readiness, package readiness, documentation readiness, and the
      operational prerequisites (`NPM_TOKEN`, `PAT_TOKEN`, GitHub Pages
      enabled) nothing in this repo can verify or set up by itself. Two
      real gaps found and fixed while writing it: the root `README.md`
      still said "Phase 0 done, calendar logic not started," badly stale
      against the repo's actual state; and none of the 7 publishable
      packages had their own `README.md` (npm's registry page reads a
      package's own README, not the repo root's). All 7 now have one.
      Publishing itself (`make release-patch`) is deliberately not done
      as part of this phase: a real, irreversible, public action belongs
      to whoever owns that decision, made on purpose, not as a side
      effect of finishing a checklist.

## Phase 12: Additional locales (`packages/i18n`, `packages/nlp`)

- [x] Confirm the next locale to add (proposed: Pashto, `ps`). Afghanistan
      is the other country that uses the Jalali solar calendar
      officially, alongside Iran, and Pashto is one of its two official
      languages; Dari, its other official language, is a national standard
      of Persian itself and already close enough to `fa` that a dedicated
      pack is lower priority. Built as proposed: Pashto (`ps`).
- [x] Add the new `LocalePack`: month names for both calendar systems,
      weekday names, native digits, and text direction. Follow `fa.ts`'s
      existing pattern (see architecture.md's "Internationalization").
      `src/ps.ts`. Every name and digit comes from CLDR's `ps` locale data,
      read through ICU (Node's `Intl`), not from memory, the same
      verification source Phase 1 used for the calendar arithmetic.
      Afghanistan names the Jalali months after the zodiac signs
      (وری through کب), so `ps`'s month names share nothing with
      `fa`'s Persian ones. They are two name sets for the same months of
      the same calendar, verified directly: ICU reports identical year,
      month, and day numbers for the `ps-AF` and `en` Persian-calendar
      locales across 20,000 random dates (1900-2100), and وری names the
      same day فروردین names (Nowruz). CLDR has no abbreviated Pashto
      month or weekday forms, so `short` reuses `long`, the same choice
      `fa.ts` makes for its month names.
- [x] Add unit tests for the new locale pack, mirroring `en`/`fa`'s
      existing coverage (`format()` across styles, the weekday prefix,
      numeral rendering). `format.test.ts`'s Pashto suite and a
      `numerals.test.ts` case for the `ps` digits.
- [x] Wire the new locale into `@jalali-js/react` and `@jalali-js/vue`'s
      `LocaleCode` type and `localePackFor()`. Also `@jalali-js/web`,
      which landed after this item was written and carries the same
      `LocaleCode`. Doing this showed the wiring itself was duplicated:
      each binding held its own copy of the code-to-pack table, and the
      four web elements each parsed their `locale` attribute with a
      hardcoded `'fa' : 'en'` ternary. Both now live once in
      `@jalali-js/i18n` (`locale-packs.ts`: `LocaleCode`,
      `localePackFor()`, `isLocaleCode()`); the bindings re-export them,
      and the web elements share one `parseLocaleAttribute()`. The next
      locale changes one table, not three bindings and four call sites.
- [x] Optional, separate from the i18n locale pack itself: add
      `@jalali-js/nlp` phrase support for the new locale (`NlpLocale`, a
      new `WordList`), if the phrase set is well understood enough to
      write correctly. Shipped: the phrase set was verifiable, not just
      well understood. Every phrase except one everyday variant comes
      straight from CLDR's `ps` relative-time data
      (`Intl.RelativeTimeFormat('ps')`): نن، سبا، پرون، راتلونکې اونۍ.
      Pashto adjectives come before the noun, so "next <month>" uses
      prefix order like English, unlike Farsi; both gender forms of the
      "next" adjective are accepted, so a writer never needs to know a
      month name's grammatical gender.
- [x] Add the new locale to the visual e2e matrix (Phase 10) and the docs
      site's i18n guide. A `grid-ps-jalali` section in `playground-react`
      and `playground-vue`, plus the matching screenshot test in both spec
      files. The new baselines land on `visual-baselines` automatically
      after merge (the Phase 10 flow, unchanged).
- [x] Write up how to add a locale from scratch, in the i18n guide, as a
      real contribution guide: a `LocalePack` is already a plain exported
      interface with no other code to change, but that fact is currently
      only implicit (a sentence in `guide/i18n.md`), not walked through.
      `guide/i18n.md`'s "Adding a locale" section: the pack fields, the
      ICU/CLDR sourcing trick, tests, binding wiring, and the optional
      NLP step, each pointing at the real `ps` files as the worked
      example.

## Phase 13: Astronomical conversion engine (`packages/core`)

- [x] First, the cheap check: add a minimal fake `CalendarEngine`
      implementation (a calendar with a deliberately irregular
      month-length rule), exercised only in `packages/core`'s own test
      suite, confirming the interface has no hidden Jalali/Gregorian-shaped
      assumption before investing in a real second engine. See
      architecture.md's "Calendar systems in scope" for why this replaces
      a full second calendar system as the interface's generalizability
      proof.
- [x] Implement the astronomical engine: the true vernal equinox instant at
      the Tehran meridian, from a validated solar-position algorithm (Jean
      Meeus's _Astronomical Algorithms_' low-precision solar position
      method is the standard, implementable reference for this; a full
      VSOP87 implementation is out of scope for the precision this needs).
      Nowruz (the Jalali new year) is the Gregorian calendar day the
      equinox instant falls on, at that meridian.
- [x] Expose it as an opt-in `CalendarEngine`, alongside the existing
      arithmetic default, with no change to the rest of the public API:
      `createCalendar({ system: 'jalali', engine: 'astronomical' })`.
- [x] Add tests: agreement with the arithmetic engine across the range
      where they should already agree (the range the arithmetic rule is
      already validated against, per Phase 1), and explicit checks at the
      edges where they might diverge (far future/past years), against
      published astronomical reference data, not only against each other.
- [x] Document the tradeoff (slower, needs real solar-position math, only
      matters for correctness many centuries out) and when to reach for
      it, in architecture.md and the docs site's core-concepts guide.

## Phase 14: Date math and query helpers (`packages/core`)

The core has `addDays()` and `compareDates()` only. Real apps need more
arithmetic: age calculations, deadlines, and reports all diff and shift
dates. This phase completes the set, still with zero runtime dependencies.

- [x] Add `addMonths()` and `addYears()`. Clamp the day to the target
      month's length (Esfand 30 in a leap year plus one year gives
      Esfand 29). Work per calendar system, like `addDays()`.
      `src/date-math.ts`. `addYears()` is `addMonths()` with the months
      scaled by `monthsInYear`, one implementation, not two.
- [x] Add `diffDates(a, b, unit)` with `day`, `week`, `month`, and `year`
      units, per calendar system. Define and document the truncation rule
      (a full unit must pass before it counts). Signed like
      `compareDates()`: positive when `a` is later. Month and year steps
      resolve the last partial unit through `addMonths()`/`addYears()`
      themselves, clamping included, so
      `diffDates(addMonths(d, n), d, 'month')` is always exactly `n`.
- [x] Add `startOf()` and `endOf()` for week, month, and year. Take the
      week start day as a parameter, since Jalali weeks start on Saturday
      and Gregorian weeks commonly start on Monday or Sunday. The default
      is the per-system `WEEK_START_DAY` table, moved out of
      `calendar-grid.ts` so the grid and these helpers share one
      definition instead of two copies.
- [x] Add the query helpers: `isBefore()`, `isAfter()`, `isSameDay()`,
      `isBetween()`, and `isToday()`. Thin wrappers over `compareDates()`,
      so each stays one line and tree-shakeable. `isBetween()` includes
      both bounds; `isToday()` reads the same local clock
      `createCalendar().today()` reads.
- [x] Add property tests against Julian Day Number arithmetic, and boundary
      tests around leap Esfand and month ends. `date-math.test.ts`. The
      antisymmetry property caught a real wart before it shipped:
      `diffDates()` could return `-0` (from `Math.trunc` on a small
      negative fraction, and from negating a zero diff). Fixed in the
      implementation, not the test.
- [x] Document the helpers in the docs site's core-concepts guide. The
      "Date math and queries" section: the full import list, the clamping
      rule, the truncation rule, and the week start parameter.

## Phase 15: Format templates and strict parsing (`packages/i18n`)

`format()` covers presets only. A consumer who needs `1404/12/30` or
`30 Esfand 1404` in an exact shape has to build it by hand. This phase adds
token templates, and the reverse: strict parsing of a known shape (the NLP
package stays the home for free-form input).

- [x] Add template support to `format()`: year, month, day, weekday, and
      month-name tokens, locale-aware, for both calendar systems. Presets
      stay; templates are additive. Done as a `template` option on
      `FormatOptions`. Tokens: `YYYY`, `MM`, `M`, `DD`, `D`, `MMMM`,
      `MMM`, `dddd`, `ddd`. One tokenizer in
      `packages/i18n/src/template.ts` serves both directions.
- [x] Add `parseTemplate(input, template, options)`. Return a
      `CalendarDate`, or `null` when the input does not match. Accept both
      Latin and Persian digits. Done as
      `parseTemplate(input, template, localePack, options)`, mirroring
      `format()`'s argument order. It accepts Latin digits and the pack's
      native digits, rejects dates that do not exist, and checks a weekday
      name against the parsed date.
- [x] Add round-trip tests: format with a template, parse it back, get the
      same date, across locales and calendar systems. Done as a
      `fast-check` property over all three locales, both systems, both
      digit styles, and six templates, plus direct rejection tests.
- [x] Document the token table in the docs site's i18n guide.

## Phase 16: Selection rules for every picker

No picker can restrict what a user picks. Booking, scheduling, and form
apps all need this. This phase adds one shared rule model, wired into every
binding at once.

- [x] Add a `SelectionRules` type to `packages/core`: `minDate`, `maxDate`,
      `enabledDates`, `disabledDates`, and `disabledWeekdays`. Add one
      resolver, `isDateSelectable(date, rules)`, with a documented priority
      order: the whitelist wins, then the blacklist, then weekdays, then
      the min/max bounds. Done in `selection-rules.ts`. Rule dates are
      plain `{ year, month, day }` fields, read in the date's own system.
- [x] Wire the rules into `buildCalendarGrid()`, so every binding gets the
      same behavior from one implementation. Blocked days render with a
      `data-disabled` attribute and reject selection. Done: the grid takes
      an optional `rules` argument and each cell gets `isSelectable`.
- [x] Expose the rule props on `Calendar`, `DatePicker`, and `RangePicker`
      in `react`, `vue`, `web`, and the `ui-*` packages. Done as a `rules`
      prop (a JS property on the Web Components). On `DatePicker`, the
      rules apply to the grid variant; the dropdown variant does not use
      the grid.
- [x] Make keyboard navigation skip blocked days. Done: blocked days
      render as natively disabled buttons, so they drop out of the Tab
      order and cannot be activated.
- [x] Decide the range-picker behavior when a blocked day falls inside a
      candidate range (block the range, or split it). Decided: block. A
      candidate range that crosses a blocked day does not complete; the
      second click starts a new range instead. One shared resolver,
      `isRangeSelectable(start, end, rules)` in `packages/core`, keeps
      the three range pickers identical.
- [x] Add unit tests per binding, playground sections, and visual e2e
      coverage for the blocked-day rendering. Done: a `selection-rules`
      section in the React, Vue, and vanilla playgrounds, pinned to
      Mordad 1403 so the screenshot is date-stable, plus e2e baselines.
- [x] Add a guide page with copy-paste examples: min/max bounds, weekend
      blocking (Thursday and Friday), and a whitelist of open dates. Done:
      `apps/docs/guide/selection-rules.md`.

## Phase 17: Time selection

The core already models `date + time` and `date + time + timezone`
(Phase 2), but no component exposes a time. This phase closes that gap.

- [x] Add a `TimePicker` component to `react`, `vue`, and `web`: hour and
      minute fields, a `minuteStep` option, and a `disabledHours` option.
      Headless first, with the same `data-jalali-*` attribute contract and
      an optional default stylesheet, like `DatePicker`. Done. Option lists
      and `withTime()` / `timeOfDay()` live once in `packages/core`.
- [x] Add a `precision` prop to `DatePicker` (`'date'` default,
      `'datetime'` adds the time panel). The emitted storage value carries
      the time, through the existing Phase 2 storage-value contract. Done:
      the popover stays open after a day pick so the person can set the
      time.
- [x] Add a `TimeRangePicker` to the `ui-*` packages, next to
      `RangePicker`. Done as two `TimePicker`s side by side.
- [x] Add unit tests per binding, playground sections, visual e2e
      coverage, and a docs guide section. Done:
      `apps/docs/guide/time-selection.md`, playground sections, and e2e
      section entries.

## Phase 18: Holiday data (`packages/holidays`)

Offline holiday data for calendar UIs. **Iran (`IR`) ships today.** `AF`
and `TJ` are reserved under `src/regions/<code>/`.

- [x] Add `@jalali-js/holidays` (zero runtime deps). Fixed solar rules plus
      lunar year table (1402-1426, `data/ir/lunar/`).
- [x] API: `isHoliday(date, { region })`, `holidaysOn`, `holidaysInMonth`,
      names in `regions/ir/names/{en,fa,ps}.ts`, picker helpers.
- [x] Wire `showHolidays`, `blockHolidays`, and `holidayRegion` into
      Calendar, DatePicker, and RangePicker. Core takes `isHolidayDay`
      only.
- [x] Update path: `make update-holidays YEARS=next|1426|...`. Yearly CI
      opens a PR with `PAT_TOKEN` when files change.
- [x] Tests, playground, e2e, and `apps/docs/guide/holidays.md`.

## Phase 19: Relative time output (`packages/i18n`)

- [x] Add `formatRelative(from, to, locale)`: "۳ روز پیش", "3 days ago",
      "in 2 months". Unit selection uses Phase 14's `diffDates()`. Digits
      follow the existing `numerals` option. Relative phrases live on
      each `LocalePack` (`relative.today` / past / future).
- [x] Add unit tests per locale, per unit, and for the "today" case.
- [x] Document it in the i18n guide.

## Phase 20: Event calendar (`packages/ui-*`)

Many apps need a month grid that renders their own events, not only a
picker. This stays headless-first, like everything else here: the consumer
owns the event data and the persistence.

- [x] Add a framework-free event model and layout module: an event has a
      date span, an optional time span, and an all-day flag. Multi-day
      spans and overlap layout are pure functions, tested on their own,
      like `buildCalendarGrid()`.
- [x] Add an `EventCalendar` month view to `ui-react`, `ui-vue`, and
      `ui-web`. Controlled component: the consumer passes the event array
      and gets callbacks (`onEventClick`, `onDayClick`). No built-in modal
      or storage; the consumer renders their own editing UI from the
      callbacks.
- [x] Add week and day views, after the month view lands.
- [x] Decide the recurring-event scope at implementation time: a pure
      rule-expansion helper is likely enough, with the expansion done on
      the consumer's side. Document the choice.
- [x] Add unit tests for the layout functions, component tests per
      binding, playground sections, visual e2e coverage, and a docs guide
      page.
- [x] Seed the playground with enough events to show multi-day all-day
      chips, timed blocks, and overlap lanes in month, week, and day
      sections (`event-calendar`, `event-calendar-week`,
      `event-calendar-day`). Rich interactive controls for those views
      wait for Phase 22.

## Phase 21: Docs depth and recipes

The guides explain concepts well. What they lack is the reference density a
consumer scans for: exact props per component, and a copy-paste answer for
each common scenario.

- [x] Add a prop table to every component's guide section (`react`, `vue`,
      `web`, and the `ui-*` packages): name, type, default, and a one-line
      description. Keep each table checked against the real source.
- [x] Add a recipes page: default to today, min/max bounds, weekend
      blocking, epoch output for an API, form submission, programmatic
      set and clear, and SSR usage. One short, complete, copy-paste
      example per recipe.
- [x] Add a programmatic-control section: how to set, read, and clear the
      value from outside the component, per binding.
- [x] Add a support statement page: which browsers and mobile behaviors
      the e2e suite actually verifies (Chromium, Firefox, and WebKit
      today), stated from the real CI matrix, not aspiration.
- [x] Keep `CHANGELOG.md` current: `make release-*` promotes
      `## [Unreleased]` to the new version heading (and compare links),
      and fails when there are no release notes.

## Phase 22: Interactive demo playground (`apps/`)

The hosted playground pages exercise the components for tests. A visitor
also needs live controls, the current value, and matching code to copy.
This phase turns the hosted playground into a real demo site.

Control state comes from URL parameters, with fixed defaults. The e2e
suite opens each page with an explicit URL and screenshots the same
state every run.

- [x] Shared demo layout in React, Vue, and Web Components playgrounds:
      tabs per component, binding links between the three apps, shared
      state helpers in `apps/playground-shared`.
- [x] Live controls: locale, system, variant, display style, `valueFormat`,
      time step, holidays, EventCalendar view. Seed events cover all-day
      chips, timed blocks, and overlap lanes.
- [x] Keep three fixed `EventCalendar` screenshot cells (month, week, day)
      under stable `data-testid`s, plus the rest of the visual matrix.
- [x] Show the emitted storage value next to the live component.
- [x] Live theme editor for `--jalali-*` colors and spacing, plus dark and
      compact toggles.
- [x] Code snippet from the current state, with a copy button, per binding.
- [x] Host-page direction toggle (ltr / rtl / auto).
- [x] Viewport-position demo with pickers at the screen edges. Popovers
      flip and clamp (`positionPopover` in the date and range pickers).
- [x] Touch-friendly layout for phone widths.
- [x] Full control state from URL parameters.
- [x] E2e tests use explicit URL state and keep the existing cell
      `data-testid`s.
- [x] Demo shell screenshots: default state and one non-default control
      state per binding.
- [x] Phase 23 landed first so visual changes report without failing CI.
- [x] Link the demo from the docs home page and the readme.

## Phase 23: Visual changes report, they do not fail CI

A changed screenshot used to fail the e2e job while the PR comment showed
the diff. The red check read like a defect, but a visual change is often
the point of the pull request. The reviewer judges the images in the
comment. The job status should match that.

- [x] Split the e2e assertions into two classes. Functional assertions
      (interaction, emitted values, computed styles) keep failing the job.
      Screenshot comparisons are advisory: they report, they do not fail.
- [x] Implement the advisory comparison in `e2e/expect-screenshot.ts`:
      catch a pixel mismatch or a missing baseline, keep Playwright's
      baseline / new / diff attachments, record a `visual-change`
      annotation, and let the test pass.
- [x] Update `scripts/visual-comment.mjs` to select images by that
      annotation, not by test failure. The comment shows baseline against
      new, with the diff, per test and per browser, and states when
      nothing changed.
- [x] Keep the job red for real errors: a crashed app, a failed functional
      assertion, or a screenshot that cannot be captured at all still
      fails the run.
- [x] Verify both directions: a forced pixel change stays green and
      appears in the comment manifest; a functional failure stays red.
- [x] Update architecture.md: the check gates functional correctness, the
      reviewer judges visuals in the comment, and the baseline branch flow
      stays unchanged.

## Phase 24: npm package pages

npm renders each package's own `README.md` as its registry page. That page
is often the first thing an evaluating developer reads. Each publishable
package now has a full, scannable README.

- [x] Define one shared readme structure and apply it to every publishable
      package: badges (version, license, docs; bundle size on the core),
      a short pitch, contents, install, compatibility (peers and CI matrix),
      quick start, API/components/elements, a short options table, theming,
      links, and license. Structure lives in `_docs/readme-structure.md`.
- [x] Keep one source of truth for the options tables. READMEs keep a short
      key-options table and link to the docs guide prop tables
      (`guide/react.md`, `vue.md`, `web-components.md`). Full tables are
      not duplicated, so the two do not drift apart.
- [x] Use npm-safe Markdown only (badges as images, GFM tables, fenced
      code, heading anchors). No custom HTML that npm would strip. Confirm
      locally with `make check-readmes` and a GitHub/npm-style Markdown
      preview before the next publish.
- [x] Review each package's `package.json` metadata: `description`,
      `keywords` (jalali, shamsi, persian, datepicker, framework names),
      `homepage` (docs site), and `repository` (with `directory`).
- [x] Add `make check-readmes` (`scripts/check-package-readmes.mjs`) to
      `make check`, `ci.yml`, and `release.yml`. A missing required section
      fails the run.

## Phase 25: Calendar UX, week start, timeline, and discoverability

Fix week headers for Iran and Persian locales. Make every calendar usable
on a phone. Improve light and dark theme colors. Add a timeline event
view. Put live demo, docs, and ecosystem package links where visitors see
them first. Land each item with a matching `CHANGELOG.md` bullet under
`## [Unreleased]`.

- [x] **Discoverability links.** Put live demo, documentation, and npm links
      for every package in this ecosystem among the first few links on the
      root README, the docs home page, and each package README. A visitor
      should reach the demo, the guide, and each sibling npm package without
      scrolling past install or API detail.
- [x] **Week start (Shanbe / Saturday).** Core `WEEK_START_DAY.jalali` is
      already `6` (Saturday). Weekday header rows in Calendar,
      RangePicker, and EventCalendar still list locale names in Sunday-first
      array order. Rotate headers to `WEEK_START_DAY[system]` so the first
      column matches the grid (شنبه first for Jalali / `fa`). Cover React,
      Vue, and Web Components. Add tests that the first weekday label is
      Saturday for Jalali and Sunday for Gregorian.
- [x] **Event calendar mobile layout.** Month, week, and day EventCalendar
      views must work on narrow viewports: readable day cells, scrollable
      week and day lanes, touch-friendly event chips, and no horizontal
      overflow that clips content. Apply across `ui-react`, `ui-vue`, and
      `ui-web`. Add playground and e2e coverage at a phone width.
- [x] **Timeline calendar.** Add a vertical timeline EventCalendar
      alternative (or sibling view) in the `ui-*` packages. Support Persian
      locale text, native digits, and date formats from `@jalali-js/i18n`.
      Expose configuration close to the attached design: direction
      (vertical first), marker shape, show icons, alternating layout,
      Persian numbers, and marker size. Document props and add a
      playground demo with seed milestones.
- [ ] **Mobile and theme polish for all calendars.** Audit Calendar,
      DatePicker, RangePicker, InlineCalendar, and EventCalendar (including
      the new timeline) at phone widths and in light and dark themes. Fix
      contrast, accent, surface, and border token use so dark mode does not
      wash out or clash. Keep the same `--jalali-*` theme surface.
- [ ] **Size, density, and elegance.** Review default calendar size, spacing,
      radius, and type scale so the default look is clean and compact while
      still configurable through theme CSS variables (and timeline marker
      size where that API exists). Prefer one coherent visual system across
      bindings.
- [ ] **Localized UI chrome strings.** Move hard-coded English control labels
      (for example `Previous week`, `Next month`, `Choose year`) into
      `@jalali-js/i18n` locale packs (`en`, `fa`, `ps`). Wire Calendar,
      DatePicker, RangePicker, EventCalendar, and related controls to those
      strings for `aria-label` and similar chrome. Keep one key per meaning.

## Later, not yet scheduled

- Any other calendar system (ISO week-date, Hebrew, or otherwise), added
  only if real user demand appears. Not a committed phase: `jalali-js` is
  named after, and scoped to, the Jalali calendar; Gregorian is in scope
  only because the storage-value contract structurally needs it, not
  because more calendars are a goal on their own.
