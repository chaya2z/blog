/** FNV-1a over the UTF-8 bytes of a string. */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(text)) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/**
 * SplitMix32: a generator of numbers in [0, 1) from a 32-bit seed. The same
 * seed gives the same numbers, so a picture drawn with them is the same on
 * every build.
 *
 * The state steps by the golden ratio (a Weyl sequence, so every 32-bit state
 * comes round once in 2^32 steps), and each step is mixed by MurmurHash3's
 * finalizer, with the constants found best in
 * https://nullprogram.com/blog/2018/07/31/. See
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#splitmix32.
 */
export function splitmix32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x9e3779b9) | 0;
    let t = state ^ (state >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t ^= t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    t ^= t >>> 15;
    return (t >>> 0) / 2 ** 32;
  };
}
