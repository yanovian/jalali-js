#!/usr/bin/env node
// Used only by e2e.yml's "publish and comment" job. Reads each browser's Playwright JSON
// report (one per browser matrix job, downloaded as a separate artifact) and writes:
//   - a flat directory of clearly-named images for every CHANGED screenshot (new baseline vs.
//     current render, plus the pixel diff), ready to publish to the `visual-snapshots` orphan
//     branch (see architecture.md's "Visual regression and PR screenshots")
//   - manifest.json describing each image's caption and a pass/fail count per browser, so the
//     PR comment step never has to guess what an image is a screenshot of.
//
// A passing screenshot test has no image to show (Playwright's JSON reporter attaches nothing
// when nothing changed), so only failed/changed tests get images here; passing ones only add to
// the summary count. This also keeps the comment itself readable: a reviewer cares about what's
// different, not a wall of unchanged images.
//
// Usage: node scripts/visual-comment.mjs <outDir> <browser>=<resultsJsonPath> [...]
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const [outDir, ...pairs] = process.argv.slice(2);
if (!outDir || pairs.length === 0) {
  throw new Error('Usage: visual-comment.mjs <outDir> <browser>=<resultsJsonPath> [...]');
}

// Walks one spec file's suite tree. A `test.describe(name, ...)` block becomes a nested suite
// named `name` (playground-react.spec.ts, playground-vue.spec.ts); a bare `test(...)` with no
// describe block leaves its spec directly on the file-level suite (playground-next.spec.ts,
// playground-nuxt.spec.ts), so its "app name" falls back to the spec file's own basename.
function collectTests(fileSuite, tests) {
  const fallbackApp = basename(fileSuite.file).replace(/\.spec\.ts$/, '');
  function walk(suite, appName) {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        tests.push({
          appName,
          specTitle: spec.title,
          projectName: t.projectName,
          result: t.results[0],
        });
      }
    }
    for (const sub of suite.suites ?? []) {
      walk(sub, sub.title);
    }
  }
  walk(fileSuite, fallbackApp);
}

const manifest = { changed: [], counts: {} };
mkdirSync(outDir, { recursive: true });

for (const pair of pairs) {
  const eq = pair.indexOf('=');
  const browser = pair.slice(0, eq);
  const resultsPath = pair.slice(eq + 1);
  if (!existsSync(resultsPath)) {
    console.warn(`No results.json for ${browser} at ${resultsPath}, skipping.`);
    continue;
  }
  const report = JSON.parse(readFileSync(resultsPath, 'utf8'));

  const tests = [];
  for (const fileSuite of report.suites ?? []) {
    collectTests(fileSuite, tests);
  }

  const counts = { passed: 0, failed: 0 };
  manifest.counts[browser] = counts;

  for (const { appName, specTitle, projectName, result } of tests) {
    if (projectName !== browser) continue;
    const passed = result.status === 'passed';
    counts[passed ? 'passed' : 'failed'] += 1;
    if (passed) continue;

    const attachments = result.attachments ?? [];
    const actual = attachments.find((a) => a.name.endsWith('-actual.png'));
    if (!actual || !existsSync(actual.path)) continue; // a non-screenshot failure

    const screenshotName = actual.name.replace(/-actual\.png$/, '');
    const safeApp = appName.replace(/[^a-z0-9-]+/gi, '-');
    const baseName = `${safeApp}__${screenshotName}__${browser}`;

    const actualFileName = `${baseName}__new.png`;
    copyFileSync(actual.path, join(outDir, actualFileName));

    const expected = attachments.find((a) => a.name.endsWith('-expected.png'));
    let baselineFileName;
    if (expected && existsSync(expected.path)) {
      baselineFileName = `${baseName}__baseline.png`;
      copyFileSync(expected.path, join(outDir, baselineFileName));
    }

    const diff = attachments.find((a) => a.name.endsWith('-diff.png'));
    let diffFileName;
    if (diff && existsSync(diff.path)) {
      diffFileName = `${baseName}__diff.png`;
      copyFileSync(diff.path, join(outDir, diffFileName));
    }

    manifest.changed.push({
      app: appName,
      test: specTitle,
      screenshot: screenshotName,
      browser,
      hasBaseline: Boolean(baselineFileName), // false only on a brand-new screenshot test
      newFileName: actualFileName,
      baselineFileName,
      diffFileName,
    });
  }
}

writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(
  `Wrote ${manifest.changed.length} changed screenshot(s) and manifest.json to ${outDir}. Counts:`,
  manifest.counts,
);
