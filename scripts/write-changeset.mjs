#!/usr/bin/env node
// Writes a changeset file directly. This skips `pnpm changeset`'s interactive wizard. It
// targets every package in .changeset/config.json's first `fixed` group. Those packages always
// version together, so one command covers the whole family. Called by `make release-patch`,
// `release-minor`, or `release-major`, each of which picks the bump type by name; this script
// always requires `--bump` explicit, on purpose, so that choice lives in one place.
//
// `--message` is optional. Without it, the changelog text is generated from every commit
// subject since the last tag, so a maintainer who has already written good commit messages
// does not have to restate them by hand. Merge and bot commits (past "Version Packages" and
// "Add release changeset" runs) are filtered out, since they describe this release process
// itself, not what shipped.
//
// Idempotent by design, since `make release-patch` (and `-minor`/`-major`) is meant to be safe
// to run again by mistake: if a changeset is already pending, or HEAD is already tagged with
// nothing new since, this exits 0 without writing anything, instead of duplicating a changeset
// or starting an unwanted second release.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.join('=')];
  }),
);

const { bump } = args;
if (!bump) {
  console.error('Usage: node scripts/write-changeset.mjs --bump=patch [--message="..."]');
  process.exit(1);
}
if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error(`Invalid --bump "${bump}": must be patch, minor, or major.`);
  process.exit(1);
}

function messageFromCommitLog() {
  let lastTag;
  try {
    lastTag = execFileSync('git', ['describe', '--tags', '--abbrev=0'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'], // Suppress git's "no tag found" error: expected on the first release.
    }).trim();
  } catch {
    lastTag = null; // No tag yet: this is the first release.
  }
  const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
  const log = execFileSync('git', ['log', range, '--pretty=format:%s'], { encoding: 'utf8' });
  const skip = /^(Version Packages|Add release changeset)/;
  const subjects = log
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !skip.test(line));
  return subjects.length > 0 ? subjects.map((line) => `- ${line}`).join('\n') : 'Release.';
}

const rootDir = fileURLToPath(new URL('..', import.meta.url));

function hasPendingChangeset() {
  return readdirSync(`${rootDir}/.changeset`).some(
    (name) => name.endsWith('.md') && name !== 'README.md',
  );
}

function headAlreadyTagged() {
  try {
    execFileSync('git', ['describe', '--tags', '--exact-match', 'HEAD'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (hasPendingChangeset()) {
  console.log(
    'A changeset is already pending; not writing another. Run `make tag-release` to continue that release.',
  );
  process.exit(0);
}
if (headAlreadyTagged()) {
  console.log('HEAD is already tagged and nothing has changed since; nothing to release.');
  process.exit(0);
}

const message = args.message || messageFromCommitLog();

const config = JSON.parse(readFileSync(`${rootDir}/.changeset/config.json`, 'utf8'));
const [fixedGroup] = config.fixed;
if (!fixedGroup || fixedGroup.length === 0) {
  console.error('.changeset/config.json has no fixed group to write a changeset for.');
  process.exit(1);
}

const frontmatter = fixedGroup.map((name) => `'${name}': ${bump}`).join('\n');
const content = `---\n${frontmatter}\n---\n\n${message}\n`;
const fileName = `release-${Date.now()}.md`;
writeFileSync(`${rootDir}/.changeset/${fileName}`, content);
console.log(`Wrote .changeset/${fileName}`);
