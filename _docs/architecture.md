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
across thousands of years, with no change to the public API. This is
scheduled as Phase 13, not speculative: a real vernal-equinox-at-the-Tehran-meridian
calculation, from Jean Meeus's low-precision solar position algorithm (a
full VSOP87 implementation is out of scope for the precision this needs),
exposed alongside the arithmetic default rather than replacing it. Before
that real engine, Phase 13 starts with the cheap check first: a minimal
fake `CalendarEngine` implementation in `packages/core`'s own test suite (a
calendar with, say, a deliberately irregular month-length rule), confirming
the interface has no hidden Jalali/Gregorian-shaped assumption before
investing in the real one. Neither is a second _calendar system_: both
engines still compute the Jalali calendar, just via two different rules
(see "Calendar systems in scope" above for why a real second calendar
system specifically was cut from the plan instead of scheduled).

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
  web/                 # Framework-free Web Components. No hooks or composables: plain custom elements.
  ui-react/            # Optional extra React components: RangePicker, InlineCalendar, themes.
  ui-vue/              # The same, for Vue.
  ui-web/              # The same, for web.
apps/
  docs/                # Documentation site and interactive playground.
  playground-react/    # Vite and React sandbox. An e2e screenshot target.
  playground-vue/      # Vite and Vue sandbox. An e2e screenshot target.
  playground-vanilla/  # Vite, no framework. An e2e screenshot target.
  playground-next/     # Real Next.js app. Confirms SSR and hydration behavior.
  playground-nuxt/     # Real Nuxt app. Confirms SSR and hydration behavior.
e2e/
  visual/              # Playwright visual tests against all five playground apps.
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
  file, with no code change. Scheduled as Phase 12, not speculative:
  proposed next is Pashto (`ps`), Afghanistan's other official language
  alongside Dari (Afghanistan being the other country that uses the
  Jalali/Solar Hijri calendar officially, besides Iran); Dari itself is a
  national standard of Persian, close enough to `fa` that a dedicated pack
  is lower priority than Pashto.

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

This scoping matters in one specific way: it must target the root element
directly, not an ancestor. Inheritance is the lowest-priority origin in
CSS. A rule that matches the root element itself always wins over an
inherited value, no matter how it was set. Playground apps found this the
hard way while building the `custom-theme` test section below (see
"Visual regression and PR screenshots"): an ancestor's inline `style`
attribute lost to `dark.css`'s own rule, because `dark.css` matches
`[data-jalali-datepicker-root]` directly and the inline style was set one
level up, not on that element. The fix was a real CSS rule with a
descendant selector, `.custom-theme-scope [data-jalali-datepicker-root]`,
which matches the root element itself and beats `dark.css`'s plain
attribute selector on specificity, regardless of import order.

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

## Documentation site (Phase 11)

`apps/docs`, VitePress (the "Docs site framework" open decision, settled: lightweight,
Vue-based, and enough for API docs plus playground embeds, see "Open decisions" below). Guide
pages (`guide/*.md`) are hand-written and checked against real source before being written, not
from memory: `createCalendar()`'s actual overloads, `DatePicker`'s actual props, `parse()`'s
actual supported phrases, and so on. The API reference (`/api/`) is generated, not hand-written,
so it can never drift from the real public API the way a hand-maintained reference page would.

