import type { LocalePack } from './locale.js';
import { en } from './en.js';
import { fa } from './fa.js';
import { ps } from './ps.js';

/** The locale codes with a bundled `LocalePack`. A new locale adds one entry here and one
 * entry in the table below; the react, vue, and web bindings re-export both, so they need no
 * change of their own. */
export type LocaleCode = 'en' | 'fa' | 'ps';

const localePacks: Record<LocaleCode, LocalePack> = { en, fa, ps };

export function localePackFor(locale: LocaleCode): LocalePack {
  return localePacks[locale];
}

/** True when `value` is a known locale code. For callers that read untyped input, such as a
 * custom element's attribute. */
export function isLocaleCode(value: string): value is LocaleCode {
  return value in localePacks;
}
