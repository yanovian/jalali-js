# Architecture

See [plan.md](./plan.md) for phase-by-phase status. See
[alternatives.md](./alternatives.md) for the vision and the comparison with
other libraries. This file explains the design behind each phase. It does
not track status.

## Calendar systems in scope

`jalali-js` is named after, and scoped to, one calendar system: Jalali.
Gregorian is the only other one in v1, and it is not a peer feature, it is
a structural requirement: the "display Jalali, store Gregorian" contract
(see "Display value against storage value" below) needs Gregorian as the
storage-side interop partner. Nothing else is committed.

| Phase            | Calendar                                            | Notes                                                                                                                                                                                     |
| ---------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1               | Jalali (Persian, Shamsi) to Gregorian               | Core deliverable                                                                                                                                                                          |
| v1               | Gregorian to Gregorian (identity)                   | This lets app code treat "calendar system" as one setting, instead of a special case for Gregorian, and is the storage side of every display calendar's value, not an independent feature |
| Later, on demand | Any other calendar, such as ISO week-date or Hebrew | The team adds a calendar here only if real user demand appears; see `CalendarEngine`'s generalizability note below for why this does not need to happen speculatively                     |

Earlier drafts of this plan committed to a "prove `CalendarEngine`
generalizes" phase that would add a full second calendar (Hebrew was the
leading candidate) purely to stress-test the plugin interface. That phase
was cut: it costs real i18n data, locale names, and test maintenance for a
calendar with no evidenced demand in a library whose name and audience are
specifically Jalali. `CalendarEngine`'s generalizability is validated far
more cheaply with a minimal fake engine in `packages/core`'s own test
suite (see below), not by shipping and maintaining a real second calendar
system nobody asked for.

## Conversion algorithm

Jalali to Gregorian conversion has two known approaches.

1. **Astronomical.** This method computes the true vernal equinox at the
   Tehran meridian. It gives an exact result, but it needs high-precision
   solar position math and runs slower.
2. **Arithmetic.** This method uses a fixed leap-year rule, such as the
   33-year cycle from Kazimierz M. Borkowski, or the 2820-year cycle from
   Ahmad Birashk. This rule matches the astronomical calendar for the full
   range any real application needs, many centuries in both directions. It
   runs in constant time, uses plain integer math, and is easy to test.

**Decision:** the default engine uses a validated arithmetic algorithm. The
wider ecosystem already uses this approach. It runs fast and needs no runtime
dependency, and its accuracy is well documented for the range a real
application hits. The conversion engine sits behind a small internal
interface, `CalendarEngine`. This interface lets the team add an
astronomical engine later, as an opt-in for a use case that needs correctness
across thousands of years, with no change to the public API. It also means
`jalali-js`/`gregorian.ts` do not hard-code assumptions the interface itself
should not depend on; that generalizability is checked cheaply, with a
minimal fake `CalendarEngine` implementation in `packages/core`'s own test
suite (a calendar with, say, a deliberately irregular month-length rule),
not by committing to build and maintain a real second calendar system (see
"Calendar systems in scope" above for why that was cut from the plan).

The team checks correctness with:

- Round-trip tests (Gregorian to Jalali and back to Gregorian) across a wide
  range of years, not just a few example dates.
- A check of leap-year results against an independent, published reference
  table.
- Boundary tests: year 1, leap and non-leap Esfand length, and Gregorian
  century leap rules (1900, 2000, 2100).

## Data model: precision and timezone

The data model uses the same three tiers as the TC39 `Temporal` proposal
(`PlainDate`, `PlainDateTime`, `ZonedDateTime`), applied to whichever
calendar system is active.

- `CalendarDate`: year, month, and day. This is the default. It has no time
  part.
- `CalendarDateTime`: adds hour, minute, second, and millisecond. It has no
  timezone. It is a wall-clock value.
- `ZonedCalendarDateTime`: adds an IANA timezone name. This is the only tier
  where "now" and UTC conversion make sense.

Each tier is its own type. The model does not use one type with optional
fields. This stops code that works on a `CalendarDate` from reading an hour
field that was never set. A consumer picks the tier it needs up front:

```ts
createCalendar({ system: 'jalali', precision: 'date' }); // default
createCalendar({ system: 'jalali', precision: 'datetime' });
createCalendar({ system: 'jalali', precision: 'zoned-datetime', timeZone: 'auto' });
createCalendar({ system: 'jalali', precision: 'zoned-datetime', timeZone: 'Asia/Tehran' });
```

`timeZone: 'auto'` reads the value from
`Intl.DateTimeFormat().resolvedOptions().timeZone`.

**SSR note for Next.js and Nuxt.** An auto-detected timezone is a client-only
value. If the server render and the client render both resolve it, the two
values can differ. This causes a hydration mismatch. The framework bindings
set `'auto'` to UTC during server render. They also expose an explicit hook
or composable, such as `useResolvedTimeZone()`, that a consumer calls to read
the real client timezone after hydration.