**API reference generation.** `apps/docs/scripts/build-api.mjs` (`pnpm run docs:api`, run
automatically before both `docs-dev` and `docs-build`) runs TypeDoc twice, not once:
`jalali-js`, `@jalali-js/i18n`, `@jalali-js/nlp`, `@jalali-js/react`, and `@jalali-js/ui-react`
are plain TypeScript/TSX and convert together in one run, using TypeDoc's `packages` entry-point
strategy (each package's own `package.json` `types` field is enough; no per-package
`typedoc.json` needed). `@jalali-js/vue` cannot join that run: its main entry point re-exports
`.vue` SFCs, and TypeDoc's TypeScript-compiler-based parser has no `.vue` support at all,
confirmed directly by trying the packages run with `vue` included and reading the resulting
`TS2307: Cannot find module './Calendar.vue'` errors, not assumed. `@jalali-js/vue`'s
plain-TypeScript composables (`useCalendar`, `useResolvedTimeZone`) still convert fine on their
own, in a second TypeDoc run scoped via `tsconfig.vue-api.json`'s `files` list (not `include`),
so the whole package's `src/`, which still contains the unparseable `.vue` re-exports in
`index.ts`, never enters the TypeScript program at all. The `.vue` component APIs themselves
(`Calendar`, `DatePicker`, `DropdownDateFields`, `RangePicker`, `InlineCalendar`) are
hand-documented on `guide/vue.md` instead, the same way the wider Vue ecosystem documents SFC
component APIs (VueUse, Vuetify): there is no robust, general TypeDoc-for-SFCs tool to reach
for. Output is markdown (`typedoc-plugin-markdown`) plus VitePress-specific link/anchor fixups
(`typedoc-vitepress-theme`); neither the generated `api/` directory nor VitePress's own
`.vitepress/dist/`/`.vitepress/cache/` are committed (`apps/docs/.gitignore`), the same
"generated output doesn't belong in git" rule `packages/*/dist/` already follows.

**A real bug this surfaced.** A JSDoc comment on `WordList.nextMonthMarkers` originally read
`used to build a "next <month>" phrase`. TypeDoc carried that literal `<month>` straight
into the generated markdown, and VitePress (which compiles every markdown file as a potential
Vue template, not simple prose) parsed it as an unclosed HTML/Vue tag and failed the build with
`Element is missing end tag`. Fixed at the source (`packages/nlp/src/word-list.ts`): rephrased
to `next Farvardin"-style phrase` instead of using angle-bracket placeholder notation.
`typedoc-vitepress-theme` was also added at the same time for its own link-fixup value, but the
actual fix is the source comment; a plugin was never going to make raw `<placeholder>` notation
safe in prose that flows through a Vue-template-aware renderer.

**Playground embeds.** `pages.yml` builds `playground-react` and `playground-vue` with an
explicit `--base` (`make app-build-at-base`), so their own emitted asset URLs resolve correctly
once copied into the docs site's own build output at `/playground/react/` and `/playground/vue/`
(verified directly: served the merged output locally at the real deployment path,
`/jalali-js/...`, confirmed every route and asset 200s, and screenshotted the embedded
playground to confirm it actually renders, themed correctly, not just that the files exist).
`playground-next` and `playground-nuxt` are SSR apps; GitHub Pages is static-only, so they stay
CI-only verification apps (already covered by `ci.yml`, `compat-matrix.yml`, and `e2e.yml`)
rather than customer-facing demos here. VitePress's own `base` config is `/jalali-js/`, matching
where GitHub Pages actually serves a project site (not a custom domain, not a
`<org>.github.io` user page) by default; this would need to become `/` if a custom domain (a
`CNAME` file) is ever added.

## Testing strategy

| Layer          | Tool                       | What it covers                                                                                                              |
| -------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Unit           | Vitest                     | Conversion correctness, leap-year rules, formatting, i18n data, NLP parsing                                                 |
| Property-based | fast-check                 | Round-trip checks across a large range of random dates                                                                      |
| Type-level     | `tsd` or `expect-type`     | The public API types work as documented, for example a precision tier rejects a field it does not have                      |
| Component      | Vitest and Testing Library | React and Vue binding behavior, tested alone                                                                                |
| E2E and visual | Playwright                 | A real browser render of all four playground apps, across locale, calendar system, picker variant, and browser combinations |
| Compatibility  | GitHub Actions matrix      | Each playground app built, typechecked, and tested against every still-supported major version of its underlying framework  |

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

### Visual regression and PR screenshots (Phase 10)

