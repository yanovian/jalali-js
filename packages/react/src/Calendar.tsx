import { holidayDayChrome, resolveCalendarHolidays, type HolidayRegion } from '@jalali-js/holidays';
import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type { CalendarDate, CalendarSystem, SelectionRules } from 'jalali-js';
import {
  buildCalendarGrid,
  createCalendar,
  nextMonth,
  previousMonth,
  weekdayLabelsForGrid,
} from 'jalali-js';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { LocaleCode } from './use-calendar.js';
import { localePackFor } from './use-calendar.js';

const YEARS_PER_PAGE = 12;

export interface CalendarProps {
  /** Which calendar system to display. Default: 'jalali'. */
  system?: CalendarSystem;
  /** Which language the month title and weekday headers read in. Default: 'en'. */
  locale?: LocaleCode;
  /** The selected date, or `null` for none. */
  value?: CalendarDate | null;
  onSelect?: (date: CalendarDate) => void;
  /** The year/month the grid opens on. Default: `value`'s month, or today's. */
  initialDisplayedMonth?: { year: number; month: number };
  /**
   * Let a person click the month or year in the header to jump straight to a month grid or a
   * year grid, instead of paging one month at a time. Default: true.
   */
  quickNav?: boolean | undefined;
  /**
   * Limits on what a person can select (see `isDateSelectable()` in `jalali-js`). Blocked
   * days render disabled, with a `data-disabled` attribute, and reject selection.
   */
  rules?: SelectionRules | undefined;
  /**
   * Mark official holidays with a `data-holiday` attribute. Jalali system only.
   * Uses `@jalali-js/holidays`. Default list is Iran (`holidayRegion: 'IR'`).
   */
  showHolidays?: boolean;
  /**
   * Also block holiday days through Phase 16 selection rules. Jalali system only.
   * Uses `@jalali-js/holidays`.
   */
  blockHolidays?: boolean;
  /**
   * Whose official holiday list to use. Default: `'IR'` (Iran). Afghanistan and
   * Tajikistan are planned region codes; they are not shipped yet.
   */
  holidayRegion?: HolidayRegion;
  className?: string;
}

type CalendarView = 'day' | 'month' | 'year';

function yearPageStart(year: number): number {
  return year - (((year % YEARS_PER_PAGE) + YEARS_PER_PAGE) % YEARS_PER_PAGE);
}

function TitlePart({
  as,
  dataAttr,
  ariaLabel,
  onClick,
  children,
}: {
  as: 'button' | 'span';
  dataAttr: 'data-jalali-calendar-title-month' | 'data-jalali-calendar-title-year';
  ariaLabel: string;
  onClick: () => void;
  children: ReactNode;
}) {
  if (as === 'span') {
    return <span {...{ [dataAttr]: '' }}>{children}</span>;
  }
  return (
    <button type="button" {...{ [dataAttr]: '' }} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  );
}

/**
 * A headless month grid: it renders plain markup with data attributes (`data-selected`,
 * `data-today`, `data-outside-month`, `data-disabled`, `data-holiday`) and no required CSS, so a
 * consumer can restyle it completely. `DatePicker` is this same component with a default
 * stylesheet and a popover wrapped around it.
 *
 * Days blocked by `rules` render as disabled buttons: clicks do nothing and the Tab order
 * skips them, so keyboard navigation skips blocked days. With `showHolidays`, holiday days
 * get `data-holiday`. With `blockHolidays`, those days also become unselectable.
 *
 * With `quickNav` (default on), clicking the month or year in the header opens a month grid or
 * a year grid, so a person can jump years ahead without paging one month at a time. Picking a
 * year moves to the month grid; picking a month moves to the day grid.
 */
