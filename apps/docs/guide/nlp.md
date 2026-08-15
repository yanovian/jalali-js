---
description: Parse English, Farsi, and Pashto date phrases into calendar dates.
---

# Natural language parsing

:::tabs key:pm variant:code
== npm

```sh
npm install @jalali-js/nlp
```

== pnpm

```sh
pnpm add @jalali-js/nlp
```

== yarn

```sh
yarn add @jalali-js/nlp
```

:::

`parse()` reads a short natural-language phrase and returns a `CalendarDate`, or `null` when it
doesn't recognize the phrase. Three locales: `en`, `fa`, and `ps` (Pashto). English input
accepts the transliterated Jalali month names (`Mehr`, `Aban`, `Azar`); Farsi input uses
Persian script.

This package is for free-form phrases. To parse input with a known, exact shape such as
`1403/05/15`, use [`parseTemplate()`](/guide/i18n#parsetemplate) from `@jalali-js/i18n`
instead.

```ts
import { parse } from '@jalali-js/nlp';

parse('today', 'en'); // today, in the jalali system (default)
parse('tomorrow', 'en');
parse('yesterday', 'en');
parse('next week', 'en');
parse('next Farvardin', 'en'); // the next upcoming occurrence of that month

parse('امروز', 'fa'); // 'today'
parse('فردا', 'fa'); // 'tomorrow'
parse('هفته آینده', 'fa'); // 'next week'
parse('فروردین آینده', 'fa'); // 'next Farvardin'

parse('نن', 'ps'); // 'today', in Pashto
parse('راتلونکې اونۍ', 'ps'); // 'next week'
parse('راتلونکی وری', 'ps'); // 'next Wray' (the Afghan name of Jalali month 1)

parse('banana', 'en'); // null: not a recognized phrase
```

Pass `{ system: 'gregorian' }` to get the result in the Gregorian system instead of the default
`'jalali'`:

```ts
parse('today', 'en', { system: 'gregorian' });
```

"Next `<month>`" means the upcoming occurrence, not the one already under way: if the named
month has already started this year, the result is next year's occurrence, the same convention
"next Monday" uses for picking a day inside a period when none is given. The day is fixed at 1.

`getWordList(locale)` exposes the underlying phrase table (`WordList`) `parse()` matches
against, for a consumer who wants to build their own matching on top of it rather than use
`parse()` directly. Full type: [API reference](/api/@jalali-js/nlp/).
