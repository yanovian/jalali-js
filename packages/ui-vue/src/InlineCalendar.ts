/**
 * An always-visible calendar grid, with no input or popover around it: exactly `Calendar` from
 * `@jalali-js/vue`, re-exported under a more discoverable name for a consumer looking for "an
 * inline calendar" specifically. There is no separate implementation to keep in sync: a
 * calendar-grid popup (`DatePicker`) and an inline calendar both already reduce to "render
 * `Calendar` somewhere," the difference is only whether something else wraps it in a popover.
 */
export { Calendar as InlineCalendar } from '@jalali-js/vue';
