# AGENTS.md

Guidance for AI agents working in this repo.

## Coding style

Make sure the code is DRY and KISS. Avoid duplocated code and complex function.

## Writing style

Use ASD-STE100 Simplified Technical English (STE) for all plans,
documentation, and code comments in this repo.

Rules:

- Write short sentences. Cover one idea in each sentence.
- Use active voice. State who does the action.
- Use simple, common words. Do not use a rare word when a simple word works.
- Use one word for one meaning. Do not switch between different words for the
  same idea.
- Do not use em dashes. Use a period, a comma, or "and" instead.
- State scope in positive terms. Describe what the project builds. Use a
  "does not include" note only for a normal technical boundary (for example,
  "this package has zero runtime dependencies"). Do not describe scope by
  naming excluded groups, beliefs, or cultures.

Apply this style to every file under `_docs/`, to `README.md`, and to code
comments.

When you update a doc under `_docs/`, check it against these rules before you
finish.

## Changelog

When a change is user-facing or otherwise notable, add a bullet under
`## [Unreleased]` in `CHANGELOG.md`. Follow Keep a Changelog sections
(`Added`, `Changed`, `Fixed`, `Removed`).

Keep each bullet short:

- One idea per bullet. Prefer one or two lines.
- Name the API, package, or behavior. Skip long rationale and file paths.
- Do not paste commit messages or phase numbers.
- Match the tone of recent `Unreleased` bullets. Prefer the short form over
  a design essay.
- Do not use em dashes.

`make release-*` promotes `## [Unreleased]` into the version heading. Leave
that step to the maintainer.

## End of a task

After you finish a task that changes code, suggest a branch name, a PR
title, and a PR description. Keep each one short and to the point. Do not
use em dashes. Follow the writing style rules above. These are suggestions
only. The user creates the branch and the PR by hand.
