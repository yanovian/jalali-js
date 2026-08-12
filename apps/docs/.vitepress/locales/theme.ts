import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress';
import { messages, type DocsLocaleId, type DocsMessages } from './messages.js';

const NPM_ITEMS = [
  { text: 'jalali-js', link: 'https://www.npmjs.com/package/jalali-js' },
  { text: '@jalali-js/i18n', link: 'https://www.npmjs.com/package/@jalali-js/i18n' },
  { text: '@jalali-js/nlp', link: 'https://www.npmjs.com/package/@jalali-js/nlp' },
  { text: '@jalali-js/holidays', link: 'https://www.npmjs.com/package/@jalali-js/holidays' },
  { text: '@jalali-js/react', link: 'https://www.npmjs.com/package/@jalali-js/react' },
  { text: '@jalali-js/vue', link: 'https://www.npmjs.com/package/@jalali-js/vue' },
  { text: '@jalali-js/web', link: 'https://www.npmjs.com/package/@jalali-js/web' },
  { text: '@jalali-js/ui-react', link: 'https://www.npmjs.com/package/@jalali-js/ui-react' },
  { text: '@jalali-js/ui-vue', link: 'https://www.npmjs.com/package/@jalali-js/ui-vue' },
  { text: '@jalali-js/ui-web', link: 'https://www.npmjs.com/package/@jalali-js/ui-web' },
] as const;

/** Path prefix for locale content. Root English uses no prefix. */
function prefixFor(locale: DocsLocaleId): string {
  return locale === 'fa' ? '/fa' : '';
}

function guideSidebar(prefix: string, m: DocsMessages): DefaultTheme.SidebarItem[] {
  const s = m.sidebar;
  return [
    {
      text: s.guide,
      items: [
        { text: s.gettingStarted, link: `${prefix}/guide/getting-started` },
        { text: s.examples, link: `${prefix}/guide/examples` },
        { text: s.recipes, link: `${prefix}/guide/recipes` },
        { text: s.coreConcepts, link: `${prefix}/guide/core-concepts` },
        { text: s.displayVsStorage, link: `${prefix}/guide/display-vs-storage` },
        { text: s.theming, link: `${prefix}/guide/theming` },
        { text: s.selectionRules, link: `${prefix}/guide/selection-rules` },
        { text: s.timeSelection, link: `${prefix}/guide/time-selection` },
        { text: s.holidays, link: `${prefix}/guide/holidays` },
        { text: s.eventCalendar, link: `${prefix}/guide/event-calendar` },
        { text: s.react, link: `${prefix}/guide/react` },
        { text: s.vue, link: `${prefix}/guide/vue` },
        { text: s.webComponents, link: `${prefix}/guide/web-components` },
        { text: s.i18n, link: `${prefix}/guide/i18n` },
        { text: s.nlp, link: `${prefix}/guide/nlp` },
        { text: s.browserSupport, link: `${prefix}/guide/browser-support` },
        { text: s.comparison, link: `${prefix}/guide/comparison` },
      ],
    },
  ];
}

function apiSidebar(m: DocsMessages): DefaultTheme.SidebarItem[] {
  const s = m.sidebar;
  // TypeDoc output stays English at /api/. Both locales link there.
  return [
    {
      text: s.api,
      items: [
        { text: s.apiCore, link: '/api/jalali-js/' },
        { text: '@jalali-js/i18n', link: '/api/@jalali-js/i18n/' },
        { text: '@jalali-js/nlp', link: '/api/@jalali-js/nlp/' },
        { text: '@jalali-js/holidays', link: '/api/@jalali-js/holidays/' },
        { text: '@jalali-js/react', link: '/api/@jalali-js/react/' },
        { text: '@jalali-js/vue', link: '/api/@jalali-js/vue/' },
        { text: '@jalali-js/ui-react', link: '/api/@jalali-js/ui-react/' },
        { text: '@jalali-js/web', link: '/api/@jalali-js/web/' },
        { text: '@jalali-js/ui-web', link: '/api/@jalali-js/ui-web/' },
      ],
    },
  ];
}

export function buildLocaleConfig(
  locale: DocsLocaleId,
): LocaleSpecificConfig<DefaultTheme.Config> & { label: string; link?: string } {
  const m = messages[locale];
  const prefix = prefixFor(locale);

  return {
    label: m.label,
    lang: m.lang,
    dir: m.dir,
    description: m.description,
    link: locale === 'fa' ? '/fa/' : undefined,
    markdown: {
      container: {
        tipLabel: m.markdown.tipLabel,
        warningLabel: m.markdown.warningLabel,
        dangerLabel: m.markdown.dangerLabel,
        infoLabel: m.markdown.infoLabel,
        detailsLabel: m.markdown.detailsLabel,
      },
      codeCopyButton: {
        tooltipText: m.markdown.copyTooltip,
        copiedText: m.markdown.copiedText,
      },
    },
    themeConfig: {
      nav: [
        { text: m.nav.guide, link: `${prefix}/guide/getting-started` },
        { text: m.nav.api, link: '/api/jalali-js/' },
        { text: m.nav.npm, items: [...NPM_ITEMS] },
        {
          text: m.nav.playground,
          items: [
            { text: m.nav.playgroundReact, link: '/playground/react/' },
            { text: m.nav.playgroundVue, link: '/playground/vue/' },
            { text: m.nav.playgroundVanilla, link: '/playground/vanilla/' },
          ],
        },
      ],
      sidebar: {
        [`${prefix}/guide/`]: guideSidebar(prefix, m),
        '/api/': apiSidebar(m),
      },
      outline: { label: m.theme.outline },
      returnToTopLabel: m.theme.returnToTopLabel,
      sidebarMenuLabel: m.theme.sidebarMenuLabel,
      darkModeSwitchLabel: m.theme.darkModeSwitchLabel,
      lightModeSwitchTitle: m.theme.lightModeSwitchTitle,
      darkModeSwitchTitle: m.theme.darkModeSwitchTitle,
      langMenuLabel: m.theme.langMenuLabel,
      docFooter: {
        prev: m.theme.docFooterPrev,
        next: m.theme.docFooterNext,
      },
    },
  };
}

export function searchLocaleOptions(): NonNullable<
  NonNullable<DefaultTheme.LocalSearchOptions['locales']>
> {
  const out: NonNullable<DefaultTheme.LocalSearchOptions['locales']> = {};
  for (const id of Object.keys(messages) as DocsLocaleId[]) {
    const m = messages[id];
    out[id] = {
      translations: {
        button: {
          buttonText: m.search.buttonText,
          buttonAriaLabel: m.search.buttonAriaLabel,
        },
        modal: {
          displayDetails: m.search.modalDisplayDetails,
          resetButtonTitle: m.search.modalResetButtonTitle,
          backButtonTitle: m.search.modalBackButtonTitle,
          noResultsText: m.search.modalNoResultsText,
          footer: {
            navigateText: m.search.modalFooterNavigateText,
            selectText: m.search.modalFooterSelectText,
            closeText: m.search.modalFooterCloseText,
          },
        },
      },
    };
  }
  return out;
}

export { messages };
