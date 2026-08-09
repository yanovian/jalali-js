#!/usr/bin/env node
// next.config.ts's webpack() hook only runs under webpack, so dev/build must force it. The
// flag for that is version-dependent: --webpack does not exist before Turbopack became the
// default (a hard CLI error), and is required from that version on. This picks the right one
// so compat-matrix.yml's older-Next-major cell builds too, not just this app's pinned version.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const TURBOPACK_DEFAULT_SINCE_MAJOR = 16;

const { version } = createRequire(import.meta.url)('next/package.json');
const major = Number.parseInt(version, 10);
const [command, ...rest] = process.argv.slice(2);
const args =
  major >= TURBOPACK_DEFAULT_SINCE_MAJOR ? [command, '--webpack', ...rest] : [command, ...rest];

execFileSync('next', args, { stdio: 'inherit' });
