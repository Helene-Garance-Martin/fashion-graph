export type GraphNodeKind =
  | 'DESIGNER'
  | 'SOURCE'
  | 'GARMENT'
  | 'ARTWORK'

export type RelationshipType =
  | 'INSPIRED'
  | 'CREATED'
  | 'EXAMPLE_OF'
  | 'COLLABORATED_WITH'
  | 'RIVAL_OF'

export type Provenance =
  | 'CURATED'
  | 'MET_METADATA'
  | 'DERIVED'
  | 'SUGGESTED'

export type GraphNode = {
  id: string
  label: string
  kind: GraphNodeKind
  image?: string
  url?: string
  date?: string
  culture?: string
  description?: string
}

export type GraphRelationship = {
  source: string
  target: string
  type: RelationshipType
  provenance: Provenance
}

export type GraphData = {
  nodes: GraphNode[]
  relationships: GraphRelationship[]
}