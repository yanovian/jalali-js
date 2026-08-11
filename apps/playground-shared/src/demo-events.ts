/** Seed events for Mordad 1403 (all-day chips, timed blocks, overlap). */
export const DEMO_EVENTS = [
  {
    id: 'workshop',
    title: 'Workshop',
    start: { year: 1403, month: 5, day: 10 },
    end: { year: 1403, month: 5, day: 12 },
  },
  {
    id: 'offsite',
    title: 'Offsite',
    start: { year: 1403, month: 5, day: 14 },
    end: { year: 1403, month: 5, day: 16 },
  },
  {
    id: 'meeting',
    title: 'Meeting',
    start: { year: 1403, month: 5, day: 15 },
    end: { year: 1403, month: 5, day: 15 },
    allDay: false,
    startTime: { hour: 14, minute: 0 },
    endTime: { hour: 15, minute: 0 },
  },
  {
    id: 'call',
    title: 'Call',
    start: { year: 1403, month: 5, day: 15 },
    end: { year: 1403, month: 5, day: 15 },
    allDay: false,
    startTime: { hour: 14, minute: 30 },
    endTime: { hour: 15, minute: 30 },
  },
  {
    id: 'standup',
    title: 'Standup',
    start: { year: 1403, month: 5, day: 16 },
    end: { year: 1403, month: 5, day: 16 },
    allDay: false,
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 9, minute: 30 },
  },
] as const;

export const DEMO_MONTH = { year: 1403, month: 5 } as const;
export const DEMO_DAY = { year: 1403, month: 5, day: 15 } as const;

/** Seed milestones for the timeline EventCalendar view (Jalali dates). */
export const DEMO_TIMELINE_EVENTS = [
  {
    id: 'project-start',
    title: 'آغاز پروژه',
    description: 'شروع رسمی کار و هماهنگی تیم',
    start: { year: 1403, month: 10, day: 26 },
    end: { year: 1403, month: 10, day: 26 },
    allDay: false,
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 10, minute: 0 },
    color: '#22c55e',
    icon: '◎',
  },
  {
    id: 'design-done',
    title: 'اتمام مرحله طراحی',
    description: 'تحویل طرح‌های نهایی رابط کاربری',
    start: { year: 1403, month: 12, day: 2 },
    end: { year: 1403, month: 12, day: 2 },
    color: '#6366f1',
    icon: '▣',
  },
  {
    id: 'beta',
    title: 'انتشار نسخه بتا',
    description: 'آزادسازی نسخه آزمایشی برای گروه محدود',
    start: { year: 1404, month: 1, day: 10 },
    end: { year: 1404, month: 1, day: 10 },
    allDay: false,
    startTime: { hour: 16, minute: 0 },
    endTime: { hour: 17, minute: 0 },
    color: '#f97316',
    icon: '▲',
  },
  {
    id: 'user-test',
    title: 'آزمایش توسط کاربران',
    description: 'جمع‌آوری بازخورد از کاربران واقعی',
    start: { year: 1404, month: 1, day: 26 },
    end: { year: 1404, month: 1, day: 26 },
    color: '#ef4444',
    icon: '◉',
  },
  {
    id: 'final',
    title: 'انتشار نهایی',
    description: 'عرضه عمومی محصول',
    start: { year: 1404, month: 2, day: 11 },
    end: { year: 1404, month: 2, day: 11 },
    allDay: false,
    startTime: { hour: 10, minute: 0 },
    endTime: { hour: 11, minute: 0 },
    color: '#a855f7',
    icon: '✦',
  },
] as const;
