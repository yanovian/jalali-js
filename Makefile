.PHONY: help install install-frozen dev build build-packages build-apps build-docs typecheck \
	lint lint-fix format format-check test test-watch test-e2e test-e2e-project \
	install-playwright check clean probe-treeshake size changeset release tag-release \
	app-typecheck app-build app-build-at-base test-paths docs-dev docs-build docs-preview

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

changeset: ## Record a changeset for the current change (interactive)
	$(PNPM) exec changeset

release: ## Publish through Changesets (CI-driven; this local target only previews what would release)
	$(PNPM) exec changeset status

tag-release: check ## Bump versions, commit, tag, and push (triggers release.yml, which publishes): make tag-release TAG=v0.0.1
	@test -n "$(TAG)" || (echo "Usage: make tag-release TAG=v0.0.1" && exit 1)
	@git diff --quiet && git diff --cached --quiet || (echo "Working tree is not clean; commit or stash first." && exit 1)
	$(PNPM) exec changeset version
	git add -A
	git commit -m "Version Packages"
	git tag -a $(TAG) -m "Release $(TAG)"
	git push origin HEAD --follow-tags

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
