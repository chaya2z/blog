/**
 * Formats a post date for display, e.g. `Oct 10, 2026`. UI text is English
 * for every post language, so the date is too.
 * Uses UTC because `publishedAt` is a date-only value parsed as UTC midnight.
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
