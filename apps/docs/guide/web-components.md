---
description: Framework-free Web Components pickers for plain HTML or any host framework.
---

# Vanilla / Web Components

```sh
npm install @jalali-js/web
```

`@jalali-js/web` needs no framework. It ships plain
[Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) (custom
elements), so it works in plain HTML and JavaScript, and drops into React, Vue, Svelte, Angular,
or any other framework the same way any other HTML element does.

## `<jalali-calendar>`: the headless primitive

A month grid with `data-jalali-calendar-*` attributes and no required CSS.

```html
<jalali-calendar id="cal" system="jalali" locale="en"></jalali-calendar>
<script type="module">
  import '@jalali-js/web';

  const cal = document.getElementById('cal');
  cal.addEventListener('select', (event) => {
    console.log(event.detail.date);
  });
</script>
```

`system`, `locale`, and `quick-nav` are plain HTML attributes. `.value` (the current selection,
or `null`) is a property only, since a `CalendarDate` is not representable as a plain attribute
string.

## `<jalali-date-picker>`: a working, default-styled picker

```html
<jalali-date-picker id="picker" system="jalali" locale="fa"></jalali-date-picker>
<script type="module">
  import '@jalali-js/web/date-picker.css';
  import '@jalali-js/web';

  document.getElementById('picker').addEventListener('change', (event) => {
    // event.detail: { value, date }. value: storage value (Gregorian ISO by default); see
    // "Display value vs. storage value". date: the raw CalendarDate.
  });
</script>
```

`variant="dropdown"` swaps the calendar-grid popup for three plain year/month/day `<select>`s,
for narrow, known-range entry such as a date of birth:

```html
<jalali-date-picker system="jalali" locale="en" variant="dropdown"></jalali-date-picker>
```

A person can click the month or year in the grid popup's header to jump straight to a month
grid or a year grid, instead of paging one month at a time. This is on by default; set
`quick-nav="false"` to turn it off. Set `.defaultDate = null` (a property, not an attribute) for
no initial selection, so the picker opens empty and shows its placeholder until someone picks a
date; leave it unset for today's date.

Full property and event list: [`JalaliDatePickerElement`](/api/@jalali-js/web/classes/JalaliDatePickerElement).

## Range picker, event calendar, and inline calendar

