import { describe, expect, it } from 'vitest';

import { serializeJsonLd } from './json-ld';

describe('serializeJsonLd', () => {
  it('escapes `<` so no value can close the script element', () => {
    const json = serializeJsonLd({ headline: '</script>' });
    expect(json).not.toContain('<');
    expect(JSON.parse(json).headline).toBe('</script>');
  });
});
