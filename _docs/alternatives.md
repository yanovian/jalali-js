# Vision, goals, and the ecosystem gap

See [plan.md](./plan.md) for phase-by-phase status. See
[architecture.md](./architecture.md) for the technical design behind this
vision.

## Vision

jalali-js is a modern, TypeScript-native calendar toolkit for JavaScript. It
starts with Jalali (Persian, Shamsi) to Gregorian conversion. Its design lets
the team add more calendars later. It ships as a small core with zero runtime
dependencies, plus thin bindings for React, Vue, Nuxt, and Next.js. It
supports English and Farsi (Persian) out of the box, including natural
language date input in both languages. It has a configurable precision model:
date only, date with time, or date with time and timezone. It has a strict CI
pipeline: lint, typecheck, unit tests, visual end-to-end tests with automatic
PR screenshots, dependency and license audits, and automated releases.

## Goals

- Correct, well-tested Jalali to Gregorian conversion. This includes leap
  years, month and day boundaries, and far past or future years.
- A calendar-system design that lets the team add more calendars later,
  without a change to the public API.
- A precision model: year, month, and day only by default, with time as an
  option, and with timezone as an option. Each level is explicit and
  configurable.
- Automatic and manual timezone handling. This includes safe behavior during
  server-side rendering in Next.js and Nuxt.
- Framework bindings that feel native in React, Vue, Nuxt, and Next.js.
- Full Persian (Farsi) and English support: month names, weekday names,
  Persian numerals, and right-to-left text layout.
- Natural language date input in v1, in Farsi and English. A user can type
  a phrase like "today", "next Farvardin", or "فردا", and the library
  parses it into a calendar date.
- A headless component layer by default, so a consumer can style everything.
  An optional pre-styled reference component ships on top of it.
- A CI pipeline that blocks a merge on lint, typecheck, unit test, and visual
  end-to-end test failures, and posts calendar screenshots on every pull
  request.

## Non-goals for v1

- **General date math.** jalali-js does not replace a general-purpose date
  library such as date-fns or Temporal. jalali-js has zero runtime
  dependencies and reads and returns plain JS `Date` objects and ISO strings.
  An application can use date-fns or Temporal beside jalali-js for date math
  that jalali-js does not cover, such as adding business days.
- **Database storage format.** jalali-js does not define how an application
  stores a date in its own database. jalali-js exchanges dates as plain JS
  `Date` objects, ISO strings, and epoch numbers. Next.js and Nuxt support is
  a core goal of this project (see the React and Vue phases in
  [plan.md](./plan.md)). This non-goal covers database schema design only. It
  does not limit framework support.

## Why the ecosystem needs this

The current set of Jalali and Persian calendar tools for JavaScript is split
across many small packages. Each one covers one or two needs well, and stays
silent on the rest. No single package today covers all of: a maintained
TypeScript-first conversion core, an explicit date and time precision model,
bindings for more than one framework, built-in English and Farsi support, and
a headless, themeable component layer with visual regression tests in CI.

| Library                                                                                  | Primary use                      | TS-native | Multi-calendar design  | Date, time, and timezone model                  | English and Farsi support | Framework bindings | Headless and themeable UI    | Visual e2e in CI |
| ---------------------------------------------------------------------------------------- | -------------------------------- | --------- | ---------------------- | ----------------------------------------------- | ------------------------- | ------------------ | ---------------------------- | ---------------- |
| [`jalaali-js`](https://www.npmjs.com/package/jalaali-js)                                 | Jalali to Gregorian math         | Yes       | No, one calendar       | No, plain numbers                               | No                        | No                 | No                           | Unknown          |
| [`moment-jalaali`](https://www.npmjs.com/package/moment-jalaali)                         | Jalali plugin for Moment         | No        | No                     | Through Moment, which its own team calls legacy | Partial                   | No                 | No                           | Unknown          |
| [`jalali-moment`](https://www.npmjs.com/package/jalali-moment)                           | Jalali fork of Moment            | No        | No                     | Through Moment, which its own team calls legacy | Partial                   | No                 | No                           | Unknown          |
| [`date-fns-jalali`](https://www.npmjs.com/package/date-fns-jalali)                       | Full date-fns API, Jalali flavor | Yes       | No, one calendar       | Through date-fns, no explicit precision types   | No                        | No                 | No                           | Unknown          |
| `dayjs` with `jalaliday` plugin                                                          | Jalali plugin for Day.js         | Partial   | No                     | Through Day.js                                  | No                        | No                 | No                           | Unknown          |
| [`persian-date`](https://www.npmjs.com/package/persian-date)                             | Persian date object              | No        | No                     | No                                              | Partial                   | No                 | No                           | Unknown          |
| [`react-multi-date-picker`](https://github.com/shahabyazdi/react-multi-date-picker)      | React date picker UI             | Yes       | Yes, several calendars | No explicit model                               | Yes                       | React only         | Tied to the UI, not headless | Unknown          |
| [`vue-persian-datetime-picker`](https://github.com/talkhabi/vue-persian-datetime-picker) | Vue date picker UI               | No        | No                     | Through moment-jalaali                          | Partial                   | Vue only           | Tied to the UI, not headless | Unknown          |

Two patterns repeat across this list. First, several packages depend on
Moment.js, and the Moment.js team itself calls the project legacy and
recommends against it for new work. Second, the packages with strong UI
components tie the date logic to one framework, so a team cannot take the
conversion engine without the component tree, or the other way around.

jalali-js sets its architecture apart on this second point. One small,
framework-agnostic, dependency-free core does the conversion work. Thin
framework bindings sit on top of it. A headless component layer sits on top
of that. This split lets the same core power a React admin dashboard, a
Vue or Nuxt storefront, and a plain TypeScript backend job, with no wasted
code in any of them.