export function Calendar({
  system = 'jalali',
  locale = 'en',
  value = null,
  onSelect,
  initialDisplayedMonth,
  quickNav = true,
  rules,
  showHolidays = false,
  blockHolidays = false,
  holidayRegion = 'IR',
  className,
}: CalendarProps) {
  const localePack = useMemo(() => localePackFor(locale), [locale]);
  const today = useMemo(() => createCalendar({ system }).today(), [system]);
  const [displayed, setDisplayed] = useState(
    () =>
      initialDisplayedMonth ??
      (value ? { year: value.year, month: value.month } : { year: today.year, month: today.month }),
  );
  const [view, setView] = useState<CalendarView>('day');
  const [yearPage, setYearPage] = useState(() => yearPageStart(displayed.year));

  const holidayOptions = useMemo(
    () =>
      resolveCalendarHolidays(system, displayed.year, displayed.month, {
        showHolidays,
        blockHolidays,
        region: holidayRegion,
        rules,
      }),
    [system, displayed.year, displayed.month, showHolidays, blockHolidays, holidayRegion, rules],
  );

  const weeks = useMemo(
    () =>
      buildCalendarGrid(
        system,
        displayed.year,
        displayed.month,
        today,
        value,
        holidayOptions.rules,
        holidayOptions.isHolidayDay,
      ),
    [system, displayed.year, displayed.month, today, value, holidayOptions],
  );

  const monthLabel = localePack.monthNames[system].long[displayed.month - 1];
  const yearLabel = formatNumber(displayed.year, localePack.defaultNumerals, localePack.digits);
  const titleAs = quickNav ? 'button' : 'span';

  function openMonthView(): void {
    setView('month');
  }
  function openYearView(): void {
    setYearPage(yearPageStart(displayed.year));
    setView('year');
  }
  function pickMonth(month: number): void {
    setDisplayed((current) => ({ ...current, month }));
    setView('day');
  }
  function pickYear(year: number): void {
    setDisplayed((current) => ({ ...current, year }));
    setView('month');
  }

  return (
    <div
      className={className}
      dir={localePack.direction}
      data-jalali-calendar-root
      data-jalali-calendar-view={view}
    >
      {view === 'day' && (
        <>
          <div data-jalali-calendar-header>
            <button
              type="button"
              data-jalali-calendar-nav="previous"
              aria-label={localePack.ui.previousMonth}
              onClick={() => setDisplayed(previousMonth(system, displayed.year, displayed.month))}
            >
              ‹
            </button>
            <div data-jalali-calendar-title>
              <TitlePart
                as={titleAs}
                dataAttr="data-jalali-calendar-title-month"
                ariaLabel={localePack.ui.chooseMonth}
                onClick={openMonthView}
              >
                {monthLabel}
              </TitlePart>
              <TitlePart
                as={titleAs}
                dataAttr="data-jalali-calendar-title-year"
                ariaLabel={localePack.ui.chooseYear}
                onClick={openYearView}
              >
                {yearLabel}
              </TitlePart>
            </div>
            <button
              type="button"
              data-jalali-calendar-nav="next"
              aria-label={localePack.ui.nextMonth}
              onClick={() => setDisplayed(nextMonth(system, displayed.year, displayed.month))}
            >
              ›
            </button>
          </div>
          <div role="grid" data-jalali-calendar-grid>
            <div role="row" data-jalali-calendar-weekdays>
              {weekdayLabelsForGrid(localePack.weekdayNames.short, system).map((name, index) => (
                <span key={index} role="columnheader" data-jalali-calendar-weekday>
                  {name}
                </span>
              ))}
            </div>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} role="row" data-jalali-calendar-week>
                {week.map((cell) => {
                  const { tip, ariaLabel } = holidayDayChrome(
                    formatDate(cell.date, localePack, { style: 'long' }),
                    cell,
                    {
                      locale,
                      region: holidayRegion,
                      closedLabel: localePack.ui.closedDay,
                    },
                  );
                  return (
                    <button
                      key={`${cell.date.year}-${cell.date.month}-${cell.date.day}`}
                      type="button"
                      role="gridcell"
                      data-jalali-calendar-day
                      data-selected={cell.isSelected ? '' : undefined}
                      data-today={cell.isToday ? '' : undefined}
                      data-outside-month={cell.isCurrentMonth ? undefined : ''}
                      data-disabled={cell.isSelectable ? undefined : ''}
                      data-holiday={cell.isHoliday ? '' : undefined}
                      data-jalali-day-tip={tip}
                      disabled={!cell.isSelectable}
                      aria-selected={cell.isSelected}
                      aria-current={cell.isToday ? 'date' : undefined}
                      aria-label={ariaLabel}
                      onClick={() => onSelect?.(cell.date)}
                    >
                      {formatNumber(cell.date.day, localePack.defaultNumerals, localePack.digits)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'month' && (
        <>
          <div data-jalali-calendar-header>
            <button
              type="button"
              data-jalali-calendar-nav="previous"
              aria-label={localePack.ui.previousYear}
              onClick={() => setDisplayed((current) => ({ ...current, year: current.year - 1 }))}
            >
              ‹
            </button>
            <div data-jalali-calendar-title>
              <TitlePart
                as={titleAs}
                dataAttr="data-jalali-calendar-title-year"
                ariaLabel={localePack.ui.chooseYear}
                onClick={openYearView}
              >
                {yearLabel}
              </TitlePart>
            </div>
            <button
              type="button"
              data-jalali-calendar-nav="next"
              aria-label={localePack.ui.nextYear}
              onClick={() => setDisplayed((current) => ({ ...current, year: current.year + 1 }))}
            >
              ›
            </button>
          </div>
          <div role="listbox" aria-label={localePack.ui.month} data-jalali-calendar-months>
            {localePack.monthNames[system].long.map((name, index) => {
              const month = index + 1;
              const isSelected = displayed.month === month;
              const isCurrent = today.year === displayed.year && today.month === month;
              return (
                <button
                  key={name}
                  type="button"
                  role="option"
                  data-jalali-calendar-month
                  data-selected={isSelected ? '' : undefined}
                  data-today={isCurrent ? '' : undefined}
                  aria-selected={isSelected}
                  aria-current={isCurrent ? 'true' : undefined}
                  onClick={() => pickMonth(month)}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </>
      )}

      {view === 'year' && (
        <>
          <div data-jalali-calendar-header>
            <button
              type="button"
              data-jalali-calendar-nav="previous"
              aria-label={localePack.ui.previousYears}
              onClick={() => setYearPage((current) => current - YEARS_PER_PAGE)}
            >
              ‹
            </button>
            <span data-jalali-calendar-title>
              {formatNumber(yearPage, localePack.defaultNumerals, localePack.digits)}
              {' – '}
              {formatNumber(
                yearPage + YEARS_PER_PAGE - 1,
                localePack.defaultNumerals,
                localePack.digits,
              )}
            </span>
            <button
              type="button"
              data-jalali-calendar-nav="next"
              aria-label={localePack.ui.nextYears}
              onClick={() => setYearPage((current) => current + YEARS_PER_PAGE)}
            >
              ›
            </button>
          </div>
          <div role="listbox" aria-label={localePack.ui.year} data-jalali-calendar-years>
            {Array.from({ length: YEARS_PER_PAGE }, (_, index) => yearPage + index).map((year) => {
              const isSelected = displayed.year === year;
              const isCurrent = today.year === year;
              return (
                <button
                  key={year}
                  type="button"
                  role="option"
                  data-jalali-calendar-year
                  data-selected={isSelected ? '' : undefined}
                  data-today={isCurrent ? '' : undefined}
                  aria-selected={isSelected}
                  aria-current={isCurrent ? 'true' : undefined}
                  onClick={() => pickYear(year)}
                >
                  {formatNumber(year, localePack.defaultNumerals, localePack.digits)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
