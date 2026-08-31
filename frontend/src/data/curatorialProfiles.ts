import type { CuratorialProfile } from '../types/curation'

export const curatorialProfiles: CuratorialProfile[] = [
  {
    nodeId: 'vionnet',
    eyebrow: 'Designer',
    title: 'Madeleine Vionnet',
    dates: '1876–1975',
    summary:
      'A radical interpreter of the body whose work drew on classical drapery and the spatial logic of Japanese dress.',
    themes: [
      'Ancient Greek sculpture',
      'Japanese kimono',
      'Bias cutting',
    ],
  },
  {
    nodeId: 'greek-sculpture',
    eyebrow: 'Source world',
    title: 'Ancient Greek sculpture',
    summary:
      'Drapery, weight and movement become a vocabulary for garments shaped around the body rather than imposed upon it.',
    themes: ['Drapery', 'Movement', 'Body'],
  },
  {
    nodeId: 'japanese-kimono',
    eyebrow: 'Source world',
    title: 'Japanese kimono',
    summary:
      'Flat construction and economical cutting offer another route into garments whose form emerges through the body.',
    themes: ['Flat construction', 'Geometry', 'Economy of cut'],
  },
]