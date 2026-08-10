/**
 * Low-precision solar longitude from Jean Meeus, Astronomical Algorithms
 * (2nd ed.), chapter 25. Good enough to place the March equinox on the
 * correct civil day for Jalali Nowruz.
 */

const DEG = Math.PI / 180;

function wrap360(degrees: number): number {
  const wrapped = degrees % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/** Apparent ecliptic longitude of the Sun at Julian Date `jde`, in degrees [0, 360). */
export function sunApparentLongitude(jde: number): number {
  const t = (jde - 2451545.0) / 36525;
  const l0 = wrap360(280.46646 + 36000.76983 * t + 0.0003032 * t * t);
  const m = wrap360(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m * DEG) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * m * DEG) +
    0.000289 * Math.sin(3 * m * DEG);
  const trueLongitude = l0 + c;
  const omega = 125.04 - 1934.136 * t;
  return wrap360(trueLongitude - 0.00569 - 0.00478 * Math.sin(omega * DEG));
}

/**
 * Julian Date (UT approximation) of the March equinox in `gregorianYear`.
 * Finds when apparent solar longitude crosses 0° in March.
 */
export function marchEquinoxJde(gregorianYear: number): number {
  let lo = gregorianYmdToJde(gregorianYear, 3, 15);
  let hi = gregorianYmdToJde(gregorianYear, 3, 25);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const longitude = sunApparentLongitude(mid);
    // Longitude near 0 after winter is small; before equinox it is near 360.
    if (longitude > 180) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Julian Date at 0h UT on the Gregorian civil day (Meeus-style). */
function gregorianYmdToJde(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  return jdn - 0.5;
}
