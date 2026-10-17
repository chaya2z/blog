import { loadDefaultJapaneseParser } from 'budoux';

const parser = loadDefaultJapaneseParser();

/** U+00A0, a space a line never breaks at. */
export const NO_BREAK_SPACE = String.fromCodePoint(0xa0);

/**
 * Japanese text cut into BudouX's phrases, the places a line may break. Set
 * them with `<wbr>` between and `word-break: keep-all`, so a line breaks only
 * there. No-break spaces hold a Latin name such as "All Products Pack" inside
 * its phrase. A space at a phrase's edge stays a plain space: a line may break
 * there too, and the space then hangs off the line's end instead of indenting
 * the next.
 *
 * Not `word-break: auto-phrase`, which Chromium hands to ICU's phrase
 * breaking: ICU's Japanese model, with weights from 2024, finds no break in
 * some of these titles, and a phrase too long for its line then breaks
 * between any two characters, even mid-word.
 */
export function japanesePhrases(text: string): string[] {
  return parser.parse(text).map((phrase) => phrase.replaceAll(/(?<=\S) (?=\S)/g, NO_BREAK_SPACE));
}