## Display value against storage value

The calendar system is a display setting. It is not a storage setting. A
component can show a user the Jalali calendar, and still hand the app a value
that has nothing calendar-specific in it.

**Default behavior.** Every component and every core conversion function
returns a Gregorian, calendar-agnostic value by default. The exact shape
follows the active precision tier:

| Precision tier          | Default value shape                                              |
| ----------------------- | ---------------------------------------------------------------- |
| `CalendarDate`          | Gregorian ISO date string, `YYYY-MM-DD`                          |
| `CalendarDateTime`      | Gregorian ISO datetime string, no offset                         |
| `ZonedCalendarDateTime` | Gregorian ISO datetime string with offset, or epoch milliseconds |

This matches how the native `<input type="date">` element behaves. No
matter what calendar the operating system displays, its value is always a
Gregorian ISO string. Display and storage stay separate by design.

**Why this is the default, not the only option.** `react-multi-date-picker`,
an existing Persian-calendar picker for React, ties its output to whichever
calendar it displays. Configure it to show the Persian calendar, and the
`DateObject` it returns is also in the Persian calendar. A consumer needs an
explicit `.convert()` call to get a Gregorian value back out. This couples a
display choice to a storage value, and it is easy to wire the picker's raw
output straight into a form or a database field without adding that
conversion step. jalali-js avoids this by keeping the default output
Gregorian, regardless of the display calendar.

**Opt-in Jalali-native output.** Some applications do need to store a Jalali
value as-is, for example a government or legal record system in Iran that
keeps dates in Jalali form. A `valueFormat` option covers this:

```ts
useCalendar({ system: 'jalali', locale: 'fa', valueFormat: 'gregorian-iso' }); // default
useCalendar({ system: 'jalali', locale: 'fa', valueFormat: 'date' }); // native JS Date
useCalendar({ system: 'jalali', locale: 'fa', valueFormat: 'epoch' });
useCalendar({ system: 'jalali', locale: 'fa', valueFormat: 'jalali-iso' }); // e.g. "1403-05-15"
useCalendar({ system: 'jalali', locale: 'fa', valueFormat: 'jalali-object' }); // { year, month, day }
```

This does not change the "no database schema" non-goal in
[alternatives.md](./alternatives.md). jalali-js still does not decide how an
application models its own table. It only decides what value a component
hands back, and it makes the calendar-agnostic value the default, so the
correct choice needs no extra thought.

**The full round trip.** A typical app follows this loop:

1. **Write.** The user picks or types a date. The `DatePicker` shows it in
   Jalali. The component converts it to Gregorian and hands the app the
   default value, for example `"2024-08-05"`. The app stores that value.
2. **Read.** The app reads the stored Gregorian value back out. It passes
   that value to `fromGregorian(value, 'jalali')`, which returns a
   `CalendarDate` in the Jalali calendar.
3. **Display.** The app formats that `CalendarDate` for the user, for
   example `cal.format(date, { style: 'long' })`, which reads
   `"۱۵ مرداد ۱۴۰۳"`.

The Phase 1 round-trip tests (Gregorian to Jalali and back to Gregorian, with
no drift) are what make step 2 and step 1 safe to repeat indefinitely, across
however many times a date is read and re-saved.

## Package layout

The repo uses a pnpm workspace monorepo.

**Open decision:** should the team add Turborepo or Nx for task caching now,
or wait until build time becomes a real problem? The proposal is to wait.
Plain pnpm workspace scripts are enough at this size.

```
packages/
  core/               # jalali-js core. Zero runtime dependencies.
  i18n/                # Locale data: en, fa. Names, numerals, direction.
  nlp/                 # Natural language date parsing: en, fa, Finglish.
  react/               # React hooks and headless components. Works in Next.js.
  vue/                 # Vue composables and headless components. Works in Nuxt.
  ui-react/            # Optional extra React components: RangePicker, InlineCalendar, themes.
  ui-vue/              # The same, for Vue.
apps/
  docs/                # Documentation site and interactive playground.
  playground-react/    # Vite and React sandbox. An e2e screenshot target.
  playground-vue/      # Vite and Vue sandbox. An e2e screenshot target.
  playground-next/     # Real Next.js app. Confirms SSR and hydration behavior.
  playground-nuxt/     # Real Nuxt app. Confirms SSR and hydration behavior.
e2e/
  visual/              # Playwright visual tests against all four playground apps.
_docs/
  plan.md              # Phase-by-phase status. Start here.
  architecture.md       # This document.
  alternatives.md       # Vision, goals, and comparison with other libraries.
```

`core` has zero runtime dependencies. Every other package depends on it.
`react` and `vue` depend on `core` and `i18n` only. Neither depends on the
other. This lets a Node backend, or a framework outside React and Vue, use
`core` directly, with no framework weight added.

