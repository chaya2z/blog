import { describe, expect, it } from 'vitest';

import { NO_BREAK_SPACE, japanesePhrases } from './phrases';

describe('japanesePhrases', () => {
  it('cuts Japanese text into phrases that join back into it', () => {
    const text = '自宅インフラ構成の紹介（2022年）';
    const phrases = japanesePhrases(text);
    expect(phrases.length).toBeGreaterThan(1);
    expect(phrases.join('')).toBe(text);
  });

  it('holds a Latin name together with no-break spaces', () => {
    const joined = japanesePhrases('JetBrainsのAll Products Packを購入した').join('');
    expect(joined).toContain(['All', 'Products', 'Pack'].join(NO_BREAK_SPACE));
    expect(joined).not.toContain(' ');
  });

  it('leaves a space at the edge of a phrase breakable', () => {
    const text = 'ProLiant サーバ 3 台と Cisco Catalyst のスイッチで組んだ';
    for (const phrase of japanesePhrases(text)) {
      expect(phrase.startsWith(NO_BREAK_SPACE)).toBe(false);
      expect(phrase.endsWith(NO_BREAK_SPACE)).toBe(false);
    }
  });
});
