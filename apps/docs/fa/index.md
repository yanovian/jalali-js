---
layout: home
hero:
  name: jalali-js
  text: کتابخانه تقویم جلالی، ساخته‌شده با TypeScript
  tagline: نمایش تاریخ جلالی (هجری شمسی)، با ذخیره‌سازی خودکار مقدار میلادی و بدون هیچ کار اضافه‌ای.
  actions:
    - theme: brand
      text: نسخه زنده
      link: /playground/react/
    - theme: alt
      text: شروع کار
      link: /fa/guide/getting-started
    - theme: alt
      text: مرجع API
      link: /api/jalali-js/
features:
  - title: نمایش جلالی، ذخیره میلادی
    details: هر مؤلفه و هر تابع تبدیل هسته، به‌صورت پیش‌فرض یک مقدار میلادی و مستقل از تقویم برمی‌گرداند؛ همان قراردادی که یک <input type="date"> بومی دارد. در صورت نیاز واقعی، می‌توانید با یک گزینه، ذخیره‌سازی مقدار جلالی را هم فعال کنید.
  - title: لایه‌های دقت، نه فیلدهای اختیاری
    details: CalendarDate، CalendarDateTime و ZonedCalendarDateTime سه نوع جدا هستند و با لایه‌های TC39 Temporal هم‌خوانی دارند. کدی که با تاریخ ساده نوشته شده، هرگز فیلد زمان خوانده‌نشده را نمی‌خواند.
  - title: React، Vue، یا بدون فریم‌ورک
    details: پریمیتیوهای بدون ظاهر (ویژگی‌های data و scoped slot) برای کنترل کامل، به‌همراه DatePicker با ظاهر پیش‌فرض برای استفاده فوری. `@jalali-js/web` همان مؤلفه‌ها را به‌صورت Web Components می‌فرستد، تا صفحه بدون فریم‌ورک یا هر میزبان بدون بایندینگ اختصاصی، همان انتخابگر و CSS قالب را بگیرد.
  - title: بر پایه موتور حسابی اعتبارسنجی‌شده
    details: قاعده سال کبیسه جلالی در برابر تقویم پارسی ICU خود Node در بازه‌ای چند هزار ساله بدون اختلاف بررسی شده است، به‌همراه یک جدول مرجع مستقل و منتشرشده.
---

## از اینجا شروع کنید

- [نسخه زنده (React)](/playground/react/) · [Vue](/playground/vue/) · [Web Components](/playground/vanilla/)
- [راهنمای مستندات](/fa/guide/getting-started)
- [مرجع API](/api/jalali-js/)
- [مقایسه گزینه‌ها](/fa/guide/comparison)

## اکوسیستم npm

[`jalali-js`](https://www.npmjs.com/package/jalali-js) ·
[`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n) ·
[`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp) ·
[`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) ·
[`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react) ·
[`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue) ·
[`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web) ·
[`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) ·
[`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue) ·
[`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)

| بسته                                                                       | نقش                        |
| -------------------------------------------------------------------------- | -------------------------- |
| [`jalali-js`](https://www.npmjs.com/package/jalali-js)                     | هسته تبدیل                 |
| [`@jalali-js/i18n`](https://www.npmjs.com/package/@jalali-js/i18n)         | زبان‌ها و قالب‌بندی        |
| [`@jalali-js/nlp`](https://www.npmjs.com/package/@jalali-js/nlp)           | پردازش زبان طبیعی          |
| [`@jalali-js/holidays`](https://www.npmjs.com/package/@jalali-js/holidays) | تعطیلات ایران              |
| [`@jalali-js/react`](https://www.npmjs.com/package/@jalali-js/react)       | بایندینگ React             |
| [`@jalali-js/vue`](https://www.npmjs.com/package/@jalali-js/vue)           | بایندینگ Vue               |
| [`@jalali-js/web`](https://www.npmjs.com/package/@jalali-js/web)           | Web Components             |
| [`@jalali-js/ui-react`](https://www.npmjs.com/package/@jalali-js/ui-react) | رابط کاربری React          |
| [`@jalali-js/ui-vue`](https://www.npmjs.com/package/@jalali-js/ui-vue)     | رابط کاربری Vue            |
| [`@jalali-js/ui-web`](https://www.npmjs.com/package/@jalali-js/ui-web)     | رابط کاربری Web Components |
