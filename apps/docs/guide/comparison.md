# Comparison with alternatives

The existing set of Jalali and Persian calendar tools for JavaScript is split across many small
packages, each covering one or two needs well and staying silent on the rest. No single one
covers all of: a maintained TypeScript-first conversion core, an explicit date/time/timezone
precision model, bindings for more than one framework, built-in English and Farsi support, and
a headless, themeable component layer with visual regression tests in CI.

🟢 good · 🟡 partial · 🔴 missing or a real drawback

| Library                                                                                  | Primary use                      | TS-native  | Multi-calendar design     | Date/time/timezone model                                                       | English and Farsi | Framework bindings | Headless and themeable UI                          |
| ---------------------------------------------------------------------------------------- | -------------------------------- | ---------- | ------------------------- | ------------------------------------------------------------------------------ | ----------------- | ------------------ | -------------------------------------------------- |
| [`jalali-js`](https://www.npmjs.com/package/jalali-js)                                   | Conversion core + bindings + UI  | 🟢 Yes     | 🟢 Yes (plugin interface) | 🟢 Explicit tiers: `CalendarDate`, `CalendarDateTime`, `ZonedCalendarDateTime` | 🟢 Yes            | 🟢 React and Vue   | 🟢 Headless primitives, styled `DatePicker` on top |
| [`jalaali-js`](https://www.npmjs.com/package/jalaali-js)                                 | Jalali-to-Gregorian math         | 🟢 Yes     | 🔴 No, one calendar       | 🔴 No, plain numbers                                                           | 🔴 No             | 🔴 No              | 🔴 No                                              |
| [`moment-jalaali`](https://www.npmjs.com/package/moment-jalaali)                         | Jalali plugin for Moment         | 🔴 No      | 🔴 No                     | 🔴 Through Moment, which its own team calls legacy                             | 🟡 Partial        | 🔴 No              | 🔴 No                                              |
| [`jalali-moment`](https://www.npmjs.com/package/jalali-moment)                           | Jalali fork of Moment            | 🔴 No      | 🔴 No                     | 🔴 Through Moment, which its own team calls legacy                             | 🟡 Partial        | 🔴 No              | 🔴 No                                              |
| [`date-fns-jalali`](https://www.npmjs.com/package/date-fns-jalali)                       | Full date-fns API, Jalali flavor | 🟢 Yes     | 🔴 No, one calendar       | 🟡 Through date-fns, no explicit precision types                               | 🔴 No             | 🔴 No              | 🔴 No                                              |
| `dayjs` + `jalaliday`                                                                    | Jalali plugin for Day.js         | 🟡 Partial | 🔴 No                     | 🟡 Through Day.js                                                              | 🔴 No             | 🔴 No              | 🔴 No                                              |
| [`persian-date`](https://www.npmjs.com/package/persian-date)                             | Persian date object              | 🔴 No      | 🔴 No                     | 🔴 No                                                                          | 🟡 Partial        | 🔴 No              | 🔴 No                                              |
| [`react-multi-date-picker`](https://github.com/shahabyazdi/react-multi-date-picker)      | React date picker UI             | 🟢 Yes     | 🟢 Yes, several calendars | 🔴 No explicit model                                                           | 🟢 Yes            | 🟡 React only      | 🔴 Tied to the UI, not headless                    |
| [`vue-persian-datetime-picker`](https://github.com/talkhabi/vue-persian-datetime-picker) | Vue date picker UI               | 🔴 No      | 🔴 No                     | 🔴 Through moment-jalaali                                                      | 🟡 Partial        | 🟡 Vue only        | 🔴 Tied to the UI, not headless                    |

Two patterns repeat across the alternatives. First, several depend on Moment.js, and the
Moment.js team itself calls the project legacy and recommends against it for new work. Second,
the packages with strong UI components tie the date logic to one framework, so a team can't take
the conversion engine without the component tree, or the other way around.

jalali-js splits on that second point deliberately: one small, framework-agnostic,
dependency-free core (`jalali-js`) does the conversion work; thin framework bindings
(`@jalali-js/react`, `@jalali-js/vue`) sit on top of it; a headless component layer sits on top
of that. The same core can power a React admin dashboard, a Vue or Nuxt storefront, and a plain
TypeScript backend job, with no wasted code in any of them.

## What jalali-js explicitly does not do

- **General date math.** Not a replacement for date-fns or Temporal. `jalali-js` has zero
  runtime dependencies and reads/returns plain `Date` objects, ISO strings, and epoch numbers;
  use date-fns or Temporal beside it for date math it doesn't cover, such as adding business
  days.
- **Database storage format.** `jalali-js` doesn't decide how your application stores a date in
  its own schema. It only decides what value a component hands back by default (see
  [Display value vs. storage value](/guide/display-vs-storage)), and makes that value
  calendar-agnostic, so the common case needs no extra thought.
