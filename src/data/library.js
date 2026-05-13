export const STATUSES = [
  { id: 'reading',      label: 'Currently Reading', color: '#2e7d5e', bg: '#e4f4ec', dot: '#2e7d5e' },
  { id: 'want-next',   label: 'Next Book!',         color: '#2c5f8a', bg: '#e8eff8', dot: '#2c5f8a' },
  { id: 'want-someday',label: 'Maybe Someday',      color: '#7a6a52', bg: '#f0e8d8', dot: '#7a6a52' },
  { id: 'want-meh',    label: 'Yeah Whatever',      color: '#8a8680', bg: '#f2f0ec', dot: '#8a8680' },
  { id: 'finished',    label: 'Finished',           color: '#b07d28', bg: '#faf0dc', dot: '#b07d28' },
  { id: 'dnf',         label: 'Did Not Finish',     color: '#c0392b', bg: '#faeae8', dot: '#c0392b' },
];

export const WANT_PRIORITIES = [
  { id: 'next',    label: 'Next Book!' },
  { id: 'someday', label: 'Maybe Someday' },
  { id: 'meh',     label: 'Yeah Whatever' },
];

export const GENRES = [
  'History', 'Philosophy', 'Psychology', 'Science', 'Mythology',
  'Biography', 'Fiction', 'Politics', 'Economics', 'Anthropology',
  'Literature', 'Religion', 'Sociology', 'Art', 'Other',
];

export const COVER_STYLES = [
  { id: 'color',    label: 'Colour block' },
  { id: 'minimal',  label: 'Minimal text' },
  { id: 'dark',     label: 'Dark' },
  { id: 'warm',     label: 'Warm paper' },
];

export const ACCENT_COLORS = [
  '#7a6a52','#2e7d5e','#c0392b','#2c5f8a','#b07d28',
  '#7b3fa0','#c0784a','#3a7d7d','#D4537E','#4a6fa5',
  '#6b4c3b','#1a6b3c','#8b4513','#2f4f8f','#8b0000',
];

export const getStatus = (id) => STATUSES.find(s => s.id === id) || STATUSES[0];
