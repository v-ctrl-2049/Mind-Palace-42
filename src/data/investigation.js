export const INVESTIGATION_TYPES = [
  { id: 'political',     label: 'Political',     color: '#c0392b', bg: '#faeae8' },
  { id: 'social',        label: 'Social',        color: '#2c5f8a', bg: '#e8eff8' },
  { id: 'economic',      label: 'Economic',      color: '#b07d28', bg: '#faf0dc' },
  { id: 'psychological', label: 'Psychological', color: '#7b3fa0', bg: '#f3eafa' },
  { id: 'cultural',      label: 'Cultural',      color: '#2e7d5e', bg: '#e4f4ec' },
  { id: 'scientific',    label: 'Scientific',    color: '#1a5c7a', bg: '#e0f0f8' },
  { id: 'religious',     label: 'Religious',     color: '#7a6a52', bg: '#f0e8d8' },
];

export const getInvType = (id) => INVESTIGATION_TYPES.find(t => t.id === id) || INVESTIGATION_TYPES[0];

export const SEED_INVESTIGATIONS = [
  {
    id: 'inv1',
    title: 'The Collapse of the Roman Republic',
    type: 'political',
    status: 'active', // 'active' | 'closed' | 'cold'
    dateRange: '133–27 BCE',
    actors: ['Julius Caesar', 'Pompey', 'Cicero', 'Augustus', 'Gracchi brothers'],
    bookIds: ['b1'],
    tags: ['rome', 'empire', 'collapse', 'politics'],
    summary: 'What structural conditions made the Roman Republic impossible to sustain? Was the collapse inevitable, or contingent on specific individuals?',
    analysis: '',
    bookNotes: [
      {
        bookId: 'b1',
        quote: 'The transformation of Rome from republic to empire was not a sudden coup but a long structural unravelling.',
        note: 'Frankopan frames Rome\'s shift as driven partly by the pressures of managing an empire that had outgrown republican institutions — the same trade networks that enriched Rome destabilised its political order.',
      },
    ],
    causes: ['Inequality and land reform failure', 'Military loyalty to generals over Senate', 'Breakdown of aristocratic consensus'],
    hypothesis: 'The collapse was primarily structural — the Republic\'s institutions were designed for a city-state and could not scale to manage an empire. Individual actors like Caesar accelerated but did not cause the collapse.',
    hypothesisStatus: 'complicated', // 'untested' | 'confirmed' | 'complicated' | 'refuted'
    hypothesisNotes: 'Evidence so far supports the structural argument, but Frankopan\'s trade-pressure angle complicates the purely internal reading.',
    verdict: '',
    contradictions: [
      { id: 'c1', sourceA: 'The Silk Roads', sourceB: 'My reading', claim: 'Frankopan frames Marathon as a footnote in Achaemenid expansion, but classical sources treat it as civilisational. Who is right to frame the stakes?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    ],
    custodyLog: [
      { id: 'l1', type: 'opened',   note: 'Case opened. Initial question: was the collapse structural or contingent?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
      { id: 'l2', type: 'evidence', note: 'Added The Silk Roads as source — Frankopan argues trade pressure destabilised republican institutions.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
      { id: 'l3', type: 'revised',  note: 'Revised position: the collapse was structural but required contingent actors (Caesar) to actualise it.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'inv2',
    title: 'Milgram\'s Obedience Experiments',
    type: 'psychological',
    status: 'active',
    dateRange: '1961–1963',
    actors: ['Stanley Milgram', 'Yale University participants'],
    bookIds: [],
    tags: ['authority', 'obedience', 'psychology', 'ethics'],
    summary: 'Why do ordinary people comply with authority to the point of causing harm? What does this tell us about moral agency and institutional design?',
    analysis: '',
    bookNotes: [],
    causes: ['Diffusion of responsibility', 'Incremental commitment', 'Legitimacy of authority figure'],
    hypothesis: '',
    hypothesisStatus: 'untested',
    hypothesisNotes: '',
    verdict: '',
    contradictions: [],
    custodyLog: [
      { id: 'l1', type: 'opened', note: 'Case opened. Starting from Milgram 1961.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
];
