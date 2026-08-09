# v1.0 release checklist

The checklist Phase 11 asks for. Each item below is either verified directly (with how), or
flagged as something only a human with the right access can do (an npm/GitHub secret, a repo
setting). This document does not itself publish anything: publishing happens through
`release.yml` (see architecture.md's "CI/CD pipeline"), triggered by merging the "Version
Packages" pull request Changesets opens, a separate, deliberate action for a maintainer to take
when they're ready.

## Engineering readiness

- [ ] **All planned phases are done, or explicitly deferred.** Phases 0-11 (this one) are done;
      see plan.md. "Later, not yet scheduled" lists what's deliberately out of scope for v1.0
      (a fake-`CalendarEngine` generalizability test, more locales, an astronomical engine, and
      any second calendar system, added only on real demand). Confirm this still matches intent
      before release: no half-finished phase, nothing silently dropped.
- [ ] **`make check` passes on a clean checkout.** Typecheck, lint, format, unit/property tests,
      every package and app builds, `packages/core`'s bundle-size budget. Verified as part of
      this phase's own work.
- [ ] **`make test-e2e` passes, with real baselines in place.** The visual regression suite
      needs `visual-baselines` (the orphan branch from Phase 10) to actually exist and be
      current; a repo that has never run `update-visual-baselines.yml` fails every screenshot
      test, not a release blocker by itself, but confirm the baseline branch is current before
      relying on `e2e.yml` as a real gate.
- [ ] **`make probe-treeshake` and `make size` both pass.** Confirms `packages/core` actually
      tree-shakes and stays inside its bundle-size budget in the built, publishable output, not
      just in source.
- [ ] **License audit is clean.** `license-audit.yml` runs on every PR already; confirm no
      outstanding critical-severity finding on `master` specifically before release.

## Package readiness

- [ ] **Every publishable package's `package.json` is correct.** `name`, `version`, `license`,
      `publishConfig` (dist-pointing `main`/`module`/`types`/`exports`, `access: "public"`),
      `files`, `sideEffects`, `peerDependencies` where relevant. Reviewed in Phase 8 when each
      was set up; re-confirm nothing regressed since.
- [ ] **Every publishable package has its own `README.md`.** npm's registry page reads a
      package's own README, not the repo root's. All 7 (`jalali-js`, `@jalali-js/i18n`,
      `@jalali-js/nlp`, `@jalali-js/react`, `@jalali-js/vue`, `@jalali-js/ui-react`,
      `@jalali-js/ui-vue`) now have one, added in this phase; the root `README.md` was also
      rewritten (it still described "Phase 0 done, calendar logic not started" going into this
      phase, badly stale against the actual state of the repo).
- [ ] **Initial version numbers are a deliberate choice, not a default.** Every package is
      currently `0.0.0` and has never been published. Changesets computes a version bump
      mechanically from whatever bump type (`patch`/`minor`/`major`) a changeset declares; it
      has no "this is the first release, jump to 1.0.0" behavior of its own. Publishing as
      `v1.0.0` means adding a changeset with a `major` bump for every package intended to reach
      `1.0.0` (`pnpm changeset`, or `make changeset`), not assuming `changeset version` will
      pick that number on its own.

## Documentation readiness

- [ ] **The docs site builds and its content is accurate.** `make build-docs` builds cleanly
      (verified in this phase); spot-check the guide pages against the actual current API
      before release, the same way this phase's own writing was checked against real source
      (`createCalendar`'s actual overloads, `DatePicker`'s actual props, `parse()`'s actual
      supported phrases) rather than written from memory.
- [ ] **The API reference covers what it should.** `jalali-js`, `@jalali-js/i18n`,
      `@jalali-js/nlp`, `@jalali-js/react`, `@jalali-js/ui-react` are TypeDoc-generated in full;
      `@jalali-js/vue`'s plain-TypeScript composables are generated, its `.vue` component APIs
      are hand-documented on the guide's Vue page instead (see `apps/docs/scripts/build-api.mjs`
      for why: TypeDoc has no `.vue` SFC support). Confirm the hand-written component tables
      still match each component's real
      `defineProps<...>()` before release.

## Operational prerequisites (human-only; nothing here can verify or do these)

- [ ] **`NPM_TOKEN` repo secret exists**, with publish rights for the `jalali-js` and
      `@jalali-js/*` names on npm. `release.yml` needs it to actually publish.
- [ ] **`PAT_TOKEN` repo secret exists**, a real personal access token (not the default
      `GITHUB_TOKEN`). `update-dependencies-non-breaking.yml` and
      `update-dependencies-breaking.yml` (Phase 9) need it so the pull requests they open can
      trigger this repo's own `ci.yml`.
- [ ] **GitHub Pages is enabled**, with "GitHub Actions" selected as the source, in this repo's
      Settings → Pages. `pages.yml` (this phase) deploys to it but cannot turn the feature on
      itself.
- [ ] **The `@jalali-js` npm org exists** and this repo's publishing identity has access to it,
      if it doesn't already from a prior phase's package.json setup.

## Publishing (do this last, deliberately, not as part of "running the checklist")

One deliberate local command, matching the org's tag-triggered release convention
(`yanovian/chrome-ext-tabby`'s `release-patch`/`-minor`/`-major`): nothing publishes until a
maintainer runs it.

1. Add a changeset per package that should reach `v1.0.0` (`major` bump type), describing what
   ships in this first release.
2. Review the pending changesets (`pnpm changeset status`, or `make release` for the same
   preview), and confirm the working tree is otherwise clean.
3. Run `make tag-release TAG=v1.0.0`. This runs `make check`, then `changeset version` (bumps
   each package's version, writes `CHANGELOG.md` entries, consumes the changesets), commits,
   tags, and pushes with `--follow-tags`.
4. Pushing the tag triggers `release.yml`: re-runs the checks, then publishes (`pnpm release`:
   `pnpm build && changeset publish`, which publishes only a package whose current version isn't
   already on npm) and creates a GitHub release with generated notes.

`@changesets/changelog-github` (the changelog format `changeset version` uses) links each entry
back to its PR/commit; that needs a GitHub token to avoid API rate limits when run locally
(`GITHUB_TOKEN` in the environment, or an authenticated `gh` CLI) — harmless to skip for an
occasional release, since it only affects link-richness in the generated changelog text, not
whether the release succeeds.

This repo has not done any of the five steps above as part of this phase: they're a real,
irreversible, public action (publishing packages under the `jalali-js`/`@jalali-js/*` names to
the public npm registry), and belong to whoever owns that decision, made deliberately, not as a
side effect of "completing Phase 11."
