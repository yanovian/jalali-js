---
description: Headless styling, CSS themes, range picker, and inline calendar options.
---

# Configuration and theming

## Visual configuration matrix

Every picker combines these independent axes; each is a plain prop or an imported stylesheet,
never a fork or a separate component:

| Axis                   | Values                                                           | Set via                            |
| ---------------------- | ---------------------------------------------------------------- | ---------------------------------- |
| Calendar system        | `jalali`, `gregorian`                                            | `system` prop                      |
| Locale                 | `en`, `fa`, `ps` (drives digits, month/weekday names, direction) | `locale` prop                      |
| Precision              | date, date+time, date+time+timezone                              | Which value type you pass in       |
| Display format         | long/short, with/without weekday, Persian/Latin digits           | `displayFormat` prop               |
| Value format (storage) | Gregorian ISO, Jalali object, and others                         | `valueFormat` prop                 |
| Picker UI variant      | grid popup (default), dropdown fields                            | `variant` prop (`DatePicker` only) |
| Theme                  | default, `dark`, `compact`, or any combination                   | Which stylesheets you import       |

## Headless or styled

`Calendar` (React and Vue) is the headless primitive: plain markup with `data-jalali-*`
attributes and no required CSS, so you can restyle it completely. `DatePicker` is the same
primitive with a popover and a default stylesheet around it. Import
`@jalali-js/react/date-picker.css` (or the Vue equivalent) for a usable look with no styling
work, or skip the import and style the data attributes yourself; nothing about the components
requires the stylesheet to function.

## The theming contract

`date-picker.css` expresses every rule through `--jalali-*` custom properties, not literal
values. A theme is a stylesheet that overrides some subset of these on the same selectors
(`[data-jalali-datepicker-root]`, `[data-jalali-datepicker-dropdown]`,
`[data-jalali-timepicker-root]`, `[data-jalali-timerangepicker-root]`,
`[data-jalali-calendar-root]`); it never redefines a rule.

| Variable                   | Controls                                                   |
| -------------------------- | ---------------------------------------------------------- |
| `--jalali-font`            | Font family                                                |
| `--jalali-font-size`       | Base font size                                             |
| `--jalali-line-height`     | Base line height                                           |
| `--jalali-bg`              | Background color (input, popover)                          |
| `--jalali-fg`              | Text color                                                 |
| `--jalali-muted-fg`        | Secondary text color (weekday headers, outside-month days) |
| `--jalali-border`          | Border color                                               |
| `--jalali-radius`          | Corner radius (input, popover, month/year cells)           |
| `--jalali-day-radius`      | Corner radius for day cells and nav controls               |
| `--jalali-primary`         | Accent color: today's ring, selected/range-endpoint fill   |
| `--jalali-primary-fg`      | Text color on top of `--jalali-primary`                    |
| `--jalali-shadow`          | Popover drop shadow                                        |
| `--jalali-gap`             | Gap between grid cells                                     |
| `--jalali-header-gap`      | Gap and margin in the calendar header                      |
| `--jalali-control-size`    | Width and height of nav controls                           |
| `--jalali-input-padding`   | Padding inside the text input and fields                   |
| `--jalali-popover-padding` | Padding inside the popover and event calendar              |
| `--jalali-cell-padding`    | Padding inside month and year picker cells                 |
| `--jalali-day-min-size`    | Minimum width/height of a day cell                         |
| `--jalali-weekday-size`    | Font size for weekday headers                              |
| `--jalali-event-bg`        | Event chip background                                      |
| `--jalali-event-fg`        | Event chip text                                            |
| `--jalali-holiday-fg`      | Holiday day text                                           |
| `--jalali-hover-bg`        | Hover fill for days and nav                                |
| `--jalali-range-bg`        | In-range day fill for `RangePicker`                        |
| `--jalali-focus-ring`      | `:focus-visible` outline color                             |

Default and `dark` theme tokens aim for WCAG 2.2 AA text contrast and about
3:1 for borders. The stylesheet also responds to `prefers-contrast: more`
and `forced-colors: active`. The default density is already compact on phone
and laptop. Import `themes/compact.css` only when you need a denser dashboard
scale.

Because CSS custom properties inherit, a theme applies to every picker on the page once its
stylesheet is imported: theming is a whole-app choice, not a per-instance prop. For a single
themed section, scope your own override under a parent selector, following the same pattern
(override the variables, never fight the rules).

## Extra themes

`@jalali-js/ui-react` and `@jalali-js/ui-vue` ship two ready-made themes, each overriding a
disjoint set of variables so they compose by importing both:

```ts
import '@jalali-js/react/date-picker.css';
import '@jalali-js/ui-react/themes/dark.css'; // colors
import '@jalali-js/ui-react/themes/compact.css'; // spacing and sizing
```

## Range picker, event calendar, and inline calendar

`@jalali-js/ui-react` (and `@jalali-js/ui-vue`) add more components on the same headless
primitives:

- **`RangePicker`**: a start/end date-range picker. Two-click selection (first click sets the
  start, second sets the end and closes the popover); clicking before the current start
  restarts the range from the new point instead of erroring. Hovering after a start is picked
  previews the range a completed selection would produce.
- **`EventCalendar`**: a month grid for consumer-owned events. See
  [Event calendar](/guide/event-calendar).
- **`InlineCalendar`**: `Calendar` re-exported under a more discoverable name, for an
  always-visible grid with no popover around it.

See the [React](/guide/react) and [Vue](/guide/vue) guides for full prop lists, and the
[API reference](/api/@jalali-js/ui-react/) for `@jalali-js/ui-react`'s generated types.
