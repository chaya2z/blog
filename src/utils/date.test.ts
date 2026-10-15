import { describe, expect, it } from 'vitest';

import { formatDate } from './date';

describe('formatDate', () => {
  const date = new Date('2026-10-10');

  it('formats the date in English', () => {
    expect(formatDate(date)).toBe('Oct 10, 2026');
  });

  it('keeps the UTC calendar day', () => {
    expect(formatDate(new Date('2026-10-10T23:30:00Z'))).toBe('Oct 10, 2026');
  });
});
