# Changelog

This file records all notable changes to this project. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow
[Semantic Versioning](https://semver.org/). Every package in this monorepo
releases together, at the same version number.

Planned work lives in [`_docs/plan.md`](_docs/plan.md).

## [Unreleased]

### Added

- Opt-in astronomical Jalali engine: `engine: 'astronomical'` on
  `createCalendar()`, `toGregorian()`, and `fromGregorian()`. Nowruz uses
  the March equinox at the Tehran meridian (52.5°E) from Meeus low-precision
  solar longitude. The arithmetic engine stays the default.
- Docs depth: prop tables on the React, Vue, and Web guides, a recipes
  page (including programmatic set/read/clear), and a browser support
  page from the real e2e matrix. `make release-*` promotes
  `## [Unreleased]` to the new version heading and fails when there are
  no release notes (`scripts/prepare-changelog.mjs`).
- `EventCalendar` in `@jalali-js/ui-react`, `@jalali-js/ui-vue`, and
  `@jalali-js/ui-web`, with a framework-free `CalendarEvent` model and
  layout helpers in `jalali-js` (`layoutMonthEvents`, `layoutWeekEvents`,
  `layoutDayTimedEvents`). Views: `month`, `week`, and `day`. The consumer
  owns the event list and editing UI. Recurring rules expand on the
  consumer side before pass-in.
- `formatRelative()` in `@jalali-js/i18n`: "۳ روز پیش", "3 days ago",
  "in 2 months", and a today string per locale. Uses `diffDates()` for
  unit selection. Digits follow `numerals`.
- `@jalali-js/holidays`: offline Iran (`IR`) holidays. `AF` and `TJ` are
  reserved. Fixed solar rules plus lunar year table (1402-1426). Names in
  `regions/ir/names/{en,fa,ps}.ts`. API takes optional `{ region }`. Pickers
  take `showHolidays`, `blockHolidays`, and `holidayRegion`. Update with
  `make update-holidays YEARS=next`. Yearly CI opens a PR when data changes.
- Time selection: a headless `TimePicker` in React, Vue, and Web Components
  (`minuteStep`, `disabledHours`), a `precision: 'datetime'` option on
  `DatePicker` that adds a time panel and emits a datetime storage value,
  and a `TimeRangePicker` in the `ui-*` packages. Shared option lists live
  in the core (`listHours`, `listMinutes`, `withTime`).
- Selection rules in every picker: a `SelectionRules` type in the core
  (`minDate`, `maxDate`, `enabledDates`, `disabledDates`,
  `disabledWeekdays`), resolved by `isDateSelectable()` and wired through
  `buildCalendarGrid()`. Blocked days render disabled with a
  `data-disabled` attribute, reject selection, and drop out of the Tab
  order. `RangePicker` also refuses a range that crosses a blocked day
  (`isRangeSelectable()`): the second click starts a new range instead.
- Format templates and strict parsing in `@jalali-js/i18n`: a `template`
  option on `format()` (`YYYY`, `MM`, `M`, `DD`, `D`, `MMMM`, `MMM`,
  `dddd`, `ddd`) and its reverse, `parseTemplate()`. Parsing accepts
  Latin and native digits and returns `null` when the input does not
  match the template or the date does not exist.
- Date math and query helpers in the core: `addMonths`, `addYears`,
  `diffDates`, `startOf`, `endOf`, `isBefore`, `isAfter`, `isSameDay`,
  `isBetween`, and `isToday`. All work per calendar system and clamp
  month ends (Esfand 30 plus one year gives Esfand 29).
- Pashto (`ps`) support: a locale pack with Afghanistan's own month names,
  sourced from CLDR, wired into the React, Vue, and Web Components
  bindings, plus Pashto phrase parsing in `@jalali-js/nlp`.
- An "Adding a locale" contribution walkthrough in the i18n guide.
- LLM-friendly docs on the docs site: `llms.txt` (index) and
  `llms-full.txt` (full guide bundle).
- A bundle-size badge in the readme.

### Removed

- The Finglish (`fa-Latn`) input style in `@jalali-js/nlp`. Finglish is
  wrong and a bad practice: it works against the language. Farsi input
  uses Persian script.

## [0.1.0] - 2026-08-10

### Added

- Web Components bindings, with no framework required: `@jalali-js/web`
  (`Calendar`, `DatePicker`, `DropdownDateFields`) and `@jalali-js/ui-web`
  (`RangePicker`, `InlineCalendar`, and the dark and compact themes).
- Quick month and year navigation in the React and Vue calendars.
- The calendar shows the selected date as text.

### Changed

- Better dark mode styling across the pickers.
- Playground improvements.
- SEO material and a better comparison table on the docs site.

### Fixed

- Native select rendering in WebKit dark mode.
- The compatibility matrix workflow for Next.js 15 and Nuxt 3.

## [0.0.3] - 2026-08-09

### Changed

- Better package description text on the npm pages.

## [0.0.2] - 2026-08-09

### Changed

- More package information on the npm pages.

## [0.0.1] - 2026-08-09

The initial release. This covers phases 0 through 11 of the plan.

### Added

- `jalali-js`, the conversion core, with zero runtime dependencies:
  Jalali to Gregorian conversion and back (a 33-year-cycle arithmetic
  rule, verified against ICU), the three precision tiers (`CalendarDate`,
  `CalendarDateTime`, `ZonedCalendarDateTime`), the `createCalendar()`
  factory, SSR-safe timezone resolution, the Gregorian storage-value
  contract with the `valueFormat` option, date math (`addDays()`,
  `compareDates()`, `dayOfWeek()`), and the calendar grid builder.
- `@jalali-js/i18n`: `en` and `fa` locale packs, `format()` with display
  presets, and Persian numerals.
- `@jalali-js/nlp`: natural language date parsing in English, Farsi, and
  Finglish.
- `@jalali-js/react`: the `useCalendar` hook, the headless `Calendar`,
  `DatePicker` (grid and dropdown variants), and `useResolvedTimeZone`.
- `@jalali-js/vue`: the same, as composables and single-file components.
- `@jalali-js/ui-react` and `@jalali-js/ui-vue`: `RangePicker`,
  `InlineCalendar`, and the dark and compact themes.
- A CSS custom-property theming contract shared by every binding.
- The docs site (VitePress): guides, a generated API reference, and the
  hosted React and Vue playgrounds.
- The build and release pipeline, CI (typecheck, lint, format check,
  tests, a bundle-size budget, and a tree-shaking probe), the
  peer-dependency compatibility matrix, and visual e2e tests with a PR
  screenshot bot.

[unreleased]: https://github.com/yanovian/jalali-js/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yanovian/jalali-js/compare/v0.0.3...v0.1.0
[0.0.3]: https://github.com/yanovian/jalali-js/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/yanovian/jalali-js/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/yanovian/jalali-js/releases/tag/v0.0.1
