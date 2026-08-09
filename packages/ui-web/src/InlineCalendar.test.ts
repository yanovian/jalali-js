// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { getByRole } from '@testing-library/dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
// Registers <jalali-inline-calendar>: only index.ts's import-time side effect does this,
// matching how a real consumer would `import '@jalali-js/ui-web'`.
import './index.js';

let originalTz: string | undefined;
beforeAll(() => {
  originalTz = process.env.TZ;
  process.env.TZ = 'UTC';
});
afterAll(() => {
  process.env.TZ = originalTz;
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2024-08-05T12:00:00.000Z'));
});
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('jalali-inline-calendar', () => {
  it('registers under its own tag and renders the same grid as jalali-calendar', () => {
    const el = document.createElement('jalali-inline-calendar');
    el.setAttribute('locale', 'en');
    document.body.append(el);
    expect(getByRole(document.body, 'grid')).toBeInTheDocument();
    expect(getByRole(document.body, 'button', { name: 'Choose month' })).toHaveTextContent(
      'Mordad',
    );
  });
});
