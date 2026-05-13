export const SEED_GROUPS = [
  { id: 'g1', name: 'History',          color: '#7a6a52' },
  { id: 'g2', name: 'Philosophy',       color: '#2c5f8a' },
  { id: 'g3', name: 'Psychology & Myth',color: '#7b3fa0' },
];

export const SEED_BOOKS = [
  {
    id: 'b1', groupId: 'g1', title: 'The Silk Roads', author: 'Peter Frankopan', color: '#7a6a52', year: 2015,
    publisher: 'Bloomsbury', pages: 636, genre: 'History', isbn: '9781408839997',
    language: 'English', originalLanguage: 'English', translator: '',
    status: 'reading', progress: 42, progressType: 'page',
    startedAt: new Date(Date.now() - 1000*60*60*24*12).toISOString(),
    finishedAt: null, dnfAt: null, dnfReason: '', rating: null, review: '',
    wantToReadPriority: null, wantToReadReason: '', coverStyle: 'color', notes: '', summary: '',
  },
  {
    id: 'b2', groupId: 'g1', title: 'Guns, Germs & Steel', author: 'Jared Diamond', color: '#2e7d5e', year: 1997,
    publisher: 'W. W. Norton', pages: 480, genre: 'History / Anthropology', isbn: '9780393317558',
    language: 'English', originalLanguage: 'English', translator: '',
    status: 'reading', progress: 87, progressType: 'page',
    startedAt: new Date(Date.now() - 1000*60*60*24*30).toISOString(),
    finishedAt: null, dnfAt: null, dnfReason: '', rating: null, review: '',
    wantToReadPriority: null, wantToReadReason: '', coverStyle: 'color', notes: '', summary: '',
  },
  {
    id: 'b3', groupId: 'g3', title: 'The Hero of 1000 Faces', author: 'Joseph Campbell', color: '#c0392b', year: 1949,
    publisher: 'Pantheon Books', pages: 416, genre: 'Mythology / Psychology', isbn: '9781577315933',
    language: 'English', originalLanguage: 'English', translator: '',
    status: 'finished', progress: 416, progressType: 'page',
    startedAt: new Date(Date.now() - 1000*60*60*24*90).toISOString(),
    finishedAt: new Date(Date.now() - 1000*60*60*24*20).toISOString(),
    dnfAt: null, dnfReason: '', rating: 5, review: 'Changed how I read every story. The monomyth is a lens you cannot un-see.',
    wantToReadPriority: null, wantToReadReason: '', coverStyle: 'color', notes: '', summary: '',
  },
  {
    id: 'b4', groupId: 'g3', title: 'Man and His Symbols', author: 'Carl Jung', color: '#2c5f8a', year: 1964,
    publisher: 'Doubleday', pages: 320, genre: 'Psychology / Philosophy', isbn: '9780440351832',
    language: 'English', originalLanguage: 'German', translator: 'Various',
    status: 'reading', progress: 118, progressType: 'page',
    startedAt: new Date(Date.now() - 1000*60*60*24*7).toISOString(),
    finishedAt: null, dnfAt: null, dnfReason: '', rating: null, review: '',
    wantToReadPriority: null, wantToReadReason: '', coverStyle: 'color',
    notes: 'Jung wrote this as his last book, specifically for a general audience. Good entry point.', summary: '',
  },
  {
    id: 'b5', groupId: 'g2', title: 'Critique of Pure Reason', author: 'Immanuel Kant', color: '#378ADD', year: 1781,
    publisher: 'Cambridge UP', pages: 785, genre: 'Philosophy', isbn: '9780521657297',
    language: 'English', originalLanguage: 'German', translator: 'Paul Guyer & Allen Wood',
    status: 'want-next', progress: 0, progressType: 'page',
    startedAt: null, finishedAt: null, dnfAt: null, dnfReason: '', rating: null, review: '',
    wantToReadPriority: 'next',
    wantToReadReason: 'The mind map I\'m building on "Time" keeps hitting Kant — I need the primary source, not summaries.',
    coverStyle: 'color', notes: '', summary: '',
  },
  {
    id: 'b6', groupId: 'g2', title: 'The Republic', author: 'Plato', color: '#D4537E', year: -380,
    publisher: 'Penguin Classics', pages: 448, genre: 'Philosophy', isbn: '9780140455113',
    language: 'English', originalLanguage: 'Ancient Greek', translator: 'Desmond Lee',
    status: 'want-someday', progress: 0, progressType: 'page',
    startedAt: null, finishedAt: null, dnfAt: null, dnfReason: '', rating: null, review: '',
    wantToReadPriority: 'someday',
    wantToReadReason: 'I keep hitting Platonic idealism in secondary literature. Should read it myself eventually.',
    coverStyle: 'color', notes: '', summary: '',
  },
];