`ui-react` and `ui-vue` (Phase 7), not a single `ui` package, despite the
"optional `ui` package" phrasing this document used before that phase
started: a range picker or an inline calendar is a real UI component, and a
UI component is framework-specific by nature, the same reason `react` and
`vue` are two packages rather than one. `ui-react` depends on `react` (for
`Calendar`, the headless primitive it builds on) the same way `ui-vue`
depends on `vue`; neither depends on the other.

The `playground-next` and `playground-nuxt` apps are real Next.js and Nuxt
apps, not Vite apps that only import the React or Vue package. CI builds and
runs both. This makes Next.js and Nuxt support a tested part of the
pipeline, not only a claim in the docs.

### API sketch

This sketch may change during implementation.

```ts
import { createCalendar } from 'jalali-js';
import { toGregorian, fromGregorian } from 'jalali-js';

const cal = createCalendar({ system: 'jalali', locale: 'fa' });
const today = cal.today(); // CalendarDate in the active system
const g = toGregorian(today); // plain Gregorian equivalent
const back = fromGregorian(g, 'jalali'); // round-trips

cal.format(today, { style: 'long' }); // "۱۵ مرداد ۱۴۰۵"
cal.isLeapYear(1403); // true
cal.parse('farda'); // Finglish for "tomorrow"
```

### Framework bindings sketch

```tsx
// React
const { date, format, setDate } = useCalendar({ system: 'jalali', locale: 'fa' });
```

```vue
<!-- Vue and Nuxt -->
<script setup>
const { date, format } = useCalendar({ system: 'jalali', locale: 'fa' });
</script>
```

Both bindings stay thin. They handle reactivity only. All date logic stays
in `core`.

## Internationalization

- Locales at launch: `en` and `fa`.
- Locale data covers: month names, weekday names in full and short form,
  Persian digits (۰ to ۹) against Latin digits, and text direction (`ltr` or
  `rtl`), so a consumer can set the `dir` attribute correctly.
- The locale pack format lets the team add a third locale later as a data
  file, with no code change.

## Natural language date parsing

- The parser reads a phrase and returns a `CalendarDate`, or `null` when it
  cannot read the phrase.
- v1 supports three input styles: English words (`today`, `tomorrow`, `next
Farvardin`), Farsi words in Persian script (`امروز`, `فردا`), and Finglish,
  Farsi words written with Latin letters (`emrooz`, `farda`). Finglish
  support covers common spelling variants for each word.
- The parser covers a fixed, testable set of relative terms and explicit
  day, month, and year phrases. It is not a general natural language engine.
- Each supported word list lives in `packages/nlp`, next to the locale data
  it depends on in `packages/i18n`.

## Configuration and theming

