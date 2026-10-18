import {
  ELEMENT_NODE,
  TEXT_NODE,
  parse,
  renderSync,
  walkSync,
  type ElementNode,
  type Node,
} from 'ultrahtml';

// `srcset` holds a list of URLs, so `resolveSrcset` handles it separately.
const SINGLE_URL_ATTRIBUTES = ['href', 'src'];

/**
 * Prepares a post's rendered HTML for a feed. Readers show it away from the
 * site, where relative URLs and the site's CSS are unavailable:
 * - `href`, `src` and `srcset` become absolute, resolved against `pageUrl`.
 * - KaTeX keeps only its MathML. Its HTML half needs katex.css, and a reader
 *   without it would print every formula twice.
 * - A long note (plugins/sidenotes.ts) unfolds, set as a short one is: a reader
 *   may show its `details` closed, or its summary's copy of the text as well.
 */
export function toFeedHtml(html: string, pageUrl: URL): string {
  const tree = parse(html);
  const katexHtml: ElementNode[] = [];
  const foldedNotes: ElementNode[] = [];
  walkSync(tree, (node) => {
    if (node.type !== ELEMENT_NODE) return;
    // The walk still visits its subtree, but the whole subtree is removed below.
    if (hasClass(node, 'katex-html')) katexHtml.push(node);
    else absolutizeUrls(node.attributes, pageUrl);
    if (node.name === 'details' && hasClass(node.parent, 'sidenote')) foldedNotes.push(node);
  });
  // Changed after the walk, so the walk never iterates a list it is changing.
  for (const node of katexHtml) {
    node.parent.children = node.parent.children.filter((child: Node) => child !== node);
  }
  for (const details of foldedNotes) unfold(details);
  return renderSync(tree);
}

/**
 * Replaces a folded note's `details` with its blocks, its number moved from
 * the summary to the start of the first paragraph, or before a first block of
 * another kind.
 */
function unfold(details: ElementNode): void {
  const elements = details.children.filter((child: Node) => child.type === ELEMENT_NODE);
  const summary = elements.find((child: ElementNode) => child.name === 'summary');
  const number = summary?.children.find((child: Node) => hasClass(child, 'sidenote-number'));
  const blocks: Node[] = elements.filter((child: ElementNode) => child !== summary);
  if (number) {
    const [first] = blocks;
    const space = { type: TEXT_NODE, value: ' ' };
    if (first?.name === 'p') {
      first.children = [number, space, ...first.children];
      number.parent = first;
    } else {
      blocks.unshift(number);
    }
  }
  for (const block of blocks) block.parent = details.parent;
  details.parent.children = details.parent.children.flatMap((child: Node) =>
    child === details ? blocks : [child],
  );
}

function hasClass(node: Node | undefined, name: string): boolean {
  if (node?.type !== ELEMENT_NODE) return false;
  return node.attributes.class?.split(/\s+/).includes(name) ?? false;
}

function absolutizeUrls(attributes: Record<string, string>, base: URL): void {
  for (const name of SINGLE_URL_ATTRIBUTES) {
    const value = attributes[name];
    if (value !== undefined) attributes[name] = new URL(value, base).href;
  }
  if (attributes.srcset !== undefined) {
    attributes.srcset = resolveSrcset(attributes.srcset, base);
  }
}

function resolveSrcset(srcset: string, base: URL): string {
  return (
    srcset
      .split(',')
      .map((candidate) => candidate.trim())
      // A trailing comma leaves an empty candidate, which would resolve to `base`.
      .filter((candidate) => candidate !== '')
      .map((candidate) => {
        const [url, ...descriptors] = candidate.split(/\s+/);
        return [new URL(url, base).href, ...descriptors].join(' ');
      })
      .join(', ')
  );
}
