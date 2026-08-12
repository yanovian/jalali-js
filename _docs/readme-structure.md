# Package README structure

npm shows each package's `README.md` as the registry page. Every publishable
package under `packages/` follows this structure so the page is easy to scan
and stays useful without opening the docs site first.

## Required sections

Use these exact `##` headings (the check script matches them):

1. Title (`# package-name`) and badges (version, license, docs; bundle size
   on `jalali-js` only).
2. One short pitch (one or two sentences).
3. A **Start here** line right after the pitch: Live demo and Documentation.
   Directly under it, an **npm ecosystem** line that lists every publishable
   package (`jalali-js`, `@jalali-js/i18n`, `@jalali-js/nlp`,
   `@jalali-js/holidays`, `@jalali-js/react`, `@jalali-js/vue`,
   `@jalali-js/web`, `@jalali-js/ui-react`, `@jalali-js/ui-vue`,
   `@jalali-js/ui-web`), each linking to its npm page. Put these before
   Install so a visitor finds them without scrolling past API detail.
4. `## Contents` with anchor links to the sections below.
5. `## Install`
6. `## Compatibility` (peers from `package.json`, framework majors from the
   CI matrix, Node majors from the CI Node matrix).
7. `## Quick start` (smallest working example).
8. One or more API sections (`## API`, `## Components`, or similar) with a
   short example per main export.
9. `## Options` with a small key-options table for the main surface, plus a
   link to the docs guide prop tables (the source of truth).
10. `## Theming` for UI packages (`react`, `vue`, `web`, `ui-*`). Other
    packages use a one-line note that they have no UI.
11. `## Links` (docs, playground, changelog, and other guide links). Lead
    with Live demo and Documentation. Do not repeat the npm ecosystem line
    here. Keep that list only under Start here.
12. `## License`

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
