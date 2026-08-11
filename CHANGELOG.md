# Changelog

This file records all notable changes to this project. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow
[Semantic Versioning](https://semver.org/). Every package in this monorepo
releases together, at the same version number.

Keep bullets short: one idea, one or two lines, name the API or behavior.
Agents follow the Changelog section in [`AGENTS.md`](AGENTS.md).

Planned work lives in [`_docs/plan.md`](_docs/plan.md).

## [Unreleased]

### Added

- EventCalendar `view: 'timeline'` with locale digits, markers, and layout options.

### Fixed

- Jalali calendar weekday headers start on Saturday (شنبه).

### Changed

- READMEs and the docs home lead with live demo and npm ecosystem links.
- EventCalendar works on phone widths, with keyboard-focusable scroll panes.

## [0.2.1] - 2026-08-10

### Added

- CI Node matrix for LTS 22 and 24 (typecheck, unit tests, package builds).

### Fixed

- Docs badge fixed.

## [0.2.0] - 2026-08-10

### Added

- Core date math: `addMonths`, `addYears`, `diffDates`, `startOf`,
  `endOf`, `isBefore`, `isAfter`, `isSameDay`, `isBetween`, `isToday`.
- Opt-in astronomical Jalali engine (`engine: 'astronomical'`). Arithmetic
  stays the default.
- Selection rules on every picker (`minDate`, `maxDate`, enabled/disabled
  dates and weekdays). `RangePicker` also blocks ranges that cross a
  blocked day.
- Time selection: `TimePicker`, `DatePicker` `precision: 'datetime'`, and
  `TimeRangePicker` in the `ui-*` packages.
- `@jalali-js/holidays`: offline Iran (`IR`) holidays, picker hooks
  (`showHolidays`, `blockHolidays`, `holidayRegion`), and
  `make update-holidays`.
- `formatRelative()` and format templates / `parseTemplate()` in
  `@jalali-js/i18n`.
- `EventCalendar` (month, week, day) in `ui-react`, `ui-vue`, and `ui-web`,
  plus core layout helpers.
- Pashto (`ps`) locale and NLP phrases.
- Docs: prop tables, recipes, browser support, `llms.txt`, release
  changelog promotion (`make release-*`).
- Interactive playgrounds (URL state, live value, theme, snippets) behind
  `/playground/*`. Popovers flip and clamp in the viewport.
- Full npm READMEs for every package, plus `make check-readmes` in CI and
  release.

### Changed

- Visual e2e screenshot mismatches are advisory in the PR comment. They
  do not fail the job. Functional asserts still fail the job.
- Package `keywords` expanded for npm search.
- ESLint ignores VitePress cache and generated docs API output.

### Removed

- Finglish (`fa-Latn`) NLP input. Farsi uses Persian script.

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

[unreleased]: https://github.com/yanovian/jalali-js/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/yanovian/jalali-js/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/yanovian/jalali-js/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yanovian/jalali-js/compare/v0.0.3...v0.1.0
[0.0.3]: https://github.com/yanovian/jalali-js/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/yanovian/jalali-js/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/yanovian/jalali-js/releases/tag/v0.0.1
