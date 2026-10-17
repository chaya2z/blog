/*
 * What the cards' pictures are drawn with. The colors are the blog's, from
 * tokens.css, and the tints CardLayout mixes from them. They resolve in the
 * page each SVG is inlined into, through style attributes: `var()` is not
 * certain to work in a presentation attribute.
 */

export const INK = 'var(--ink)';
export const PAPER = 'var(--paper)';
export const ACCENT = 'var(--accent)';
export const MIST = 'var(--mist)';
export const SHALLOW = 'var(--shallow)';
export const DEEP = 'var(--deep)';

/** Fills a shape with a color. */
export const fill = (color: string): string => `style="fill: ${color}"`;

/** Strokes a line or an outline with a color, leaving it unfilled. */
export const stroke = (color: string): string => `fill="none" style="stroke: ${color}"`;

/** An SVG document of a size, holding the shapes given. */
export function svg(width: number, height: number, shapes: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${shapes}</svg>`;
}
