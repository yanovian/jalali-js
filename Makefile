.PHONY: help install install-frozen dev build build-packages build-apps typecheck lint lint-fix \
	format format-check test test-watch check clean probe-treeshake size changeset release \
	app-typecheck app-build test-paths

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

build-apps: ## Build only apps/* (the four playground apps), its own target for the same reason as build-packages
	$(PNPM) --filter "./apps/**" build

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

app-typecheck: ## Typecheck one app/package by name (compat-matrix.yml): make app-typecheck APP=playground-react
	$(PNPM) --filter $(APP) typecheck

app-build: ## Build one app/package by name (compat-matrix.yml): make app-build APP=playground-react
	$(PNPM) --filter $(APP) build

test-paths: ## Run Vitest scoped to specific paths (compat-matrix.yml): make test-paths PATHS="packages/react packages/ui-react"
	$(PNPM) exec vitest run $(PATHS)

clean: ## Remove build output
	find packages apps -maxdepth 2 -type d -name dist -prune -exec rm -rf {} \; 2>/dev/null || true
