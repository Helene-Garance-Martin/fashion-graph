import type { GraphNode } from "./graph";

export type Dia = {
  id: string;
  node: GraphNode;
  order: number;
  caption?: string;
};

export type Show = {
  id: string;
  title: string;
  dias: Dia[];
  createdAt: string;
  updatedAt: string;
};
