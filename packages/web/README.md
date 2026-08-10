# @jalali-js/web

Framework-free [jalali-js](https://github.com/yanovian/jalali-js) bindings: a headless
`<jalali-calendar>` grid and a working default-styled `<jalali-date-picker>`, as plain
[Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components). No React, no
Vue, no build step required: works in plain HTML/JS, and drops into any framework the same way
any other HTML element does.

```sh
npm install @jalali-js/web
```

```html
<jalali-date-picker id="picker" system="jalali" locale="fa"></jalali-date-picker>
<script type="module">
  import '@jalali-js/web/date-picker.css';
  import '@jalali-js/web';

  document.getElementById('picker').addEventListener('change', (event) => {
    // event.detail: { value, date }. value: a Gregorian ISO string by default ('2024-08-05').
  });
</script>
```

`<jalali-calendar>` is the headless primitive underneath `<jalali-date-picker>` (plain markup,
`data-jalali-*` attributes, no required CSS, no shadow root in the way), for full styling
control. `variant="dropdown"` swaps the calendar-grid popup for three plain `<select>`s, for
narrow, known-range entry such as a date of birth. A person can click the month or year in the
grid popup's header to jump straight to a month grid or a year grid; on by default, turn it off
with `quick-nav="false"`.

[`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web) adds a
`<jalali-range-picker>`, a `<jalali-inline-calendar>`, and extra themes on the same primitives.

[Guide and API reference](https://jalali-js.yanovian.com/) ·
[Examples](https://jalali-js.yanovian.com/guide/examples) ·
[Playground](https://jalali-js.yanovian.com/playground/vanilla/)

MIT licensed.
