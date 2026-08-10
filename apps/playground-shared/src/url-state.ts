export type DemoTab =
  | 'date-picker'
  | 'range-picker'
  | 'inline-calendar'
  | 'event-calendar'
  | 'time-picker'
  | 'datetime-picker'
  | 'time-range-picker'
  | 'position';

export type DemoLocale = 'en' | 'fa' | 'ps';
export type DemoSystem = 'jalali' | 'gregorian';
export type DemoVariant = 'grid' | 'dropdown';
export type DemoEventView = 'month' | 'week' | 'day';
export type DemoValueFormat = 'gregorian-iso' | 'jalali-object';

export interface DemoThemeVars {
  primary: string;
  bg: string;
  radius: string;
  gap: string;
}

export interface DemoState {
  tab: DemoTab;
  locale: DemoLocale;
  system: DemoSystem;
  variant: DemoVariant;
  valueFormat: DemoValueFormat;
  displayStyle: 'short' | 'long';
  dark: boolean;
  compact: boolean;
  dir: 'ltr' | 'rtl' | 'auto';
  eventView: DemoEventView;
  minuteStep: number;
  showHolidays: boolean;
  theme: DemoThemeVars;
}

export const DEFAULT_DEMO_STATE: DemoState = {
  tab: 'date-picker',
  locale: 'fa',
  system: 'jalali',
  variant: 'grid',
  valueFormat: 'gregorian-iso',
  displayStyle: 'short',
  dark: true,
  compact: true,
  // Host layout direction. 'auto' means ltr for the demo chrome and stage.
  // Pickers keep their own locale direction on their roots.
  dir: 'ltr',
  eventView: 'month',
  minuteStep: 15,
  showHolidays: false,
  theme: {
    primary: '',
    bg: '',
    radius: '',
    gap: '',
  },
};

/** Stable gallery cells the visual e2e suite screenshots. */
export const GALLERY_CELLS = [
  'grid-en-jalali',
  'grid-fa-jalali',
  'grid-ps-jalali',
  'dropdown',
  'gregorian',
  'inline-calendar',
  'range-picker',
  'time-picker',
  'datetime-picker',
  'time-range-picker',
  'event-calendar',
  'event-calendar-week',
  'event-calendar-day',
  'selection-rules',
  'holidays',
  'custom-theme',
] as const;

export type GalleryCellId = (typeof GALLERY_CELLS)[number];

const TABS: readonly DemoTab[] = [
  'date-picker',
  'range-picker',
  'inline-calendar',
  'event-calendar',
  'time-picker',
  'datetime-picker',
  'time-range-picker',
  'position',
];

function parseBool(value: string | null, fallback: boolean): boolean {
  if (value === '1' || value === 'true') return true;
  if (value === '0' || value === 'false') return false;
  return fallback;
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Read demo state from a query string. Missing keys use fixed defaults. */
export function parseDemoState(search: string): DemoState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const d = DEFAULT_DEMO_STATE;
  return {
    tab: oneOf(params.get('tab'), TABS, d.tab),
    locale: oneOf(params.get('locale'), ['en', 'fa', 'ps'] as const, d.locale),
    system: oneOf(params.get('system'), ['jalali', 'gregorian'] as const, d.system),
    variant: oneOf(params.get('variant'), ['grid', 'dropdown'] as const, d.variant),
    valueFormat: oneOf(
      params.get('valueFormat'),
      ['gregorian-iso', 'jalali-object'] as const,
      d.valueFormat,
    ),
    displayStyle: oneOf(params.get('displayStyle'), ['short', 'long'] as const, d.displayStyle),
    dark: parseBool(params.get('dark'), d.dark),
    compact: parseBool(params.get('compact'), d.compact),
    dir: oneOf(params.get('dir'), ['ltr', 'rtl', 'auto'] as const, d.dir),
    eventView: oneOf(params.get('eventView'), ['month', 'week', 'day'] as const, d.eventView),
    minuteStep: Number(params.get('minuteStep')) || d.minuteStep,
    showHolidays: parseBool(params.get('showHolidays'), d.showHolidays),
    theme: {
      primary: params.get('themePrimary') ?? '',
      bg: params.get('themeBg') ?? '',
      radius: params.get('themeRadius') ?? '',
      gap: params.get('themeGap') ?? '',
    },
  };
}

/** Build a query string. Omits keys that match the default so links stay short. */
export function serializeDemoState(state: DemoState): string {
  const d = DEFAULT_DEMO_STATE;
  const params = new URLSearchParams();
  const set = (key: string, value: string, fallback: string) => {
    if (value !== fallback) params.set(key, value);
  };
  set('tab', state.tab, d.tab);
  set('locale', state.locale, d.locale);
  set('system', state.system, d.system);
  set('variant', state.variant, d.variant);
  set('valueFormat', state.valueFormat, d.valueFormat);
  set('displayStyle', state.displayStyle, d.displayStyle);
  set('dark', state.dark ? '1' : '0', d.dark ? '1' : '0');
  set('compact', state.compact ? '1' : '0', d.compact ? '1' : '0');
  set('dir', state.dir, d.dir);
  set('eventView', state.eventView, d.eventView);
  set('minuteStep', String(state.minuteStep), String(d.minuteStep));
  set('showHolidays', state.showHolidays ? '1' : '0', d.showHolidays ? '1' : '0');
  if (state.theme.primary) params.set('themePrimary', state.theme.primary);
  if (state.theme.bg) params.set('themeBg', state.theme.bg);
  if (state.theme.radius) params.set('themeRadius', state.theme.radius);
  if (state.theme.gap) params.set('themeGap', state.theme.gap);
  const q = params.toString();
  return q ? `?${q}` : '';
}

/** Explicit URL for visual e2e: dark + compact + fa (same as the page defaults). */
export const E2E_DEFAULT_SEARCH = '?dark=1&locale=fa&compact=1';

/** Non-default shell state for a second demo-shell screenshot. */
export const E2E_SHELL_ALT_SEARCH = '?tab=date-picker&locale=en&dark=0&compact=0';

export function writeDemoStateToUrl(state: DemoState): void {
  const next = `${window.location.pathname}${serializeDemoState(state)}${window.location.hash}`;
  window.history.replaceState(null, '', next);
}

export function themeStyleFromState(theme: DemoThemeVars): Record<string, string> {
  const style: Record<string, string> = {};
  if (theme.primary) {
    style['--jalali-primary'] = theme.primary;
    style['--jalali-primary-fg'] = '#ffffff';
  }
  if (theme.bg) style['--jalali-bg'] = theme.bg;
  if (theme.radius) style['--jalali-radius'] = theme.radius;
  if (theme.gap) style['--jalali-gap'] = theme.gap;
  return style;
}
