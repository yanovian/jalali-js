---
description: عبارت‌های تاریخ انگلیسی، فارسی و پشتو را به تاریخ تقویم تبدیل کنید.
---

# پردازش زبان طبیعی

:::tabs key:pm variant:code
== npm

```sh
npm install @jalali-js/nlp
```

== pnpm

```sh
pnpm add @jalali-js/nlp
```

== yarn

```sh
yarn add @jalali-js/nlp
```

:::

`parse()` یک عبارت کوتاه زبان طبیعی را می‌خواند و یک `CalendarDate` برمی‌گرداند، یا وقتی
عبارت را نشناسد `null`. سه زبان: `en`، `fa` و `ps` (پشتو). ورودی انگلیسی نام ماه‌های
جلالی با حرف لاتین را می‌پذیرد (`Mehr`، `Aban`، `Azar`). ورودی فارسی از خط پارسی
استفاده می‌کند.

این بسته برای عبارت‌های آزاد است. برای ورودی با شکل دقیق و شناخته‌شده مثل
`1403/05/15`، به‌جای آن [`parseTemplate()`](/fa/guide/i18n#parsetemplate) از
`@jalali-js/i18n` را به کار ببرید.

```ts
import { parse } from '@jalali-js/nlp';

parse('today', 'en'); // امروز، در سامانه jalali (پیش‌فرض)
parse('tomorrow', 'en');
parse('yesterday', 'en');
parse('next week', 'en');
parse('next Farvardin', 'en'); // نزدیک‌ترین رخداد آینده آن ماه

parse('امروز', 'fa'); // 'today'
parse('فردا', 'fa'); // 'tomorrow'
parse('هفته آینده', 'fa'); // 'next week'
parse('فروردین آینده', 'fa'); // 'next Farvardin'

parse('نن', 'ps'); // 'today'، به پشتو
parse('راتلونکې اونۍ', 'ps'); // 'next week'
parse('راتلونکی وری', 'ps'); // 'next Wray' (نام افغانی ماه ۱ جلالی)

parse('banana', 'en'); // null: عبارت شناخته‌شده نیست
```

`{ system: 'gregorian' }` را بدهید تا نتیجه در سامانه میلادی باشد، نه پیش‌فرض
`'jalali'`:

```ts
parse('today', 'en', { system: 'gregorian' });
```

«ماه آینده» یعنی رخداد پیش رو، نه ماهی که هم‌اکنون جاری است: اگر ماه نام‌برده امسال
شروع شده باشد، نتیجه سال بعد است. همان قرارداد «دوشنبه آینده» برای انتخاب روز داخل
یک دوره وقتی روزی داده نشده. روز روی ۱ ثابت است.

`getWordList(locale)` جدول عبارت زیرین (`WordList`) را که `parse()` با آن تطبیق
می‌دهد در دسترس می‌گذارد، برای مصرف‌کننده‌ای که می‌خواهد تطبیق خودش را بسازد و
مستقیم `parse()` را به کار نبرد. نوع کامل: [مرجع API](/api/@jalali-js/nlp/).
