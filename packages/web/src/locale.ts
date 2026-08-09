import type { LocalePack } from '@jalali-js/i18n';
import { en, fa } from '@jalali-js/i18n';

export type LocaleCode = 'en' | 'fa';

export function localePackFor(locale: LocaleCode): LocalePack {
  return locale === 'fa' ? fa : en;
}
