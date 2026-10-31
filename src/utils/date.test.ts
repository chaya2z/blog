import { describe, expect, it } from 'vitest';

import { formatDate, formatInstant } from './date';

describe('formatDate', () => {
  const date = new Date('2026-10-10');

  it('formats the date in English', () => {
    expect(formatDate(date)).toBe('Oct 10, 2026');
  });

  it('keeps the UTC calendar day', () => {
    expect(formatDate(new Date('2026-10-10T23:30:00Z'))).toBe('Oct 10, 2026');
  });
});

describe('formatInstant', () => {
  it('prints the UTC instant to the second', () => {
    expect(formatInstant(new Date('2026-09-08T19:00:00Z'))).toBe('2026-09-08T19:00:00Z');
  });
});
