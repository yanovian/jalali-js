import '@jalali-js/react/date-picker.css';
import { DatePicker, useCalendar } from '@jalali-js/react';
import type { StorageValue } from 'jalali-js';
import { useState } from 'react';

function CalendarSummary() {
  const jalali = useCalendar({ system: 'jalali', locale: 'fa' });
  return <p>امروز: {jalali.format(jalali.today(), { style: 'long', weekday: true })}</p>;
}

export default function App() {
  const [stored, setStored] = useState<StorageValue | null>(null);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640 }}>
      <h1>jalali-js playground</h1>
      <CalendarSummary />

      <section>
        <h2>Grid variant, English, Jalali system</h2>
        <DatePicker system="jalali" locale="en" onChange={(value) => setStored(value)} />
        <p>Stored value (Gregorian by default): {JSON.stringify(stored)}</p>
      </section>

      <section>
        <h2>Grid variant, Farsi</h2>
        <DatePicker system="jalali" locale="fa" />
      </section>

      <section>
        <h2>Dropdown variant (date-of-birth style entry)</h2>
        <DatePicker system="jalali" locale="en" variant="dropdown" />
      </section>

      <section>
        <h2>Gregorian system</h2>
        <DatePicker system="gregorian" locale="en" />
      </section>
    </main>
  );
}
