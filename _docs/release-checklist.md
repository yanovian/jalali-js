# Release checklist

> **Status as of this pass: not ready to publish.** Everything this repo can verify by itself
> passes. Two things block release: the visual e2e baseline (below), and four operational items
> nothing here has the credentials to check. See "What's still open" at the bottom before you run
> `make tag-release`.

The checklist Phase 11 asks for. Each item below is either verified directly, with how, or
flagged as something only a human with the right access can do (an npm or GitHub secret, a repo
setting). This document does not publish anything by itself. Publishing happens through
`release.yml` (see architecture.md's "CI/CD pipeline"). A maintainer triggers it by pushing a
release tag (`make tag-release TAG=v0.0.1`), a separate, deliberate action to take when ready.

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
      dependencies use `workspace:*`. Both `pnpm publish` and `changeset publish` rewrite that
      to the real version at publish time. That is expected, not a bug.
- [x] **Every publishable package has its own `README.md`.** Confirmed a `README.md` exists in
      all 7 package directories directly.
- [x] **Initial version numbers are a deliberate choice, not a default.** Confirmed all 7 are
      still `0.0.0` and never published (`npm view jalali-js` and `npm view @jalali-js/i18n`
      both return 404, so the names are free). The first release targets `v0.0.1`: a `patch`
      bump for every package meant to publish (`pnpm changeset`, or `make changeset`). See
      "Publishing" below.

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

One deliberate local command, matching the org's tag-triggered release convention
(`yanovian/chrome-ext-tabby`'s `release-patch`, `release-minor`, and `release-major`). Nothing
publishes until a maintainer runs it.

1. Add a changeset per package that should reach `v0.0.1` (`patch` bump type, since every
   package starts at `0.0.0`). Describe what ships in this first release.
2. Review the pending changesets (`pnpm changeset status`, or `make release` for the same
   preview). Confirm the working tree is otherwise clean.
3. Run `make tag-release TAG=v0.0.1`. This runs `make check`, then `changeset version` (bumps
   each package's version, writes `CHANGELOG.md` entries, and consumes the changesets), commits,
   tags, and pushes with `--follow-tags`.
4. Pushing the tag triggers `release.yml`. It re-runs the checks, then `changesets/action@v1`
   publishes (`pnpm release`: `pnpm build && changeset publish`, which publishes only a package
   whose current version is not already on npm) and creates one GitHub release per published
   package. Each release body comes from that package's own `CHANGELOG.md` entry.

`@changesets/changelog-github` (the changelog format `changeset version` uses) links each entry
back to its PR or commit. That needs a GitHub token to avoid API rate limits when run locally
(`GITHUB_TOKEN` in the environment, or an authenticated `gh` CLI). It is harmless to skip for an
occasional release, since it only affects link richness in the generated changelog text, not
whether the release succeeds.

This repo has not done any of the four steps above. Publishing packages under the
`jalali-js`/`@jalali-js/*` names to the public npm registry is a real, irreversible, public
action. It belongs to whoever owns that decision, made deliberately, not as a side effect of
running this checklist.

## What's still open

Everything checkable from this environment passes. Two things are not yet confirmed, and are
worth resolving first:

1. **No visual-baseline branch exists yet.** `visual-baselines` and `visual-snapshots` are both
   absent from `origin`. `update-visual-baselines.yml` now runs automatically on every push to
   `master` (fixed in this pass: it used to be a manual `workflow_dispatch` step that nobody had
   ever run), so the next merge to `master` creates the branch on its own. To get a baseline in
   place sooner, without waiting for a merge, run `update-visual-baselines.yml` once by hand
   (`workflow_dispatch` still works) so `e2e.yml` has something to diff against right away.
2. **Four operational items are unverified.** They are not confirmed wrong, only unchecked: this
   environment's `gh` and `npm` credentials are both invalid. Confirm the `NPM_TOKEN` and
   `PAT_TOKEN` secrets, GitHub Pages being enabled, and `@jalali-js` npm org access, from a
   machine with working credentials, before you push the release tag. If `NPM_TOKEN` turns out
   to be missing, `release.yml` fails partway through, after it has already pushed a commit and
   a tag.

## When you're done with this document

This checklist is a one-time gate for the first release, not a living document. Later releases
are just "add changesets, run `make tag-release`." **Once you have published `v0.0.1`, confirmed
it landed on npm, and confirmed it got a GitHub release, delete this file.** Keeping it around
past that point only invites it to go stale and mislead the next release.
