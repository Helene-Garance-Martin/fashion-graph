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

    case 'garment':
      return 'GARMENT'

    case 'sourceworld':
      return 'SOURCE'

    case 'artwork':
      return 'ARTWORK'
  }
}

function toGraphNode(
  node: ApiNode
): GraphNode {
  const graphNode: GraphNode = {
    id: node.id,

    label:
      node.label === 'Spanish painting'
        ? 'Spanish paintings'
        : node.label,

    kind: toNodeKind(node.type),

    color: node.color,

    image: node.image,
    imageSmall: node.imageSmall,

    url: node.url,

    date: node.date,
    culture: node.culture,
    description: node.description,

    artist: node.artist,
    artistRole: node.artistRole,
    artistPrefix: node.artistPrefix,

    medium: node.medium,
    dimensions: node.dimensions,
    classification: node.classification,
  }

  if (node.id === 'artwork:437173') {
    console.log(
      'AFTER ADAPTER:',
      graphNode.artist,
      graphNode.date,
      graphNode.medium
    )
  }

  return graphNode
}

function toRelationship(
  link: ApiGraphResponse['links'][number]
): GraphRelationship {
  switch (link.kind) {
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

    case 'inspired':
      return {
        source: link.source,
        target: link.target,
        type: 'INSPIRED',
        provenance: 'CURATED',
      }
  }
}

export function toGraphData(
  response: ApiGraphResponse
): GraphData {
  return {
    nodes: response.nodes.map(toGraphNode),
    relationships:
      response.links.map(toRelationship),
  }
}