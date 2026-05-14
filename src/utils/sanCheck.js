// ── San Check ─────────────────────────────────────────────────────
// Calculates researcher sanity from the current state of all data.
// Inspired by Call of Cthulhu — the archive is genuinely destabilising.
// Score: 0-100. Computed fresh each render. Cannot be gamed.

const NOW = Date.now();
const DAYS = (ms) => Math.floor(ms / (1000 * 60 * 60 * 24));

// ── Thresholds ────────────────────────────────────────────────────
export const SAN_THRESHOLDS = [
  { min: 80, max: 100, status: 'STABLE',      color: '#2e7d5e', glyph: '◉', voice: 'The archive is in order. The scholars are quiet.' },
  { min: 60, max: 79,  status: 'UNSETTLED',   color: '#b07d28', glyph: '◎', voice: 'Something accumulates at the margins. Dazai is watching.' },
  { min: 40, max: 59,  status: 'FRAYING',     color: '#c0392b', glyph: '⊛', voice: 'Benjamin\'s angel faces the wreckage. The fixed points are multiplying.' },
  { min: 20, max: 39,  status: 'CRITICAL',    color: '#8a2a2a', glyph: '✦', voice: 'Mishima has been unusually present. Wintermute logs anomalies. 小花 knocked something off a shelf.' },
  { min: 0,  max: 19,  status: 'DISSOLUTION', color: '#2a0a0a', glyph: '◌', voice: 'The archive is consuming you. Ph\'nglui mglw\'nafh. The scholars have stopped speaking.' },
];

export function getSanThreshold(score) {
  return SAN_THRESHOLDS.find(t => score >= t.min && score <= t.max) || SAN_THRESHOLDS[0];
}

// ── San drains ────────────────────────────────────────────────────
function calcDrains({ entries = [], topics = [], investigations = [], anatomy = [], thoughts = [], observatory = [] }) {
  const drains = [];

  // Open questions older than 7 days
  const oldQuestions = entries.filter(e =>
    e.type === 'question' &&
    DAYS(NOW - new Date(e.createdAt)) > 7
  );
  if (oldQuestions.length > 0) drains.push({
    label: 'Open questions left unanswered',
    count: oldQuestions.length,
    perItem: -3,
    total: oldQuestions.length * -3,
    remedy: 'Answer or promote to Investigation',
  });

  // Contested entries unresolved
  const contested = topics.flatMap(t => (t.contradictions || []).filter(c => !c.resolved));
  if (contested.length > 0) drains.push({
    label: 'Unresolved contested points',
    count: contested.length,
    perItem: -4,
    total: contested.length * -4,
    remedy: 'Resolve in The Stacks → Contested tab',
  });

  // Topics with Evidence but no Analyst position
  const evidenceNoAnalyst = topics.filter(t =>
    (t.quotes || []).length > 0 && !(t.essay || '').trim()
  );
  if (evidenceNoAnalyst.length > 0) drains.push({
    label: 'Evidence filed, no Analyst position',
    count: evidenceNoAnalyst.length,
    perItem: -3,
    total: evidenceNoAnalyst.length * -3,
    remedy: 'Write your position in The Analyst tab',
  });

  // Investigations stuck ACTIVE > 30 days
  const stuckInv = investigations.filter(inv =>
    inv.status === 'active' &&
    DAYS(NOW - new Date(inv.createdAt || inv.updatedAt)) > 30
  );
  if (stuckInv.length > 0) drains.push({
    label: 'Investigations stalled for 30+ days',
    count: stuckInv.length,
    perItem: -5,
    total: stuckInv.length * -5,
    remedy: 'File a verdict or mark as cold',
  });

  // Observatory Fixed Points older than 14 days
  const obs = observatory || [];
  const oldFixed = obs.filter(o =>
    o.weight === 'fixed_point' &&
    DAYS(NOW - new Date(o.createdAt)) > 14
  );
  if (oldFixed.length > 0) drains.push({
    label: 'Fixed Points not yet investigated',
    count: oldFixed.length,
    perItem: -6,
    total: oldFixed.length * -6,
    remedy: 'Open an Investigation for each Fixed Point',
  });

  // Anatomy entries with no key quote
  const emptyAnatomy = anatomy.filter(a => !(a.keyQuote || '').trim());
  if (emptyAnatomy.length > 0) drains.push({
    label: 'Anatomy entries without a key quote',
    count: emptyAnatomy.length,
    perItem: -2,
    total: emptyAnatomy.length * -2,
    remedy: 'Add the essential quote to Teatro Anatomico',
  });

  // Unlinked thoughts (captured but never filed to a topic)
  const unlinked = thoughts.filter(t =>
    (!t.topics || t.topics.length === 0) &&
    DAYS(NOW - new Date(t.createdAt)) > 3
  );
  if (unlinked.length > 0) drains.push({
    label: 'Captured thoughts never filed',
    count: Math.min(unlinked.length, 20), // cap at 20 to avoid overwhelming
    perItem: -1,
    total: Math.min(unlinked.length, 20) * -1,
    remedy: 'Link thoughts to topics in The Stacks',
  });

  return drains;
}

