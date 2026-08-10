import { format as formatDate, formatNumber } from '@jalali-js/i18n';
import type { CalendarDate, CalendarSystem, SelectionRules } from 'jalali-js';
import { buildCalendarGrid, createCalendar, nextMonth, previousMonth } from 'jalali-js';
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
 * `data-today`, `data-outside-month`, `data-disabled`) and no required CSS, so a consumer can
 * restyle it completely. `DatePicker` is this same component with a default stylesheet and a
 * popover wrapped around it.
 *
 * Days blocked by `rules` render as disabled buttons: clicks do nothing and the Tab order
 * skips them, so keyboard navigation skips blocked days.
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

  const weeks = useMemo(
    () => buildCalendarGrid(system, displayed.year, displayed.month, today, value, rules),
    [system, displayed.year, displayed.month, today, value, rules],
  );

  const monthLabel = localePack.monthNames[system].long[displayed.month - 1];
  const yearLabel = formatNumber(displayed.year, localePack.defaultNumerals, localePack.digits);
  const previousGlyph = localePack.direction === 'rtl' ? '›' : '‹';
  const nextGlyph = localePack.direction === 'rtl' ? '‹' : '›';
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
              aria-label="Previous month"
              onClick={() => setDisplayed(previousMonth(system, displayed.year, displayed.month))}
            >
              {previousGlyph}
            </button>
            <div data-jalali-calendar-title>
              <TitlePart
                as={titleAs}
                dataAttr="data-jalali-calendar-title-month"
                ariaLabel="Choose month"
                onClick={openMonthView}
              >
                {monthLabel}
              </TitlePart>
              <TitlePart
                as={titleAs}
                dataAttr="data-jalali-calendar-title-year"
                ariaLabel="Choose year"
                onClick={openYearView}
              >
                {yearLabel}
              </TitlePart>
            </div>
            <button
              type="button"
              data-jalali-calendar-nav="next"
              aria-label="Next month"
              onClick={() => setDisplayed(nextMonth(system, displayed.year, displayed.month))}
            >
              {nextGlyph}
            </button>
          </div>
          <div role="grid" data-jalali-calendar-grid>
            <div role="row" data-jalali-calendar-weekdays>
              {localePack.weekdayNames.short.map((name, index) => (
                <span key={index} role="columnheader" data-jalali-calendar-weekday>
                  {name}
                </span>
              ))}
            </div>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} role="row" data-jalali-calendar-week>
                {week.map((cell) => (
                  <button
                    key={`${cell.date.year}-${cell.date.month}-${cell.date.day}`}
                    type="button"
                    role="gridcell"
                    data-jalali-calendar-day
                    data-selected={cell.isSelected ? '' : undefined}
                    data-today={cell.isToday ? '' : undefined}
                    data-outside-month={cell.isCurrentMonth ? undefined : ''}
                    data-disabled={cell.isSelectable ? undefined : ''}
                    disabled={!cell.isSelectable}
                    aria-selected={cell.isSelected}
                    aria-current={cell.isToday ? 'date' : undefined}
                    aria-label={formatDate(cell.date, localePack, { style: 'long' })}
                    onClick={() => onSelect?.(cell.date)}
                  >
                    {formatNumber(cell.date.day, localePack.defaultNumerals, localePack.digits)}
                  </button>
                ))}
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
              aria-label="Previous year"
              onClick={() => setDisplayed((current) => ({ ...current, year: current.year - 1 }))}
            >
              {previousGlyph}
            </button>
            <div data-jalali-calendar-title>
              <TitlePart
                as={titleAs}
                dataAttr="data-jalali-calendar-title-year"
                ariaLabel="Choose year"
                onClick={openYearView}
              >
                {yearLabel}
              </TitlePart>
            </div>
            <button
              type="button"
              data-jalali-calendar-nav="next"
              aria-label="Next year"
              onClick={() => setDisplayed((current) => ({ ...current, year: current.year + 1 }))}
            >
              {nextGlyph}
            </button>
          </div>
          <div role="listbox" aria-label="Month" data-jalali-calendar-months>
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
              aria-label="Previous years"
              onClick={() => setYearPage((current) => current - YEARS_PER_PAGE)}
            >
              {previousGlyph}
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
              aria-label="Next years"
              onClick={() => setYearPage((current) => current + YEARS_PER_PAGE)}
            >
              {nextGlyph}
            </button>
          </div>
          <div role="listbox" aria-label="Year" data-jalali-calendar-years>
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
