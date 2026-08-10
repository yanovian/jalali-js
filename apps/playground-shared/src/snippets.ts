import type { DemoState } from './url-state.js';

function commonProps(state: DemoState): string {
  const lines = [
    `  system="${state.system}"`,
    `  locale="${state.locale}"`,
    `  valueFormat="${state.valueFormat}"`,
  ];
  if (state.tab === 'date-picker' || state.tab === 'datetime-picker') {
    lines.push(`  variant="${state.variant}"`);
  }
  if (state.tab === 'datetime-picker') {
    lines.push(`  precision="datetime"`);
    lines.push(`  minuteStep={${state.minuteStep}}`);
  }
  if (state.showHolidays && (state.tab === 'date-picker' || state.tab === 'inline-calendar')) {
    lines.push(`  showHolidays`);
    lines.push(`  holidayRegion="IR"`);
  }
  return lines.join('\n');
}

export function reactSnippet(state: DemoState): string {
  switch (state.tab) {
    case 'range-picker':
      return `import { RangePicker } from '@jalali-js/ui-react';\n\n<RangePicker\n${commonProps(state)}\n  onChange={(value) => console.log(value)}\n/>`;
    case 'inline-calendar':
      return `import { InlineCalendar } from '@jalali-js/ui-react';\n\n<InlineCalendar\n${commonProps(state)}\n  onSelect={(date) => console.log(date)}\n/>`;
    case 'event-calendar':
      return `import { EventCalendar } from '@jalali-js/ui-react';\n\n<EventCalendar\n  system="${state.system}"\n  locale="${state.locale}"\n  view="${state.eventView}"\n  events={events}\n/>`;
    case 'time-picker':
      return `import { TimePicker } from '@jalali-js/react';\n\n<TimePicker locale="${state.locale}" minuteStep={${state.minuteStep}} onChange={setTime} />`;
    case 'time-range-picker':
      return `import { TimeRangePicker } from '@jalali-js/ui-react';\n\n<TimeRangePicker locale="${state.locale}" minuteStep={${state.minuteStep}} onChange={setRange} />`;
    case 'datetime-picker':
      return `import { DatePicker } from '@jalali-js/react';\n\n<DatePicker\n${commonProps(state)}\n  onChange={(value) => console.log(value)}\n/>`;
    case 'position':
      return `import { DatePicker } from '@jalali-js/react';\n\n{/* Place near a screen edge. The popover flips and clamps. */}\n<DatePicker system="${state.system}" locale="${state.locale}" />`;
    default:
      return `import { DatePicker } from '@jalali-js/react';\n\n<DatePicker\n${commonProps(state)}\n  displayFormat={{ style: '${state.displayStyle}' }}\n  onChange={(value) => console.log(value)}\n/>`;
  }
}

export function vueSnippet(state: DemoState): string {
  return reactSnippet(state)
    .replaceAll('@jalali-js/react', '@jalali-js/vue')
    .replaceAll('@jalali-js/ui-react', '@jalali-js/ui-vue')
    .replaceAll('onChange={(value) => console.log(value)}', '@change="onChange"')
    .replaceAll('onSelect={(date) => console.log(date)}', '@select="onSelect"')
    .replaceAll('onChange={setTime}', '@change="onChange"')
    .replaceAll('onChange={setRange}', '@change="onChange"')
    .replaceAll('minuteStep={', ':minute-step="')
    .replaceAll('displayFormat={{ style: ', ':display-format="{ style: ')
    .replace(/' }}\n/, '\' }"\n');
}

export function webSnippet(state: DemoState): string {
  const attrs = [
    `system="${state.system}"`,
    `locale="${state.locale}"`,
    `value-format="${state.valueFormat}"`,
  ];
  if (state.tab === 'date-picker') attrs.push(`variant="${state.variant}"`);
  if (state.tab === 'datetime-picker') {
    attrs.push(`precision="datetime"`);
    attrs.push(`minute-step="${state.minuteStep}"`);
  }
  switch (state.tab) {
    case 'range-picker':
      return `<script type="module">\n  import '@jalali-js/ui-web';\n</script>\n\n<jalali-range-picker ${attrs.join(' ')}></jalali-range-picker>`;
    case 'inline-calendar':
      return `<script type="module">\n  import '@jalali-js/ui-web';\n</script>\n\n<jalali-inline-calendar ${attrs.join(' ')}></jalali-inline-calendar>`;
    case 'event-calendar':
      return `<script type="module">\n  import '@jalali-js/ui-web';\n</script>\n\n<jalali-event-calendar system="${state.system}" locale="${state.locale}" view="${state.eventView}"></jalali-event-calendar>`;
    case 'time-picker':
      return `<script type="module">\n  import '@jalali-js/web';\n</script>\n\n<jalali-time-picker locale="${state.locale}" minute-step="${state.minuteStep}"></jalali-time-picker>`;
    case 'time-range-picker':
      return `<script type="module">\n  import '@jalali-js/ui-web';\n</script>\n\n<jalali-time-range-picker locale="${state.locale}" minute-step="${state.minuteStep}"></jalali-time-range-picker>`;
    default:
      return `<script type="module">\n  import '@jalali-js/web';\n</script>\n\n<jalali-date-picker ${attrs.join(' ')}></jalali-date-picker>`;
  }
}
