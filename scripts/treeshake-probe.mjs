#!/usr/bin/env node
// Confirms tree-shaking actually works against the real, built `jalali-js` (packages/core)
// output, not just the source: bundles a probe entry that imports one export
// (`createCalendar`) and asserts the bundle drops several other real exports it never calls.
// Run after `pnpm --filter jalali-js build`; `make probe-treeshake` does both.
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const corePackage = join(repoRoot, 'packages/core');
const coreDist = join(corePackage, 'dist/index.js');

if (!existsSync(coreDist)) {
  console.error(`Missing ${coreDist}. Run "pnpm --filter jalali-js build" first.`);
  process.exit(1);
}

const probeDir = await mkdtemp(join(tmpdir(), 'jalali-treeshake-'));
const entryFile = join(probeDir, 'entry.mjs');
await writeFile(
  entryFile,
  `import { createCalendar } from ${JSON.stringify(coreDist)};\nconsole.log(createCalendar({ system: 'jalali' }).today());\n`,
);

let bundleText;
try {
  const result = await esbuild.build({
    entryPoints: [entryFile],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    treeShaking: true,
  });
  bundleText = result.outputFiles[0].text;
} finally {
  await rm(probeDir, { recursive: true, force: true });
}

// Never called by createCalendar()/today(): calendar.ts does not import date-math.ts,
// calendar-grid.ts, day-of-week.ts, or storage-value.ts (confirmed by reading calendar.ts's own
// imports). A real bundler should drop every one of these from the output.
const shouldBeAbsent = [
  'function compareDates',
  'function addDays',
  'function buildCalendarGrid',
  'function nextMonth',
  'function previousMonth',
  'function dayOfWeek',
  'function toStorageValue',
];
// Sanity check the probe itself: something jalali-specific that `today()` truly does reach
// must survive, or an empty/broken bundle would make every "absent" check trivially pass.
const shouldBePresent = ['LEAP_YEAR_RESIDUES'];

const leaked = shouldBeAbsent.filter((marker) => bundleText.includes(marker));
const missing = shouldBePresent.filter((marker) => !bundleText.includes(marker));

if (leaked.length > 0) {
  console.error('Tree-shaking probe FAILED: unused exports survived in the bundle:');
  for (const marker of leaked) console.error(`  - ${marker}`);
  process.exit(1);
}
if (missing.length > 0) {
  console.error('Tree-shaking probe is broken: expected reachable code is missing:');
  for (const marker of missing) console.error(`  - ${marker}`);
  process.exit(1);
}

console.log(
  `Tree-shaking probe passed: bundle is ${bundleText.length} bytes and drops ${shouldBeAbsent.length} unused exports (compareDates, addDays, buildCalendarGrid, nextMonth, previousMonth, dayOfWeek, toStorageValue).`,
);
