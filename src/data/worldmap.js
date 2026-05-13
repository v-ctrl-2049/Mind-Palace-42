export const PIN_TYPES = [
  { id: 'event',   label: 'Historical event', color: '#c0392b', bg: '#faeae8' },
  { id: 'origin',  label: 'Book origin',      color: '#2c5f8a', bg: '#e8eff8' },
  { id: 'setting', label: 'Book setting',     color: '#2e7d5e', bg: '#e4f4ec' },
  { id: 'person',  label: 'Person / thinker', color: '#7b3fa0', bg: '#f3eafa' },
  { id: 'place',   label: 'Named place',      color: '#b07d28', bg: '#faf0dc' },
];

export const getPinType = (id) => PIN_TYPES.find(t => t.id === id) || PIN_TYPES[0];

// SVG world map path data (simplified Robinson-ish projection, 680×420 viewBox)
// Coordinates are [lng, lat] → x = (lng + 180) * (680/360), y = (90 - lat) * (420/180)
export function lngLatToXY(lng, lat) {
  const x = (lng + 180) * (680 / 360);
  const y = (90 - lat) * (420 / 180);
  return { x, y };
}

export const WORLD_LAND_PATHS = [
  // North America
  { id: 'na', d: 'M 95 80 L 130 65 L 175 62 L 200 70 L 215 85 L 220 105 L 210 120 L 195 140 L 180 155 L 165 170 L 150 185 L 140 200 L 120 210 L 100 215 L 85 205 L 75 190 L 70 170 L 72 150 L 80 130 L 85 110 Z' },
  // Greenland
  { id: 'gl', d: 'M 195 40 L 230 35 L 255 45 L 250 65 L 230 70 L 210 65 L 200 55 Z' },
  // Central America
  { id: 'ca', d: 'M 140 200 L 155 205 L 160 215 L 150 225 L 138 220 L 132 210 Z' },
  // South America
  { id: 'sa', d: 'M 150 225 L 175 220 L 200 230 L 210 255 L 205 285 L 195 310 L 180 335 L 165 350 L 150 345 L 138 325 L 132 300 L 130 270 L 138 245 Z' },
  // Europe
  { id: 'eu', d: 'M 295 75 L 330 68 L 355 72 L 370 80 L 365 95 L 350 100 L 335 105 L 315 108 L 300 100 L 290 90 Z' },
  // Scandinavia
  { id: 'sc', d: 'M 320 55 L 340 48 L 355 52 L 360 65 L 350 72 L 335 68 L 320 62 Z' },
  // UK & Ireland
  { id: 'uk', d: 'M 285 75 L 298 70 L 305 78 L 298 88 L 288 85 Z' },
  // North Africa
  { id: 'naf', d: 'M 290 115 L 380 108 L 420 115 L 430 130 L 425 148 L 400 155 L 360 158 L 320 155 L 295 145 L 285 130 Z' },
  // Sub-Saharan Africa
  { id: 'af', d: 'M 300 155 L 400 155 L 425 165 L 435 190 L 430 220 L 415 250 L 395 275 L 370 290 L 350 295 L 330 285 L 310 265 L 298 240 L 292 210 L 292 180 Z' },
  // Middle East
  { id: 'me', d: 'M 370 100 L 420 95 L 450 100 L 460 115 L 455 130 L 440 140 L 415 145 L 390 140 L 375 128 L 368 115 Z' },
  // Central Asia
  { id: 'casia', d: 'M 450 80 L 510 72 L 540 78 L 545 95 L 535 108 L 510 115 L 478 118 L 458 112 L 448 98 Z' },
  // South Asia
  { id: 'sa2', d: 'M 455 115 L 510 112 L 530 120 L 532 140 L 520 160 L 500 175 L 480 178 L 462 168 L 452 148 L 450 132 Z' },
  // Russia / Siberia
  { id: 'ru', d: 'M 340 45 L 430 30 L 530 28 L 590 35 L 620 50 L 615 70 L 580 78 L 540 78 L 490 72 L 440 68 L 400 72 L 365 68 L 345 58 Z' },
  // East Asia
  { id: 'ea', d: 'M 540 78 L 590 72 L 620 80 L 630 100 L 625 120 L 610 135 L 590 140 L 565 138 L 548 125 L 538 108 Z' },
  // Southeast Asia
  { id: 'sea', d: 'M 548 125 L 585 125 L 600 138 L 595 155 L 575 162 L 555 158 L 543 145 Z' },
  // Japan
  { id: 'jp', d: 'M 615 90 L 630 85 L 638 95 L 632 108 L 620 112 L 612 102 Z' },
  // Australia
  { id: 'au', d: 'M 560 255 L 610 248 L 640 258 L 645 285 L 635 310 L 610 325 L 580 320 L 558 305 L 548 280 L 550 262 Z' },
  // New Zealand
  { id: 'nz', d: 'M 640 310 L 652 305 L 658 318 L 648 328 L 638 322 Z' },
  // Madagascar
  { id: 'mg', d: 'M 425 250 L 432 242 L 438 255 L 435 272 L 425 268 Z' },
  // Iceland
  { id: 'is', d: 'M 255 55 L 272 50 L 278 60 L 268 68 L 256 64 Z' },
];