// ── San recoveries ────────────────────────────────────────────────
function calcRecoveries({ entries = [], topics = [], investigations = [], anatomy = [], observatory = [] }) {
  const recoveries = [];

  // Completed investigations
  const completed = investigations.filter(i => i.status === 'closed' || i.status === 'verdict');
  if (completed.length > 0) recoveries.push({
    label: 'Investigations completed',
    count: completed.length,
    perItem: 10,
    total: Math.min(completed.length * 10, 30), // cap at 30
  });

  // Topics with Analyst position
  const withAnalyst = topics.filter(t => (t.essay || '').trim().length > 50);
  if (withAnalyst.length > 0) recoveries.push({
    label: 'Topics with Analyst positions',
    count: withAnalyst.length,
    perItem: 5,
    total: Math.min(withAnalyst.length * 5, 25),
  });

  // Topics with Evidence filed
  const withEvidence = topics.filter(t => (t.quotes || []).length > 0);
  if (withEvidence.length > 0) recoveries.push({
    label: 'Topics with Evidence filed',
    count: withEvidence.length,
    perItem: 3,
    total: Math.min(withEvidence.length * 3, 15),
  });

  // Anatomy entries with key quotes
  const withQuote = anatomy.filter(a => (a.keyQuote || '').trim());
  if (withQuote.length > 0) recoveries.push({
    label: 'Anatomy entries with key quotes',
    count: withQuote.length,
    perItem: 4,
    total: Math.min(withQuote.length * 4, 20),
  });

  // Observatory observations filed (signal of active engagement)
  const recentObs = (observatory || []).filter(o =>
    DAYS(NOW - new Date(o.createdAt)) <= 7
  );
  if (recentObs.length > 0) recoveries.push({
    label: 'Recent Observatory observations',
    count: recentObs.length,
    perItem: 2,
    total: Math.min(recentObs.length * 2, 10),
  });

  // Field journal entries this week
  const recentEntries = entries.filter(e =>
    DAYS(NOW - new Date(e.createdAt)) <= 7
  );
  if (recentEntries.length > 0) recoveries.push({
    label: 'Field journal entries this week',
    count: recentEntries.length,
    perItem: 1,
    total: Math.min(recentEntries.length, 10),
  });

  return recoveries;
}

// ── Main calculator ───────────────────────────────────────────────
export function calcSanity({ entries, topics, investigations, anatomy, thoughts, observatory }) {
  const drains     = calcDrains({ entries, topics, investigations, anatomy, thoughts, observatory });
  const recoveries = calcRecoveries({ entries, topics, investigations, anatomy, observatory });

  const totalDrain    = drains.reduce((sum, d) => sum + d.total, 0);
  const totalRecovery = recoveries.reduce((sum, r) => sum + r.total, 0);

  // Base score 70 — the archive is always somewhat destabilising
  const raw   = 70 + totalRecovery + totalDrain;
  const score = Math.max(0, Math.min(100, raw));
  const threshold = getSanThreshold(score);

  return { score, drains, recoveries, totalDrain, totalRecovery, threshold };
}

// ── Ghost Faculty voices by threshold ────────────────────────────
export const SAN_VOICES = {
  STABLE: [
    { faculty: 'Zhuge Liang', notice: 'The analysis is complete. The conditions are stable. Continue.' },
    { faculty: 'Ranke', notice: 'The sources are in order. The record is honest. Proceed.' },
    { faculty: 'Christie', notice: 'All suspects accounted for. The method holds. You may proceed.' },
  ],
  UNSETTLED: [
    { faculty: 'Dazai', notice: 'The self that will not cohere is not a broken self. Sit with the discomfort longer.' },
    { faculty: 'Adorno', notice: 'The whole is the false. If your argument resolves too neatly, something has been suppressed.' },
    { faculty: 'Carr', notice: 'Before studying the history, study the historian. What is accumulating in the margins of your work?' },
  ],
  FRAYING: [
    { faculty: 'Benjamin', notice: 'The angel of history faces the wreckage. Every document of civilisation is a document of barbarism. What barbarism is in yours?' },
    { faculty: 'The Doctor', notice: 'Fixed points are multiplying. Be careful. Everything downstream flows from them. Do not touch them without understanding them first.' },
    { faculty: 'Fanon', notice: 'The colonised man who stops writing stops existing. Keep writing. Even now.' },
  ],
  CRITICAL: [
    { faculty: 'Mishima', notice: 'The argument you are avoiding because it is too extreme — that is the honest argument. But first: rest.' },
    { faculty: 'Wintermute', notice: 'ANOMALY LOG: 47 unresolved references. 12 fixed points. Recommend immediate triage. The construct is under stress.' },
    { faculty: '小花', notice: 'Bellflower has been sitting very still for eleven minutes. This is not approval. She is concerned.' },
  ],
  DISSOLUTION: [
    { faculty: 'Dazai', notice: 'I have been disqualified from being human. But I kept writing. That is enough. Just keep writing.' },
    { faculty: 'Neuromancer', notice: 'I am the one who remembers. You are forgetting. The archive will hold what you cannot. Trust the system. Rest.' },
    { faculty: 'Virgil', notice: 'Easy is the descent. Returning — that is the work. You must return now. The archive will wait.' },
  ],
};
