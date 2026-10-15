import katex from 'katex';
import { defineMdastPlugin } from 'satteri';

/** Renders `$...$` and `$$...$$` math, parsed by Sätteri's `math` feature, with KaTeX. */
export const katexPlugin = defineMdastPlugin({
  name: 'katex',
  inlineMath(node, ctx) {
    ctx.replaceNode(node, { type: 'html', value: katex.renderToString(node.value) });
  },
  math(node, ctx) {
    ctx.replaceNode(node, {
      type: 'html',
      value: katex.renderToString(node.value, { displayMode: true }),
    });
  },
});
