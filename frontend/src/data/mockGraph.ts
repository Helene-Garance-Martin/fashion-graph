import type { GraphData } from '../types/graph'

export const mockGraph: GraphData = {
  nodes: [
    {
      id: 'vionnet',
      label: 'Madeleine Vionnet',
      kind: 'DESIGNER',
    },
    {
      id: 'greek-sculpture',
      label: 'Ancient Greek sculpture',
      kind: 'SOURCE',
    },
    {
      id: 'japanese-kimono',
      label: 'Japanese kimono',
      kind: 'SOURCE',
    },
  ],

  relationships: [
    {
      source: 'greek-sculpture',
      target: 'vionnet',
      type: 'INSPIRED',
      provenance: 'CURATED',
    },
    {
      source: 'japanese-kimono',
      target: 'vionnet',
      type: 'INSPIRED',
      provenance: 'CURATED',
    },
  ],
}