`playwright.config.ts` (repo root; `testDir: 'e2e'`) defines three browser
projects (chromium, firefox, webkit) and a `webServer` array that builds
and starts all four playground apps (ports 4001-4004) before any test
runs. `e2e/playground-react.spec.ts` and `e2e/playground-vue.spec.ts`
screenshot each `data-testid`-marked section of the playground page
(`grid-en-jalali`, `grid-fa-jalali`, `dropdown`, `gregorian`,
`inline-calendar`, `range-picker`, `custom-theme`), plus one extra
screenshot of an opened calendar-grid popover (the actual month grid, not
just the closed input); `e2e/playground-next.spec.ts` and
`e2e/playground-nuxt.spec.ts` each take one full-page screenshot, since
those two apps exist to exercise SSR and hydration (see their own page
components), not to demonstrate the locale/system/variant matrix the
React/Vue playgrounds already cover.

**A screenshot alone only proves the render changed, not that a specific
configured value took effect.** The `custom-theme` section exists to test
that: it applies a real consumer-style CSS override (see the "Theming
contract" note above on why it must scope to the root element, not an
ancestor), and each spec file has a matching, non-screenshot test that
reads the actual computed styles (`toHaveCSS('--jalali-primary', ...)`
and a check that a rule consuming that variable, `border-radius`, really
resolved to the overridden value) and fails with a plain "expected X, got
Y" if an override stops applying. That failure mode is a real regression
this design could hit silently: a specificity or ordering change in a
future edit to `date-picker.css` or a theme file could make the shipped
default win over a consumer's override again, and a screenshot diff alone
would only catch it if the pixels happened to look different enough to
register, not the exact mechanism that broke.

**No screenshot PNG, of any kind, lives on `master`.** `.gitignore` excludes
`test-results/`, `playwright-report/`, and `e2e/**/*-snapshots/` (the
baseline PNGs `toHaveScreenshot()` diffs against) for the same reason PR-run
screenshots were already going to an orphan branch instead of a regular
commit: binary images bloat every future clone and every future `git log`
walk forever if they land in `master`'s history. This phase extends that
principle to baselines too, on a **second** orphan branch,
`visual-baselines`, separate from `visual-snapshots`:

- **`visual-baselines`** holds only the currently accepted baseline PNGs.
  `e2e.yml` fetches it and extracts straight into `e2e/**/*-snapshots/`
  before running tests (`git archive origin/visual-baselines | tar -x -C
e2e/`); a repo with no `visual-baselines` branch yet fails every
  screenshot test until one is created. Force-pushed, single commit, no
  history kept: only the current baseline is ever meaningful for diffing,
  so keeping old ones around only costs storage.
- **`visual-snapshots`** holds per-PR screenshots for human review,
  accumulating under `pr-<number>/` (`e2e.yml`'s own changed screenshots
  under `pr-<number>/`, `compat-matrix.yml`'s smoke screenshots under
  `pr-<number>/compat/`), a real commit per run, never force-pushed: an
  old PR's comment must keep linking to real images for as long as that
  PR stays open (or is referenced later), so this branch is allowed to
  grow. Pruning merged/closed PRs' subdirectories is a reasonable future
  addition, not built here.

**Accepting a visual change.** `update-visual-baselines.yml` runs
automatically once `ci.yml` succeeds on `master`, so no maintainer ever
has to run it by hand. It is chained via `workflow_run`, not its own
independent `push` trigger: an earlier version triggered on
`push: branches: [master]` directly, which ran in parallel with `ci.yml`
on the same commit, a real problem (not just wasted CI minutes), since a
commit that failed typecheck, lint, or test could still become the
accepted baseline. `workflow_run` only proceeds past a real, successful
`ci.yml` run, checked out at the exact commit `ci.yml` validated
(`github.event.workflow_run.head_sha`), not just whatever `master`'s tip
happens to be by the time this job starts. It regenerates every
screenshot from scratch (`playwright test --update-snapshots`, all three
browsers) and force-replaces `visual-baselines` with the result. A
`workflow_dispatch` trigger stays available too, for the one-time
bootstrap on a repo with no `visual-baselines` branch yet, or to force a
re-baseline with no code change.

