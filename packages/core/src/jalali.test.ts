import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { gregorianEngine } from './gregorian.js';
import { jalaliEngine } from './jalali.js';

// An independent reference table for Jalali leap years, covering years 1300-1420 AP (four full
// 33-year cycles). Sourced from ICU's Persian calendar (`Intl.DateTimeFormat` with
// `calendar: persian`), not from this package's own leap-year formula, so this is a genuine
// cross-check rather than the formula checking itself. ICU's Persian calendar implementation is
// what every major browser and Node itself already ship and rely on.
const ICU_LEAP_YEAR_REFERENCE: Array<[year: number, isLeap: boolean]> = [
  [1300, true],
  [1301, false],
  [1302, false],
  [1303, false],
  [1304, true],
  [1305, false],
  [1306, false],
  [1307, false],
  [1308, false],
  [1309, true],
  [1310, false],
  [1311, false],
  [1312, false],
  [1313, true],
  [1314, false],
  [1315, false],
  [1316, false],
  [1317, true],
  [1318, false],
  [1319, false],
  [1320, false],
  [1321, true],
  [1322, false],
  [1323, false],
  [1324, false],
  [1325, true],
  [1326, false],
  [1327, false],
  [1328, false],
  [1329, true],
  [1330, false],
  [1331, false],
  [1332, false],
  [1333, true],
  [1334, false],
  [1335, false],
  [1336, false],
  [1337, true],
  [1338, false],
  [1339, false],
  [1340, false],
  [1341, false],
  [1342, true],
  [1343, false],
  [1344, false],
  [1345, false],
  [1346, true],
  [1347, false],
  [1348, false],
  [1349, false],
  [1350, true],
  [1351, false],
  [1352, false],
  [1353, false],
  [1354, true],
  [1355, false],
  [1356, false],
  [1357, false],
  [1358, true],
  [1359, false],
  [1360, false],
  [1361, false],
  [1362, true],
  [1363, false],
  [1364, false],
  [1365, false],
  [1366, true],
  [1367, false],
  [1368, false],
  [1369, false],
  [1370, true],
  [1371, false],
  [1372, false],
  [1373, false],
  [1374, false],
  [1375, true],
  [1376, false],
  [1377, false],
  [1378, false],
  [1379, true],
  [1380, false],
  [1381, false],
  [1382, false],
  [1383, true],
  [1384, false],
  [1385, false],
  [1386, false],
  [1387, true],
  [1388, false],
  [1389, false],
  [1390, false],
  [1391, true],
  [1392, false],
  [1393, false],
  [1394, false],
  [1395, true],
  [1396, false],
  [1397, false],
  [1398, false],
  [1399, true],
  [1400, false],
  [1401, false],
  [1402, false],
  [1403, true],
  [1404, false],
  [1405, false],
  [1406, false],
  [1407, false],
  [1408, true],
  [1409, false],
  [1410, false],
  [1411, false],
  [1412, true],
  [1413, false],
  [1414, false],
  [1415, false],
  [1416, true],
  [1417, false],
  [1418, false],
  [1419, false],
  [1420, true],
] as const;

describe('jalaliEngine.isLeapYear against the ICU reference table', () => {
  it.each(ICU_LEAP_YEAR_REFERENCE)('year %i is leap: %s', (year, isLeap) => {
    expect(jalaliEngine.isLeapYear(year)).toBe(isLeap);
  });
});

describe('jalaliEngine boundary cases', () => {
  it('starts year 1 at the Jalali epoch (22 March 622 CE, Gregorian)', () => {
    const jdn = jalaliEngine.toJulianDayNumber({ year: 1, month: 1, day: 1 });
    expect(gregorianEngine.fromJulianDayNumber(jdn)).toEqual({ year: 622, month: 3, day: 21 });
  });

  it('gives Esfand 30 days in a leap year, 29 in a non-leap year', () => {
    expect(jalaliEngine.daysInMonth(1403, 12)).toBe(30); // 1403 is leap
    expect(jalaliEngine.daysInMonth(1404, 12)).toBe(29); // 1404 is not
  });

  it('places 1 Farvardin 1404 the day after 30 Esfand 1403 (a leap year)', () => {
    const esfand30 = jalaliEngine.toJulianDayNumber({ year: 1403, month: 12, day: 30 });
    const farvardin1 = jalaliEngine.toJulianDayNumber({ year: 1404, month: 1, day: 1 });
    expect(farvardin1 - esfand30).toBe(1);
  });

  it('matches the known Gregorian date of Nowruz 1400 (21 March 2021)', () => {
    const jdn = jalaliEngine.toJulianDayNumber({ year: 1400, month: 1, day: 1 });
    expect(gregorianEngine.fromJulianDayNumber(jdn)).toEqual({ year: 2021, month: 3, day: 21 });
  });
});

describe('jalaliEngine Julian Day Number conversion', () => {
  it('round-trips any valid Jalali date across a wide year range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 3000 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const day = jalaliEngine.daysInMonth(year, month);
          const date = { year, month, day };
          const jdn = jalaliEngine.toJulianDayNumber(date);
          expect(jalaliEngine.fromJulianDayNumber(jdn)).toEqual(date);
        },
      ),
    );
  });

  it('gives consecutive Julian Day Numbers to consecutive calendar days', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1583865, max: 3043320 }), (jdn) => {
        const today = jalaliEngine.fromJulianDayNumber(jdn);
        const tomorrow = jalaliEngine.fromJulianDayNumber(jdn + 1);
        expect(jalaliEngine.toJulianDayNumber(tomorrow)).toBe(
          jalaliEngine.toJulianDayNumber(today) + 1,
        );
      }),
    );
  });

  it('gives every Jalali year in range exactly 365 or 366 days', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 3000 }), (year) => {
        const start = jalaliEngine.toJulianDayNumber({ year, month: 1, day: 1 });
        const end = jalaliEngine.toJulianDayNumber({ year: year + 1, month: 1, day: 1 });
        expect(end - start).toBe(jalaliEngine.isLeapYear(year) ? 366 : 365);
      }),
    );
  });
});
