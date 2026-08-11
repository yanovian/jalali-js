#!/usr/bin/env node
/**
 * Mirror live `/pr-<n>/` playground trees into a Pages dist folder.
 * No extra git branch. The live site and the open-PR list are the source of truth.
 *
 * Usage:
 *   node scripts/pr-previews.mjs open-prs
 *   node scripts/pr-previews.mjs mirror <distDir> [--exclude 12,15]
 *
 * Env: GITHUB_TOKEN, GITHUB_REPOSITORY, SITE_URL (default https://jalali-js.yanovian.com)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SITE_URL = (process.env.SITE_URL || 'https://jalali-js.yanovian.com').replace(/\/$/, '');
const APPS = ['react', 'vue', 'vanilla'];

const [command, ...args] = process.argv.slice(2);
if (!command) {
  fail('Usage: pr-previews.mjs <open-prs|mirror> ...');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseExclude(argv) {
  const exclude = new Set();
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] !== '--exclude') continue;
    const value = argv[i + 1] || '';
    for (const part of value.split(',')) {
      const n = part.trim();
      if (n) exclude.add(n);
    }
  }
  return exclude;
}

async function listOpenPrNumbers() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) fail('GITHUB_TOKEN and GITHUB_REPOSITORY are required.');

  const numbers = [];
  let page = 1;
  for (;;) {
    const url = `https://api.github.com/repos/${repo}/pulls?state=open&per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'jalali-js-pr-previews',
      },
    });
    if (!res.ok) fail(`Failed to list open PRs: HTTP ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const pr of batch) numbers.push(String(pr.number));
    if (batch.length < 100) break;
    page += 1;
  }
  return numbers;
}

async function downloadFile(sitePath, distDir) {
  const res = await fetch(`${SITE_URL}${sitePath}`);
  if (!res.ok) return false;
  const dest = join(distDir, sitePath.replace(/^\//, ''));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return true;
}

async function mirrorPrApp(pr, app, distDir) {
  const prefix = `/pr-${pr}/playground/${app}/`;
  const indexPath = `${prefix}index.html`;
  const indexRes = await fetch(`${SITE_URL}${indexPath}`);
  if (!indexRes.ok) return false;

  const html = await indexRes.text();
  const paths = new Set([indexPath]);
  for (const match of html.matchAll(/(?:src|href)="(\/pr-\d+\/playground\/[^"]+)"/g)) {
    paths.add(match[1]);
  }

  const destIndex = join(distDir, indexPath.replace(/^\//, ''));
  mkdirSync(dirname(destIndex), { recursive: true });
  writeFileSync(destIndex, html);

  for (const path of paths) {
    if (path === indexPath) continue;
    await downloadFile(path, distDir);
  }
  return true;
}

async function mirror(distDir, exclude) {
  if (!distDir) fail('Usage: pr-previews.mjs mirror <distDir> [--exclude 12,15]');
  const open = await listOpenPrNumbers();
  let mirrored = 0;
  for (const pr of open) {
    if (exclude.has(pr)) continue;
    let any = false;
    for (const app of APPS) {
      if (await mirrorPrApp(pr, app, distDir)) any = true;
    }
    if (any) {
      mirrored += 1;
      console.log(`Mirrored /pr-${pr}/ from ${SITE_URL}`);
    }
  }
  console.log(`Mirrored ${mirrored} open PR preview tree(s).`);
}

switch (command) {
  case 'open-prs': {
    const numbers = await listOpenPrNumbers();
    console.log(numbers.join(','));
    break;
  }
  case 'mirror': {
    const distDir = args[0];
    const exclude = parseExclude(args.slice(1));
    await mirror(distDir, exclude);
    break;
  }
  default:
    fail(`Unknown command: ${command}`);
}
