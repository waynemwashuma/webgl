import { withBase } from "../utils/url";

/**
 * @param {{ type?: any; url?: any; children?: any; }} node
 */
function visit(node) {
  if (node.type === "link" || node.type === "image") {
    node.url = withBase(node.url);
  }

  const { children } = node;
  if (Array.isArray(children)) {
    for (const child of children) {
      visit(child);
    }
  }
}

export default function remarkLinkBase() {
  return (/** @type {{ type?: any; url?: any; children?: any; }} */ tree) => {
    visit(tree);
  };
}
