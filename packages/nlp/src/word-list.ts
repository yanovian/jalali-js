import { en, fa, ps } from '@jalali-js/i18n';

/**
 * The languages this parser supports (see architecture.md's "Natural language date parsing"):
 * English, Farsi in Persian script, and Pashto (`'ps'`, Phase 12). English input accepts the
 * transliterated Jalali month names (`Mehr`, `Aban`, `Azar`); Farsi input uses Persian script.
 */
export type NlpLocale = 'en' | 'fa' | 'ps';

export interface WordList {
  today: readonly string[];
  tomorrow: readonly string[];
  yesterday: readonly string[];
  nextWeek: readonly string[];
  /** The word(s) meaning "next", used to build a "next Farvardin"-style phrase. */
  nextMonthMarkers: readonly string[];
  /** Whether the marker comes before the month name ('prefix', "next Farvardin") or after it
   * ('suffix', "فروردین آینده"). */
  nextMonthOrder: 'prefix' | 'suffix';
  /** 12 entries, index 0 is Farvardin (Jalali month 1). Each entry lists every accepted
   * spelling for that month, so more variants can be added without changing `parse()`. */
  monthNames: readonly (readonly string[])[];
}

function asVariantList(names: readonly string[]): readonly (readonly string[])[] {
  return names.map((name) => [name]);
}

export const en_wordList: WordList = {
  today: ['today'],
  tomorrow: ['tomorrow'],
  yesterday: ['yesterday'],
  nextWeek: ['next week'],
  nextMonthMarkers: ['next'],
  nextMonthOrder: 'prefix',
  // English transliterations of the Jalali months, reused from packages/i18n rather than
  // duplicated here (see architecture.md: "next to the locale data it depends on").
  monthNames: asVariantList(en.monthNames.jalali.long),
};

export const fa_wordList: WordList = {
  today: ['امروز'],
  tomorrow: ['فردا'],
  yesterday: ['دیروز'],
  nextWeek: ['هفته آینده', 'هفته بعد'],
  nextMonthMarkers: ['آینده', 'بعد'],
  nextMonthOrder: 'suffix',
  monthNames: asVariantList(fa.monthNames.jalali.long),
};

// Every phrase below except 'بله اونۍ' comes straight from CLDR's `ps` relative-time data,
// read through ICU (`Intl.RelativeTimeFormat('ps')`), the same verifiable source ps.ts's
// month and weekday names come from. 'بله اونۍ' ("the other/next week") is the common
// everyday variant, included the way fa's word list includes 'هفته بعد' next to CLDR's
// 'هفته آینده'. Pashto adjectives come before the noun (CLDR: 'راتلونکې اونۍ'), so the
// "next <month>" order is prefix, like English and unlike Farsi. Both gender forms of the
// "next" adjective are accepted, so a writer never has to know a month name's grammatical
// gender to be understood.
export const ps_wordList: WordList = {
  today: ['نن', 'نن ورځ'],
  tomorrow: ['سبا'],
  yesterday: ['پرون'],
  nextWeek: ['راتلونکې اونۍ', 'بله اونۍ'],
  nextMonthMarkers: ['راتلونکی', 'راتلونکې', 'بل', 'بله'],
  nextMonthOrder: 'prefix',
  monthNames: asVariantList(ps.monthNames.jalali.long),
};

export function getWordList(locale: NlpLocale): WordList {
  switch (locale) {
    case 'en':
      return en_wordList;
    case 'fa':
      return fa_wordList;
    case 'ps':
      return ps_wordList;
  }
}
