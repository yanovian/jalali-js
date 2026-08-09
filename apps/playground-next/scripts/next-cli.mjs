#!/usr/bin/env node
// --webpack does not exist before Turbopack became the default, and is required after.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const TURBOPACK_DEFAULT_SINCE_MAJOR = 16;

const { version } = createRequire(import.meta.url)('next/package.json');
const major = Number.parseInt(version, 10);
const [command, ...rest] = process.argv.slice(2);
const args =
  major >= TURBOPACK_DEFAULT_SINCE_MAJOR ? [command, '--webpack', ...rest] : [command, ...rest];

execFileSync('next', args, { stdio: 'inherit' });
