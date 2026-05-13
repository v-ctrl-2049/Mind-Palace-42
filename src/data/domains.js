// ── The Twelve Domains — the disciplinary spine of the Stacks ─────
// Loeb-style colours: each discipline has a characteristic binding

export const DEFAULT_DOMAINS = [
  { id: 'hist-eu',    name: 'History (EU)',       color: '#7a4a2a', order: 0  },
  { id: 'hist-us',    name: 'History (US)',        color: '#4a6a3a', order: 1  },
  { id: 'hist-cn',    name: 'History (China)',     color: '#8a2a2a', order: 2  },
  { id: 'classics',   name: 'Classics',            color: '#2a4a7a', order: 3  },
  { id: 'law-us',     name: 'Law (US)',             color: '#4a4a6a', order: 4  },
  { id: 'law-west',   name: 'Law (West)',           color: '#5a4a7a', order: 5  },
  { id: 'law-cn',     name: 'Law (China)',          color: '#7a3a5a', order: 6  },
  { id: 'med-hist',   name: 'Medicine (History)',   color: '#4a6a6a', order: 7  },
  { id: 'med-hum',    name: 'Medicine (Humanity)',  color: '#3a5a5a', order: 8  },
  { id: 'science',    name: 'Science',              color: '#5a5a3a', order: 9  },
  { id: 'economy',    name: 'Economy',              color: '#6a5a2a', order: 10 },
  { id: 'practical',  name: 'Practical',            color: '#3a3a3a', order: 11 },
];

// Heat indicator — days since last edit → visual weight
export function getHeat(updatedAt) {
  if (!updatedAt) return 'cold';
  const days = (Date.now() - new Date(updatedAt)) / 86400000;
  if (days < 1)  return 'hot';
  if (days < 7)  return 'warm';
  if (days < 30) return 'cool';
  return 'cold';
}

export function heatColor(heat) {
  return { hot: '#c4924a', warm: '#8a7a5a', cool: '#6a6a6a', cold: '#4a4a4a' }[heat] || '#4a4a4a';
}

// Density indicator — note count → filled dots (max 5)
export function getDensityDots(noteCount) {
  const filled = Math.min(5, Math.floor(noteCount / 3));
  return { filled, empty: 5 - filled };
}
