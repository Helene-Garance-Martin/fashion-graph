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

function toNodeKind(
  type: ApiNode['type']
): GraphNodeKind {
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
    color: node.color,
    image: node.image,
    url: node.url,
    date: node.date,
    culture: node.culture,
    description: node.description,
    medium: node.medium,
    dimensions: node.dimensions,
    classification: node.classification,
  }
}

export function toGraphData(
  response: ApiGraphResponse
): GraphData {
  const nodes = response.nodes.map(toGraphNode)

  const relationships: GraphRelationship[] =
    response.links.map((link) => {
      switch (link.kind) {
        case 'inspired':
          return {
            source: link.source,
            target: link.target,
            type: 'INSPIRED',
            provenance: 'CURATED',
          }

        case 'created':
          return {
            source: link.source,
            target: link.target,
            type: 'CREATED',
            provenance: 'MET_METADATA',
          }

        case 'example_of':
          return {
            source: link.source,
            target: link.target,
            type: 'EXAMPLE_OF',
            provenance: 'MET_METADATA',
          }
      }
    })

  return {
    nodes,
    relationships,
  }
}