# jalali-js

A TypeScript-native calendar toolkit for JavaScript, for the Jalali (Persian, Shamsi) calendar.
Converts between Jalali and Gregorian, with first-class bindings for React and Vue (and
first-class support for Next.js and Nuxt through them). English and Farsi (Persian) ship out of
the box, including natural language date input in both languages ("today", "next Farvardin",
"فردا", "emrooz"). A configurable date/time/timezone precision model, matching TC39 `Temporal`'s
own tiers. Every component displays Jalali but stores a calendar-agnostic Gregorian value by
default, the same contract a native `<input type="date">` follows.

```sh
npm install jalali-js          # core: conversion, no framework, no runtime dependency
npm install @jalali-js/react   # React bindings
npm install @jalali-js/vue     # Vue bindings
```

```ts
import { createCalendar } from 'jalali-js';

createCalendar({ system: 'jalali' }).today(); // { year: 1403, month: 5, day: 15 }
```

See the [documentation site](https://yanovian.github.io/jalali-js/) for the full guide and API
reference, and each package's own README (`packages/*/README.md`) for that package specifically.

## Packages

| Package               | What it is                                                        |
| --------------------- | ----------------------------------------------------------------- |
| `jalali-js`           | The conversion core. Zero runtime dependencies.                   |
| `@jalali-js/i18n`     | Locale data (`en`, `fa`) and display formatting.                  |
| `@jalali-js/nlp`      | Natural language date parsing, in English, Farsi, and Finglish.   |
| `@jalali-js/react`    | React bindings: `useCalendar`, headless `Calendar`, `DatePicker`. |
| `@jalali-js/vue`      | The same, for Vue.                                                |
| `@jalali-js/ui-react` | `RangePicker`, `InlineCalendar`, and extra themes, for React.     |
| `@jalali-js/ui-vue`   | The same, for Vue.                                                |

## This repo

- [`_docs/plan.md`](_docs/plan.md): the phase-by-phase status checklist.
- [`_docs/architecture.md`](_docs/architecture.md): the technical design. Scope, data model,
  package layout, testing strategy, CI/CD design, and tooling.
- [`_docs/alternatives.md`](_docs/alternatives.md): the vision, the goals, and a comparison with
  existing Jalali and Persian calendar libraries.
- [`_docs/release-checklist.md`](_docs/release-checklist.md): the v1.0 release readiness
  checklist.
- [`CONTRIBUTING.md`](CONTRIBUTING.md): setup, the branch and PR workflow, and the checks a
  change must pass.

## License

[MIT](LICENSE), copyright Yanovian LLC. Open source and free to use, with no warranty.
