# Plan

See [alternatives.md](./alternatives.md) for the vision and the comparison
with other libraries. See [architecture.md](./architecture.md) for the design
behind these decisions. This file shows only the status of each phase.

No phase is implemented yet. Every item below is `[ ]`. Change an item to
`[x]` as it lands.

## Phase 0: Repo scaffolding and tooling

- [ ] Set up the pnpm workspace layout: `packages/`, `apps/`, `e2e/`,
      `_docs/`.
- [ ] Add a shared root `tsconfig.json` in strict mode, with project
      references per package.
- [ ] Add an ESLint flat config and Prettier, shared across packages.
- [ ] Set up Vitest at the workspace root, so it runs across all packages.
- [ ] Add a `LICENSE` file (MIT, pending confirmation; see architecture.md's
      open decisions).
- [ ] Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.
- [ ] Add `.github/ISSUE_TEMPLATE/` with `bug_report.yml`,
      `feature_request.yml`, and `config.yml`.
- [ ] Add `.github/PULL_REQUEST_TEMPLATE.md`.
- [ ] Add a `Makefile` with separate `install`, `dev`, `build`, `typecheck`,
      `lint`, `lint-fix`, `format`, `format-check`, `test`, and `test-watch`
      targets, plus one combined `check` target that runs typecheck, lint,
      format-check, and test together. Later phases add more targets, but
      every command a phase needs already has a place to go.
- [ ] Add a minimal `ci.yml`: install, typecheck, lint, format-check, and
      unit test, on every push and pull request. This is the only CI setup
      step in this phase. It exists before any calendar logic does, so every
      later phase lands its tests into a pipeline that already runs them,
      instead of waiting for Phase 9 to add checks retroactively.
- [ ] Add a pre-commit hook (Husky and lint-staged, or an equivalent) that
      runs ESLint `--fix` and Prettier `--write` on staged files, restages
      the fixed files, and blocks the commit when an error remains that
      `--fix` cannot resolve. Only formatted, lint-clean code reaches a
      commit.

## Phase 1: Core Jalali to Gregorian conversion engine (`packages/core`)

- [ ] Define the internal `CalendarEngine` interface. This is the seam that
      later lets a second calendar system, and later an astronomical engine,
      plug in with no change to the public API.
- [ ] Implement the Jalali leap-year rule (see architecture.md for the
      chosen algorithm).
- [ ] Implement Gregorian leap-year handling, including the century rule.
- [ ] Implement `toGregorian()` and `fromGregorian()`.
- [ ] Add month-length tables for both calendars.
- [ ] Add round-trip property tests (fast-check) across a wide range of
      years.
- [ ] Add boundary tests: year 1, Esfand length in a leap and a non-leap
      year, and Gregorian century-leap edge cases (1900, 2000, 2100).
- [ ] Check leap years against an independent, published reference table.

## Phase 2: Precision and timezone data model (`packages/core`)

- [ ] Add the `CalendarDate` type: year, month, and day. This is the
      default, with no time part.
- [ ] Add the `CalendarDateTime` type: adds time, with no timezone.
- [ ] Add the `ZonedCalendarDateTime` type: adds an IANA timezone.
- [ ] Add the `createCalendar()` factory, with a `precision` option that
      picks one of the tiers above.
