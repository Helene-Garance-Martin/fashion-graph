import type { GraphNode } from "../types/graph";

export function canAddToExhibition(node: GraphNode) {
  return node.kind === "ARTWORK" || node.kind === "GARMENT";
}
