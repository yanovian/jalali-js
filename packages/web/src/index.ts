import { defineCalendarElements } from './Calendar.js';
import { defineDatePickerElement } from './DatePicker.js';
import { defineDropdownDateFieldsElement } from './DropdownDateFields.js';

export { JalaliCalendarElement, defineCalendarElements } from './Calendar.js';
export type { CalendarSelectEventDetail } from './Calendar.js';
export { JalaliDatePickerElement, defineDatePickerElement } from './DatePicker.js';
export type { DatePickerChangeEventDetail, Variant } from './DatePicker.js';
export {
  JalaliDropdownDateFieldsElement,
  defineDropdownDateFieldsElement,
} from './DropdownDateFields.js';
export type { DropdownDateFieldsChangeEventDetail } from './DropdownDateFields.js';
export { localePackFor } from './locale.js';
export type { LocaleCode } from './locale.js';

// package.json sets "sideEffects": true so a bundler never tree-shakes these calls away: unlike
// a React/Vue component, a custom element is useless until `customElements.define()` actually
// runs, and nothing in this file's exports forces that on its own.
defineCalendarElements();
defineDropdownDateFieldsElement();
defineDatePickerElement();
