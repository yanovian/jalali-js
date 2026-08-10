<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-dark.svg">
    <img src=".github/assets/logo-light.svg" alt="jalali-js" height="72">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/yanovian/jalali-js/actions/workflows/ci.yml"><img src="https://github.com/yanovian/jalali-js/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
  <a href="https://www.npmjs.com/package/jalali-js"><img src="https://img.shields.io/npm/v/jalali-js.svg" alt="npm version"></a>
  <a href="https://bundlejs.com/?q=jalali-js"><img src="https://deno.bundlejs.com/badge?q=jalali-js" alt="Bundle size"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/yanovian/jalali-js.svg" alt="License"></a>
  <a href="https://yanovian.github.io/jalali-js/"><img src="https://img.shields.io/badge/docs-yanovian.github.io-1e1b4b.svg" alt="Documentation"></a>
</p>

<p align="center">
  <b>A TypeScript-native Jalali (Persian, Shamsi) calendar toolkit, with first-class React, Vue,
  and framework-free Web Components bindings.</b>
</p>

<p align="center">
  <a href="https://yanovian.github.io/jalali-js/guide/getting-started">Guide</a>
  ·
  <a href="https://yanovian.github.io/jalali-js/guide/examples">Examples</a>
  ·
  <a href="https://yanovian.github.io/jalali-js/api/jalali-js/">API reference</a>
  ·
  <a href="https://yanovian.github.io/jalali-js/playground/react/">Playground</a>
</p>

## Why this exists

Most Jalali packages for JavaScript force a trade-off. A package is either a thin, math-only
conversion function with no framework support, or a full date picker UI tied to one framework,
often built on a legacy library like Moment. No single package covers TypeScript-native
conversion, a real date, time, and timezone model, React and Vue bindings, a framework-free
Web Components option, and a headless component layer together. See
[`_docs/alternatives.md`](_docs/alternatives.md) for the package-by-package comparison.

jalali-js splits this into layers instead. One small, dependency-free core does the conversion.
Thin framework bindings sit on top of it, including a plain Web Components binding for a page
with no framework, or one this project has no dedicated binding for. A headless, themeable
component layer sits on top of that. Use only the layer you need.

## Install

```sh
npm install jalali-js          # core: conversion, zero runtime dependencies
npm install @jalali-js/react   # React bindings
npm install @jalali-js/vue     # Vue bindings
npm install @jalali-js/web     # No framework: plain Web Components
```

## Quick look

```ts
import { createCalendar } from 'jalali-js';

const calendar = createCalendar({ system: 'jalali' });
calendar.today(); // { year: 1403, month: 5, day: 15 }
```

```tsx
// React
import { DatePicker } from '@jalali-js/react';

<DatePicker locale="fa" onChange={(value) => console.log(value)} />;
// Displays Jalali. Emits a plain Gregorian value by default. Your database never
// has to store a Jalali-shaped value.
```

```vue
<!-- Vue -->
<script setup lang="ts">
import { DatePicker } from '@jalali-js/vue';
import type { StorageValue } from 'jalali-js';
import { ref } from 'vue';

const stored = ref<StorageValue>();
</script>

<template>
  <DatePicker v-model="stored" locale="fa" />
</template>
```

```html
<!-- No framework -->
<jalali-date-picker id="picker" locale="fa"></jalali-date-picker>
<script type="module">
  import '@jalali-js/web';
  document.getElementById('picker').addEventListener('change', (e) => console.log(e.detail.value));
</script>
```

More copy-paste examples, including natural language parsing, range pickers, and custom
theming, are in the [Examples](https://yanovian.github.io/jalali-js/guide/examples) guide
linked above.

## What you get

- **TypeScript-native, not retrofitted.** Each precision tier (`date`, `date + time`,
  `date + time + timezone`) is its own type. Function overloads resolve the right type, so you
  get no `any` and no runtime-only guard standing in for one.
- **Small and tree-shakeable.** The core stays under a 6 kB budget (minified, brotli), enforced
  in CI. Import only what you use, and the bundler drops the rest.
- **Zero runtime dependencies in the core.** `jalali-js` depends on nothing. `i18n` and `nlp`
  depend only on `jalali-js`.
- **Display and storage stay separate, on purpose.** A component shows Jalali by default and
  emits a calendar-agnostic Gregorian value, the same contract a native `<input type="date">`
  follows. A Jalali UI never forces a Jalali-shaped value into your database.
- **React and Vue, both first-class,** including Next.js and Nuxt SSR with safe timezone
  resolution during server render.
- **No framework? No problem.** `@jalali-js/web` ships the same pickers as plain Web
  Components: usable from plain HTML/JS, or dropped into any framework this project has no
  dedicated binding for.
- **English, Farsi, and Pashto out of the box,** including natural language date input in all
  three (`"next Farvardin"`, `"فردا"`, `"نن"`).
- **Headless by default.** Data attributes and scoped slots give you full styling control. An
  optional pre-styled `DatePicker` sits on top for teams that want one ready to use.
- **Visual regressions get caught before merge.** Every pull request gets automated screenshots
  across locale, calendar system, and picker variant.

## Packages

| Package               | What it is                                                        |
| --------------------- | ----------------------------------------------------------------- |
| `jalali-js`           | The conversion core. Zero runtime dependencies.                   |
| `@jalali-js/i18n`     | Locale data (`en`, `fa`, `ps`) and display formatting.            |
| `@jalali-js/nlp`      | Natural language date parsing: English, Farsi, and Pashto.        |
| `@jalali-js/react`    | React bindings: `useCalendar`, headless `Calendar`, `DatePicker`. |
| `@jalali-js/vue`      | The same, for Vue.                                                |
| `@jalali-js/web`      | The same, as plain Web Components. No framework required.         |
| `@jalali-js/ui-react` | `RangePicker`, `InlineCalendar`, and extra themes, for React.     |
| `@jalali-js/ui-vue`   | The same, for Vue.                                                |
| `@jalali-js/ui-web`   | The same, for web.                                                |

## This repo

- [`_docs/architecture.md`](_docs/architecture.md): the technical design. Scope, data model,
  package layout, testing strategy, CI/CD design, and tooling.
- [`_docs/alternatives.md`](_docs/alternatives.md): the vision, the goals, and a comparison with
  existing Jalali and Persian calendar libraries.
- Docs for agents: [`llms.txt`](https://yanovian.github.io/jalali-js/llms.txt) (index) and
  [`llms-full.txt`](https://yanovian.github.io/jalali-js/llms-full.txt) (full guide bundle).
- [`CHANGELOG.md`](CHANGELOG.md): what changed in each release.
- [`CONTRIBUTING.md`](CONTRIBUTING.md): setup, the branch and PR workflow, and the checks a
  change must pass.
- [`_docs/plan.md`](_docs/plan.md): the phase-by-phase status checklist.

## Used by

- [kissed.app](https://kissed.app)

## License

[MIT](LICENSE), copyright Yanovian LLC. Open source and free to use, with no warranty.
