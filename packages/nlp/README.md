# @jalali-js/nlp

Natural language date parsing for [jalali-js](https://github.com/yanovian/jalali-js), in
English, Farsi, and Finglish (Farsi written in Latin script).

```sh
npm install @jalali-js/nlp
```

```ts
import { parse } from '@jalali-js/nlp';

parse('today', 'en');
parse('next Farvardin', 'en');
parse('فردا', 'fa'); // 'tomorrow'
parse('emrooz', 'fa-Latn'); // 'today', in Finglish
parse('banana', 'en'); // null: not a recognized phrase
```

Returns a `CalendarDate` (in the Jalali system by default; pass `{ system: 'gregorian' }` for
the other), or `null` when the phrase isn't recognized. Full guide and API reference:
[yanovian.github.io/jalali-js](https://yanovian.github.io/jalali-js/).

MIT licensed.
