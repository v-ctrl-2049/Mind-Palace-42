// ── Editable type registries ────────────────────────────────────
// These are the DEFAULT sets. User edits are stored in localStorage
// under 'rm_thought_types', 'rm_event_types', 'rm_node_types', 'rm_edge_types', 'rm_genres'

export const DEFAULT_GENRES = [
  'History', 'Philosophy', 'Psychology', 'Science', 'Mythology',
  'Biography', 'Fiction', 'Politics', 'Economics', 'Anthropology',
  'Literature', 'Religion', 'Sociology', 'Art', 'Other',
];

export const DEFAULT_THOUGHT_TYPES = [
  { id: 'reaction',      label: 'Reaction',      color: '#7a6a52', bg: '#f0e8d8' },
  { id: 'question',      label: 'Question',      color: '#c0392b', bg: '#faeae8' },
  { id: 'connection',    label: 'Connection',    color: '#2c5f8a', bg: '#e8eff8' },
  { id: 'loose-end',     label: 'Loose end',     color: '#b07d28', bg: '#faf0dc' },
  { id: 'insight',       label: 'Insight',       color: '#2e7d5e', bg: '#e4f4ec' },
  { id: 'quote',         label: 'Quote',         color: '#7b3fa0', bg: '#f3eafa' },
  { id: 'retrospective', label: 'Retrospective', color: '#1a5c7a', bg: '#e0f0f8' },
];

export const DEFAULT_NODE_TYPES = [
  { id: 'topic',       label: 'Topic',         color: '#2c3e50', bg: '#e8edf2' },
  { id: 'concept',     label: 'Concept',       color: '#7a6a52', bg: '#f0e8d8' },
  { id: 'thinker',     label: 'Thinker',       color: '#2c5f8a', bg: '#e8eff8' },
  { id: 'work',        label: 'Work / Text',   color: '#2e7d5e', bg: '#e4f4ec' },
  { id: 'opposing',    label: 'Opposing view', color: '#c0392b', bg: '#faeae8' },
  { id: 'synthesis',   label: 'My synthesis',  color: '#b07d28', bg: '#faf0dc' },
  { id: 'question',    label: 'Open question', color: '#7b3fa0', bg: '#f3eafa' },
];

export const DEFAULT_EDGE_TYPES = [
  { id: 'influence',    label: 'Influence',     color: '#8a8680', dash: false },
  { id: 'tension',      label: 'Tension',       color: '#c0392b', dash: false },
  { id: 'extends',      label: 'Extends',       color: '#2c5f8a', dash: false },
  { id: 'refutes',      label: 'Refutes',       color: '#e05a4a', dash: true  },
  { id: 'related',      label: 'Related',       color: '#7a6a52', dash: true  },
  { id: 'synthesises',  label: 'Synthesises',   color: '#b07d28', dash: false },
  { id: 'foundation',   label: 'Foundation of', color: '#1a5c3a', dash: false },
];

export const TYPE_COLORS = [
  '#2c3e50','#7a6a52','#c0392b','#2c5f8a','#2e7d5e','#b07d28','#7b3fa0',
  '#c0784a','#3a7d7d','#D4537E','#4a6fa5','#1a5c3a','#8b4513',
  '#556B2F','#8B008B','#2F4F4F',
];

export const DEFAULT_EVENT_TYPES = [
  { id: 'political',   label: 'Political',   color: '#c0392b', bg: '#faeae8' },
  { id: 'military',    label: 'Military',    color: '#7a3f20', bg: '#f5e8df' },
  { id: 'cultural',    label: 'Cultural',    color: '#7b3fa0', bg: '#f3eafa' },
  { id: 'economic',    label: 'Economic',    color: '#b07d28', bg: '#faf0dc' },
  { id: 'scientific',  label: 'Scientific',  color: '#2c5f8a', bg: '#e8eff8' },
  { id: 'religious',   label: 'Religious',   color: '#2e7d5e', bg: '#e4f4ec' },
  { id: 'other',       label: 'Other',       color: '#8a8680', bg: '#f2f0ec' },
];

export const DEFAULT_INV_TYPES = [
  { id: 'political',     label: 'Political',     color: '#c0392b', bg: '#faeae8' },
  { id: 'social',        label: 'Social',        color: '#2c5f8a', bg: '#e8eff8' },
  { id: 'economic',      label: 'Economic',      color: '#b07d28', bg: '#faf0dc' },
  { id: 'psychological', label: 'Psychological', color: '#7b3fa0', bg: '#f3eafa' },
  { id: 'cultural',      label: 'Cultural',      color: '#2e7d5e', bg: '#e4f4ec' },
  { id: 'scientific',    label: 'Scientific',    color: '#1a5c7a', bg: '#e0f0f8' },
  { id: 'religious',     label: 'Religious',     color: '#7a6a52', bg: '#f0e8d8' },
];

export const DEFAULT_METHODOLOGIES = [
  'Annales school',
  'Marxist / materialist',
  'Postcolonial',
  'Institutionalist',
  'Narrative / biographical',
  'Psychoanalytic',
  'Structuralist',
  'World-systems theory',
  'Feminist',
  'Environmental / ecocritical',
  'Intellectual history',
  'Social history',
  'Political history',
  'Cultural history',
  'Empiricist',
];
