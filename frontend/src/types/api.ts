export type ApiHouse = {
  id: string;
  label: string;
  color: string;
};

export type ApiConcept = {
  id: string;
  label: string;
  color: string;
};

export type SearchOption = {
  id: string;
  label: string;
  kind: "HOUSE" | "SOURCE" | "CONCEPT";
  apiName: string;
};

export type ApiNodeType =
  | "designer"
  | "garment"
  | "sourceworld"
  | "artwork"
  | "concept";

export type ApiNode = {
  id: string;
  type: ApiNodeType;
  label: string;
  color?: string;
  image?: string;
  imageSmall?: string;
  url?: string;
  date?: string;
  culture?: string;
  description?: string;
  artist?: string;
  artistRole?: string;
  artistPrefix?: string;
  medium?: string;
  dimensions?: string;
  classification?: string;
};

export type ApiLinkKind = "created" | "inspired" | "example_of" | "has_concept";

export type ApiLink = {
  source: string;
  target: string;
  kind: ApiLinkKind;
};

export type ApiGraphResponse = {
  nodes: ApiNode[];
  links: ApiLink[];
};
