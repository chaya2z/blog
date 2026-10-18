import { defineHastPlugin, type HastNode, type HastVisitorInstance } from 'satteri';

// hast's types, through Sätteri's own: `hast` is its dependency, not ours.
type Root = Parameters<NonNullable<HastVisitorInstance['after']>>[0];
type RootContent = Root['children'][number];
type Element = Extract<HastNode, { type: 'element' }>;
type ElementContent = Element['children'][number];

/*
 * Moves each footnote next to the block that first refers to it, so a post
 * holds every note once, where it is read: the block and its notes share a
 * wrapper, the notes after the block. The page sets the notes beside the
 * block on wide screens and under it on narrow ones, and a feed reader shows
 * them under it too. Each note takes its footnote's id, so the reference still
 * links to it. The list at the end goes once it is empty.
 *
 * A reference deep inside a list or a quote puts its note beside the whole
 * list or quote, the block at the top of the post that holds it.
 */

const isElement = (node: RootContent | ElementContent): node is Element => node.type === 'element';

const isBackref = (node: ElementContent): boolean =>
  isElement(node) && node.properties.dataFootnoteBackref !== undefined;

// The note's own copy of a node, without positions.
function cloneForSidenote(node: ElementContent): ElementContent {
  if (node.type !== 'element') return { ...node, position: undefined };
  return {
    type: 'element',
    tagName: node.tagName,
    properties: { ...node.properties },
    children: node.children.map(cloneForSidenote),
  };
}

// The `↩` links back to the references, one per reference, and the spaces
// between them. A note sits by its reference, so it needs none.
function withoutBackrefs(children: ElementContent[]): ElementContent[] {
  const kept = children.filter((child) => !isBackref(child));
  for (let last = kept.at(-1); last?.type === 'text'; last = kept.at(-1)) {
    const value = last.value.trimEnd();
    if (value) {
      kept[kept.length - 1] = { ...last, value };
      break;
    }
    kept.pop();
  }
  return kept;
}

/**
 * The note for `footnote`, numbered `number`: its blocks as they are, lists
 * and code included, without the links back. Those end the last paragraph, or
 * follow a last block of another kind on their own. The number opens the first
 * paragraph, or stands before a first block of another kind.
 */
function createSidenote(footnote: Element, number: string): Element {
  const blocks = footnote.children
    .filter((child): child is Element => isElement(child) && !isBackref(child))
    .map((block): Element => {
      if (block.tagName !== 'p') return cloneForSidenote(block) as Element;
      return {
        ...block,
        properties: {},
        children: withoutBackrefs(block.children).map(cloneForSidenote),
      };
    });
  const label: Element = {
    type: 'element',
    tagName: 'span',
    properties: { className: ['sidenote-number'] },
    children: [{ type: 'text', value: number }],
  };
  const [first, ...rest] = blocks;
  const children: ElementContent[] =
    first?.tagName === 'p'
      ? [{ ...first, children: [label, { type: 'text', value: ' ' }, ...first.children] }, ...rest]
      : [label, ...blocks];
  return {
    type: 'element',
    tagName: 'div',
    properties: { className: ['sidenote'], role: 'note', id: footnote.properties.id },
    children,
  };
}

/** Footnote references inside `node`, in document order. */
function* footnoteReferencesIn(node: Element): Generator<Element> {
  for (const child of node.children) {
    if (!isElement(child)) continue;
    if (child.tagName === 'a' && child.properties.dataFootnoteRef !== undefined) yield child;
    else yield* footnoteReferencesIn(child);
  }
}

export const sidenotesPlugin = defineHastPlugin({
  name: 'sidenotes',
  after(root: Readonly<Root>, ctx) {
    const section = root.children.find(
      (node): node is Element => isElement(node) && node.properties.dataFootnotes !== undefined,
    );
    if (!section) return;

    const lists = section.children.filter(isElement).filter((node) => node.tagName === 'ol');
    const footnotesById = new Map<string, Element>();
    for (const list of lists) {
      for (const footnote of list.children.filter(isElement)) {
        if (typeof footnote.properties.id === 'string') {
          footnotesById.set(footnote.properties.id, footnote);
        }
      }
    }

    // A footnote referred to twice gets one note, by the first reference.
    const placedIds = new Set<string>();
    for (const block of root.children) {
      if (!isElement(block) || block === section) continue;
      const notes: Element[] = [];
      for (const reference of footnoteReferencesIn(block)) {
        const footnoteId = String(reference.properties.href ?? '').replace(/^#/, '');
        const footnote = footnotesById.get(footnoteId);
        if (!footnote || placedIds.has(footnoteId)) continue;
        placedIds.add(footnoteId);
        notes.push(createSidenote(footnote, ctx.textContent(reference)));
      }
      if (notes.length === 0) continue;
      ctx.wrapNode(block, {
        type: 'element',
        tagName: 'div',
        properties: { className: ['noted'] },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['sidenotes'] },
            children: notes,
          },
        ],
      });
    }

    // A footnote no block refers to, as one only another footnote cites, stays
    // in the list. The list, and the label every reference points to with
    // aria-describedby, go only when every footnote has moved.
    if (placedIds.size < footnotesById.size) {
      for (const id of placedIds) ctx.removeNode(footnotesById.get(id)!);
      return;
    }
    ctx.removeNode(section);
    for (const block of root.children) {
      if (!isElement(block)) continue;
      for (const reference of footnoteReferencesIn(block)) {
        ctx.setProperty(reference, 'ariaDescribedBy', undefined);
      }
    }
  },
});
