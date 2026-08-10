---
description: Browsers and Node versions the CI suite verifies today.
---

# Browser support

This page states what CI verifies. It is not a promise about every browser
or every Node release.

## Node matrix

`.github/workflows/ci.yml` runs a slim `node-matrix` job on each supported
Node LTS, in parallel with the full Node 24 gate:

| Node | Role in CI                                             |
| ---- | ------------------------------------------------------ |
| 22   | Maintenance LTS. Typecheck, unit tests, package builds |
| 24   | Active LTS. Full CI gate, plus the same slim checks    |

EOL Node majors (20 and older) are out of scope.

## Visual e2e matrix

`.github/workflows/e2e.yml` runs Playwright once per browser, in parallel:

| Browser  | Playwright project | Device profile  |
| -------- | ------------------ | --------------- |
| Chromium | `chromium`         | Desktop Chrome  |
| Firefox  | `firefox`          | Desktop Firefox |
| WebKit   | `webkit`           | Desktop Safari  |

`playwright.config.ts` sets a desktop viewport of `1280×900`. There is no mobile device
project in that config today.

## What that covers

- React, Vue, and Vanilla playgrounds: closed picker sections and opened calendar grids.
- Next.js and Nuxt playground apps in the same Playwright webServer list.
- Screenshot baselines compared with a small anti-aliasing tolerance
  (`maxDiffPixelRatio: 0.02`).

## What that does not cover

- Dedicated phone or tablet device projects.
- Every host OS font stack. Baselines run on `ubuntu-latest`.
- Every consumer bundler. Unit tests and the CI typecheck matrix cover packages, not every
  app stack.

## Practical guidance

Ship for modern evergreen browsers. Use the three Playwright projects above as the verified
set. If you need a specific mobile layout check, add a Playwright project and a playground
section first, then update this page.
