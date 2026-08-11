---
layout: home
hero:
  name: jalali-js
  text: A TypeScript-native Jalali calendar library
  tagline: Display Jalali (Persian, Shamsi) dates. Store Gregorian, by default, without extra thought.
  actions:
    - theme: brand
      text: Live demo
      link: /playground/react/
    - theme: alt
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: API reference
      link: /api/jalali-js/
features:
  - title: Display Jalali, store Gregorian
    details: Every component and every core conversion function returns a Gregorian, calendar-agnostic value by default, the same contract a native <input type="date"> follows. Opt into a Jalali-native stored value with one option, when you actually need one.
  - title: Precision tiers, not optional fields
    details: CalendarDate, CalendarDateTime, and ZonedCalendarDateTime are three separate types, matching TC39 Temporal's own tiers, so code written against a plain date can never accidentally read a time field that was never set.
  - title: React, Vue, or no framework at all
    details: Headless primitives (data attributes, scoped slots) for full control, plus a working default-styled DatePicker for zero-setup use. @jalali-js/web ships the same components as plain Web Components, so a page with no framework, or one this project has no dedicated binding for, gets the exact same picker and theme CSS.
  - title: Built on a validated arithmetic engine
    details: The Jalali leap-year rule is checked against Node's own ICU Persian calendar with zero mismatches across a multi-thousand-year range, plus an independent, published reference table.
---

## Start here

- [Live demo (React)](/playground/react/) · [Vue](/playground/vue/) · [Web Components](/playground/vanilla/)
- [Documentation guide](/guide/getting-started)
- [API reference](/api/jalali-js/)
- [Compare alternatives](/guide/comparison)

## npm ecosystem

[`jalali-js`](https://www.npmjs.com/package/jalali-js) ·
[`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) ·
[`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) ·
[`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) ·
[`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react) ·
[`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue) ·
[`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) ·
[`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) ·
[`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue) ·
[`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)

| Package                                                                    | Role                     |
| -------------------------------------------------------------------------- | ------------------------ |
| [`jalali-js`](https://www.npmjs.com/package/jalali-js)                     | Conversion core          |
| [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n)         | Locales and formatting   |
| [`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp)           | Natural language parsing |
| [`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) | Iran holidays            |
| [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react)       | React bindings           |
| [`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue)           | Vue bindings             |
| [`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web)           | Web Components           |
| [`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) | React UI (range, events) |
| [`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue)     | Vue UI                   |
| [`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)     | Web Components UI        |