- **Headless primitives, plus a default-styled picker.** The React and Vue
  packages ship headless primitives (data attributes, class hooks, render
  props, or scoped slots, with no required CSS) for full customization. They
  also ship a working, default-styled `DatePicker` component built on those
  same primitives, so a consumer gets a usable, good-looking picker with no
  styling work. Both live in the `react` and `vue` packages, not only in the
  optional `ui-react`/`ui-vue` packages (Phase 7; see
  [Package layout](#package-layout) for why two packages, not one `ui`).
- `ui-react` and `ui-vue` (Phase 7) add more elaborate variants on top of
  the same primitives: `RangePicker` (a start/end picker, two-click
  selection with a hover preview of the pending range) and `InlineCalendar`
  (`Calendar` re-exported under a more discoverable name for an
  always-visible grid with no popover), plus extra themes (`dark.css`,
  `compact.css`). All of it uses CSS custom properties for theming (see
  "Theming contract" below), so a consumer can restyle it without a
  specificity fight.
- Every visual variant (locale, text direction, precision, and theme) is a
  configuration option, not a fork or a separate component.
- **Display format.** A `displayFormat` option picks a format preset:
  long against short, with or without weekday, Persian against Latin
  digits. This is separate from the value format covered in
  [Display value against storage value](#display-value-against-storage-value)
  above; one controls what the user reads, the other controls what the app
  stores.
- **Picker UI variant.** `DatePicker`'s default is a calendar-grid popup: it
  fits "pick a date from a calendar" tasks. A `variant: 'dropdown'` option
  switches to three plain year/month/day `<select>` elements instead, for
  narrow, known-range entry such as a date of birth. Both variants share the
  same value-format and display-format wiring; only the input surface
  differs. (Built in Phase 5/6, alongside the grid default.)

### Theming contract

`react`'s and `vue`'s `date-picker.css` each define the same set of
`--jalali-*` custom properties on every component's root element
(`[data-jalali-datepicker-root]`, `[data-jalali-datepicker-dropdown]`,
`[data-jalali-calendar-root]`), and every rule in that stylesheet reads a
variable rather than a literal value. A theme is a stylesheet that
overrides some subset of these variables on the same selectors; it does not
redefine any rule. This is why `dark.css` (colors) and `compact.css`
(spacing and sizing) compose by importing both: they touch disjoint
variables.

| Variable                   | Controls                                                   |
| -------------------------- | ---------------------------------------------------------- |
| `--jalali-font`            | Font family                                                |
| `--jalali-font-size`       | Base font size                                             |
| `--jalali-bg`              | Background color (input, popover)                          |
| `--jalali-fg`              | Text color                                                 |
| `--jalali-muted-fg`        | Secondary text color (weekday headers, outside-month days) |
| `--jalali-border`          | Border color                                               |
| `--jalali-radius`          | Corner radius (input, popover, day cells, nav buttons)     |
| `--jalali-primary`         | Accent color: today's ring, selected/range-endpoint fill   |
| `--jalali-primary-fg`      | Text color on top of `--jalali-primary`                    |
| `--jalali-shadow`          | Popover drop shadow                                        |
| `--jalali-gap`             | Gap between grid cells                                     |
| `--jalali-input-padding`   | Padding inside the text input                              |
| `--jalali-popover-padding` | Padding inside the popover                                 |
| `--jalali-day-min-size`    | Minimum width/height of a day cell                         |

Because CSS custom properties inherit, a theme applies to every picker on
the page once its stylesheet is imported: theming is a whole-app choice
(import a theme, or don't), not a per-instance prop. A consumer who wants a
single themed section scopes their own override under a parent selector,
following the same pattern (override the variables, never fight the
rules); the shipped theme files are page-wide by design.

### Visual configuration matrix

Every picker (`DatePicker`, `RangePicker`, `Calendar`/`InlineCalendar`)
combines these independent axes; each is a plain prop or an imported
stylesheet, never a fork or a separate component:

| Axis                   | Values                                                                 | Set via                                                                                 |
| ---------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Calendar system        | `jalali`, `gregorian`                                                  | `system` prop                                                                           |
| Locale                 | `en`, `fa` (drives digits, month/weekday names, and RTL/LTR direction) | `locale` prop                                                                           |
| Precision              | date, date+time, date+time+timezone                                    | Which `CalendarDate`/`CalendarDateTime`/`ZonedCalendarDateTime` value the app passes in |
| Display format         | long/short, with/without weekday, Persian/Latin digits                 | `displayFormat` prop                                                                    |
| Value format (storage) | Gregorian ISO, Jalali object, and others                               | `valueFormat` prop                                                                      |
| Picker UI variant      | grid popup (default), dropdown fields                                  | `variant` prop (`DatePicker` only)                                                      |
| Theme                  | default, `dark`, `compact`, or any combination                         | Which `date-picker.css`/theme stylesheets are imported                                  |

`playground-react` and `playground-vue` exercise this matrix directly:
each section demonstrates one axis (system, locale, variant), and the
whole page runs under `dark` + `compact` imported together to demonstrate
composing themes.

## Testing strategy

| Layer          | Tool                       | What it covers                                                                                                             |
| -------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Unit           | Vitest                     | Conversion correctness, leap-year rules, formatting, i18n data, NLP parsing                                                |
| Property-based | fast-check                 | Round-trip checks across a large range of random dates                                                                     |
| Type-level     | `tsd` or `expect-type`     | The public API types work as documented, for example a precision tier rejects a field it does not have                     |
| Component      | Vitest and Testing Library | React and Vue binding behavior, tested alone                                                                               |
| E2E and visual | Playwright                 | A real browser render of all four playground apps, across locale, direction, precision, theme, and browser combinations    |
| Compatibility  | GitHub Actions matrix      | Each playground app built, typechecked, and tested against every still-supported major version of its underlying framework |

### Cross-browser coverage

The Playwright suite (Phase 10) runs against Playwright's three engines,
Chromium, Firefox, and WebKit, covering Chrome/Edge, Firefox, and Safari's
rendering engine without needing a real per-OS browser install or a paid
cross-browser cloud service. Browser is a matrix dimension, not a config
option baked into one run: each `{app, browser}` pair is its own parallel
CI job (see the CI/CD pipeline's matrix exception above), so adding a
browser costs one more parallel job, not more wall-clock time.

### Peer-dependency compatibility matrix

A UI library breaks in ways `packages/react`'s and `packages/vue`'s own
test suites cannot see: a peer dependency's own major-version upgrade
changing a JSX transform, a hook's rules, a Vue reactivity edge case, or an
SSR API. Phase 9 adds a compatibility job, separate from the main `ci.yml`
checks, that installs each playground app against every major version of
its framework still under active support/maintenance today (illustrative,
not fixed, since the real list drifts: React's last two majors, Vue 2 and
3, Next.js's last two or three majors, Nuxt's last two), and runs that
app's own build, typecheck, and test steps against each. One GitHub
Actions matrix job per `{app, framework version}` cell, in parallel. A
`peerDependencies` range that is too narrow, or a real incompatibility a
type-only check would miss, fails here instead of in a downstream
consumer's install.

### Visual regression and PR screenshots

Playwright takes screenshots of the calendar in a set matrix, for example
`{en, fa}` by `{date, datetime, zoned-datetime}` by `{default theme}` by
`{chromium, firefox, webkit}`, across all four playground apps:
`playground-react`, `playground-vue`, `playground-next`, and
`playground-nuxt`. It also takes one smoke screenshot per `{app, framework
version}` cell from the compatibility matrix above, so a maintainer sees
whether a framework upgrade changed rendering, not only whether the build
succeeded; that smoke shot skips the full locale/precision/theme/browser
cross product; one representative configuration per cell is enough to
catch a rendering regression, and the full cross product already runs on
the current framework version. On every pull request, a CI job:

1. Runs the Playwright visual suite (both matrices above, each a set of
   parallel matrix jobs) and saves the PNG files as a build artifact.
2. Publishes the images somewhere a PR comment can link to. The proposal is
   to commit them to an orphan `visual-snapshots` branch. A raw GitHub URL
   then embeds directly in Markdown, with no third-party service and no
   cost. `actions/github-script` posts or updates one PR comment with the
   image grid, covering both matrices. A paid visual-diff service, such as
   Chromatic or Percy, is a reasonable upgrade later, if pixel-diff review
   becomes slow. It is not required for v1.
3. Fails the check when a screenshot differs from its baseline past a set
   threshold, and the PR does not update the baseline. This stops silent
   visual drift, while it still lets an intended visual change move through
   review.

## CI/CD pipeline

The pipeline uses GitHub Actions. It follows the pattern already used across
this org's repos: pnpm and Node setup, single-runner jobs with no matrix, and
reusable internal actions for dependency updates and license audits.

**Exception: the Phase 9 peer-dependency compatibility matrix and the Phase
10 cross-browser visual suite both use a real GitHub Actions
`strategy.matrix`, deliberately, not the single-runner style above.** A
compatibility check across several supported major versions of React, Vue,
Next.js, and Nuxt, and a visual suite across several browser engines, are
exactly the case a matrix exists for: the work is the same job repeated
over an axis of inputs, and running it serially would multiply CI
wall-clock time by the size of that axis for no benefit. The rest of the
pipeline (`ci.yml`'s install/typecheck/lint/format-check/test/build, and
the scheduled maintenance workflows) stays single-runner, since none of
that work is naturally shaped as "the same job, many inputs" the way these
two checks are.

- **`ci.yml`.** This workflow exists from Phase 0, not from a later phase.
  Its first version runs on push and pull request: install, typecheck,
  lint, format-check, and unit tests. Every later phase adds a step to this
  same workflow instead of standing up CI for the first time: a build step
  and a bundle-size check (with `size-limit` or a similar tool, since "fast
  and efficient" is a stated goal and CI should enforce it, not just state
  it) once there is a build, a step that builds all four playground apps
  including `playground-next` and `playground-nuxt` once they exist, and a
  Playwright visual suite with screenshot upload or comment once the visual
  tests exist. The result is that no phase after Phase 0 ships a change with
  no CI check behind it.
- **`release.yml` (Phase 8).** Driven by Changesets, via `changesets/action`.
  Runs on every push to `master`. When unreleased changesets exist, the
  action opens or updates a "Version Packages" pull request (`pnpm
version-packages`, i.e. `changeset version`). Merging that pull request
  re-triggers the workflow, finds no unreleased changesets left, and runs
  `pnpm release` instead (`pnpm build && changeset publish`), which
  publishes every changed package to npm (`NPM_TOKEN`) and tags a GitHub
  release with generated notes. The team picks this flow over a single
  tag-triggered release, since this repo has several packages, and `core`,
  `react`, and `vue` each need their own version.
- **`license-audit.yml`.** Runs on pull requests, in the same shape as the
  org's existing license-audit workflow. It gates on critical-severity
  license issues in dependencies.
- **`update-dependencies-non-breaking.yml`** and
  **`update-dependencies-breaking.yml`.** Scheduled dependency update pull
  requests, on the same cadence as other repos in the org: weekly for
  non-breaking updates, monthly for breaking updates, with a minimum
  release-age buffer.
- **`prune-old-actions.yaml`.** A scheduled cleanup of old workflow runs.
- **`pages.yml`.** Deploys the docs and playground site to GitHub Pages when
  a file under `apps/docs/**` changes.

**Open decision:** should the team reuse this org's existing internal
GitHub Actions (dependency updater, license auditor, action pruner) as they
are, or build new equivalents for this repo? The proposal is to reuse them.
They are already trusted, and reuse keeps this repo consistent with the rest
of the org.

## Pre-commit checks

A pre-commit hook, set up with Husky and lint-staged (or an equivalent tool),
runs on every `git commit`. It runs ESLint `--fix` and Prettier `--write` on
staged files only, then restages the fixed files. If an error remains that
`--fix` cannot resolve, the commit is blocked. This keeps unformatted or
lint-broken code out of the history, and it stays fast, since it checks only
the files in the commit, not the whole repo.

This hook does not run the full test suite. A full test run stays in CI,
where it checks the whole repo on every push, not only the files in one
commit.

## Tooling

- **Package manager and workspaces:** pnpm.
- **Language:** TypeScript, with `strict: true`, no implicit `any`.
  A package that depends on another workspace package (for example
  `packages/i18n` on `packages/core`) does **not** declare a TypeScript
  project reference to it in its own `tsconfig.json`. A declared reference
  puts that pair under TypeScript's composite build-graph rules, which
  require an actual `tsc --build` (with real `.d.ts` output on disk) before
  a plain `tsc --noEmit` on the referencing package can see the other
  package's types at all: the exact failure this repo hit once already.
  Cross-package types resolve through the ordinary pnpm workspace
  `node_modules` symlink instead, backed by each package's `main`/`types`
  fields (pointing at `src/index.ts` until Phase 8 adds a real build). The
  root `tsconfig.json` still lists every package under `references`, but
  only as an editor convenience (cross-package go-to-definition and
  the like); no script ever runs that file directly.
- **Turbopack and `.js`-suffixed relative imports.** `packages/core`,
  `packages/i18n`, and `packages/nlp` write their relative imports the
  NodeNext way, with an explicit `.js` suffix even though the file on disk
  is `.ts` (required, since those packages are also meant to run directly
  under plain Node, with no bundler at all). Vite resolves that `.js`
  suffix back to the real `.ts` file automatically, including for a
  package's _internal_ files, not only its published entry point.
  Turbopack, as of Next.js 16, does not: it resolves a workspace package's
  own entry point fine, but not a `.js` specifier inside a relative import
  two files deep, so a Next.js app built with Turbopack cannot consume
  these packages from source at all. `apps/playground-next` builds with
  webpack instead (`next build --webpack` / `next dev --webpack`), with
  `resolve.extensionAlias: { '.js': ['.ts', '.tsx', '.js'] }` set in
  `next.config.ts`, webpack's own standard fix for this exact NodeNext-plus-
  bundler case. `packages/react` keeps the same `.js`-suffixed import style
  as the other packages, on purpose, rather than switching to extensionless
  imports to dodge this: it is consumed by both Vite (`playground-react`)
  and webpack (`playground-next`) today, and a third bundler with its own
  resolution quirks is more likely to show up later than a reason for
  `packages/react` to run under plain Node ever is. `apps/playground-nuxt`
  needed no such workaround: Nuxt builds on Vite, not Turbopack, and Vite
  already resolves the `.js`-suffixed imports correctly on its own. Nuxt
  does need `build.transpile` in `nuxt.config.ts` listing `jalali-js`,
  `@jalali-js/i18n`, and `@jalali-js/vue`, so its build treats them as
  source to compile rather than pre-built external packages.
- **Build (Phase 8).** `tsup` for `core`, `i18n`, `nlp`, `react`, and
  `ui-react`; Vite in library mode (`@vitejs/plugin-vue` plus
  `vite-plugin-dts`) for `vue` and `ui-vue`, since tsup's esbuild core has
  no `.vue` SFC support. Every package builds ESM (`dist/index.js`) and CJS
  (`dist/index.cjs`) output, plus `.d.ts`. `tsup.config.base.ts` (repo
  root) holds the one tsup config shared by all five tsup-built packages,
  imported from each package's own `tsup.config.ts`, rather than five
  near-identical copies. Two fixes were needed for the `.d.ts` build
  specifically, both isolated to `dts.compilerOptions` so they change
  nothing about the JS output: `composite`/`incremental` (set in
  `tsconfig.base.json` for the root `tsconfig.json`'s own editor-only
  project references, see above) get turned off, since tsup's dts worker
  otherwise misreads them as a real composite build and rejects every
  source file as "not listed in the file list of project ''"; and
  `ignoreDeprecations: '6.0'` silences a `baseUrl`-deprecated error the dts
  worker triggers internally under TypeScript 6.x, unrelated to anything
  this repo's own tsconfig files set. The Vue packages skip the
  single-file-rollup option (`vite-plugin-dts`'s `rollupTypes`) since it
  needs `@microsoft/api-extractor`, an extra heavy dependency neither
  package otherwise needs; they ship a `.d.ts` per source file instead, an
  equally valid package shape, with `exclude: ['src/**/*.test.ts']` so test
  files do not get their own declaration output.
- **`main`/`types`/`exports` keep pointing at `src/index.ts` even after
  Phase 8; only `publishConfig` points at `dist`.** Every buildable
  package's top-level `main`/`types`/`exports` still resolve to
  `src/index.ts`, exactly as before this phase (see the `tsconfig`
  discussion above for why: no build should be required before `tsc
--noEmit` or a playground app can see a sibling package's types).
  `publishConfig` on each package.json carries the real `dist`-pointing
  `main`/`module`/`types`/`exports`; npm and pnpm both merge
  `publishConfig` over the top-level fields specifically at publish time,
  so a consumer installing the published package gets compiled `dist`
  output, while the workspace (typecheck, tests, and every playground app)
  keeps resolving siblings straight from source, unaffected. Verified
  directly: every `dist/` directory in the repo was deleted, and `pnpm
typecheck` still passed across all 11 packages and apps.
  CSS subpath exports (`./date-picker.css`, `./themes/*.css`) point at
  `src/*.css` in both the default `exports` and `publishConfig.exports`:
  plain CSS needs no compile step, so there is nothing for a build to
  change; `files` lists `src/*.css` (or `src/themes/*.css`) alongside
  `dist` so the published tarball still includes them.
- **`sideEffects`.** `jalali-js`, `@jalali-js/i18n`, and `@jalali-js/nlp`
  are `"sideEffects": false`: every export is a pure function or constant,
  confirmed by reading each package's source for top-level code with an
  external effect (there is none). `@jalali-js/react`, `@jalali-js/vue`,
  `@jalali-js/ui-react`, and `@jalali-js/ui-vue` use the array form,
  `"sideEffects": ["*.css"]`: their JS entry points are equally pure, but
  each ships a CSS file meant to be imported for its side effect (injecting
  style into the page), and a bare `false` would let a bundler's
  tree-shaking drop that import as dead code.
- **Tree-shaking probe (Phase 8).** `scripts/treeshake-probe.mjs` (`pnpm
probe:treeshake`, or `make probe-treeshake` to build `packages/core`
  first) bundles a probe entry that imports only `createCalendar` from the
  real, built `jalali-js` output with esbuild, then asserts the result
  drops several other real exports (`compareDates`, `addDays`,
  `buildCalendarGrid`, `nextMonth`, `previousMonth`, `dayOfWeek`,
  `toStorageValue`) that `calendar.ts` never imports, while a
  jalali-specific constant `today()` genuinely does reach
  (`LEAP_YEAR_RESIDUES`) must survive, so a broken or empty bundle cannot
  make the check trivially pass. Confirmed both directions directly: the
  real config drops all seven; the same probe with `treeShaking: false`
  set leaks `compareDates` back in. Result today: a probe bundling only
  `createCalendar` is 6.7 KB unminified.
- **Lint and format:** ESLint with a flat config, plus Prettier, enforced in
  CI, not only on a local machine. `eslint-plugin-react` does not yet
  support ESLint 10 (a real crash on load, not just an unmet peer-range
  warning); `.tsx` files are linted with `eslint-plugin-react-hooks` and
  `eslint-plugin-jsx-a11y` instead, both confirmed to work under ESLint 10.
  Revisit adding `eslint-plugin-react` back once it catches up. `.vue` files
  are linted with `eslint-plugin-vue`'s `essential` tier, not its
  `recommended` tier: `recommended` layers in template formatting rules
  (attribute wrapping, quote style, self-closing tags, and more) that
  actively fight Prettier's own opinion on the same things, the same class
  of problem `eslint-config-prettier` exists to solve for core ESLint.
  `essential` is Vue's correctness-only tier; the handful of non-formatting
  rules worth keeping from the higher tiers (`vue/no-v-html`,
  `vue/require-explicit-emits`, `vue/no-template-shadow`) are added back
  explicitly instead of pulling in the whole formatting layer to get them.
- **Pre-commit hooks:** Husky and lint-staged, see "Pre-commit checks" above.
  `lint-staged`'s glob (`package.json`) must list `.vue` alongside
  `.js`/`.jsx`/`.ts`/`.tsx` explicitly; adding `packages/vue` without
  updating that glob left `.vue` files unlinted and unformatted by the hook
  entirely, caught by deliberately staging a broken `.vue` file and
  confirming the hook now catches it.
- **Unit and property tests:** Vitest and fast-check. Vue component tests
  use `@vue/test-utils` (Vue's own official testing library) rather than
  `@testing-library/vue`: the latter's last release predates Vue 3.5 and
  Vitest 4 by more than two years, a real compatibility risk, not just a
  staleness preference.
- **E2E and visual tests:** Playwright.
- **Versioning and publishing (Phase 8).** Changesets. `.changeset/config.json`:
  `"access": "public"` (every library package publishes in the open, not
  behind an npm org's private registry default), `"baseBranch": "master"`
  (this repo's actual default branch; `ci.yml` already targets `master`,
  not `main`), `changelog: ["@changesets/changelog-github", { repo:
"yanovian/jalali-js" }]` for changelog entries linked back to the actual
  PR/commit, and `"ignore": ["playground-react", "playground-vue",
"playground-next", "playground-nuxt"]`, since the four playground apps
  are `private` demo apps, never published. Root scripts: `changeset` (add
  a changeset, interactive), `version-packages` (`changeset version`, bumps
  versions and writes changelogs from unreleased changesets), and
  `release` (`pnpm build && changeset publish`, builds every package for
  real before publishing what changed). `updateInternalDependencies:
"patch"` means a patch release of `jalali-js` bumps the packages that
  depend on it by at least a patch too, keeping the workspace's own
  `workspace:*` ranges meaningful after publish (Changesets rewrites
  `workspace:*` to the real published version automatically).
- **Bundle-size budget (Phase 8).** `size-limit` plus
  `@size-limit/preset-small-lib`, checked on `packages/core`'s built
  output (`packages/core/dist/index.js`) via a `"size-limit"` array in the
  root `package.json` (`pnpm size`, or `make size` to build `packages/core`
  first). Budget: 6 KB, minified and brotli-compressed, chosen against a
  measured baseline of 2.05 KB for the same build, roughly 3x headroom for
  further core growth while still catching a real regression (an
  accidentally-bundled dependency, or tree-shaking breaking). Verified the
  gate itself fails shut, not just passes:
  temporarily set to a limit `size-limit` cannot meet, confirmed the
  command exits non-zero with the actual overage reported, then restored
  the real 6 KB budget.
- **`defineModel()` and `exactOptionalPropertyTypes`.** Vue's `defineModel()`
  macro (used in `@jalali-js/vue`'s `DatePicker` for its `v-model`) generates
  a `modelValue` prop type that is not `exactOptionalPropertyTypes`-clean:
  binding a genuinely-optional ref to it from a consuming app fails to
  typecheck, even though the component itself (`packages/vue`, checked with
  the flag on) is correct. `apps/playground-vue` and `apps/playground-nuxt`
  set `exactOptionalPropertyTypes: false` in their own `tsconfig.json`
  for this reason; this weakens nothing about the library's own guarantee,
  since it is scoped to apps consuming the library, not the library itself.
- **Framework-agnostic UI logic lives in `packages/core`, not in each
  binding.** `buildCalendarGrid()`/`nextMonth()`/`previousMonth()` (the
  month-grid computation both `Calendar` components need) touch no
  framework API at all; writing them once in `packages/core` and importing
  them from both `packages/react` and `packages/vue` was cheaper and safer
  than keeping two copies in sync, and let Phase 6 add real property-based
  tests for logic that Phase 5 had only exercised indirectly, through
  React component tests.

## Makefile

A root `Makefile` wraps the common commands, so a contributor does not need
to memorize each package-manager command. It follows the same `help` target
convention used across the org. Each check has its own target, so a
contributor can run one check alone or every check together.

```
help                 Show available commands
install              Install all workspace dependencies
dev                  Run the playground apps in dev mode
build                Build all packages
typecheck            TypeScript project-wide check
lint / lint-fix       ESLint, on its own or with autofix
format / format-check Prettier, write mode or check mode (the CI gate)
test / test-watch     Unit and property tests (Vitest)
test-e2e             Playwright visual e2e suite
probe-treeshake      Confirm packages/core's built output actually tree-shakes
size                 Bundle-size budget check
check                CI-equivalent: typecheck, lint, format-check, test, build, size
changeset            Record a changeset for the current change
docs-dev / docs-build Documentation site
clean                Remove build output
release              Publish through Changesets (CI-driven; the local target is a dry run)
```

## Governance and community files

- `LICENSE`: MIT. This matches the license used across the rest of this
  ecosystem, and across this org's other public repos.
- `CONTRIBUTING.md`: setup steps, branch and PR conventions, the changeset
  requirement, and commit style.
- `CODE_OF_CONDUCT.md`: Contributor Covenant.
- `SECURITY.md`: how to report a vulnerability.
- `CHANGELOG.md`: generated by Changesets, one per package.
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml`, and
  `config.yml`.
- `.github/PULL_REQUEST_TEMPLATE.md`: includes the `make check` checklist and
  a screenshot section for a visual change.

## Open decisions

The license is MIT (see "Governance and community files" above). Package
naming is settled too: `jalali-js` for the core package, `@jalali-js/i18n`,
`@jalali-js/nlp`, and `@jalali-js/react` for the rest, matching each
package's own `package.json`. The default `DatePicker` UI variant is
settled as well: a calendar-grid popup, with `variant: 'dropdown'` as the
alternative (see "Configuration and theming" above); both ship in Phase 5.
The decisions below are still open.

| #   | Decision                                                                                              | Proposed default                                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Monorepo task runner                                                                                  | Plain pnpm workspace scripts. Add Turborepo or Nx only if CI time later justifies it                                               |
| 2   | Docs site framework                                                                                   | VitePress: lightweight, Vue-based, and enough for API docs plus playground embeds                                                  |
| 3   | Reuse the org's existing internal GitHub Actions (dependency updater, license auditor, action pruner) | Yes, reuse them as they are                                                                                                        |
| 4   | Where to host PR screenshots for visual diffs                                                         | Commit to an orphan branch and link raw URLs, with no third-party cost. Revisit with Chromatic or Percy if the team needs it later |
