# Package README structure

npm shows each package's `README.md` as the registry page. Every publishable
package under `packages/` follows this structure so the page is easy to scan
and stays useful without opening the docs site first.

## Required sections

Use these exact `##` headings (the check script matches them):

1. Title (`# package-name`) and badges (version, license, docs; bundle size
   on `jalali-js` only).
2. One short pitch (one or two sentences).
3. `## Contents` with anchor links to the sections below.
4. `## Install`
5. `## Compatibility` (peers from `package.json`, framework majors from the
   CI matrix, Node majors from the CI Node matrix).
6. `## Quick start` (smallest working example).
7. One or more API sections (`## API`, `## Components`, or similar) with a
   short example per main export.
8. `## Options` with a small key-options table for the main surface, plus a
   link to the docs guide prop tables (the source of truth).
9. `## Theming` for UI packages (`react`, `vue`, `web`, `ui-*`). Other
   packages use a one-line note that they have no UI.
10. `## Links` (docs, playground, changelog, sibling packages).
11. `## License`

## Options tables

Do not copy full prop tables into every README. The docs guides own the full
tables (`apps/docs/guide/react.md`, `vue.md`, `web-components.md`). Each
README keeps a short key-options table and links to those guides so the two
never drift apart.

## Check

`make check-readmes` (also part of `make check`) fails when a package README
misses a required heading.

## Writing style

Follow `AGENTS.md`: short sentences, active voice, no em dashes, STE for
docs. Prefer plain language over marketing filler.