export const THOUGHT_TYPES = [
  { id: 'reaction',   label: 'Reaction',   color: '#7a6a52', bg: '#f0e8d8' },
  { id: 'question',   label: 'Question',   color: '#c0392b', bg: '#faeae8' },
  { id: 'connection', label: 'Connection', color: '#2c5f8a', bg: '#e8eff8' },
  { id: 'loose-end',  label: 'Loose end',  color: '#b07d28', bg: '#faf0dc' },
  { id: 'insight',    label: 'Insight',    color: '#2e7d5e', bg: '#e4f4ec' },
];

export const SEED_TOPICS = [
  {
    id: 'tp1', parentId: null,
    title: 'Mythology & the Shadow',
    summary: 'Both Jung and Campbell circle the same psychological grammar — the thing we fear and must face is not an obstacle but a passage.',
    essay: "Jung's shadow and Campbell's threshold guardian are the same figure wearing different masks.\n\nWhat strikes me reading them together is that Campbell is essentially dramatising Jung. The hero's journey is individuation made into story.\n\nIf the threshold guardian is always a projection of the hero's own fear, then every monster in myth is autobiographical.",
    thoughtIds: ['t2', 't4'],
    confirmedAt: new Date(Date.now() - 1000*60*60).toISOString(),
    updatedAt: new Date(Date.now() - 1000*60*30).toISOString(),
  },
  {
    id: 'tp2', parentId: 'tp1',
    title: 'Shadow as threshold guardian',
    summary: 'The shadow is not the enemy — it is the door. Both Jung and Campbell describe the same figure from different angles.',
    essay: '',
    thoughtIds: ['t2'],
    confirmedAt: new Date(Date.now() - 1000*60*30).toISOString(),
    updatedAt: new Date(Date.now() - 1000*60*10).toISOString(),
  },
];

export const SEED_THOUGHTS = [
  {
    id: 't1', bookId: 'b1', type: 'reaction', quote: '', topics: ['trade', 'geography'], page: 42,
    text: 'The idea that the Silk Road was not one road but a living network — this reframes every history I\'ve read that treats it as a fixed route.',
    createdAt: new Date(Date.now() - 1000*60*8).toISOString(),
  },
  {
    id: 't2', bookId: 'b4', type: 'connection', quote: '', topics: ['mythology', 'shadow', 'psychology'], page: 118,
    text: 'Jung\'s shadow maps almost exactly onto what Campbell calls the threshold guardian — both are the feared thing that must be metabolised, not defeated.',
    createdAt: new Date(Date.now() - 1000*60*45).toISOString(),
  },
  {
    id: 't3', bookId: 'b2', type: 'question', quote: '', topics: ['causation', 'history', 'methodology'], page: 87,
    text: 'Diamond keeps invoking "proximate vs ultimate causes" — is this distinction doing real work or is it a way to sidestep the messiness of historical agency?',
    createdAt: new Date(Date.now() - 1000*60*90).toISOString(),
  },
  {
    id: 't4', bookId: 'b3', type: 'loose-end', quote: '', topics: ['mythology', 'Sumerian', 'underworld'], page: 201,
    text: 'The Sumerian descent myth — Inanna going through the seven gates — feels like the clearest archetype for all later underworld narratives.',
    createdAt: new Date(Date.now() - 1000*60*60*3).toISOString(),
  },
];

