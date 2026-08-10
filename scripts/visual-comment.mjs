#!/usr/bin/env node
// Used only by e2e.yml's "publish and comment" job. Reads each browser's Playwright JSON
// report and writes:
//   - images for every advisory visual change (baseline / new / diff)
//   - manifest.json with captions and per-browser counts
//
// Screenshot mismatches are advisory (see e2e/expect-screenshot.ts). Selection uses the
// `visual-change` annotation on a passed test, not a failed test status. Functional
// failures still fail the job and have no visual-change annotation.
//
// Usage: node scripts/visual-comment.mjs <outDir> <browser>=<resultsJsonPath> [...]
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const VISUAL_CHANGE_ANNOTATION = 'visual-change';

const [outDir, ...pairs] = process.argv.slice(2);
if (!outDir || pairs.length === 0) {
  throw new Error('Usage: visual-comment.mjs <outDir> <browser>=<resultsJsonPath> [...]');
}

function collectTests(fileSuite, tests) {
  const fallbackApp = basename(fileSuite.file).replace(/\.spec\.ts$/, '');
  function walk(suite, appName) {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        tests.push({
          appName,
          specTitle: spec.title,
          projectName: t.projectName,
          annotations: [...(t.annotations ?? []), ...(t.results[0]?.annotations ?? [])],
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

function hasVisualChange(annotations) {
  return annotations.some((a) => a.type === VISUAL_CHANGE_ANNOTATION);
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

  const counts = { passed: 0, failed: 0, changed: 0 };
  manifest.counts[browser] = counts;

  for (const { appName, specTitle, projectName, annotations, result } of tests) {
    if (projectName !== browser) continue;
    if (!result) continue;

    const passed = result.status === 'passed';
    counts[passed ? 'passed' : 'failed'] += 1;

    if (!hasVisualChange(annotations)) continue;

    const attachments = result.attachments ?? [];
    const actual = attachments.find((a) => a.name.endsWith('-actual.png'));
    if (!actual || !existsSync(actual.path)) continue;

    counts.changed += 1;

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
      hasBaseline: Boolean(baselineFileName),
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