export const SEED_PINS = [
  // Historical events (linked to timeline)
  { id: 'p1', type: 'event', label: 'Battle of Marathon', lat: 38.1, lng: 24.0, bookId: 'b1', eventTag: 'persia', note: '490 BCE — Greek city-states repel Persian invasion. Herodotus watches.' },
  { id: 'p2', type: 'event', label: 'Achaemenid heartland', lat: 30.0, lng: 53.0, bookId: 'b1', eventTag: 'persia', note: 'Persepolis — centre of Darius\'s empire and the Silk Road\'s western hub.' },
  { id: 'p3', type: 'event', label: 'Han Silk Road opens', lat: 34.3, lng: 108.9, bookId: 'b1', eventTag: 'silk road', note: '130 BCE — Chang\'an, capital of Han China, origin point of eastern silk trade.' },
  { id: 'p4', type: 'event', label: 'Samarkand', lat: 39.6, lng: 66.9, bookId: 'b1', eventTag: 'silk road', note: 'Central hub of the Silk Road — where east and west met for millennia.' },
  { id: 'p5', type: 'event', label: 'Columbian Exchange', lat: 19.4, lng: -99.1, bookId: 'b2', eventTag: 'disease', note: '1492 — Tenochtitlan (Mexico City). The collision of Old and New World.' },
  { id: 'p6', type: 'event', label: 'Black Death enters Europe', lat: 43.9, lng: 28.7, bookId: 'b2', eventTag: 'plague', note: '1347 — Caffa (Crimea), where plague-infected Mongols catapulted bodies over walls.' },
  // Book origins
  { id: 'p7', type: 'origin', label: 'The Silk Roads (London)', lat: 51.5, lng: -0.1, bookId: 'b1', note: 'Peter Frankopan wrote this at Oxford. Published London, 2015.' },
  { id: 'p8', type: 'origin', label: 'Guns, Germs & Steel (LA)', lat: 34.0, lng: -118.2, bookId: 'b2', note: 'Jared Diamond, UCLA. Written after a conversation in New Guinea.' },
  { id: 'p9', type: 'origin', label: 'Hero of 1000 Faces (NY)', lat: 40.7, lng: -74.0, bookId: 'b3', note: 'Joseph Campbell wrote this at Sarah Lawrence College, New York.' },
  { id: 'p10', type: 'origin', label: 'Critique of Pure Reason', lat: 54.7, lng: 20.5, bookId: 'b5', note: 'Kant never left Königsberg (now Kaliningrad, Russia) his entire life.' },
  { id: 'p11', type: 'origin', label: 'The Republic (Athens)', lat: 37.9, lng: 23.7, bookId: 'b6', note: 'Plato\'s Academy, Athens, ~380 BCE. The foundational text of Western philosophy.' },
  // Thinkers / persons
  { id: 'p12', type: 'person', label: 'Herodotus (Halicarnassus)', lat: 37.0, lng: 27.4, bookId: 'b1', note: 'Herodotus was born in Halicarnassus (modern Bodrum, Turkey), c. 484 BCE.' },
  { id: 'p13', type: 'person', label: 'Jung (Kesswil, Switzerland)', lat: 47.6, lng: 9.3, bookId: 'b4', note: 'Carl Jung born 1875 in Kesswil, Switzerland. Worked in Zürich.' },
  { id: 'p14', type: 'person', label: 'Heidegger (Meßkirch)', lat: 47.9, lng: 9.1, bookId: '', note: 'Born in Meßkirch, Baden, 1889. Taught in Freiburg and Marburg.' },
];

export const SEED_ROUTES = [
  { id: 'r1', label: 'Silk Road (overland)', color: '#b07d28', points: [[34.3,108.9],[39.6,66.9],[30.0,53.0],[37.9,23.7]], bookId: 'b1' },
  { id: 'r2', label: 'Mediterranean trade', color: '#7a6a52', points: [[37.9,23.7],[37.0,27.4],[36.8,10.2],[38.1,24.0],[41.9,12.5]], bookId: 'b1' },
  { id: 'r3', label: 'Plague route westward', color: '#c0392b', points: [[43.9,28.7],[41.9,12.5],[43.3,5.4],[48.8,2.3]], bookId: 'b2', dash: true },
];
