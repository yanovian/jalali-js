---
description: Browsers the e2e suite verifies today.
---

# Browser support

This page states what CI verifies. It is not a promise about every browser.

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