`@jalali-js/ui-web` adds `<jalali-range-picker>`, `<jalali-event-calendar>`, and
`<jalali-inline-calendar>` on the same primitives; see
[Configuration and theming](/guide/theming#range-picker-event-calendar-and-inline-calendar) and
[Event calendar](/guide/event-calendar).

```sh
npm install @jalali-js/ui-web
```

```html
<jalali-inline-calendar system="jalali" locale="en"></jalali-inline-calendar>
<jalali-range-picker system="jalali" locale="en"></jalali-range-picker>
<jalali-event-calendar system="jalali" locale="en"></jalali-event-calendar>
<script type="module">
  import '@jalali-js/ui-web';
</script>
```

## Attribute and property tables

Boolean attributes use presence for on. Set `"false"` to turn them off. Objects
(`rules`, `defaultDate`, `events`) are JavaScript properties only.

### `<jalali-date-picker>`

| Name             | Kind  | Default         | Meaning                                  |
| ---------------- | ----- | --------------- | ---------------------------------------- |
| `system`         | attr  | `jalali`        | Display calendar                         |
| `locale`         | attr  | `en`            | UI language                              |
| `variant`        | attr  | `grid`          | `grid` or `dropdown`                     |
| `precision`      | attr  | `date`          | `date` or `datetime`                     |
| `minute-step`    | attr  | `1`             | Minute step                              |
| `disabled-hours` | attr  | -               | Comma-separated hours                    |
| `value-format`   | attr  | `gregorian-iso` | Storage shape                            |
| `placeholder`    | attr  | locale pack     | Empty input text                         |
| `quick-nav`      | attr  | on              | Month and year jump grids                |
| `show-holidays`  | attr  | off             | Mark holidays                            |
| `block-holidays` | attr  | off             | Block holidays                           |
| `holiday-region` | attr  | `IR`            | Holiday pack                             |
| `defaultDate`    | prop  | today           | Initial selection. `null` is empty       |
| `rules`          | prop  | -               | Selection limits                         |
| `value`          | prop  | -               | Get or set selection (set does not emit) |
| `change`         | event | -               | `{ value, date }`                        |

### `<jalali-calendar>` / `<jalali-inline-calendar>`

| Name                    | Kind  | Default  | Meaning                   |
| ----------------------- | ----- | -------- | ------------------------- |
| `system`                | attr  | `jalali` | Display calendar          |
| `locale`                | attr  | `en`     | UI language               |
| `quick-nav`             | attr  | on       | Month and year jump grids |
| `show-holidays`         | attr  | off      | Mark holidays             |
| `block-holidays`        | attr  | off      | Block holidays            |
| `holiday-region`        | attr  | `IR`     | Holiday pack              |
| `value`                 | prop  | `null`   | Selected day              |
| `rules`                 | prop  | -        | Selection limits          |
| `initialDisplayedMonth` | prop  | -        | Opening month             |
| `select`                | event | -        | `{ date }`                |

### `<jalali-time-picker>`

| Name             | Kind  | Default  | Meaning               |
| ---------------- | ----- | -------- | --------------------- |
| `locale`         | attr  | `en`     | Digits language       |
| `minute-step`    | attr  | `1`      | Minute options step   |
| `disabled-hours` | attr  | -        | Comma-separated hours |
| `value`          | prop  | midnight | Current time          |
| `change`         | event | -        | `{ time }`            |

### `<jalali-range-picker>`

| Name                                                  | Kind  | Default             | Meaning              |
| ----------------------------------------------------- | ----- | ------------------- | -------------------- |
| `system` / `locale` / `value-format` / `placeholder`  | attr  | same as date picker | Shared picker attrs  |
| `show-holidays` / `block-holidays` / `holiday-region` | attr  | off / off / `IR`    | Holiday flags        |
| `defaultRange`                                        | prop  | -                   | Initial range        |
| `rules`                                               | prop  | -                   | Day and range limits |
| `change`                                              | event | -                   | `{ value, range }`   |

### `<jalali-time-range-picker>`

| Name             | Kind  | Default            | Meaning               |
| ---------------- | ----- | ------------------ | --------------------- |
| `locale`         | attr  | `en`               | Digits language       |
| `minute-step`    | attr  | `1`                | Minute step           |
| `disabled-hours` | attr  | -                  | Comma-separated hours |
| `defaultRange`   | prop  | `09:00` to `17:00` | Initial range         |
| `change`         | event | -                  | `{ range }`           |

### `<jalali-event-calendar>`

| Name                    | Kind  | Default  | Meaning                                |
| ----------------------- | ----- | -------- | -------------------------------------- |
| `system`                | attr  | `jalali` | Display calendar                       |
| `locale`                | attr  | `en`     | UI language                            |
| `view`                  | attr  | `month`  | `month`, `week`, `day`, or `timeline`  |
| `timeline`              | prop  | -        | Timeline options (`layout`, and so on) |
| `events`                | prop  | `[]`     | Events to layout                       |
| `initialDisplayedMonth` | prop  | -        | Month anchor                           |
| `initialDate`           | prop  | today    | Week or day anchor                     |
| `event-click`           | event | -        | `{ event }`                            |
| `day-click`             | event | -        | `{ date }`                             |

## No shadow DOM, on purpose

These elements render in light DOM: no `attachShadow()`, no encapsulation boundary. That is
what makes `@jalali-js/web/date-picker.css` (and the `compact`/`dark` themes from
`@jalali-js/ui-web/themes`) the exact same stylesheets the React and Vue bindings use, styling
the exact same `[data-jalali-*]` attributes either way. A team already running one of those
themes across React and Vue can drop a `<jalali-date-picker>` into a plain HTML page, or into a
framework this project has no dedicated binding for, and it looks identical with zero new CSS.
