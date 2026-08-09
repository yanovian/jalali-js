import { defineConfig, devices } from '@playwright/test';

// Ports match each playground app's own "preview"/"start" script (apps/*/package.json).
const PORTS = {
  react: 4001,
  vue: 4002,
  next: 4003,
  nuxt: 4004,
  vanilla: 4005,
};

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  outputDir: 'test-results',
  // The JSON reporter is what e2e.yml's PR comment bot reads (scripts/visual-comment.mjs):
  // per-test attachment paths and pass/fail status, not directory-name scanning.
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  expect: {
    // A small tolerance for anti-aliasing/font-rendering noise across OSes, not for hiding a
    // real visual change: the baseline PNGs in e2e/**/*-snapshots/ are what "no unacknowledged
    // visual change" is checked against (see architecture.md's "Visual regression and PR
    // screenshots").
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  use: {
    headless: true,
    viewport: { width: 1280, height: 900 },
  },
  // Every project needs every server; each app's own "build" runs first since a cold checkout
  // has no dist/.next/.output yet. Playwright starts all five before any test runs and tears
  // them all down after, regardless of which project/app a given test file targets.
  webServer: [
    {
      command:
        'pnpm --filter playground-react run build && pnpm --filter playground-react run preview',
      url: `http://localhost:${PORTS.react}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter playground-vue run build && pnpm --filter playground-vue run preview',
      url: `http://localhost:${PORTS.vue}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter playground-next run build && pnpm --filter playground-next run start',
      url: `http://localhost:${PORTS.next}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        'pnpm --filter playground-nuxt run build && pnpm --filter playground-nuxt run preview',
      url: `http://localhost:${PORTS.nuxt}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        'pnpm --filter playground-vanilla run build && pnpm --filter playground-vanilla run preview',
      url: `http://localhost:${PORTS.vanilla}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
