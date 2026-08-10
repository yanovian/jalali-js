---
description: Parse English, Farsi, and Finglish date phrases into calendar dates.
---

# Natural language parsing

```sh
npm install @jalali-js/nlp
```

`parse()` reads a short natural-language phrase and returns a `CalendarDate`, or `null` when it
doesn't recognize the phrase. Three locales: `en`, `fa`, and `fa-Latn` (Finglish, Persian
written in Latin script).

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

parse('emrooz', 'fa-Latn'); // 'today', written in Finglish
parse('farda', 'fa-Latn'); // 'tomorrow'

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
