---
layout: home
hero:
  name: jalali-js
  text: A TypeScript-native Jalali calendar library
  tagline: Display Jalali (Persian, Shamsi) dates. Store Gregorian, by default, without extra thought.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Core concepts
      link: /guide/core-concepts
    - theme: alt
      text: API reference
      link: /api/jalali-js/
features:
  - title: Display Jalali, store Gregorian
    details: Every component and every core conversion function returns a Gregorian, calendar-agnostic value by default, the same contract a native <input type="date"> follows. Opt into a Jalali-native stored value with one option, when you actually need one.
  - title: Precision tiers, not optional fields
    details: CalendarDate, CalendarDateTime, and ZonedCalendarDateTime are three separate types, matching TC39 Temporal's own tiers, so code written against a plain date can never accidentally read a time field that was never set.
  - title: React and Vue bindings, headless or styled
    details: Headless primitives (data attributes, scoped slots) for full control, plus a working default-styled DatePicker for zero-setup use. A range picker, an inline calendar, and extra themes ship in @jalali-js/ui-react and @jalali-js/ui-vue.
  - title: Built on a validated arithmetic engine
    details: The Jalali leap-year rule is checked against Node's own ICU Persian calendar with zero mismatches across a multi-thousand-year range, plus an independent, published reference table.
---
