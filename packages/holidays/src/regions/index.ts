import type { HolidayRegion, RegionHolidayPack } from '../types.js';
import { iranHolidayPack } from './ir/index.js';

/** Default region for every public query and picker helper. */
export const DEFAULT_HOLIDAY_REGION: HolidayRegion = 'IR';

/**
 * Holiday packs that this package ships today. Afghanistan (`AF`) and
 * Tajikistan (`TJ`) are planned region codes; their packs are not shipped yet.
 */
const PACKS: Partial<Record<HolidayRegion, RegionHolidayPack>> = {
  IR: iranHolidayPack,
};

/** Region codes this package accepts. Only shipped packs resolve holidays. */
export const HOLIDAY_REGIONS = ['IR', 'AF', 'TJ'] as const;

/** Region codes that currently have holiday data. */
export const SHIPPED_HOLIDAY_REGIONS = ['IR'] as const satisfies readonly HolidayRegion[];

export function isHolidayRegion(value: string): value is HolidayRegion {
  return (HOLIDAY_REGIONS as readonly string[]).includes(value);
}

export function isShippedHolidayRegion(
  value: string,
): value is (typeof SHIPPED_HOLIDAY_REGIONS)[number] {
  return (SHIPPED_HOLIDAY_REGIONS as readonly string[]).includes(value);
}

/**
 * The holiday pack for a region. Throws when the region code is unknown, or
 * when the region is planned but not shipped yet (Afghanistan, Tajikistan).
 */
export function holidayPackFor(region: HolidayRegion = DEFAULT_HOLIDAY_REGION): RegionHolidayPack {
  const pack = PACKS[region];
  if (pack) return pack;
  if (isHolidayRegion(region)) {
    throw new Error(
      `Holiday region "${region}" is not shipped yet. This package ships Iran ("IR") today. Afghanistan ("AF") and Tajikistan ("TJ") are planned.`,
    );
  }
  throw new Error(`Unknown holiday region "${region}". Use "IR", "AF", or "TJ".`);
}
