#!/usr/bin/env node
// Used only by the compat-matrix.yml CI job (Phase 9's peer-dependency compatibility matrix):
// writes each "pkg@range" argument into the root package.json's `pnpm.overrides`, so a
// following `pnpm install` resolves that package to the matrix cell's version across the whole
// workspace, including packages that only declare it as a peerDependency (packages/react,
// packages/vue, and so on). Never run outside CI; it mutates the checked-out package.json in
// place and is never meant to be committed.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url));

function parseOverrideArg(arg) {
  // Scoped package names (e.g. "@types/react@18") have their own leading "@", so split on the
  // *last* "@" in the string, not the first.
  const at = arg.lastIndexOf('@');
  if (at <= 0) {
    throw new Error(`Expected "pkg@range", got "${arg}"`);
  }
  return { name: arg.slice(0, at), range: arg.slice(at + 1) };
}

const overrides = process.argv.slice(2).map(parseOverrideArg);
if (overrides.length === 0) {
  throw new Error('Usage: compat-override.mjs <pkg@range> [pkg@range ...]');
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
packageJson.pnpm ??= {};
packageJson.pnpm.overrides ??= {};
for (const { name, range } of overrides) {
  packageJson.pnpm.overrides[name] = range;
  console.log(`pnpm.overrides["${name}"] = "${range}"`);
}

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
