import '@jalali-js/react/date-picker.css';
import { DatePickerDemo } from './date-picker-demo';
import { TimezoneDemo } from './timezone-demo';

export default function Page() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640 }}>
      <h1>jalali-js playground (Next.js)</h1>
      <p>
        This page is server-rendered. <code>DatePickerDemo</code> and <code>TimezoneDemo</code> are
        client components, exercising <code>@jalali-js/react</code> under real SSR and hydration.
      </p>
      <TimezoneDemo />
      <DatePickerDemo />
    </main>
  );
}
