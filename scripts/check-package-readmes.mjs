#!/usr/bin/env node
/**
 * Fail when a publishable package README misses a required section.
 * Section list: _docs/readme-structure.md
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = join(root, 'packages');

const REQUIRED = [
  '## Contents',
  '## Install',
  '## Compatibility',
  '## Quick start',
  '## Options',
  '## Theming',
  '## Links',
  '## License',
];

const UI_PACKAGES = new Set([
  '@jalali-js/react',
  '@jalali-js/vue',
  '@jalali-js/web',
  '@jalali-js/ui-react',
  '@jalali-js/ui-vue',
  '@jalali-js/ui-web',
]);

let failed = false;

for (const dir of readdirSync(packagesDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const pkgPath = join(packagesDir, dir.name, 'package.json');
  const readmePath = join(packagesDir, dir.name, 'README.md');
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch {
    continue;
  }
  if (pkg.private) continue;

  let readme;
  try {
    readme = readFileSync(readmePath, 'utf8');
  } catch {
    console.error(`${pkg.name}: missing README.md`);
    failed = true;
    continue;
  }

  const missing = REQUIRED.filter((heading) => !readme.includes(heading));
  if (missing.length) {
    console.error(`${pkg.name}: missing sections: ${missing.join(', ')}`);
    failed = true;
  }

  if (!/^#\s+\S+/m.test(readme)) {
    console.error(`${pkg.name}: missing top-level # title`);
    failed = true;
  }

  if (!/img\.shields\.io\/npm\/v\//.test(readme)) {
    console.error(`${pkg.name}: missing npm version badge`);
    failed = true;
  }

  if (pkg.name === 'jalali-js' && !/bundlejs\.com|deno\.bundlejs\.com/.test(readme)) {
    console.error(`${pkg.name}: missing bundle size badge`);
    failed = true;
  }

  if (UI_PACKAGES.has(pkg.name)) {
    if (!/## Theming[\s\S]*?--jalali-/.test(readme)) {
      console.error(`${pkg.name}: Theming section should mention a --jalali-* token`);
      failed = true;
    }
  }

  if (!/^## (API|Components|Functions|Elements)\b/m.test(readme)) {
    console.error(`${pkg.name}: missing ## API, ## Components, ## Functions, or ## Elements`);
    failed = true;
  }
}

if (failed) {
  console.error('\nSee _docs/readme-structure.md for the required README shape.');
  process.exit(1);
}

console.log('All package READMEs include the required sections.');
