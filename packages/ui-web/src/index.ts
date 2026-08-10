import { defineInlineCalendarElement } from './InlineCalendar.js';
import { defineRangePickerElement } from './RangePicker.js';
import { defineTimeRangePickerElement } from './TimeRangePicker.js';

export { JalaliInlineCalendarElement, defineInlineCalendarElement } from './InlineCalendar.js';
export { JalaliRangePickerElement, defineRangePickerElement } from './RangePicker.js';
export type { DateRange, RangePickerChangeEventDetail, RangeStorageValue } from './RangePicker.js';
export { JalaliTimeRangePickerElement, defineTimeRangePickerElement } from './TimeRangePicker.js';
export type { TimeRange, TimeRangePickerChangeEventDetail } from './TimeRangePicker.js';

// package.json sets "sideEffects": true, the same reason @jalali-js/web does: a bundler must
// never tree-shake these calls away, or the elements never register.
defineInlineCalendarElement();
defineRangePickerElement();
defineTimeRangePickerElement();
