/**
 * Docs UI strings per locale. Page bodies live as markdown under the locale
 * tree. Keep labels here so nav and sidebar stay DRY.
 */
export type DocsLocaleId = 'root' | 'fa';

export interface DocsMessages {
  label: string;
  lang: string;
  dir: 'ltr' | 'rtl';
  description: string;
  nav: {
    guide: string;
    api: string;
    npm: string;
    playground: string;
    playgroundReact: string;
    playgroundVue: string;
    playgroundVanilla: string;
  };
  sidebar: {
    guide: string;
    api: string;
    gettingStarted: string;
    examples: string;
    recipes: string;
    coreConcepts: string;
    displayVsStorage: string;
    theming: string;
    selectionRules: string;
    timeSelection: string;
    holidays: string;
    eventCalendar: string;
    react: string;
    vue: string;
    webComponents: string;
    i18n: string;
    nlp: string;
    browserSupport: string;
    comparison: string;
    apiCore: string;
  };
  theme: {
    outline: string;
    returnToTopLabel: string;
    sidebarMenuLabel: string;
    darkModeSwitchLabel: string;
    lightModeSwitchTitle: string;
    darkModeSwitchTitle: string;
    langMenuLabel: string;
    docFooterPrev: string;
    docFooterNext: string;
  };
  search: {
    buttonText: string;
    buttonAriaLabel: string;
    modalDisplayDetails: string;
    modalResetButtonTitle: string;
    modalBackButtonTitle: string;
    modalNoResultsText: string;
    modalFooterNavigateText: string;
    modalFooterSelectText: string;
    modalFooterCloseText: string;
  };
  markdown: {
    tipLabel: string;
    warningLabel: string;
    dangerLabel: string;
    infoLabel: string;
    detailsLabel: string;
    copyTooltip: string;
    copiedText: string;
  };
}

export const messages = {
  root: {
    label: 'English',
    lang: 'en',
    dir: 'ltr',
    description:
      'A TypeScript-native Jalali (Persian) calendar toolkit, with first-class React and Vue bindings.',
    nav: {
      guide: 'Guide',
      api: 'API',
      npm: 'npm ecosystem',
      playground: 'Playground',
      playgroundReact: 'React',
      playgroundVue: 'Vue',
      playgroundVanilla: 'Vanilla / Web Components',
    },
    sidebar: {
      guide: 'Guide',
      api: 'API reference',
      gettingStarted: 'Getting started',
      examples: 'Examples',
      recipes: 'Recipes',
      coreConcepts: 'Core concepts',
      displayVsStorage: 'Display value vs. storage value',
      theming: 'Configuration and theming',
      selectionRules: 'Selection rules',
      timeSelection: 'Time selection',
      holidays: 'Holidays',
      eventCalendar: 'Event calendar',
      react: 'React',
      vue: 'Vue',
      webComponents: 'Vanilla / Web Components',
      i18n: 'Internationalization',
      nlp: 'Natural language parsing',
      browserSupport: 'Browser support',
      comparison: 'Comparison with alternatives',
      apiCore: 'jalali-js (core)',
    },
    theme: {
      outline: 'On this page',
      returnToTopLabel: 'Return to top',
      sidebarMenuLabel: 'Menu',
      darkModeSwitchLabel: 'Appearance',
      lightModeSwitchTitle: 'Switch to light theme',
      darkModeSwitchTitle: 'Switch to dark theme',
      langMenuLabel: 'Change language',
      docFooterPrev: 'Previous page',
      docFooterNext: 'Next page',
    },
    search: {
      buttonText: 'Search',
      buttonAriaLabel: 'Search',
      modalDisplayDetails: 'Display detailed list',
      modalResetButtonTitle: 'Reset search',
      modalBackButtonTitle: 'Close search',
      modalNoResultsText: 'No results for',
      modalFooterNavigateText: 'to navigate',
      modalFooterSelectText: 'to select',
      modalFooterCloseText: 'to close',
    },
    markdown: {
      tipLabel: 'TIP',
      warningLabel: 'WARNING',
      dangerLabel: 'DANGER',
      infoLabel: 'INFO',
      detailsLabel: 'Details',
      copyTooltip: 'Copy Code',
      copiedText: 'Copied!',
    },
  },
  fa: {
    label: 'فارسی',
    lang: 'fa-IR',
    dir: 'rtl',
    description: 'کیت تقویم جلالی (هجری شمسی) با TypeScript بومی، به‌همراه رابط‌های React و Vue.',
    nav: {
      guide: 'راهنما',
      api: 'API',
      npm: 'اکوسیستم npm',
      playground: 'زمین بازی',
      playgroundReact: 'React',
      playgroundVue: 'Vue',
      playgroundVanilla: 'Vanilla / Web Components',
    },
    sidebar: {
      guide: 'راهنما',
      api: 'مرجع API',
      gettingStarted: 'شروع کار',
      examples: 'مثال‌ها',
      recipes: 'دستورالعمل‌ها',
      coreConcepts: 'مفاهیم اصلی',
      displayVsStorage: 'مقدار نمایش در برابر مقدار ذخیره',
      theming: 'پیکربندی و قالب ظاهری',
      selectionRules: 'قواعد انتخاب',
      timeSelection: 'انتخاب زمان',
      holidays: 'تعطیلات',
      eventCalendar: 'تقویم رویداد',
      react: 'React',
      vue: 'Vue',
      webComponents: 'Vanilla / Web Components',
      i18n: 'بین‌المللی‌سازی',
      nlp: 'پردازش زبان طبیعی',
      browserSupport: 'پشتیبانی مرورگر',
      comparison: 'مقایسه با گزینه‌های دیگر',
      apiCore: 'jalali-js (هسته)',
    },
    theme: {
      outline: 'در این صفحه',
      returnToTopLabel: 'بازگشت به بالا',
      sidebarMenuLabel: 'منو',
      darkModeSwitchLabel: 'ظاهر',
      lightModeSwitchTitle: 'رفتن به پوسته روشن',
      darkModeSwitchTitle: 'رفتن به پوسته تیره',
      langMenuLabel: 'تغییر زبان',
      docFooterPrev: 'صفحه قبل',
      docFooterNext: 'صفحه بعد',
    },
    search: {
      buttonText: 'جستجو',
      buttonAriaLabel: 'جستجو',
      modalDisplayDetails: 'نمایش فهرست جزئیات',
      modalResetButtonTitle: 'پاک کردن جستجو',
      modalBackButtonTitle: 'بستن جستجو',
      modalNoResultsText: 'نتیجه‌ای برای',
      modalFooterNavigateText: 'برای حرکت',
      modalFooterSelectText: 'برای انتخاب',
      modalFooterCloseText: 'برای بستن',
    },
    markdown: {
      tipLabel: 'نکته',
      warningLabel: 'هشدار',
      dangerLabel: 'خطر',
      infoLabel: 'اطلاعات',
      detailsLabel: 'جزئیات',
      copyTooltip: 'کپی کد',
      copiedText: 'کپی شد!',
    },
  },
} as const satisfies Record<DocsLocaleId, DocsMessages>;
