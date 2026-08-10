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
