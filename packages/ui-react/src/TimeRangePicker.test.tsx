// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TimeRangePicker } from './TimeRangePicker.js';

afterEach(() => {
  cleanup();
});

describe('TimeRangePicker', () => {
  it('renders start and end time selects', () => {
    render(
      <TimeRangePicker
        defaultRange={{ start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } }}
      />,
    );
    const hours = screen.getAllByLabelText('Hour');
    expect(hours[0]).toHaveValue('9');
    expect(hours[1]).toHaveValue('17');
  });

  it('emits onChange when either end changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimeRangePicker
        defaultRange={{ start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } }}
        onChange={onChange}
      />,
    );
    await user.selectOptions(screen.getAllByLabelText('Hour')[0]!, '10');
    expect(onChange).toHaveBeenCalledWith({
      start: { hour: 10, minute: 0 },
      end: { hour: 17, minute: 0 },
    });
  });
});