// ── Articles / Academic Papers ────────────────────────────────
export const SEED_ARTICLES = [
  {
    id: 'a1', groupId: 'g2', type: 'article',
    title: 'The Unreasonable Effectiveness of Mathematics in the Natural Sciences',
    author: 'Eugene Wigner', year: 1960,
    journal: 'Communications on Pure and Applied Mathematics', volume: '13', issue: '1',
    doi: '10.1002/cpa.3160130102', pages: 14, url: '',
    genre: 'Philosophy', language: 'English',
    color: '#2c5f8a', coverStyle: 'color',
    status: 'finished', progress: 14, progressType: 'page',
    startedAt: new Date(Date.now() - 1000*60*60*24*5).toISOString(),
    finishedAt: new Date(Date.now() - 1000*60*60*24*2).toISOString(),
    dnfAt: null, dnfReason: '', rating: 5,
    review: 'One of those papers that reframes a question you never thought to ask.',
    wantToReadPriority: null, wantToReadReason: '',
    abstract: 'Wigner argues that the mathematical structure found in nature is unreasonably effective — a miracle we neither understand nor deserve.',
    notes: 'Connects deeply to Kant\'s a priori intuition — if math is a construct of mind, why does it describe physical reality so precisely?',
    summary: '',
    connectedBookIds: ['b5'],
  },
  {
    id: 'a2', groupId: 'g1', type: 'article',
    title: 'The Columbian Exchange: Plants, Animals, and Disease between the Old and New Worlds',
    author: 'Alfred Crosby', year: 1972,
    journal: 'OAH Magazine of History', volume: '6', issue: '2',
    doi: '', pages: 8, url: '',
    genre: 'History', language: 'English',
    color: '#2e7d5e', coverStyle: 'color',
    status: 'reading', progress: 4, progressType: 'page',
    startedAt: new Date(Date.now() - 1000*60*60*24*1).toISOString(),
    finishedAt: null, dnfAt: null, dnfReason: '', rating: null, review: '',
    wantToReadPriority: null, wantToReadReason: 'Found cited in Guns, Germs & Steel — Crosby coined the term Diamond built his argument on.',
    abstract: 'The original paper introducing the concept of the Columbian Exchange and its ecological consequences.',
    notes: '', summary: '',
    connectedBookIds: ['b2'],
  },
  {
    id: 'a3', groupId: 'g2', type: 'article',
    title: 'What Is It Like to Be a Bat?',
    author: 'Thomas Nagel', year: 1974,
    journal: 'The Philosophical Review', volume: '83', issue: '4',
    doi: '10.2307/2183914', pages: 15, url: '',
    genre: 'Philosophy', language: 'English',
    color: '#7b3fa0', coverStyle: 'color',
    status: 'want-next', progress: 0, progressType: 'page',
    startedAt: null, finishedAt: null, dnfAt: null, dnfReason: '', rating: null, review: '',
    wantToReadPriority: 'next',
    wantToReadReason: 'The consciousness problem keeps coming up in the Heidegger / Kant reading. Nagel is the entry point.',
    abstract: 'Nagel argues that subjective experience has a character that cannot be captured by physicalist accounts.',
    notes: '', summary: '',
    connectedBookIds: [],
  },
];

// ── Articles / Papers ─────────────────────────────────────────────

export const SEED_ARTICLE_THOUGHTS = [
  {
    id: 'at1', sourceId: 'a1', sourceType: 'article', bookId: 'a1',
    type: 'reaction', quote: 'The fundamental source of conflict in this new world will not be primarily ideological or primarily economic.',
    text: 'Huntington is essentially arguing culture is destiny — but his civilisation map is suspiciously neat. Does China really share a "Sinic" identity with Vietnam?',
    topics: ['civilisation', 'conflict', 'culture'], page: null,
    createdAt: new Date(Date.now() - 1000*60*60*24*14).toISOString(),
  },
];

// ── Article groups ──────────────────────────────────────────────
export const SEED_ARTICLE_GROUPS = [
  { id: 'ag1', name: 'History & Culture',  color: '#7a6a52' },
  { id: 'ag2', name: 'Philosophy',         color: '#2c5f8a' },
  { id: 'ag3', name: 'Psychology',         color: '#7b3fa0' },
];

// ── Articles ────────────────────────────────────────────────────
// Shares the same status/genre/group system as books.
// Extra fields: journal, volume, issue, doi, url, abstract, articleType
