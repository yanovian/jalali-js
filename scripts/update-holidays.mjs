#!/usr/bin/env node
/**
 * Iran lunar holiday maintenance.
 *
 *   make update-holidays                 # rebuild table from JSON
 *   make update-holidays YEARS=next      # fetch max+1, write JSON, rebuild
 *   make update-holidays YEARS=1426
 *   make update-holidays YEARS="1426 1427"
 *
 * Lunar JSON only. Fixed solar rules: src/regions/ir/fixed.ts.
 * Names: src/regions/ir/names/{en,fa,ps}.ts.
 * Lunar ids: IRAN_LUNAR_HOLIDAY_IDS in src/regions/ir/ids.ts.
 */

import { spawnSync } from 'node:child_process';
import { access, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'packages/holidays/data/ir/lunar');
const IDS_FILE = path.join(ROOT, 'packages/holidays/src/regions/ir/ids.ts');
const OUT_FILE = path.join(ROOT, 'packages/holidays/src/regions/ir/lunar-table.ts');
const CORE_DIST = path.join(ROOT, 'packages/core/dist/index.js');
const SOURCE_NOTE =
  'University of Tehran Calendar Centre / official Iran holiday list (via emrooz.app). Martyrdom of Imam Reza is 30 Safar, two Jalali days after Demise of the Prophet when the source omits it.';

/**
 * @typedef {{ month: number, day: number, id: string }} LunarEntry
 * @typedef {{ year: number, source: string, entries: LunarEntry[] }} LunarYearFile
 * @typedef {{ year: number, month: number, day: number }} Ymd
 * @typedef {{ fromGregorian: (date: Ymd, system: 'jalali') => Ymd, toGregorian: (date: Ymd, system: 'jalali') => Ymd }} Core
 */

