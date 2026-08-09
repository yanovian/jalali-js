# @jalali-js/ui-react

`RangePicker`, `InlineCalendar`, and extra themes for
[`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react), built on the same headless
primitives.

```sh
npm install @jalali-js/ui-react
```

```tsx
import '@jalali-js/react/date-picker.css';
import '@jalali-js/ui-react/themes/dark.css';
import { InlineCalendar, RangePicker } from '@jalali-js/ui-react';

<InlineCalendar system="jalali" locale="en" value={selected} onSelect={setSelected} />
<RangePicker system="jalali" locale="en" onChange={(value, range) => { /* ... */ }} />
```

`RangePicker`: two-click range selection (first click sets the start, second sets the end and
closes the popover); clicking before the current start restarts the range instead of erroring;
hovering after a start is picked previews the range a completed selection would produce.
`InlineCalendar`: `Calendar` re-exported under a more discoverable name, for an always-visible
grid with no popover. `themes/dark.css` and `themes/compact.css` each override a disjoint set of
the shared `--jalali-*` custom properties, so they compose by importing both.

[Guide and API reference](https://yanovian.github.io/jalali-js/) ·
[Examples](https://yanovian.github.io/jalali-js/guide/examples) ·
[Playground](https://yanovian.github.io/jalali-js/playground/react/)

MIT licensed.
