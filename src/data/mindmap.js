export const NODE_TYPES = [
  { id: 'topic',       label: 'Topic',         color: '#2c3e50', bg: '#e8edf2' },
  { id: 'concept',     label: 'Concept',       color: '#7a6a52', bg: '#f0e8d8' },
  { id: 'thinker',     label: 'Thinker',       color: '#2c5f8a', bg: '#e8eff8' },
  { id: 'work',        label: 'Work / Text',   color: '#2e7d5e', bg: '#e4f4ec' },
  { id: 'opposing',    label: 'Opposing view', color: '#c0392b', bg: '#faeae8' },
  { id: 'synthesis',   label: 'My synthesis',  color: '#b07d28', bg: '#faf0dc' },
  { id: 'question',    label: 'Open question', color: '#7b3fa0', bg: '#f3eafa' },
];

export const EDGE_TYPES = [
  { id: 'foundation',  label: 'Foundation of', color: '#1a5c3a', dash: false },
  { id: 'influence',   label: 'Influence',     color: '#8a8680', dash: false },
  { id: 'tension',     label: 'Tension',       color: '#c0392b', dash: false },
  { id: 'extends',     label: 'Extends',       color: '#2c5f8a', dash: false },
  { id: 'refutes',     label: 'Refutes',       color: '#e05a4a', dash: true  },
  { id: 'related',     label: 'Related',       color: '#7a6a52', dash: true  },
  { id: 'synthesises', label: 'Synthesises',   color: '#b07d28', dash: false },
];

export const getNodeType = (id, types) => (types || NODE_TYPES).find(t => t.id === id) || (types || NODE_TYPES)[0] || NODE_TYPES[0];
export const getEdgeType = (id, types) => (types || EDGE_TYPES).find(t => t.id === id) || EDGE_TYPES[0];

export const SEED_NODES = [
  { id: 'n0',  type: 'topic',    label: 'Time & Existence',    note: 'What is time? How do we experience it? This topic spans philosophy of mind, metaphysics, and physics.', bookIds: [], year: '', x: 280, y: 50 },
  { id: 'n1',  type: 'concept',  label: 'Time',                note: 'The central concept — what does it mean for time to exist at all? Feature of consciousness or of the world?', bookIds: [], year: '', x: 320, y: 190 },
  { id: 'n2',  type: 'thinker',  label: 'Kant',                note: 'Time is a form of inner intuition — we impose it on experience, not derived from things themselves.', bookIds: ['b5'], year: '1724–1804', x: 120, y: 120 },
  { id: 'n3',  type: 'thinker',  label: 'Heidegger',           note: 'Dasein is being-toward-death; temporality is the meaning of care. We are fundamentally temporal creatures.', bookIds: [], year: '1889–1976', x: 520, y: 120 },
  { id: 'n4',  type: 'thinker',  label: 'Plato',               note: 'Time is the moving image of eternity — it imitates the eternal forms but can never reach them.', bookIds: ['b6'], year: '428–348 BCE', x: 120, y: 310 },
  { id: 'n5',  type: 'concept',  label: 'A priori intuition',  note: "Kant's claim: time is a precondition for experience, not derived from it.", bookIds: ['b5'], year: '1781', x: 60, y: 230 },
  { id: 'n6',  type: 'concept',  label: 'Dasein',              note: "Heidegger's term for being-in-the-world — always already thrown, always projecting toward possibilities.", bookIds: [], year: '1927', x: 560, y: 240 },
  { id: 'n7',  type: 'opposing', label: 'Eternal forms',       note: 'For Plato, the truly real is timeless. Temporal things are shadows of the eternal.', bookIds: ['b6'], year: '380 BCE', x: 200, y: 370 },
  { id: 'n8',  type: 'synthesis',label: 'Time: lived vs known', note: 'Kant describes how time is structured in cognition; Heidegger describes how time is felt in existence. Different questions entirely.', bookIds: [], year: '', x: 380, y: 370 },
  { id: 'n9',  type: 'question', label: 'Is time continuous?', note: 'Physics says spacetime is smooth; quantum mechanics suggests granularity at Planck scale.', bookIds: [], year: '', x: 520, y: 370 },
  { id: 'n10', type: 'work',     label: 'Critique of Pure Reason', note: "The Transcendental Aesthetic: space and time as pure forms of intuition.", bookIds: ['b5'], year: '1781', x: 40, y: 145 },
];

export const SEED_EDGES = [
  { id: 'e0a', source: 'n0', target: 'n1', type: 'foundation', label: '' },
  { id: 'e0b', source: 'n0', target: 'n2', type: 'foundation', label: '' },
  { id: 'e0c', source: 'n0', target: 'n3', type: 'foundation', label: '' },
  { id: 'e0a', source: 'n0',  target: 'n1',  type: 'foundation',  label: '' },
  { id: 'e0b', source: 'n0',  target: 'n2',  type: 'related',     label: '' },
  { id: 'e0c', source: 'n0',  target: 'n3',  type: 'related',     label: '' },
  { id: 'e1',  source: 'n2',  target: 'n1',  type: 'influence',   label: '' },
  { id: 'e2',  source: 'n3',  target: 'n1',  type: 'influence',   label: '' },
  { id: 'e3',  source: 'n4',  target: 'n1',  type: 'related',     label: '' },
  { id: 'e4',  source: 'n2',  target: 'n5',  type: 'extends',     label: '' },
  { id: 'e5',  source: 'n3',  target: 'n6',  type: 'extends',     label: '' },
  { id: 'e6',  source: 'n4',  target: 'n7',  type: 'extends',     label: '' },
  { id: 'e7',  source: 'n7',  target: 'n6',  type: 'tension',     label: 'timeless vs temporal' },
  { id: 'e8',  source: 'n5',  target: 'n7',  type: 'tension',     label: 'constructed vs eternal' },
  { id: 'e9',  source: 'n5',  target: 'n8',  type: 'synthesises', label: '' },
  { id: 'e10', source: 'n6',  target: 'n8',  type: 'synthesises', label: '' },
  { id: 'e11', source: 'n10', target: 'n2',  type: 'related',     label: '' },
  { id: 'e12', source: 'n1',  target: 'n9',  type: 'related',     label: '' },
];
