// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TimePicker } from './TimePicker.js';

afterEach(() => {
  cleanup();
});

describe('TimePicker', () => {
  it('renders hour and minute selects', () => {
    render(<TimePicker defaultValue={{ hour: 14, minute: 30 }} />);
    expect(screen.getByLabelText('Hour')).toHaveValue('14');
    expect(screen.getByLabelText('Minute')).toHaveValue('30');
  });

  it('emits onChange when the hour changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker defaultValue={{ hour: 9, minute: 0 }} onChange={onChange} />);
    await user.selectOptions(screen.getByLabelText('Hour'), '15');
    expect(onChange).toHaveBeenCalledWith({ hour: 15, minute: 0 });
  });

  it('honors minuteStep and disabledHours', () => {
    render(
      <TimePicker defaultValue={{ hour: 10, minute: 0 }} minuteStep={15} disabledHours={[0, 1]} />,
    );
    const hourOptions = [...screen.getByLabelText('Hour').querySelectorAll('option')].map(
      (option) => option.value,
    );
    expect(hourOptions).not.toContain('0');
    expect(hourOptions).not.toContain('1');
    expect(hourOptions).toContain('10');

    const minuteOptions = [...screen.getByLabelText('Minute').querySelectorAll('option')].map(
      (option) => option.value,
    );
    expect(minuteOptions).toEqual(['0', '15', '30', '45']);
  });
});
