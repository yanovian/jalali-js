import { en, fa, ps } from '@jalali-js/i18n';

/**
 * The input styles this parser supports (see architecture.md's "Natural language date
 * parsing"). `'fa-Latn'` is Finglish: Farsi words written with Latin letters. The tag follows
 * the BCP 47 pattern of language plus script, the same shape a real BCP 47 tag for this would
 * take. `'ps'` is Pashto (Phase 12).
 */
export type NlpLocale = 'en' | 'fa' | 'fa-Latn' | 'ps';

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

export const faLatn_wordList: WordList = {
  today: ['emrooz', 'emruz', 'emrouz'],
  tomorrow: ['farda', 'fardaa'],
  yesterday: ['dirooz', 'diruz', 'dirouz'],
  nextWeek: ['hafte ayande', 'hafteh ayande', 'hafte baad', 'hafte bad'],
  nextMonthMarkers: ['ayande', 'aayande', 'baad', 'bad'],
  nextMonthOrder: 'suffix',
  // The same Latin transliterations as the English word list: these already are Finglish
  // spellings of the Jalali months, not English words, so they are shared rather than
  // re-typed. A month can still gain Finglish-specific variants later (see WordList's doc
  // comment) without this list needing to diverge from en_wordList for that reason alone.
  monthNames: asVariantList(en.monthNames.jalali.long),
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
    case 'fa-Latn':
      return faLatn_wordList;
    case 'ps':
      return ps_wordList;
  }
}
