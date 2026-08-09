# Release checklist

> **Status as of this pass: not ready to publish.** Everything this repo can verify by itself
> passes. Two things block release: the visual e2e baseline (below), and four operational items
> nothing here has the credentials to check. See "What's still open" at the bottom before you run
> `make release-patch`.

The checklist Phase 11 asks for. Each item below is either verified directly, with how, or
flagged as something only a human with the right access can do (an npm or GitHub secret, a repo
setting). This document does not publish anything by itself. Publishing happens through
`release.yml` (see architecture.md's "CI/CD pipeline"). A maintainer triggers it by running
`make release-patch` (see "Publishing" below), a separate, deliberate action to take when ready.

## Engineering readiness

- [x] **All planned phases are done, or explicitly deferred.** Phases 0 through 11 are `[x]` in
      plan.md. Verified by grepping for any remaining unchecked box outside Phase 12 and Phase
      13 (found none). "Later, not yet scheduled" lists what stays out of scope for this first
      release: any second calendar system, added only if real demand appears.
- [x] **`make check` passes on a clean checkout.** Re-ran it directly (typecheck, lint,
      format-check, test, build, size). All green.
- [ ] **`make test-e2e` passes, with real baselines in place. NOT MET.** `git ls-remote origin`
      shows neither `visual-baselines` nor `visual-snapshots` exists on `origin`.
      `update-visual-baselines.yml` has never run. `e2e.yml` will fail every screenshot test on
      the next PR or push until a maintainer runs it once. That is an expected one-time
      bootstrap step, not a bug (see Phase 10). It does not block publishing by itself
      (`release.yml` does not run e2e), but it does mean there is currently no working visual
      regression gate. Fix this before or right after this release. Do not defer it
      indefinitely.
- [x] **`make probe-treeshake` and `make size` both pass.** Re-ran both directly. The
      tree-shaking probe drops all 7 unused exports as expected, in a 6737-byte bundle.
      `size-limit` reports 2.05 kB against a 6 kB budget, as measured at the time of this check.
- [ ] **License audit is clean. UNVERIFIED.** `gh auth status` shows an invalid or expired token
      in this environment. `license-audit.yml`'s run history on `master` and the GitHub API are
      both unreachable from here. Check the Actions tab, or re-run `gh auth login` and then
      `gh run list --workflow=license-audit.yml`, before you publish.

## Package readiness

- [x] **Every publishable package's `package.json` is correct.** Read all 7 directly.
      `publishConfig` (dist-pointing `main`, `module`, `types`, `exports`, and
      `access: "public"`), `files`, `sideEffects` (`false` for the 3 framework-agnostic
      packages, `["*.css"]` for the 4 that ship a stylesheet), and `peerDependencies`
      (`react`/`react-dom` `>=18`, `vue >=3.4`) all match Phase 8's design. Cross-package
      dependencies use `workspace:*`, which `pnpm publish` rewrites to the real version at
      publish time. That is expected, not a bug.
- [x] **Every publishable package has its own `README.md`.** Confirmed a `README.md` exists in
      all 7 package directories directly.
- [x] **Initial version numbers are a deliberate choice, not a default.** Confirmed all 7 are
      still `0.0.0` and never published (`npm view jalali-js` and `npm view @jalali-js/i18n`
      both return 404, so the names are free). The first release targets `v0.0.1`. Every
      package under `packages/*` starts at the same version and always gets bumped by the same
      `make release-patch/-minor/-major` call, so they stay in sync automatically; a `patch`
      bump moves every one of them from `0.0.0` to `0.0.1` at once. See "Publishing" below.

## Documentation readiness

- [x] **The docs site builds, and its content is accurate.** Re-ran `make build-docs` directly.
      It builds cleanly. TypeDoc covers all 5 eligible packages, plus the scoped
      Vue-composables run. VitePress renders with no errors.
- [x] **The API reference covers what it should.** Confirmed in the same build's log. `core`,
      `i18n`, `nlp`, `react`, and `ui-react` convert in the main TypeDoc pass. `vue`'s
      composables convert in a second, scoped pass. Guide prose was spot-checked against the
      real API when each guide page was written, in Phase 11. This pass did not re-verify it
      line by line. Re-check it if the API has changed since.

## Operational prerequisites (human-only: nothing here can verify or do these)

- [ ] **`NPM_TOKEN` repo secret exists. UNVERIFIED.** `gh secret list` fails (invalid token in
      this environment). Check Settings, then Secrets and variables, then Actions.
- [ ] **`PAT_TOKEN` repo secret exists. UNVERIFIED.** Same tool, same failure. Check the same
      Settings page.
- [ ] **GitHub Pages is enabled. UNVERIFIED.** `gh api repos/yanovian/jalali-js/pages` returned
      `401 Bad credentials`. Check Settings, then Pages, directly.
- [ ] **The `@jalali-js` npm org exists, and this identity can publish to it. UNVERIFIED.**
      `npm whoami` is not logged in from this environment. Confirm from a machine that is.

## Publishing (do this last, deliberately, not as part of "running the checklist")

One deliberate local command, matching the org's own tag-triggered release convention:
`release-patch`, `release-minor`, and `release-major` bump the version via `pnpm version` and
trigger the same way. Nothing publishes until a maintainer runs it, and no GitHub token or any
other credential is needed on your machine for this step: `pnpm version` only touches local
`package.json` files and git, no network calls.

1. Run **one** of `make release-patch`, `make release-minor`, or `make release-major`, whichever
   bump this release needs. No arguments needed.
2. That command runs `make check` first, then bumps every package under `packages/*` to the
   same new version in one call (`pnpm --filter "./packages/**" exec -- pnpm version <bump>
--no-git-tag-version`, since they all start in sync and always get the same bump, they stay in
   sync with no extra bookkeeping), commits as "Release vX.Y.Z", tags, and pushes with
   `--follow-tags`. It refuses to run on a dirty working tree, and no-ops cleanly if `HEAD` is
   already tagged with nothing new since (safe to run again by mistake).
3. Pushing the tag triggers `release.yml`. It re-runs the checks, builds, publishes each
   package to npm (skipping any that are already published at that version, so a partial
   failure is safe to retry), and creates one GitHub release with auto-generated notes
   (`softprops/action-gh-release`, `generate_release_notes: true`).

This repo has not run any of the steps above. Publishing packages under the
`jalali-js`/`@jalali-js/*` names to the public npm registry is a real, irreversible, public
action. It belongs to whoever owns that decision, made deliberately, not as a side effect of
running this checklist.

## What's still open

Everything checkable from this environment passes. Two things are not yet confirmed, and are
worth resolving first:

1. **No visual-baseline branch exists yet.** `visual-baselines` and `visual-snapshots` are both
   absent from `origin`. `update-visual-baselines.yml` runs automatically on every push to
   `master`, so the next merge to `master` creates the branch on its own. To get a baseline in
   place sooner, without waiting for a merge, run `update-visual-baselines.yml` once by hand
   (`workflow_dispatch` still works) so `e2e.yml` has something to diff against right away.
2. **Four operational items are unverified.** They are not confirmed wrong, only unchecked: this
   environment's `gh` and `npm` credentials are both invalid. Confirm the `NPM_TOKEN` and
   `PAT_TOKEN` secrets, GitHub Pages being enabled, and `@jalali-js` npm org access, from a
   machine with working credentials, before you push the release tag. If `NPM_TOKEN` turns out
   to be missing, `release.yml` fails at the publish step, after it has already re-run the
   checks and built.

## When you're done with this document

This checklist is a one-time gate for the first release, not a living document. Later releases
are just "run `make release-patch` (or `-minor`/`-major`)." **Once you have published `v0.0.1`,
confirmed it landed on npm, and confirmed it got a GitHub release, delete this file.** Keeping
it around past that point only invites it to go stale and mislead the next release.
