import type { LocaleCode } from '@jalali-js/i18n';
import { isLocaleCode } from '@jalali-js/i18n';

// Re-exported so a consumer of this binding never needs to import @jalali-js/i18n directly.
// The locale table itself lives there, once, shared by every binding.
export type { LocaleCode } from '@jalali-js/i18n';
export { localePackFor } from '@jalali-js/i18n';

/** Reads a `locale` attribute value; an unknown or missing value falls back to 'en', the same
 * default every element starts with. */
export function parseLocaleAttribute(value: string | null): LocaleCode {
  return value !== null && isLocaleCode(value) ? value : 'en';
}