This means a PR that intentionally changes rendering keeps showing
"changed" screenshots in its `e2e.yml` comment for as long as it stays
open: the baseline only catches up after merge, not before. That is by
design, not a gap to close. A changed screenshot is not the same claim as
a broken build; it means "a human should look at this," the same role a
code diff plays in review. The reviewer looks at the baseline, new, and
diff images in the PR comment and decides whether the change is
intentional, then approves and merges on that judgment. `e2e.yml` is not
wired up as a required, merge-blocking status check for this reason: a
PR that touches no rendering-affecting code still gets a clean pass,
since the baseline already matches, but a PR that does change rendering
is expected to show a diff until it merges.

**The PR comment itself** (`e2e.yml`'s `comment` job) does not show every
screenshot on every run: `scripts/visual-comment.mjs` reads each browser
job's Playwright JSON report (`reporter: [..., ['json', { outputFile:
'test-results/results.json' }]]`), the only reporter that gives
structured, per-test attachment paths and pass/fail status; scanning
`test-results/`'s directory-naming convention directly was considered and
rejected as more fragile. A **passing** screenshot test has no attachment
at all in that JSON (nothing changed, nothing to report), so only
**changed** screenshots get images in the comment; everything else is a
`{passed, failed}` count per browser. Every image in the comment is
captioned with `{app}, {test name}, {browser}` directly above it (not a
bare filename or an uncaptioned grid), and a changed screenshot shows
baseline/new/diff side by side in one table row. `compat-matrix.yml`'s
smoke screenshots get their own, separate PR comment (`<!--
compat-matrix-comment -->` marker, distinct from `e2e.yml`'s `<!--
visual-e2e-comment -->`): the two workflows cannot easily merge into one
comment across separate workflow runs without cross-workflow artifact
lookups, and a maintainer reading two clearly-titled comments ("Visual e2e
results" vs. "Compatibility matrix smoke screenshots") loses nothing
compared to one merged comment.

Verified the whole mechanism locally, including the parts that only
matter once a screenshot actually changes: forced a genuine pixel diff
(copied a different baseline over `dropdown`'s), confirmed
`toHaveScreenshot()` failed with real `-actual.png`/`-diff.png`/
`-expected.png` attachments, ran `scripts/visual-comment.mjs` against
that real `results.json`, and confirmed it produced correctly captioned,
correctly copied images and manifest, before restoring the baseline. Also
caught and fixed a real bug this way: an opened calendar popover is
`position: absolute` and pokes outside its parent section's own box, so a
section-scoped screenshot silently clipped it to a two-line sliver; fixed
by screenshotting the popover element itself (`page.getByRole('dialog')`)
instead of its ancestor section.

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
  Its first version ran install, typecheck, lint, format-check, and unit
  tests on push and pull request. Phase 9 added the rest: a "Build
  packages" step (`pnpm --filter "./packages/**" build`), a separate "Build
  playground apps" step (`pnpm --filter "./apps/**" build`, so a break
  specific to `playground-next` or `playground-nuxt` shows up as its own
  named step, not folded into one opaque "build everything" line), and a
  "Check bundle size" step (`pnpm size`, `packages/core`'s `size-limit`
  budget from Phase 8) run after the packages build so `packages/core/dist`
  already exists. A Playwright visual suite with screenshot upload or
  comment is still Phase 10. No phase after Phase 0 ships a change with no
  CI check behind it.
- **`release.yml` (Phase 8, matches the org's own tag-triggered release
  convention, trigger and mechanism both).** One workflow, triggered by a
  pushed tag matching `v*.*.*`. `make release-patch` (`-minor`/`-major`)
  is the local command a maintainer runs: it runs `make check`, then
  bumps every package under `packages/*` to the same new version in one
  call (`pnpm --filter "./packages/**" exec -- pnpm version <bump>
--no-git-tag-version`, since plain `pnpm version` only bumps one
  `package.json` at a time), commits, tags, and pushes with
  `--follow-tags`, all locally, all in one command. `release.yml` then
  re-runs the checks, builds, publishes each package to npm via `make
publish-packages` (skipping any already published at that version, so a
  partial failure is safe to retry), and creates the GitHub release with
  `softprops/action-gh-release`'s `generate_release_notes: true`.

  This replaced a Changesets-based design that went through two
  revisions before being dropped entirely. Changesets, and specifically
  `changesets/action@v1` in publish-only mode, briefly created one
  GitHub release **per published package**, each sourced from that
  package's own `CHANGELOG.md` entry (`@changesets/changelog-github`,
  confirmed directly from the action's own source,
  `src/run.ts`: `body: changelogEntry.content`, read from `pkg.dir`'s
  changelog). That broke down on a real release attempt:
  `@changesets/changelog-github` needs a `GITHUB_TOKEN` to generate a
  changelog locally, and no local token was available. Swapping to the
  git-only `@changesets/cli/changelog` (no token needed) fixed that, but
  it also removed the one feature `changesets/changelog-github` added
  over plain `pnpm version`: real per-PR/commit changelog links. At that
  point, keeping Changesets bought only "independent per-package version
  numbers," a feature this repo does not use, since every package here
  always ships together at the same number already. Dropping it removed
  a dependency, the `.changeset/` directory, and a hand-written
  changeset-generation script, with nothing actually lost.

- **`license-audit.yml` (Phase 9).** `yanovian/open-license-auditor@v1`, the
  org's own license-scanning Action (used the same way across the org's
  other repos), on every pull request. `fail-on: critical` gates on
  strong-copyleft licenses (the GPL
  and AGPL families); it posts one PR comment either way
  (`severity-filter: both`) so a warning-level license is visible without
  failing the check. No config file needed for this repo: the config file
  is entirely optional, and every default bucket already fits a plain npm
  workspace with no unusual license needs.
- **`update-dependencies-non-breaking.yml`** and
  **`update-dependencies-breaking.yml` (Phase 9).**
  `yanovian/update-dependencies-action@v1`, scoped by `update-strategy` to
  `non-breaking` and `breaking` respectively. **This repo's cadence is
  slower than a browser extension's use of the same Action on purpose,
  not copied verbatim:** monthly for non-breaking (the 1st of every
  month, 03:00 UTC) and every 6 months for breaking (January 1st and
  July 1st, 05:00 UTC, offset an hour from the non-breaking run so the
  two never race on the months both fire). jalali-js releases
  deliberately, by hand (`make release-patch`/etc.),
  not continuously the way a browser extension ships, so a breaking
  dependency bump benefits from a slower, more deliberate cadence with
  more real migration review between runs. `min-release-age-days: 30` on the breaking workflow gives a
  compromised or broken release a month to get caught before this repo
  picks it up. Both need a `PAT_TOKEN` repo secret (a real personal access
  token), not the default `GITHUB_TOKEN`: GitHub does not let a
  GITHUB_TOKEN-authored pull request trigger this repo's own `ci.yml`, so
  nothing would check the update once it opened.
- **`prune-old-actions.yaml` (Phase 9).** `yanovian/prune-old-actions@v1`,
  daily, `days-ago: 30`, matching the org's other repos exactly (no reason
  for this one's cadence to differ).
- **`compat-matrix.yml` (Phase 9).** The peer-dependency compatibility
  matrix from "Peer-dependency compatibility matrix" above. Runs on pull
  requests that touch `packages/react`, `packages/vue`, `packages/ui-react`,
  `packages/ui-vue`, or `apps/**`, on a weekly schedule (catches drift from
  a newly released framework version with no PR open), and on
  `workflow_dispatch`. `fail-fast: false`, so one incompatible version does
  not hide the others in the same run. Each matrix cell:
  1. Installs the workspace normally (`pnpm install --frozen-lockfile`).
  2. Runs `scripts/compat-override.mjs <pkg@range>...`, which writes that
     cell's framework version into the root `package.json`'s
     `pnpm.overrides` (never committed, only ever mutated in a CI
     checkout).
  3. Reinstalls (`pnpm install --no-frozen-lockfile`), which pnpm resolves
     workspace-wide, including packages that only declare the framework as
     a `peerDependency` (`packages/react`, `packages/vue`), not only the
     one playground app that names it as a real dependency.
  4. Runs that app's own `typecheck` and `build` scripts, plus (for
     React/Vue cells) `vitest run` scoped to the affected packages, so the
     component test suites themselves run against the overridden version,
     not only a build/typecheck smoke check.

  Verified this mechanism for real, not only read: overrode `react`/
  `react-dom`/`@types/react` to `^18` locally, reinstalled, and confirmed
  `packages/react` and `packages/ui-react`'s full test suites (30 tests)
  passed, along with `playground-react`'s own typecheck and build, all
  against React 18, before restoring `package.json`/`pnpm-lock.yaml` to
  their unmodified state.

  Matrix cells today: React 18 and 19 (both still broadly deployed); Vue 3
  only (Vue 2 reached end-of-life 2023-12-31 and is excluded, so this is a
  matrix of one on purpose, not an oversight); Next.js 15 and 16; Nuxt 3
  and 4. This list is not meant to stay fixed; update it as each
  framework's own supported-majors set moves.

- **`pages.yml` (Phase 11).** Deploys the docs and playground site to GitHub
  Pages on push to `master`, when a file under `apps/docs/**`,
  `apps/playground-react/**`, `apps/playground-vue/**`, or `packages/**`
  changes (`packages/**`, since the API reference is generated from those
  packages' own types). Builds the docs site (`make build-docs`, which runs
  API reference generation first), builds `playground-react` and
  `playground-vue` at their embedded subpaths (`make app-build-at-base`),
  copies both into the docs build output under `/playground/react/` and
  `/playground/vue/`, then deploys the merged result with the official
  `actions/configure-pages` / `actions/upload-pages-artifact` /
  `actions/deploy-pages` flow. Needs GitHub Pages enabled with "GitHub
  Actions" as the source in this repo's own Settings, an operational
  prerequisite this workflow cannot turn on itself (see
  `_docs/release-checklist.md`).

The dependency-update, license-audit, and action-pruning Actions above are
the org's own (`yanovian/update-dependencies-action`,
`yanovian/open-license-auditor`, `yanovian/prune-old-actions`), the same
ones used across the org's other repos, confirmed directly against a
real, live usage rather than assumed. Reusing them was an open decision
earlier in this document; it is settled now, as the "reuse them" bullets
above show.

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
- **Versioning and publishing (Phase 8, revised after Phase 11 to drop
  Changesets: see `release.yml`'s own entry above for why).** Plain
  `pnpm version <bump>`, matching the org's own tag-triggered release
  convention, extended across every package under `packages/*` (the 7
  publishable ones; the four playground apps and the docs site live under `apps/`,
  never touched by this). `packages/*/package.json`'s `"access": "public"`
  under `publishConfig` (every library package publishes in the open),
  and each cross-package dependency is `workspace:*`, which `pnpm
