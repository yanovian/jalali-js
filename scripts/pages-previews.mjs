#!/usr/bin/env node
/**
 * Manage short-lived PR playground trees on the orphan `pages-previews` branch.
 * Master Pages deploys merge those trees into the live site under `/pr-<n>/`.
 * This keeps master docs builds isolated from preview paths.
 *
 * Usage:
 *   node scripts/pages-previews.mjs merge <distDir>
 *   node scripts/pages-previews.mjs publish <prNumber> <prDir>
 *   node scripts/pages-previews.mjs remove <prNumber>
 *   node scripts/pages-previews.mjs sweep <commaSeparatedOpenPrNumbers>
 *
 * Env: GITHUB_TOKEN, GITHUB_REPOSITORY (owner/repo)
 *
 * publish / remove / sweep print `changed=true` or `changed=false` on the last
 * line so a workflow can append it to $GITHUB_OUTPUT.
 */
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const BRANCH = 'pages-previews';
const PR_DIR_RE = /^pr-(\d+)$/;

const [command, ...args] = process.argv.slice(2);
if (!command) {
  fail('Usage: pages-previews.mjs <merge|publish|remove|sweep> ...');
}

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
if (!token || !repo) {
  fail('GITHUB_TOKEN and GITHUB_REPOSITORY are required.');
}

const remote = `https://x-access-token:${token}@github.com/${repo}.git`;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(cmd, cmdArgs, options = {}) {
  const result = spawnSync(cmd, cmdArgs, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || '').trim();
    fail(`${cmd} ${cmdArgs.join(' ')} failed${err ? `: ${err}` : ''}`);
  }
  return result.stdout?.trim() ?? '';
}

function runSoft(cmd, cmdArgs, options = {}) {
  return spawnSync(cmd, cmdArgs, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
}

function branchExists() {
  const result = runSoft('git', ['ls-remote', '--exit-code', '--heads', remote, BRANCH]);
  return result.status === 0;
}

function cloneWorktree() {
  const work = mkdtempSync(join(tmpdir(), 'pages-previews-'));
  if (branchExists()) {
    run('git', ['clone', '--quiet', '--depth=1', '--branch', BRANCH, remote, work]);
  } else {
    run('git', ['clone', '--quiet', '--depth=1', remote, work]);
    run('git', ['checkout', '--orphan', BRANCH], { cwd: work });
    runSoft('git', ['rm', '-rf', '.'], { cwd: work });
  }
  run('git', ['config', 'user.name', 'github-actions[bot]'], { cwd: work });
  run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], {
    cwd: work,
  });
  return work;
}

function listPrDirs(work) {
  return readdirSync(work, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && PR_DIR_RE.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function commitAndPush(work, message) {
  run('git', ['add', '-A'], { cwd: work });
  const staged = runSoft('git', ['diff', '--staged', '--quiet'], { cwd: work });
  if (staged.status === 0) {
    console.log('changed=false');
    return false;
  }
  run('git', ['commit', '--quiet', '-m', message], { cwd: work });
  run('git', ['push', '--quiet', remote, `HEAD:${BRANCH}`], { cwd: work });
  console.log('changed=true');
  return true;
}

function assertPrNumber(value) {
  if (!/^\d+$/.test(value)) fail(`Invalid PR number: ${value}`);
  return value;
}

function mergeIntoDist(distDir) {
  if (!existsSync(distDir)) fail(`distDir does not exist: ${distDir}`);
  if (!branchExists()) {
    console.log('No pages-previews branch yet; nothing to merge.');
    return;
  }
  const work = mkdtempSync(join(tmpdir(), 'pages-previews-merge-'));
  try {
    run('git', ['clone', '--quiet', '--depth=1', '--branch', BRANCH, remote, work]);
    for (const name of listPrDirs(work)) {
      const from = join(work, name);
      const to = join(distDir, name);
      rmSync(to, { recursive: true, force: true });
      cpSync(from, to, { recursive: true });
      console.log(`Merged ${name}/ into dist.`);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

function publish(prNumber, prDir) {
  const pr = assertPrNumber(prNumber);
  const folder = `pr-${pr}`;
  if (!existsSync(prDir)) fail(`prDir does not exist: ${prDir}`);
  const work = cloneWorktree();
  try {
    const target = join(work, folder);
    rmSync(target, { recursive: true, force: true });
    cpSync(prDir, target, { recursive: true });
    commitAndPush(work, `Playground preview for PR #${pr}`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

function remove(prNumber) {
  const pr = assertPrNumber(prNumber);
  const folder = `pr-${pr}`;
  if (!branchExists()) {
    console.log('changed=false');
    return;
  }
  const work = cloneWorktree();
  try {
    const target = join(work, folder);
    if (!existsSync(target)) {
      console.log('changed=false');
      return;
    }
    rmSync(target, { recursive: true, force: true });
    commitAndPush(work, `Remove playground preview for PR #${pr}`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

function sweep(openPrCsv) {
  const open = new Set(
    (openPrCsv || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map(assertPrNumber),
  );
  if (!branchExists()) {
    console.log('changed=false');
    return;
  }
  const work = cloneWorktree();
  try {
    let removed = 0;
    for (const name of listPrDirs(work)) {
      const match = PR_DIR_RE.exec(name);
      const pr = match?.[1];
      if (!pr || open.has(pr)) continue;
      rmSync(join(work, name), { recursive: true, force: true });
      removed += 1;
      console.log(`Removed orphan ${name}/`);
    }
    if (removed === 0) {
      console.log('changed=false');
      return;
    }
    commitAndPush(work, `Sweep orphan PR playground previews (${removed} removed)`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

switch (command) {
  case 'merge':
    if (!args[0]) fail('Usage: pages-previews.mjs merge <distDir>');
    mergeIntoDist(args[0]);
    break;
  case 'publish':
    if (!args[0] || !args[1]) fail('Usage: pages-previews.mjs publish <prNumber> <prDir>');
    publish(args[0], args[1]);
    break;
  case 'remove':
    if (!args[0]) fail('Usage: pages-previews.mjs remove <prNumber>');
    remove(args[0]);
    break;
  case 'sweep':
    sweep(args[0] ?? '');
    break;
  default:
    fail(`Unknown command: ${command}`);
}
