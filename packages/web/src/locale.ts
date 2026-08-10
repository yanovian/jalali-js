import type { LocalePack } from '@jalali-js/i18n';
import { en, fa, ps } from '@jalali-js/i18n';

export type LocaleCode = 'en' | 'fa' | 'ps';

const localePacks: Record<LocaleCode, LocalePack> = { en, fa, ps };

export function localePackFor(locale: LocaleCode): LocalePack {
  return localePacks[locale];
}

/** Reads a `locale` attribute value; an unknown or missing value falls back to 'en', the same
 * default every element starts with. */
export function parseLocaleAttribute(value: string | null): LocaleCode {
  return value !== null && value in localePacks ? (value as LocaleCode) : 'en';
}
