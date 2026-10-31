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

/**
 * Prints an instant in UTC to the second, e.g. `2026-09-08T19:00:00Z`, for
 * machine-readable dates: JSON-LD, Open Graph and `<time datetime>`.
 * `Date#toISOString()` always adds milliseconds, which schema.org's DateTime
 * leaves out, and frontmatter holds instants to the second.
 * ref: https://schema.org/DateTime
 */
export function formatInstant(date: Date): string {
  return date.toTemporalInstant().toString({ smallestUnit: 'second' });
}
