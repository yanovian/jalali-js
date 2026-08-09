#!/usr/bin/env node
// next.config.ts's webpack() hook (extensionAlias, for resolving workspace ".js" specifiers to
// their ".ts" source) only runs under webpack, so dev/build must force it. The CLI flag for
// that depends on the installed Next major: --webpack does not exist before Turbopack became
// the dev/build default (an unrecognized flag is a hard CLI error there), and is required from
// that version on. This picks the right invocation so compat-matrix.yml's older-Next-major
// cell (see .github/workflows/compat-matrix.yml) builds too, not just this app's own pinned
// version.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const TURBOPACK_DEFAULT_SINCE_MAJOR = 16;

const require = createRequire(import.meta.url);
const { version } = require('next/package.json');
const major = Number.parseInt(version, 10);

const [command, ...rest] = process.argv.slice(2);
const args =
  major >= TURBOPACK_DEFAULT_SINCE_MAJOR ? [command, '--webpack', ...rest] : [command, ...rest];

execFileSync('next', args, { stdio: 'inherit' });
