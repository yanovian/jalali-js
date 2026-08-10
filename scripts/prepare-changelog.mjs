#!/usr/bin/env node
/**
 * Prepare CHANGELOG.md for a release.
 * Checks that notes exist, then moves ## [Unreleased] into ## [version] - date
 * and refreshes the compare links at the bottom.
 *
 * Usage: node scripts/prepare-changelog.mjs patch|minor|major [--dry-run]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const bump = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
if (bump !== 'patch' && bump !== 'minor' && bump !== 'major') {
  console.error('Usage: node scripts/prepare-changelog.mjs patch|minor|major [--dry-run]');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const changelogPath = join(root, 'CHANGELOG.md');
const current = JSON.parse(readFileSync(join(root, 'packages/core/package.json'), 'utf8')).version;
const next = nextVersion(current, bump);
const today = new Date().toISOString().slice(0, 10);
const repoCompare = 'https://github.com/yanovian/jalali-js/compare';

let changelog = readFileSync(changelogPath, 'utf8');
const hasVersionHeading = new RegExp(`^## \\[${escapeRegExp(next)}\\](?:\\s|$)`, 'm').test(
  changelog,
);
const unreleased = readUnreleased(changelog);

if (!hasVersionHeading && !unreleased.hasBullets) {
  console.error(
    `CHANGELOG.md has no entry for ${next}. Put release notes under ## [Unreleased].`,
  );
  process.exit(1);
}

if (hasVersionHeading && unreleased.hasBullets) {
  console.error(
    `CHANGELOG.md already has ## [${next}] and still has Unreleased bullets. Resolve one of them.`,
  );
  process.exit(1);
}

if (hasVersionHeading) {
  console.log(`CHANGELOG.md already has ## [${next}]. No promote needed.`);
  process.exit(0);
}

const body = unreleased.body.replace(/^\n+/, '').replace(/\n+$/, '');
const promoted = [
  '## [Unreleased]',
  '',
  `## [${next}] - ${today}`,
  '',
  body,
  '',
].join('\n');

changelog =
  changelog.slice(0, unreleased.start) + promoted + changelog.slice(unreleased.end);

changelog = updateFooterLinks(changelog, current, next);

if (dryRun) {
  process.stdout.write(changelog);
  process.exit(0);
}

writeFileSync(changelogPath, changelog);
console.log(`Promoted Unreleased to ## [${next}] - ${today}.`);

function readUnreleased(text) {
  const marker = '## [Unreleased]';
  const start = text.indexOf(marker);
  if (start < 0) {
    return { start: -1, end: -1, body: '', hasBullets: false };
  }
  const bodyStart = start + marker.length;
  const after = text.slice(bodyStart);
  const nextHeading = after.search(/^## \[/m);
  const end = nextHeading < 0 ? text.length : bodyStart + nextHeading;
  const body = text.slice(bodyStart, end);
  return { start, end, body, hasBullets: /^- /m.test(body) };
}

function updateFooterLinks(text, previous, version) {
  const unreleasedLine = `[unreleased]: ${repoCompare}/v${version}...HEAD`;
  const versionLine = `[${version}]: ${repoCompare}/v${previous}...v${version}`;
  if (/^\[unreleased\]:/m.test(text)) {
    text = text.replace(/^\[unreleased\]:.*$/m, unreleasedLine);
  } else {
    text = `${text.trimEnd()}\n\n${unreleasedLine}\n`;
  }
  if (new RegExp(`^\\[${escapeRegExp(version)}\\]:`, 'm').test(text)) {
    text = text.replace(new RegExp(`^\\[${escapeRegExp(version)}\\]:.*$`, 'm'), versionLine);
  } else {
    text = text.replace(/^\[unreleased\]:.*$/m, `${unreleasedLine}\n${versionLine}`);
  }
  return text.endsWith('\n') ? text : `${text}\n`;
}

function nextVersion(version, kind) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`Unsupported version: ${version}`);
  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);
  if (kind === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (kind === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
