export type GraphNodeKind =
  | 'DESIGNER'
  | 'SOURCE'
  | 'GARMENT'

export type RelationshipType =
  | 'INSPIRED'
  | 'CREATED'
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