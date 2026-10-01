import { dateRangeForDays, formatDuration, toDateInputValue } from '../date';

describe('date utilities', () => {
  it('formats durations', () => {
    expect(formatDuration(0)).toBe('0 min');
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(60)).toBe('1 hr');
    expect(formatDuration(95)).toBe('1 hr 35 min');
  });

  it('creates an inclusive range for the requested number of days', () => {
    const range = dateRangeForDays(7, new Date(2026, 8, 28, 12));
    expect(new Date(range.from).getDate()).toBe(22);
    expect(new Date(range.to).getDate()).toBe(28);
    expect(new Date(range.from).getHours()).toBe(0);
    expect(new Date(range.to).getHours()).toBe(23);
  });

  it('produces a local calendar date input value', () => {
    expect(toDateInputValue(new Date(2026, 8, 5, 12))).toBe('2026-09-05');
  });
});
