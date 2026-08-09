import '@jalali-js/react/date-picker.css';
import '@jalali-js/ui-react/themes/dark.css';
import '@jalali-js/ui-react/themes/compact.css';
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

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640 }}>
      <h1>jalali-js playground</h1>
      <p>
        This page has the dark + compact themes from <code>@jalali-js/ui-react/themes</code> applied
        throughout, to demonstrate composing multiple theme files (see the two CSS imports at the
        top of this file). Every component below shares one page-wide theme, since the theming
        contract is CSS custom properties on each picker's root element, the same design a whole-app
        theme switch relies on.
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

      <section data-testid="dropdown">
        <h2>Dropdown variant (date-of-birth style entry)</h2>
        <DatePicker system="jalali" locale="en" variant="dropdown" />
      </section>

      <section data-testid="gregorian">
        <h2>Gregorian system</h2>
        <DatePicker system="gregorian" locale="en" />
      </section>

      <section data-testid="inline-calendar">
        <h2>Inline calendar (@jalali-js/ui-react)</h2>
        <InlineCalendar
          system="jalali"
          locale="en"
          value={inlineSelected}
          onSelect={setInlineSelected}
        />
        <p>Selected: {inlineSelected ? JSON.stringify(inlineSelected) : 'none'}</p>
      </section>

      <section data-testid="range-picker">
        <h2>Range picker (@jalali-js/ui-react)</h2>
        <RangePicker system="jalali" locale="en" onChange={(value) => setStoredRange(value)} />
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
          <DatePicker system="jalali" locale="en" />
        </div>
      </section>
    </main>
  );
}
