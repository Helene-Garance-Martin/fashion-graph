export type ApiHouse = {
  id: string
  label: string
  color: string
}

export type SearchOption = {
  id: string
  label: string
  kind: 'HOUSE' | 'SOURCE'
  apiName: string
}

export type ApiNodeType =
  | 'designer'
  | 'garment'
  | 'sourceworld'
  | 'artwork'

export type ApiNode = {
  id: string
  type: ApiNodeType
  label: string
  color?: string
  image?: string
  url?: string
  date?: string
  culture?: string
  description?: string
}

export type ApiLinkKind =
  | 'created'
  | 'inspired'
  | 'example_of'

export type ApiLink = {
  source: string
  target: string
  kind: ApiLinkKind
}

export type ApiGraphResponse = {
  nodes: ApiNode[]
  links: ApiLink[]
}