# @jalali-js/nlp

Natural language date parsing for [jalali-js](https://github.com/yanovian/jalali-js), in
English, Farsi, and Pashto.

```sh
npm install @jalali-js/nlp
```

```ts
import { parse } from '@jalali-js/nlp';

parse('today', 'en');
parse('next Farvardin', 'en');
parse('فردا', 'fa'); // 'tomorrow'
parse('نن', 'ps'); // 'today', in Pashto
parse('banana', 'en'); // null: not a recognized phrase
```

Returns a `CalendarDate` (in the Jalali system by default; pass `{ system: 'gregorian' }` for
the other), or `null` when the phrase isn't recognized.

[Guide and API reference](https://yanovian.github.io/jalali-js/) ·
[Examples](https://yanovian.github.io/jalali-js/guide/examples) ·
[Playground](https://yanovian.github.io/jalali-js/playground/react/)

MIT licensed.
