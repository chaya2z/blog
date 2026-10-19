/**
 * Serializes schema.org data as JSON safe to embed in a script element.
 */
export function serializeJsonLd(data: object): string {
  // `<` escaped, so no data value can end the script element the JSON sits in.
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}