/** @type {ReadonlyArray<{ id: string, match: RegExp }>} */
const TITLE_RULES = [
  { id: 'eyd-fetr-holiday', match: /eid al-fitr holiday/i },
  { id: 'eyd-fetr', match: /^eid al-fitr$/i },
  { id: 'eyd-qorban', match: /eid al-adha|eid al-qurban/i },
  { id: 'eyd-ghadir', match: /ghadir/i },
  { id: 'tasua', match: /tasua/i },
  { id: 'ashura', match: /ashura/i },
  { id: 'arbain', match: /arba'?een|arbain/i },
  { id: 'demise-prophet', match: /demise of the holy prophet/i },
  { id: 'martyrdom-imam-reza', match: /imam reza|imam ri[dḍ]a/i },
  { id: 'martyrdom-imam-askari', match: /askari/i },
  { id: 'birth-prophet', match: /birth of the holy prophet/i },
  { id: 'martyrdom-fatemeh', match: /fatimah|fatemeh/i },
  { id: 'birth-imam-ali', match: /birth of imam ali/i },
  { id: 'mabas', match: /mab'?ath|mabas/i },
  { id: 'birth-imam-mahdi', match: /mahdi|ghaem|qa'?im/i },
  { id: 'martyrdom-imam-ali', match: /martyrdom of imam ali/i },
  {
    id: 'martyrdom-imam-sadegh',
    match: /martyrdom of imam ja'?far|martyrdom.*sadiq|martyrdom.*sadegh/i,
  },
];

/** @param {LunarEntry} a @param {LunarEntry} b */
function compareEntries(a, b) {
  return a.month - b.month || a.day - b.day || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

/** @param {string} source @returns {Set<string>} */
function readLunarIds(source) {
  const match = source.match(/export const IRAN_LUNAR_HOLIDAY_IDS = \[([\s\S]*?)\] as const/);
  if (!match) throw new Error(`Could not find IRAN_LUNAR_HOLIDAY_IDS in ${IDS_FILE}`);
  const ids = [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
  if (ids.length === 0) throw new Error(`IRAN_LUNAR_HOLIDAY_IDS is empty in ${IDS_FILE}`);
  return new Set(ids);
}

/** @param {unknown} value @param {Set<string>} knownIds @returns {value is LunarYearFile} */
function isYearFile(value, knownIds) {
  if (!value || typeof value !== 'object') return false;
  const file = /** @type {Record<string, unknown>} */ (value);
  if (typeof file.year !== 'number' || !Number.isInteger(file.year)) return false;
  if (typeof file.source !== 'string' || file.source.length === 0) return false;
  if (!Array.isArray(file.entries)) return false;
  return file.entries.every((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const row = /** @type {Record<string, unknown>} */ (entry);
    return (
      typeof row.month === 'number' &&
      Number.isInteger(row.month) &&
      row.month >= 1 &&
      row.month <= 12 &&
      typeof row.day === 'number' &&
      Number.isInteger(row.day) &&
      row.day >= 1 &&
      row.day <= 31 &&
      typeof row.id === 'string' &&
      knownIds.has(row.id)
    );
  });
}

/** @param {string[]} argv @returns {Array<number | 'next'>} */
function parseYearArgs(argv) {
  return argv.map((arg) => {
    if (arg === 'next') return 'next';
    if (!/^\d{4}$/.test(arg)) {
      throw new Error(`Unknown argument "${arg}". Pass Jalali years or next.`);
    }
    return Number(arg);
  });
}

/** @returns {Promise<number>} */
async function maxExistingYear() {
  const years = (await readdir(DATA_DIR))
    .filter((name) => name.endsWith('.json'))
    .map((name) => Number(name.replace(/\.json$/, '')))
    .filter(Number.isInteger);
  if (years.length === 0) throw new Error(`No lunar JSON files found in ${DATA_DIR}`);
  return Math.max(...years);
}

/** @returns {Promise<Core>} */
async function loadCore() {
  try {
    await access(CORE_DIST);
  } catch {
    console.log('Building jalali-js core...');
    const result = spawnSync('pnpm', ['--filter', 'jalali-js', 'build'], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    if (result.status !== 0) throw new Error('Failed to build packages/core');
  }
  return import(pathToFileURL(CORE_DIST).href);
}

/** @param {string} title */
function lunarIdForTitle(title) {
  for (const rule of TITLE_RULES) {
    if (rule.match.test(title.trim())) return rule.id;
  }
  return null;
}

/** @param {string} html */
function eventsFromHtml(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error('emrooz page has no JSON-LD holiday list');
  const data = JSON.parse(match[1]);
  const list = Array.isArray(data) ? data.find((entry) => entry?.['@type'] === 'ItemList') : data;
  const items = list?.itemListElement;
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('emrooz JSON-LD ItemList is empty');
  }
  return items.map((item) => {
    const event = item?.item ?? item;
    const name = event?.name;
    const startDate = event?.startDate;
    if (typeof name !== 'string' || typeof startDate !== 'string') {
      throw new Error('emrooz event is missing name or startDate');
    }
    const [year, month, day] = startDate.split('-').map(Number);
    if (![year, month, day].every(Number.isInteger)) {
      throw new Error(`Invalid startDate "${startDate}"`);
    }
    return { name, gregorian: { year, month, day } };
  });
}

/**
 * @param {number} year
 * @param {Core} core
 * @param {Set<string>} knownIds
 */
async function fetchYear(year, core, knownIds) {
  const url = `https://emrooz.app/en/holidays/${year}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url} (${response.status})`);

  /** @type {Map<string, LunarEntry>} */
  const byKey = new Map();
  for (const event of eventsFromHtml(await response.text())) {
    const id = lunarIdForTitle(event.name);
    if (!id) continue;
    if (!knownIds.has(id)) throw new Error(`Mapped id "${id}" is not in IRAN_LUNAR_HOLIDAY_IDS`);
    const jalali = core.fromGregorian(event.gregorian, 'jalali');
    if (jalali.year !== year) continue;
    byKey.set(`${jalali.month}-${jalali.day}-${id}`, {
      month: jalali.month,
      day: jalali.day,
      id,
    });
  }

  const entries = [...byKey.values()].sort(compareEntries);

  if (!entries.some((entry) => entry.id === 'martyrdom-imam-reza')) {
    const demise = entries.find((entry) => entry.id === 'demise-prophet');
    if (demise) {
      const g = core.toGregorian({ year, month: demise.month, day: demise.day }, 'jalali');
      const shifted = new Date(Date.UTC(g.year, g.month - 1, g.day + 2));
      const reza = core.fromGregorian(
        {
          year: shifted.getUTCFullYear(),
          month: shifted.getUTCMonth() + 1,
          day: shifted.getUTCDate(),
        },
        'jalali',
      );
      if (reza.year === year) {
        entries.push({ month: reza.month, day: reza.day, id: 'martyrdom-imam-reza' });
        entries.sort(compareEntries);
      }
    }
  }

  if (entries.length === 0) {
    throw new Error(`No lunar holidays mapped for Jalali year ${year} from ${url}`);
  }
  return { year, source: SOURCE_NOTE, entries };
}

/** @param {string} filePath @param {string} next @param {string} label */
async function writeIfChanged(filePath, next, label) {
  let previous = null;
  try {
    previous = await readFile(filePath, 'utf8');
  } catch {
    // Missing file: write below.
  }
  if (previous === next) {
    console.log(`Unchanged ${label}`);
    return false;
  }
  await writeFile(filePath, next, 'utf8');
  console.log(`Wrote ${label}`);
  return true;
}

/** @param {LunarYearFile} yearFile */
async function writeYearFile(yearFile) {
  const rel = `packages/holidays/data/ir/lunar/${yearFile.year}.json`;
  return writeIfChanged(path.join(ROOT, rel), `${JSON.stringify(yearFile, null, 2)}\n`, rel);
}

/** @param {Set<string>} knownIds */
async function rebuildTable(knownIds) {
  const names = (await readdir(DATA_DIR)).filter((name) => name.endsWith('.json')).sort();
  if (names.length === 0) throw new Error(`No lunar JSON files found in ${DATA_DIR}`);

  /** @type {LunarYearFile[]} */
  const years = [];
  for (const name of names) {
    const raw = JSON.parse(await readFile(path.join(DATA_DIR, name), 'utf8'));
    if (!isYearFile(raw, knownIds)) throw new Error(`Invalid lunar year file: ${name}`);
    if (name !== `${raw.year}.json`) throw new Error(`File ${name} must be named ${raw.year}.json`);
    years.push(raw);
  }

  const min = years[0].year;
  const max = years[years.length - 1].year;
  for (let year = min; year <= max; year++) {
    if (!years.some((entry) => entry.year === year)) {
      throw new Error(`Lunar table has a gap at year ${year}`);
    }
  }

  const lines = [
    '/* Generated by scripts/update-holidays.mjs. Do not edit by hand. */',
    "import type { IranLunarHolidayId } from './ids.js';",
    '',
    'export interface LunarHolidayEntry {',
    '  month: number;',
    '  day: number;',
    '  id: IranLunarHolidayId;',
    '}',
    '',
    '/** Inclusive Jalali year range covered by {@link LUNAR_BY_YEAR}. */',
    `export const LUNAR_YEAR_RANGE = { min: ${min}, max: ${max} } as const;`,
    '',
    '/** Iran lunar official holidays by Jalali year. */',
    'export const LUNAR_BY_YEAR: Readonly<Record<number, readonly LunarHolidayEntry[]>> = {',
  ];

  for (const yearFile of years) {
    lines.push(`  // ${yearFile.source}`);
    lines.push(`  ${yearFile.year}: [`);
    for (const entry of yearFile.entries) {
      lines.push(`    { month: ${entry.month}, day: ${entry.day}, id: '${entry.id}' },`);
    }
    lines.push('  ],');
  }
  lines.push('};');

  const rel = path.relative(ROOT, OUT_FILE);
  return writeIfChanged(OUT_FILE, `${lines.join('\n')}\n`, `${rel} (${min}-${max})`);
}

async function main() {
  const yearArgs = parseYearArgs(process.argv.slice(2));
  const knownIds = readLunarIds(await readFile(IDS_FILE, 'utf8'));
  let changed = false;

  if (yearArgs.length > 0) {
    const core = await loadCore();
    /** @type {number[]} */
    const resolved = [];
    for (const arg of yearArgs) {
      resolved.push(arg === 'next' ? (await maxExistingYear()) + 1 : arg);
    }
    for (const year of [...new Set(resolved)].sort((a, b) => a - b)) {
      if (await writeYearFile(await fetchYear(year, core, knownIds))) changed = true;
    }
  }

  if (await rebuildTable(knownIds)) changed = true;
  if (!changed && yearArgs.length > 0) console.log('Nothing has changed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
