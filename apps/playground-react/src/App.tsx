import '@jalali-js/react/date-picker.css';
import '@jalali-js/ui-react/themes/compact.css';
import darkThemeCss from '@jalali-js/ui-react/themes/dark.css?inline';
import type { LocaleCode } from '@jalali-js/react';
import { DatePicker, TimePicker, useCalendar } from '@jalali-js/react';
import { EventCalendar, InlineCalendar, RangePicker, TimeRangePicker } from '@jalali-js/ui-react';
import type { RangeStorageValue } from '@jalali-js/ui-react';
import type { CalendarDate, CalendarEvent, StorageValue, TimeOfDay } from 'jalali-js';
import {
  DEMO_DAY,
  DEMO_EVENTS,
  DEMO_MONTH,
  DEMO_TIMELINE_EVENTS,
  comfortableDensityCss,
  parseDemoState,
  reactSnippet,
  themeOverrideCss,
  writeDemoStateToUrl,
  type DemoState,
  type DemoTab,
} from 'playground-shared';
import { useEffect, useMemo, useState } from 'react';
import './demo.css';

const TABS: { id: DemoTab; label: string }[] = [
  { id: 'date-picker', label: 'DatePicker' },
  { id: 'range-picker', label: 'RangePicker' },
  { id: 'inline-calendar', label: 'InlineCalendar' },
  { id: 'event-calendar', label: 'EventCalendar' },
  { id: 'time-picker', label: 'TimePicker' },
  { id: 'datetime-picker', label: 'DateTime' },
  { id: 'time-range-picker', label: 'TimeRange' },
  { id: 'position', label: 'Position' },
];

const demoEvents = DEMO_EVENTS as unknown as CalendarEvent[];
const demoTimelineEvents = DEMO_TIMELINE_EVENTS as unknown as CalendarEvent[];

function CalendarSummary() {
  const jalali = useCalendar({ system: 'jalali', locale: 'fa' });
  return <p>امروز: {jalali.format(jalali.today(), { style: 'long', weekday: true })}</p>;
}

function useDemoState(): [DemoState, (patch: Partial<DemoState>) => void] {
  const [state, setState] = useState(() => parseDemoState(window.location.search));
  useEffect(() => {
    writeDemoStateToUrl(state);
  }, [state]);
  useEffect(() => {
    document.documentElement.style.colorScheme = state.dark ? 'dark' : 'light';
  }, [state.dark]);
  const patch = (next: Partial<DemoState>) => setState((prev) => ({ ...prev, ...next }));
  return [state, patch];
}

