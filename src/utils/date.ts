/**
 * Formats a date for display, e.g. `Oct 10, 2026`. UI text is English
 * for every post language, so the date is too.
 * Uses UTC, the zone every date on the site is shown in, whatever the post's
 * language.
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
