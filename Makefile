.PHONY: help install install-frozen dev build build-packages build-apps build-docs typecheck \
	lint lint-fix format format-check test test-watch test-e2e test-e2e-project \
	install-playwright check clean probe-treeshake size tag-release release-patch \
	release-minor release-major publish-packages app-typecheck app-build app-build-at-base \
	test-paths docs-dev docs-build docs-preview

PNPM ?= pnpm

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make <target>\n\nTargets:\n"} \
		/^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install workspace dependencies
	$(PNPM) install

install-frozen: ## Install workspace dependencies without updating the lockfile (CI)
	$(PNPM) install --frozen-lockfile

dev: ## Run the playground apps in dev mode
	$(PNPM) dev

build: ## Build all packages and apps
	$(PNPM) build

build-packages: ## Build only packages/* (not apps/*), its own target so a break there is named on its own in CI
	$(PNPM) --filter "./packages/**" build

build-apps: ## Build only the four playground apps (not docs), its own target for the same reason as build-packages
	$(PNPM) --filter "./apps/**" --filter "!docs" build

build-docs: ## Build the docs site (API reference generation runs first automatically)
	$(PNPM) --filter docs build

docs-dev: ## Run the docs site in dev mode (API reference generation runs first automatically)
	$(PNPM) --filter docs dev

docs-build: build-docs ## Alias for build-docs, matching architecture.md's documented Makefile listing

docs-preview: ## Preview the built docs site locally
	$(PNPM) --filter docs preview

typecheck: ## TypeScript check, across every package
	$(PNPM) typecheck

lint: ## ESLint
	$(PNPM) lint

lint-fix: ## ESLint, with autofix
	$(PNPM) lint:fix

format: ## Prettier, write mode
	$(PNPM) format

format-check: ## Prettier, check mode (the CI gate)
	$(PNPM) format:check

test: ## Unit and property tests (Vitest), once
	$(PNPM) test

test-watch: ## Unit and property tests (Vitest), watch mode
	$(PNPM) test:watch

test-e2e: ## Playwright visual e2e suite, every browser (build + browser install run automatically)
	$(PNPM) test:e2e

test-e2e-project: ## Playwright visual e2e suite, one browser (e2e.yml): make test-e2e-project PROJECT=chromium
	$(PNPM) exec playwright test --project=$(PROJECT)

install-playwright: ## Install Playwright browser binaries: make install-playwright BROWSERS="chromium firefox webkit"
	$(PNPM) exec playwright install --with-deps $(BROWSERS)

check: typecheck lint format-check test build size ## CI-equivalent: typecheck, lint, format-check, test, build, size

probe-treeshake: ## Confirm packages/core's built output actually tree-shakes
	$(PNPM) --filter jalali-js build
	$(PNPM) probe:treeshake

size: ## Check packages/core's bundle-size budget (size-limit)
	$(PNPM) --filter jalali-js build
	$(PNPM) size

# Bumps every package under packages/* to the same new version in one call (they always start
# in sync and always get the same bump type, so they stay in sync with no extra bookkeeping),
# commits, tags, and pushes. Matches yanovian/chrome-ext-tabby's own release-patch/-minor/-major
# (`pnpm version <bump>`), extended across multiple packages via `pnpm --filter ... exec`, since
# plain `pnpm version` only ever bumps one package.json. Safe to run again by mistake: it refuses
# to start if the tree is dirty, and no-ops cleanly if HEAD is already tagged with nothing new
# since, rather than cutting an unwanted second release.
tag-release: check
	@test -n "$(BUMP)" || (echo "Usage: make tag-release BUMP=patch|minor|major (or use make release-patch/-minor/-major)" && exit 1)
	@git diff --quiet && git diff --cached --quiet || (echo "Working tree is not clean; commit or stash first." && exit 1)
	@if git describe --tags --exact-match HEAD >/dev/null 2>&1; then \
	  echo "HEAD is already tagged ($$(git describe --tags --exact-match HEAD)); nothing to release."; \
	  exit 0; \
	fi
	$(PNPM) --filter "./packages/**" exec -- pnpm version $(BUMP) --no-git-tag-version
	@TAG="v$$(node -p "require('./packages/core/package.json').version")"; \
	git add -A; \
	git commit -m "Release $$TAG"; \
	if git rev-parse -q --verify "refs/tags/$$TAG" >/dev/null; then \
	  echo "Tag $$TAG already exists; not creating it again."; \
	else \
	  git tag -a "$$TAG" -m "Release $$TAG"; \
	fi; \
	git push origin HEAD --follow-tags

release-patch: ## Bump every package's patch version, commit, tag, and push (triggers release.yml, which publishes): make release-patch
	@$(MAKE) tag-release BUMP=patch

release-minor: ## Same as release-patch, minor bump: make release-minor
	@$(MAKE) tag-release BUMP=minor

release-major: ## Same as release-patch, major bump: make release-major
	@$(MAKE) tag-release BUMP=major

publish-packages: ## Publish every package/* to npm, skipping any already published at its current version (release.yml)
	@for pkg in packages/*/; do \
	  name=$$(node -p "require('./$${pkg}package.json').name"); \
	  version=$$(node -p "require('./$${pkg}package.json').version"); \
	  if npm view "$$name@$$version" version >/dev/null 2>&1; then \
	    echo "$$name@$$version is already on npm, skipping"; \
	  else \
	    (cd "$$pkg" && pnpm publish --no-git-checks); \
	  fi; \
	done

app-typecheck: ## Typecheck one app/package by name (compat-matrix.yml): make app-typecheck APP=playground-react
	$(PNPM) --filter $(APP) typecheck

app-build-at-base: ## Build one Vite app under a URL subpath (pages.yml, embedding a playground into the docs site): make app-build-at-base APP=playground-react BASE=/jalali-js/playground/react/
	$(PNPM) --filter $(APP) exec vite build --base $(BASE)

app-build: ## Build one app/package by name (compat-matrix.yml): make app-build APP=playground-react
	$(PNPM) --filter $(APP) build

test-paths: ## Run Vitest scoped to specific paths (compat-matrix.yml): make test-paths PATHS="packages/react packages/ui-react"
	$(PNPM) exec vitest run $(PATHS)

clean: ## Remove build output
	find packages apps -maxdepth 2 -type d -name dist -prune -exec rm -rf {} \; 2>/dev/null || true
