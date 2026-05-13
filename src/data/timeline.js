export const REGIONS = [
  { id: 'europe',      label: 'Europe',        color: '#7a6a52' },
  { id: 'middle-east', label: 'Middle East',   color: '#c0392b' },
  { id: 'asia',        label: 'Asia',          color: '#2c5f8a' },
  { id: 'africa',      label: 'Africa',        color: '#2e7d5e' },
  { id: 'americas',    label: 'Americas',      color: '#b07d28' },
  { id: 'oceania',     label: 'Oceania',       color: '#7b3fa0' },
  { id: 'global',      label: 'Global',        color: '#8a8680' },
];

export const EVENT_TYPES = [
  { id: 'political',  label: 'Political',   color: '#c0392b', bg: '#faeae8' },
  { id: 'military',   label: 'Military',    color: '#7a3f20', bg: '#f5e8df' },
  { id: 'cultural',   label: 'Cultural',    color: '#7b3fa0', bg: '#f3eafa' },
  { id: 'economic',   label: 'Economic',    color: '#b07d28', bg: '#faf0dc' },
  { id: 'scientific', label: 'Scientific',  color: '#2c5f8a', bg: '#e8eff8' },
  { id: 'religious',  label: 'Religious',   color: '#2e7d5e', bg: '#e4f4ec' },
  { id: 'other',      label: 'Other',       color: '#8a8680', bg: '#f2f0ec' },
];

export const getRegion = (id) => REGIONS.find(r => r.id === id) || REGIONS[0];
export const getEventType = (id) => EVENT_TYPES.find(t => t.id === id) || EVENT_TYPES[6];

// Parse a flexible date entry into a sortable numeric year + display string
// Accepts: "480 BCE", "-480", "1453", "March 1453", "15 March 1453", "2024-03-15"
export function parseEventDate(raw) {
  if (!raw) return { year: 0, display: '', sortKey: 0 };
  const s = String(raw).trim();

  // ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s);
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), display: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), sortKey: d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() };
  }

  // BCE / BC
  const bceMatch = s.match(/^(-?\d+)\s*(BCE|BC)$/i);
  if (bceMatch) {
    const yr = -Math.abs(parseInt(bceMatch[1]));
    return { year: yr, display: `${Math.abs(yr)} BCE`, sortKey: yr * 10000 };
  }

  // Negative number = BCE
  if (/^-\d+$/.test(s)) {
    const yr = parseInt(s);
    return { year: yr, display: `${Math.abs(yr)} BCE`, sortKey: yr * 10000 };
  }

  // "Month Year" e.g. "March 480"
  const monthYearMatch = s.match(/^([A-Za-z]+)\s+(-?\d+)(?:\s*(BCE|BC))?$/i);
  if (monthYearMatch) {
    const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    const mIdx = months.indexOf(monthYearMatch[1].toLowerCase());
    const yr = parseInt(monthYearMatch[2]) * (monthYearMatch[3] ? -1 : 1);
    const display = mIdx >= 0 ? `${monthYearMatch[1]} ${Math.abs(yr)}${yr < 0 ? ' BCE' : ''}` : s;
    return { year: yr, month: mIdx + 1, display, sortKey: yr * 10000 + (mIdx + 1) * 100 };
  }

  // "Day Month Year" e.g. "15 March 1453"
  const dayMonthYearMatch = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(-?\d+)(?:\s*(BCE|BC))?$/i);
  if (dayMonthYearMatch) {
    const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    const mIdx = months.indexOf(dayMonthYearMatch[2].toLowerCase());
    const yr = parseInt(dayMonthYearMatch[3]) * (dayMonthYearMatch[4] ? -1 : 1);
    const display = `${dayMonthYearMatch[1]} ${dayMonthYearMatch[2]} ${Math.abs(yr)}${yr < 0 ? ' BCE' : ''}`;
    return { year: yr, month: mIdx + 1, day: parseInt(dayMonthYearMatch[1]), display, sortKey: yr * 10000 + (mIdx + 1) * 100 + parseInt(dayMonthYearMatch[1]) };
  }

  // Plain year
  if (/^-?\d+$/.test(s)) {
    const yr = parseInt(s);
    return { year: yr, display: yr < 0 ? `${Math.abs(yr)} BCE` : String(yr), sortKey: yr * 10000 };
  }

  return { year: 0, display: s, sortKey: 0 };
}

export const SEED_EVENTS = [
  {
    id: 'e1', title: 'Battle of Marathon',
    dateRaw: '490 BCE', region: 'europe', type: 'military',
    bookIds: ['b1'], tags: ['persia', 'greece', 'war'],
    quote: 'The Athenians ran to meet the Persians — the first Greeks known to have charged at a run.',
    note: 'Herodotus frames this as the moment Greek freedom was defended. But Frankopan sees it as a blip in Achaemenid expansion — Persia barely noticed.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'e2', title: 'Achaemenid Empire at peak extent',
    dateRaw: '500 BCE', region: 'middle-east', type: 'political',
    bookIds: ['b1'], tags: ['persia', 'empire', 'trade'],
    quote: 'Darius reorganised his empire into satrapies, each governed from a fixed capital.',
    note: 'This is when the Silk Road network first becomes recognisable. Persia is the hinge between East and West.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'e3', title: 'Han Dynasty opens western trade routes',
    dateRaw: '130 BCE', region: 'asia', type: 'economic',
    bookIds: ['b1'], tags: ['china', 'trade', 'silk road'],
    quote: 'Zhang Qian returned from his mission to the west having discovered a world unknown to China.',
    note: 'The moment China deliberately connects to the wider world. Silk flows west; grapes and horses flow east.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'e4', title: 'Mongol Pax — peak of overland trade',
    dateRaw: '1250', region: 'asia', type: 'economic',
    bookIds: ['b1'], tags: ['mongol', 'trade', 'silk road'],
    quote: '',
    note: 'The Pax Mongolica briefly makes it possible to travel from China to Persia without being robbed. Trade volume peaks.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'e5', title: 'Black Death reaches Europe',
    dateRaw: '1347', region: 'europe', type: 'other',
    bookIds: ['b2'], tags: ['plague', 'disease', 'trade'],
    quote: 'The plague bacillus travelled the trade routes faster than any army could march.',
    note: 'Diamond\'s point: disease is a weapon of geography, not intention. The Silk Roads that enabled commerce also enabled catastrophe.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'e6', title: 'Columbian Exchange begins',
    dateRaw: '1492', region: 'americas', type: 'other',
    bookIds: ['b2'], tags: ['disease', 'americas', 'europe', 'trade'],
    quote: 'Within decades of contact, up to 90% of indigenous American populations perished.',
    note: 'Diamond\'s central argument made concrete. The exchange was catastrophically asymmetric — Eurasian germs devastated America; American crops enriched Europe.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
];