export default function App() {
  const [state, patch] = useDemoState();
  const [stored, setStored] = useState<StorageValue | null>(null);
  const [storedRange, setStoredRange] = useState<RangeStorageValue | null>(null);
  const [time, setTime] = useState<TimeOfDay>({ hour: 14, minute: 30 });
  const [timeRange, setTimeRange] = useState<{ start: TimeOfDay; end: TimeOfDay } | null>(null);
  const [inlineSelected, setInlineSelected] = useState<CalendarDate | null>(null);
  const [eventClickLog, setEventClickLog] = useState('none');
  const [copyLabel, setCopyLabel] = useState('Copy');

  const snippet = useMemo(() => reactSnippet(state), [state]);
  const themeCss = useMemo(() => themeOverrideCss(state.theme), [state.theme]);
  // Host chrome stays LTR. Page direction only wraps the live stage.
  // Pickers keep locale direction on their own roots, not from this value.
  const stageDir = state.dir === 'auto' ? 'ltr' : state.dir;

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet);
    setCopyLabel('Copied');
    window.setTimeout(() => setCopyLabel('Copy'), 1200);
  }

  return (
    <main
      className="demo-page"
      dir="ltr"
      style={{
        background: state.dark ? '#141414' : '#ffffff',
        color: state.dark ? '#ededed' : '#1a1a1a',
      }}
    >
      {state.dark && <style>{darkThemeCss}</style>}
      {themeCss ? <style>{themeCss}</style> : null}
      {!state.compact && <style>{comfortableDensityCss()}</style>}

      <div className="demo-shell" data-testid="demo-shell">
        <div>
          <h1>jalali-js playground</h1>
          <p className="demo-bindings">
            <strong>React</strong>
            <a href="../vue/">Vue</a>
            <a href="../vanilla/">Web Components</a>
          </p>
          <CalendarSummary />
        </div>

        <div className="demo-tabs" role="tablist" aria-label="Component">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={state.tab === tab.id}
              onClick={() => patch({ tab: tab.id })}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="demo-controls">
          <label>
            Locale
            <select
              value={state.locale}
              onChange={(e) => patch({ locale: e.target.value as DemoState['locale'] })}
            >
              <option value="en">en</option>
              <option value="fa">fa</option>
              <option value="ps">ps</option>
            </select>
          </label>
          <label>
            System
            <select
              value={state.system}
              onChange={(e) => patch({ system: e.target.value as DemoState['system'] })}
            >
              <option value="jalali">jalali</option>
              <option value="gregorian">gregorian</option>
            </select>
          </label>
          <label>
            Variant
            <select
              value={state.variant}
              onChange={(e) => patch({ variant: e.target.value as DemoState['variant'] })}
            >
              <option value="grid">grid</option>
              <option value="dropdown">dropdown</option>
            </select>
          </label>
          <label>
            valueFormat
            <select
              value={state.valueFormat}
              onChange={(e) => patch({ valueFormat: e.target.value as DemoState['valueFormat'] })}
            >
              <option value="gregorian-iso">gregorian-iso</option>
              <option value="jalali-object">jalali-object</option>
            </select>
          </label>
          <label>
            Display style
            <select
              value={state.displayStyle}
              onChange={(e) => patch({ displayStyle: e.target.value as DemoState['displayStyle'] })}
            >
              <option value="short">short</option>
              <option value="long">long</option>
            </select>
          </label>
          <label>
            Event view
            <select
              value={state.eventView}
              onChange={(e) => patch({ eventView: e.target.value as DemoState['eventView'] })}
            >
              <option value="month">month</option>
              <option value="week">week</option>
              <option value="day">day</option>
              <option value="timeline">timeline</option>
            </select>
          </label>
          {state.tab === 'event-calendar' && state.eventView === 'timeline' ? (
            <>
              <label>
                Direction
                <select
                  value={state.timelineDirection}
                  onChange={(e) =>
                    patch({
                      timelineDirection: e.target.value as DemoState['timelineDirection'],
                    })
                  }
                >
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                </select>
              </label>
              <label>
                Marker shape
                <select
                  value={state.timelineMarkerShape}
                  onChange={(e) =>
                    patch({
                      timelineMarkerShape: e.target.value as DemoState['timelineMarkerShape'],
                    })
                  }
                >
                  <option value="circular">Circular</option>
                  <option value="square">Square</option>
                </select>
              </label>
              <label>
                Marker size
                <input
                  type="range"
                  min={16}
                  max={40}
                  value={state.timelineMarkerSize}
                  onChange={(e) => patch({ timelineMarkerSize: Number(e.target.value) || 24 })}
                />
              </label>
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={state.timelineShowIcons}
                    onChange={(e) => patch({ timelineShowIcons: e.target.checked })}
                  />{' '}
                  Show icons
                </span>
              </label>
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={state.timelineAlternating}
                    onChange={(e) => patch({ timelineAlternating: e.target.checked })}
                  />{' '}
                  Alternating layout
                </span>
              </label>
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={state.nativeDigits}
                    onChange={(e) => patch({ nativeDigits: e.target.checked })}
                  />{' '}
                  Native digits
                </span>
              </label>
            </>
          ) : null}
          <label>
            Minute step
            <input
              type="number"
              min={1}
              max={30}
              value={state.minuteStep}
              onChange={(e) => patch({ minuteStep: Number(e.target.value) || 15 })}
            />
          </label>
          <label>
            Page direction
            <select
              value={state.dir}
              onChange={(e) => patch({ dir: e.target.value as DemoState['dir'] })}
            >
              <option value="auto">auto</option>
              <option value="ltr">ltr</option>
              <option value="rtl">rtl</option>
            </select>
          </label>
          <label>
            Primary
            <input
              type="color"
              value={state.theme.primary || '#2563eb'}
              onChange={(e) => patch({ theme: { ...state.theme, primary: e.target.value } })}
            />
          </label>
          <label>
            Background
            <input
              type="color"
              value={state.theme.bg || (state.dark ? '#1f1f1f' : '#ffffff')}
              onChange={(e) => patch({ theme: { ...state.theme, bg: e.target.value } })}
            />
          </label>
          <label>
            Radius
            <input
              type="text"
              placeholder="e.g. 12px"
              value={state.theme.radius}
              onChange={(e) => patch({ theme: { ...state.theme, radius: e.target.value } })}
            />
          </label>
          <label>
            Gap
            <input
              type="text"
              placeholder="e.g. 0.5em"
              value={state.theme.gap}
              onChange={(e) => patch({ theme: { ...state.theme, gap: e.target.value } })}
            />
          </label>
          <label>
            <span>
              <input
                type="checkbox"
                checked={state.dark}
                onChange={(e) => patch({ dark: e.target.checked })}
              />{' '}
              Dark
            </span>
          </label>
          <label>
            <span>
              <input
                type="checkbox"
                checked={state.compact}
                onChange={(e) => patch({ compact: e.target.checked })}
              />{' '}
              Compact
            </span>
          </label>
          <label>
            <span>
              <input
                type="checkbox"
                checked={state.showHolidays}
                onChange={(e) => patch({ showHolidays: e.target.checked })}
              />{' '}
              Show holidays
            </span>
          </label>
        </div>

        <div className="demo-stage" dir={stageDir}>
          {state.tab === 'date-picker' && (
            <DatePicker
              system={state.system}
              locale={state.locale}
              variant={state.variant}
              valueFormat={state.valueFormat}
              displayFormat={{ style: state.displayStyle }}
              showHolidays={state.showHolidays}
              onChange={(value) => setStored(value)}
            />
          )}
          {state.tab === 'range-picker' && (
            <RangePicker
              system={state.system}
              locale={state.locale}
              valueFormat={state.valueFormat}
              showHolidays={state.showHolidays}
              onChange={(value) => setStoredRange(value)}
            />
          )}
          {state.tab === 'inline-calendar' && (
            <InlineCalendar
              system={state.system}
              locale={state.locale}
              value={inlineSelected}
              showHolidays={state.showHolidays}
              onSelect={setInlineSelected}
            />
          )}
          {state.tab === 'event-calendar' && (
            <EventCalendar
              system={state.system}
              locale={state.locale}
              view={state.eventView}
              initialDisplayedMonth={DEMO_MONTH}
              initialDate={DEMO_DAY}
              displayFormat={{
                style: state.displayStyle,
                numerals: state.nativeDigits ? 'native' : 'latin',
              }}
              timeline={{
                direction: state.timelineDirection,
                markerShape: state.timelineMarkerShape,
                showIcons: state.timelineShowIcons,
                alternating: state.timelineAlternating,
                markerSize: state.timelineMarkerSize,
              }}
              events={state.eventView === 'timeline' ? demoTimelineEvents : demoEvents}
              onEventClick={(event) => setEventClickLog(event.title)}
            />
          )}
          {state.tab === 'time-picker' && (
            <TimePicker
              locale={state.locale}
              value={time}
              minuteStep={state.minuteStep}
              onChange={setTime}
            />
          )}
          {state.tab === 'datetime-picker' && (
            <DatePicker
              system={state.system}
              locale={state.locale}
              variant={state.variant}
              precision="datetime"
              minuteStep={state.minuteStep}
              valueFormat={state.valueFormat}
              defaultDate={{
                precision: 'datetime',
                system: 'jalali',
                year: 1403,
                month: 5,
                day: 15,
                hour: 14,
                minute: 30,
                second: 0,
                millisecond: 0,
              }}
              onChange={(value) => setStored(value)}
            />
          )}
          {state.tab === 'time-range-picker' && (
            <TimeRangePicker
              locale={state.locale}
              minuteStep={state.minuteStep}
              onChange={setTimeRange}
            />
          )}
          {state.tab === 'position' && (
            <div className="demo-position-frame" data-testid="viewport-position">
              <div className="corner corner-tl">
                <DatePicker system={state.system} locale={state.locale} />
              </div>
              <div className="corner corner-tr">
                <DatePicker system={state.system} locale={state.locale} />
              </div>
              <div className="corner corner-bl">
                <DatePicker system={state.system} locale={state.locale} />
              </div>
              <div className="corner corner-br">
                <DatePicker system={state.system} locale={state.locale} />
              </div>
            </div>
          )}
        </div>

        <p className="demo-value">
          Emitted value (storage):{' '}
          {JSON.stringify(
            state.tab === 'range-picker'
              ? storedRange
              : state.tab === 'time-picker'
                ? time
                : state.tab === 'time-range-picker'
                  ? timeRange
                  : state.tab === 'inline-calendar'
                    ? inlineSelected
                    : state.tab === 'event-calendar'
                      ? { lastEventClick: eventClickLog }
                      : stored,
          )}
        </p>

        <div className="demo-snippet-section">
          <strong>Code</strong>
          <div className="demo-snippet-block">
            <button type="button" className="demo-snippet-copy" onClick={() => void copySnippet()}>
              {copyLabel}
            </button>
            <pre className="demo-snippet">{snippet}</pre>
          </div>
        </div>
      </div>

      <h2>Visual matrix</h2>
      <p>
        Stable cells for visual e2e. Page defaults match dark + compact + fa unless the URL
        overrides them.
      </p>
      <div className="demo-gallery">
        <section data-testid="grid-en-jalali">
          <h3>Grid, English, Jalali</h3>
          <DatePicker system="jalali" locale="en" onChange={(value) => setStored(value)} />
          <p>Stored value: {JSON.stringify(stored)}</p>
        </section>
        <section data-testid="grid-fa-jalali">
          <h3>Grid, Farsi</h3>
          <DatePicker system="jalali" locale="fa" />
        </section>
        <section data-testid="grid-ps-jalali">
          <h3>Grid, Pashto</h3>
          <DatePicker system="jalali" locale="ps" />
        </section>
        <section data-testid="dropdown">
          <h3>Dropdown</h3>
          <DatePicker system="jalali" locale={state.locale as LocaleCode} variant="dropdown" />
        </section>
        <section data-testid="gregorian">
          <h3>Gregorian</h3>
          <DatePicker system="gregorian" locale={state.locale as LocaleCode} />
        </section>
        <section data-testid="inline-calendar">
          <h3>Inline calendar</h3>
          <InlineCalendar
            system="jalali"
            locale={state.locale as LocaleCode}
            value={inlineSelected}
            onSelect={setInlineSelected}
          />
        </section>
        <section data-testid="range-picker">
          <h3>Range picker</h3>
          <RangePicker
            system="jalali"
            locale={state.locale as LocaleCode}
            onChange={(value) => setStoredRange(value)}
          />
        </section>
        <section data-testid="time-picker">
          <h3>Time picker</h3>
          <TimePicker
            locale={state.locale as LocaleCode}
            value={time}
            minuteStep={15}
            onChange={setTime}
          />
        </section>
        <section data-testid="datetime-picker">
          <h3>Date and time</h3>
          <DatePicker
            system="jalali"
            locale={state.locale as LocaleCode}
            precision="datetime"
            minuteStep={15}
            defaultDate={{
              precision: 'datetime',
              system: 'jalali',
              year: 1403,
              month: 5,
              day: 15,
              hour: 14,
              minute: 30,
              second: 0,
              millisecond: 0,
            }}
            onChange={(value) => setStored(value)}
          />
        </section>
        <section data-testid="time-range-picker">
          <h3>Time range</h3>
          <TimeRangePicker
            locale={state.locale as LocaleCode}
            minuteStep={15}
            onChange={setTimeRange}
          />
        </section>
        <section data-testid="event-calendar">
          <h3>Event calendar month</h3>
          <EventCalendar
            system="jalali"
            locale={state.locale as LocaleCode}
            view="month"
            initialDisplayedMonth={DEMO_MONTH}
            events={demoEvents}
            onEventClick={(event) => setEventClickLog(event.title)}
          />
        </section>
        <section data-testid="event-calendar-week">
          <h3>Event calendar week</h3>
          <EventCalendar
            system="jalali"
            locale={state.locale as LocaleCode}
            view="week"
            initialDate={DEMO_DAY}
            events={demoEvents}
          />
        </section>
        <section data-testid="event-calendar-day">
          <h3>Event calendar day</h3>
          <EventCalendar
            system="jalali"
            locale={state.locale as LocaleCode}
            view="day"
            initialDate={DEMO_DAY}
            events={demoEvents}
          />
        </section>
        <section data-testid="event-calendar-timeline">
          <h3>Event calendar timeline</h3>
          <EventCalendar
            system="jalali"
            locale={state.locale as LocaleCode}
            view="timeline"
            events={demoTimelineEvents}
            timeline={{ direction: 'vertical', showIcons: true, alternating: true }}
            onEventClick={(event) => setEventClickLog(event.title)}
          />
        </section>
        <section data-testid="selection-rules">
          <h3>Selection rules</h3>
          <InlineCalendar
            system="jalali"
            locale={state.locale as LocaleCode}
            initialDisplayedMonth={DEMO_MONTH}
            rules={{
              minDate: { year: 1403, month: 5, day: 5 },
              maxDate: { year: 1403, month: 5, day: 28 },
              disabledDates: [{ year: 1403, month: 5, day: 12 }],
              disabledWeekdays: [4, 5],
            }}
          />
        </section>
        <section data-testid="holidays">
          <h3>Iran holidays</h3>
          <InlineCalendar
            system="jalali"
            locale={state.locale as LocaleCode}
            initialDisplayedMonth={{ year: 1403, month: 1 }}
            showHolidays
            holidayRegion="IR"
          />
        </section>
        <section data-testid="holidays-and-rules">
          <h3>Holidays and rules</h3>
          <InlineCalendar
            system="jalali"
            locale={state.locale as LocaleCode}
            initialDisplayedMonth={{ year: 1403, month: 1 }}
            showHolidays
            blockHolidays
            holidayRegion="IR"
            rules={{
              minDate: { year: 1403, month: 1, day: 1 },
              maxDate: { year: 1403, month: 1, day: 31 },
              disabledWeekdays: [5],
            }}
          />
        </section>
        <section data-testid="custom-theme">
          <h3>Custom theme</h3>
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
            <DatePicker system="jalali" locale={state.locale as LocaleCode} />
          </div>
        </section>
      </div>
    </main>
  );
}
