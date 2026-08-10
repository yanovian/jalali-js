import '@jalali-js/react/date-picker.css';
import '@jalali-js/ui-react/themes/compact.css';
// Loaded as a string, not a global side-effect import, so the dark theme can be toggled: it
// only overrides --jalali-* custom properties on [data-jalali-*] elements (see dark.css's own
// comment), so injecting/removing it as a <style> tag turns the picker theme on and off cleanly.
import darkThemeCss from '@jalali-js/ui-react/themes/dark.css?inline';
import type { LocaleCode } from '@jalali-js/react';
import { DatePicker, useCalendar } from '@jalali-js/react';
import { InlineCalendar, RangePicker } from '@jalali-js/ui-react';
import type { RangeStorageValue } from '@jalali-js/ui-react';
import type { CalendarDate, StorageValue } from 'jalali-js';
import { useState } from 'react';

function CalendarSummary() {
  const jalali = useCalendar({ system: 'jalali', locale: 'fa' });
  return <p>امروز: {jalali.format(jalali.today(), { style: 'long', weekday: true })}</p>;
}

export default function App() {
  const [stored, setStored] = useState<StorageValue | null>(null);
  const [storedRange, setStoredRange] = useState<RangeStorageValue | null>(null);
  const [inlineSelected, setInlineSelected] = useState<CalendarDate | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [locale, setLocale] = useState<LocaleCode>('fa');

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        maxWidth: 640,
        background: isDark ? '#141414' : '#ffffff',
        color: isDark ? '#ededed' : '#1a1a1a',
        minHeight: '100vh',
      }}
    >
      {isDark && <style>{darkThemeCss}</style>}
      <h1>jalali-js playground</h1>
      <p style={{ margin: '-0.5rem 0 1rem' }}>
        React playground · <a href="../vue/">Vue playground</a> ·{' '}
        <a href="../vanilla/">Vanilla playground</a>
      </p>
      <p style={{ margin: '0 0 1rem' }}>
        <label>
          <input type="checkbox" checked={isDark} onChange={(e) => setIsDark(e.target.checked)} />{' '}
          Dark mode
        </label>
        {'  '}
        <label>
          <input
            type="checkbox"
            checked={locale === 'en'}
            onChange={(e) => setLocale(e.target.checked ? 'en' : 'fa')}
          />{' '}
          English (unchecked: Farsi)
        </label>
      </p>
      <p>
        The <code>compact</code> theme from <code>@jalali-js/ui-react/themes</code> is always on
        below, for spacing. The <code>dark</code> theme (colors) is what the dark mode toggle
        controls, applied to both the pickers and this page&rsquo;s own background: composing
        multiple theme files works by importing more than one (see the CSS imports at the top of
        this file). Every component below shares one page-wide theme, since the theming contract is
        CSS custom properties on each picker&rsquo;s root element, the same design a whole-app theme
        switch relies on. The language toggle controls every component below except the explicit
        fixed-locale comparison sections (English, Farsi, and Pashto), which always show their own
        locale.
      </p>
      <CalendarSummary />

      <section data-testid="grid-en-jalali">
        <h2>Grid variant, English, Jalali system</h2>
        <DatePicker system="jalali" locale="en" onChange={(value) => setStored(value)} />
        <p>Stored value (Gregorian by default): {JSON.stringify(stored)}</p>
      </section>

      <section data-testid="grid-fa-jalali">
        <h2>Grid variant, Farsi</h2>
        <DatePicker system="jalali" locale="fa" />
      </section>

      <section data-testid="grid-ps-jalali">
        <h2>Grid variant, Pashto (Afghan month names)</h2>
        <DatePicker system="jalali" locale="ps" />
      </section>

      <section data-testid="quick-nav">
        <h2>Quick year/month navigation (default on)</h2>
        <p>Click the month or year in the header to jump straight to a month grid or year grid.</p>
        <DatePicker system="jalali" locale={locale} />
      </section>

      <section data-testid="quick-nav-off">
        <h2>Quick navigation turned off (quickNav: false)</h2>
        <p>The month and year in the header are plain text; only the prev/next arrows page.</p>
        <DatePicker system="jalali" locale={locale} quickNav={false} />
      </section>

      <section data-testid="no-initial-selection">
        <h2>No initial selection (defaultDate: null)</h2>
        <p>Opens with nothing picked, showing the placeholder until a person picks a date.</p>
        <DatePicker system="jalali" locale={locale} defaultDate={null} />
      </section>

      <section data-testid="dropdown">
        <h2>Dropdown variant (date-of-birth style entry)</h2>
        <DatePicker system="jalali" locale={locale} variant="dropdown" />
      </section>

      <section data-testid="gregorian">
        <h2>Gregorian system</h2>
        <DatePicker system="gregorian" locale={locale} />
      </section>

      <section data-testid="inline-calendar">
        <h2>Inline calendar (@jalali-js/ui-react)</h2>
        <InlineCalendar
          system="jalali"
          locale={locale}
          value={inlineSelected}
          onSelect={setInlineSelected}
        />
        <p>Selected: {inlineSelected ? JSON.stringify(inlineSelected) : 'none'}</p>
      </section>

      <section data-testid="range-picker">
        <h2>Range picker (@jalali-js/ui-react)</h2>
        <RangePicker system="jalali" locale={locale} onChange={(value) => setStoredRange(value)} />
        <p>Stored range (Gregorian by default): {JSON.stringify(storedRange)}</p>
      </section>

      <section data-testid="custom-theme">
        <h2>Custom CSS override (consumer-configured, not a shipped theme file)</h2>
        <p>
          A consumer can retheme a picker by overriding the <code>--jalali-*</code> custom
          properties, with no theme file at all. The theme imports above already set some of those
          properties directly on every picker&rsquo;s root element, and since custom properties
          inherit rather than cascade by specificity, an ancestor&rsquo;s inline style cannot win
          against a value set directly on the root itself. This section instead follows
          architecture.md&rsquo;s own documented pattern: a scoped selector under a parent class
          (see the &quot;Theming contract&quot; section there).
        </p>
        <style>{`
          .custom-theme-scope [data-jalali-datepicker-root] {
            --jalali-primary: #c026d3;
            --jalali-primary-fg: #ffffff;
            --jalali-bg: #fdf4ff;
            --jalali-fg: #581c87;
            --jalali-radius: 20px;
          }
        `}</style>
        <div className="custom-theme-scope">
          <DatePicker system="jalali" locale={locale} />
        </div>
      </section>
    </main>
  );
}
