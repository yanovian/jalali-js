import { JalaliCalendarElement } from '@jalali-js/web';

// Not a separate implementation: an inline calendar and a headless grid are the same element,
// the difference is only whether something else wraps it in a popover (see @jalali-js/web's
// <jalali-date-picker>). This subclass exists only because the Custom Elements registry allows
// one tag name per class; it adds a second, more discoverable tag for the exact same behavior.
export class JalaliInlineCalendarElement extends JalaliCalendarElement {}

export function defineInlineCalendarElement(): void {
  if (!customElements.get('jalali-inline-calendar')) {
    customElements.define('jalali-inline-calendar', JalaliInlineCalendarElement);
  }
}