- [ ] Support `timeZone: 'auto'` through `Intl.DateTimeFormat`.
- [ ] Handle timezone safely under SSR: `'auto'` resolves to UTC during
      server render. Add a `useResolvedTimeZone()`-style hook that reads the
      real client timezone after hydration (see architecture.md's SSR note).
- [ ] Add unit tests for each precision tier and for timezone conversion.
- [ ] Add the storage-value contract: each precision tier converts to a
      Gregorian, calendar-agnostic value by default (see architecture.md's
      "Display value against storage value").
- [ ] Add the `valueFormat` option (`gregorian-iso`, `date`, `epoch`,
      `jalali-iso`, `jalali-object`), so an app can opt into a Jalali-native
      stored value when it needs one.
- [ ] Add unit tests that confirm the default stored value stays Gregorian
      even when the display locale and calendar are Jalali.

## Phase 3: Internationalization (`packages/i18n`)

- [ ] Add `en` locale data: month names, weekday names, and direction.
- [ ] Add `fa` locale data: month names, weekday names, Persian numerals,
      and right-to-left direction.
- [ ] Add a `format()` function that reads locale data.
- [ ] Add display-format presets: long against short, with or without
      weekday, and Persian against Latin digits.
- [ ] Design the locale-pack format so a third locale is a data file, with
      no code change.
- [ ] Add unit tests for formatted output per locale, per format preset, and
      for numeral conversion.

## Phase 4: Natural language date parsing (`packages/nlp`)

- [ ] Define a `parse(input: string, locale)` function that returns a
      `CalendarDate`, or `null` when it cannot read the input.
- [ ] Add an English word list: relative terms (`today`, `tomorrow`,
      `yesterday`, `next week`) and Jalali month names in English spelling
      (`next Farvardin`).
- [ ] Add a Farsi word list, in Persian script (`امروز`, `فردا`, `دیروز`).
- [ ] Add a Finglish word list, Farsi words in Latin letters (`emrooz`,
      `farda`, `dirooz`), with common spelling variants for each word.
- [ ] Add unit tests for each input style, and for invalid or unclear input.

## Phase 5: React bindings (`packages/react`)

- [ ] Confirm the default `DatePicker` UI variant (calendar-grid popup
      against dropdowns; see architecture.md's open decisions) before this
      phase starts.
- [ ] Add the `useCalendar` hook.
- [ ] Add headless component primitives: data attributes and class hooks
      for styling.
- [ ] Add a default-styled `DatePicker` component built on the headless
      primitives, so a consumer gets a usable picker with no custom styling.
- [ ] Wire the `DatePicker`'s `onChange` value to the Phase 2 storage-value
      contract, and expose the `valueFormat` option.
- [ ] Expose a `displayFormat` prop, using the Phase 3 format presets.
- [ ] Scaffold `apps/playground-react` (Vite and React) to exercise the
      hook and components.
- [ ] Scaffold `apps/playground-next`, a real Next.js app, and confirm the
      SSR timezone handling from Phase 2.
- [ ] Add component tests with Vitest and Testing Library, including a test
      that the emitted value stays Gregorian by default while the display
      shows Jalali.

## Phase 6: Vue bindings (`packages/vue`)

- [ ] Add the `useCalendar` composable.
- [ ] Add headless component primitives: scoped slots for styling.
- [ ] Add a default-styled `DatePicker` component built on the headless
      primitives, so a consumer gets a usable picker with no custom styling.
- [ ] Wire the `DatePicker`'s `v-model` value to the Phase 2 storage-value
      contract, and expose the `valueFormat` option.
- [ ] Expose a `displayFormat` prop, using the Phase 3 format presets.
- [ ] Scaffold `apps/playground-vue` (Vite and Vue) to exercise the
      composable and components.
- [ ] Scaffold `apps/playground-nuxt`, a real Nuxt app, and confirm the SSR
      timezone handling from Phase 2.
- [ ] Add component tests with Vitest and Testing Library, including a test
      that the emitted value stays Gregorian by default while the display
      shows Jalali.

## Phase 7: Theming and configurability

- [ ] Define a CSS custom-property theming contract for the headless
      components and the default `DatePicker` from Phases 5 and 6.
- [ ] Add the optional `packages/ui`: a range picker, an inline calendar,
      and extra themes, built on the same headless primitives.
- [ ] Add the `variant: 'dropdown'` option to `DatePicker`, alongside the
      v1 calendar-grid default.
- [ ] Document the visual configuration matrix: locale, direction,
      precision, display format, picker variant, and theme.

## Phase 8: Build and release pipeline

- [ ] Add a `tsup` (or Vite library mode) build config per package: ESM,
      CJS, and `.d.ts` output.
- [ ] Confirm tree-shaking with a real bundler probe, and mark `sideEffects:
      false` where true.
- [ ] Add a `size-limit` bundle-size budget on `packages/core`.
- [ ] Set up Changesets for versioning across the monorepo.
- [ ] Add `release.yml`: the Changesets bot opens or updates a "Version
      Packages" pull request. Merging it publishes to npm and cuts a GitHub
      release.

## Phase 9: Expand continuous integration

`ci.yml` already runs install, typecheck, lint, format-check, and unit tests,
since Phase 0. This phase adds the checks that only make sense once there is
more to build: a full build, a bundle-size budget, and the surrounding
audit and maintenance workflows.

- [ ] Add a build step to `ci.yml` that builds every package.
- [ ] Add a step that builds all four playground apps: `playground-react`,
      `playground-vue`, `playground-next`, and `playground-nuxt`. This
      catches a break specific to Next.js or Nuxt.
- [ ] Add a bundle-size check step that fails the build when `size-limit`'s
      budget is exceeded.
- [ ] Add `license-audit.yml`, reusing the org's existing license-audit
      action.
- [ ] Add `update-dependencies-non-breaking.yml` (weekly).
- [ ] Add `update-dependencies-breaking.yml` (monthly, with a minimum
      release-age buffer).
- [ ] Add `prune-old-actions.yaml` (scheduled cleanup).

## Phase 10: Visual e2e tests and PR screenshot bot

- [ ] Add a Playwright config that targets all four playground apps,
      including `playground-next` and `playground-nuxt`.
- [ ] Add the screenshot capture matrix: locale, precision, and theme.
- [ ] Add a publish step that commits screenshots to an orphan
      `visual-snapshots` branch, for linkable raw URLs.
- [ ] Add a PR comment bot, using `actions/github-script`, that posts or
      updates one comment with the image grid.
- [ ] Add a baseline diff check that fails the build on an unacknowledged
      visual change, and passes when the PR updates the baseline with the
      change.

## Phase 11: Docs site and v1.0 release

- [ ] Scaffold `apps/docs` (VitePress, pending confirmation).
- [ ] Generate the API reference from the `core`, `i18n`, `nlp`, `react`,
      and `vue` package types.
- [ ] Add `pages.yml`: deploy the docs and playground site to GitHub Pages.
- [ ] Run the v1.0 release checklist and review the changelog.

## Phase 12: Add a second calendar system

This phase is last on purpose. The `CalendarEngine` design from Phase 1
should prove itself against real use across every other phase first.

- [ ] Confirm the second calendar to add (proposed: the Hebrew calendar; see
      architecture.md's open decisions).
- [ ] Turn `CalendarEngine` from an internal interface into a public plugin
      contract.
- [ ] Implement the chosen calendar's engine: its leap rule and month
      lengths.
- [ ] Add i18n data for the new calendar's month and era names.
- [ ] Add tests that prove the design works with no change to the existing
      public API.

## Later, not yet scheduled

- ISO week-date calendar support. A cheap addition, and a useful check on
  the design (see architecture.md).
- More locales beyond `en` and `fa`.
- An astronomical (vernal-equinox-based) conversion engine, as an opt-in
  next to the arithmetic default.
- More calendar systems beyond the Phase 12 proof, based on real demand.
