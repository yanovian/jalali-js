/** Builds a DOM element with attributes and children in one call, no innerHTML string
 * interpolation (avoids re-deriving values from concatenated markup, and any XSS risk from
 * doing so). A `false`/`undefined` attribute value omits the attribute entirely; `true` sets
 * it as an empty-value boolean attribute (the `data-jalali-*` state markers this library uses
 * for CSS, e.g. `data-selected`). */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | boolean | undefined> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    node.setAttribute(name, value === true ? '' : value);
  }
  node.append(...children);
  return node;
}
