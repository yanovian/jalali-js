# Contributing

Thank you for your interest in jalali-js. This guide covers setup, the branch
and PR workflow, and the checks a change must pass.

See [`_docs/plan.md`](_docs/plan.md) for the current phase status,
[`_docs/architecture.md`](_docs/architecture.md) for the technical design,
[`_docs/release-checklist.md`](_docs/release-checklist.md) for what "ready for v1.0" means, and
[`AGENTS.md`](AGENTS.md) for the writing style used in this repo's docs and
comments.

## Setup

This repo uses pnpm workspaces. Install pnpm first, then run:

```sh
make install
```

## Everyday commands

Run `make help` to list every command. The common ones:

```sh
make lint          # ESLint
make lint-fix       # ESLint, with autofix
make format         # Prettier, write mode
make format-check   # Prettier, check mode (the CI gate)
make typecheck      # TypeScript, across every package
make test           # Unit and property tests (Vitest)
make test-watch     # Same, in watch mode
make test-e2e       # Playwright visual e2e suite (every browser)
make docs-dev       # Run the docs site locally
make check          # Everything above (except test-e2e/docs-dev), together. Run this before you open a PR.
```

## Before you commit

A pre-commit hook runs ESLint `--fix` and Prettier `--write` on staged files.
It blocks the commit when an error remains that `--fix` cannot resolve. You
do not need to run `lint-fix` or `format` by hand before a commit, but doing
so first means fewer surprises at commit time.

## Branch and PR workflow

- Branch off `master`.
- Keep a PR focused on one change. A small PR is faster to review.
- Add or update tests for any new or changed behavior.
- Run `make check` before you open a PR. CI runs the same checks and blocks
  a merge on failure.
- If your change affects a published package, add a changeset:

  ```sh
  make changeset
  ```

  Describe the change in plain language. The changeset becomes the package's
  changelog entry.

## Commit style

Write a commit message that states what changed and why, in one or two short
sentences. Follow [`AGENTS.md`](AGENTS.md)'s writing style: short sentences,
active voice, no em dashes.

## Reporting a security issue

Do not open a public issue for a security problem. See
[`SECURITY.md`](SECURITY.md) instead.
