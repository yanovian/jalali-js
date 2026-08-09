# @jalali-js/ui-web

`<jalali-range-picker>`, `<jalali-inline-calendar>`, and extra themes for
[`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web), built on the same headless
Web Components. No framework required.

```sh
npm install @jalali-js/ui-web
```

```html
<jalali-inline-calendar id="cal" system="jalali" locale="en"></jalali-inline-calendar>
<jalali-range-picker id="range" system="jalali" locale="en"></jalali-range-picker>
<script type="module">
  import '@jalali-js/web/date-picker.css';
  import '@jalali-js/ui-web/themes/dark.css';
  import '@jalali-js/ui-web';

  document.getElementById('cal').addEventListener('select', (e) => console.log(e.detail.date));
  document.getElementById('range').addEventListener('change', (e) => console.log(e.detail.value));
</script>
```

`<jalali-range-picker>`: two-click range selection (first click sets the start, second sets the
end and closes the popover); clicking before the current start restarts the range instead of
erroring; hovering after a start is picked previews the range a completed selection would
produce. `<jalali-inline-calendar>`: `<jalali-calendar>` registered under a second, more
discoverable tag name, for an always-visible grid with no popover. `themes/dark.css` and
`themes/compact.css` each override a disjoint set of the shared `--jalali-*` custom properties,
so they compose by importing both.

[Guide and API reference](https://yanovian.github.io/jalali-js/) ·
[Examples](https://yanovian.github.io/jalali-js/guide/examples) ·
[Playground](https://yanovian.github.io/jalali-js/playground/vanilla/)

MIT licensed.
