/**
 * Disposes an exclusively owned child tree, including children detached by a control's
 * dispose(). Node.dispose() only detaches children. Capture the whole tree first so
 * framework controls can run their own cleanup without hiding undisposed descendants.
 * Never use this with shared/reusable nodes.
 */
import { type Node, RichText } from "scenerystack/scenery";

export function disposeOwnedChildren(parent: Node): void {
  const owned = new Set<Node>();
  const collect = (node: Node): void => {
    if (owned.has(node)) {
      return;
    }
    owned.add(node);
    // RichText owns pooled implementation nodes. Its dispose() returns them to the
    // pool for reuse; disposing those descendants would corrupt that pool.
    if (!(node instanceof RichText)) {
      node.children.forEach(collect);
    }
  };
  parent.children.forEach(collect);
  for (const node of owned) {
    if (!node.isDisposed) {
      node.dispose();
    }
  }
}