publish` rewrites to the real published version automatically, the
  same as it always did; dropping Changesets did not change this. Every
  package starts at the same version and always gets the same bump type
  in the same command, so they stay in sync with no config needed to
  enforce it, unlike Changesets' `fixed` groups, which existed only to
  approximate this same guarantee.
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

**Every CI workflow calls `make <target>`, never a raw `pnpm` command,
everywhere a Makefile target exists for what that step does (Phase 9).**
This is deliberate, not incidental: it keeps exactly one definition of
"what does typecheck/lint/build/etc. actually run" (the Makefile), so a
contributor reproduces any CI failure locally with the same command CI
used, and changing how a check runs means editing the Makefile once, not
hunting through every workflow file that happens to invoke it. `ci.yml`,
`release.yml`, and `compat-matrix.yml` all follow this. Two narrow,
intentional exceptions:

- `release.yml`'s final step's `publish: pnpm release` input names an
  exact pnpm script rather than a `make` target: Makefile's own `release`
  target is a deliberately different, dry-run-only preview command (see
  its own entry below), so pointing this at `make release` would run the
  wrong thing.
- `compat-matrix.yml`'s "Install with override" step uses `pnpm install
--no-frozen-lockfile` directly: its entire point is letting the lockfile
  move to match a version `scripts/compat-override.mjs` just wrote into
  `package.json`, an inherently CI-only mechanic with no equivalent a
  contributor would run by hand, unlike `install`/`install-frozen`.

```
help                 Show available commands
install              Install all workspace dependencies
install-frozen       Install without updating the lockfile (CI)
dev                  Run the playground apps in dev mode
build                Build all packages and apps
build-packages       Build only packages/* (its own CI step, named separately from build-apps)
build-apps           Build only apps/*, the four playground apps (ditto)
typecheck            TypeScript project-wide check
lint / lint-fix       ESLint, on its own or with autofix
format / format-check Prettier, write mode or check mode (the CI gate)
test / test-watch     Unit and property tests (Vitest)
test-e2e             Playwright visual e2e suite
probe-treeshake      Confirm packages/core's built output actually tree-shakes
size                 Bundle-size budget check
check                CI-equivalent: typecheck, lint, format-check, test, build, size
app-typecheck        Typecheck one app/package by name: make app-typecheck APP=playground-react
app-build            Build one app/package by name: make app-build APP=playground-react
test-paths           Run Vitest scoped to specific paths: make test-paths PATHS="packages/react packages/ui-react"
docs-dev / docs-build Documentation site (playground URLs don't resolve under docs-dev, see docs-preview)
docs-preview          Build and preview the docs site, with a working embedded playground
embed-playgrounds     Build both playgrounds and embed them under apps/docs/public/
clean                Remove build output
release-patch/-minor/-major  Bump every package's version, commit, tag, and push: make release-patch
publish-packages     Publish every package to npm, skipping any already published (release.yml)
```

`app-typecheck`, `app-build`, and `test-paths` exist for
`compat-matrix.yml`'s dynamic matrix (see "Peer-dependency compatibility
matrix" above), which needs to typecheck/build/test a specific app or path
set chosen at matrix-expansion time, not one fixed at Makefile-authoring
time; Make's own `VAR=value` argument passing covers this without
inventing a parallel mechanism. They are equally usable by a contributor
locally, for example to reproduce one matrix cell's typecheck step by hand.

## Governance and community files

- `LICENSE`: MIT. This matches the license used across the rest of this
  ecosystem, and across this org's other public repos.
- `CONTRIBUTING.md`: setup steps, branch and PR conventions, and commit
  style.
- `CODE_OF_CONDUCT.md`: Contributor Covenant.
- `SECURITY.md`: how to report a vulnerability.
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
Reusing the org's existing internal GitHub Actions (dependency updater,
license auditor, action pruner) is settled too, as of Phase 9: yes, reuse
them as they are (`yanovian/update-dependencies-action`,
`yanovian/open-license-auditor`, `yanovian/prune-old-actions`; see the
CI/CD pipeline section above), on this repo's own cadence rather than
copying another repo's schedule verbatim. Two more are settled as of Phase
10 and Phase 11 respectively: where to host PR screenshots (an orphan
branch, `visual-snapshots`, plus a second orphan branch,
`visual-baselines`, for the diff baselines themselves. See "Visual
regression and PR screenshots" above) and the docs site framework
(VitePress. See "Documentation site" above). The decision below is still
open.

| #   | Decision             | Proposed default                                                                     |
| --- | -------------------- | ------------------------------------------------------------------------------------ |
| 1   | Monorepo task runner | Plain pnpm workspace scripts. Add Turborepo or Nx only if CI time later justifies it |
