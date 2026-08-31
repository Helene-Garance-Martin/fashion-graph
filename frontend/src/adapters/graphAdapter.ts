import type {
  ApiGraphResponse,
  ApiNode,
} from '../types/api'

import type {
  GraphData,
  GraphNode,
  GraphNodeKind,
  GraphRelationship,
} from '../types/graph'

function toNodeKind(type: ApiNode['type']): GraphNodeKind {
  switch (type) {
    case 'designer':
      return 'DESIGNER'

    case 'sourceworld':
      return 'SOURCE'

    case 'garment':
      return 'GARMENT'

    case 'artwork':
      return 'ARTWORK'
  }
}

function toGraphNode(node: ApiNode): GraphNode {
  return {
    id: node.id,
    label:
      node.label === 'Spanish painting'
        ? 'Spanish paintings'
        : node.label,
    kind: toNodeKind(node.type),
    image: node.image,
    url: node.url,
    date: node.date,
    culture: node.culture,
    description: node.description,
  }
}

export function toInfluenceGraph(
  response: ApiGraphResponse
): GraphData {
  const nodes = response.nodes
    .filter(
      (node) =>
        node.type === 'designer' ||
        node.type === 'sourceworld'
    )
    .map(toGraphNode)

  const nodeIds = new Set(nodes.map((node) => node.id))

  const relationships: GraphRelationship[] =
    response.links
      .filter(
        (link) =>
          nodeIds.has(link.source) &&
          nodeIds.has(link.target)
      )
      .map((link) => {
        if (link.kind === 'inspired') {
          return {
            source: link.source,
            target: link.target,
            type: 'INSPIRED',
            provenance: 'CURATED',
          }
        }

        if (link.kind === 'created') {
          return {
            source: link.source,
            target: link.target,
            type: 'CREATED',
            provenance: 'MET_METADATA',
          }
        }

        return {
          source: link.source,
          target: link.target,
          type: 'EXAMPLE_OF',
          provenance: 'CURATED',
        }
      })

  return {
    nodes,
    relationships,
  }
}