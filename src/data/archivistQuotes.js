// ── Reading Room Residents & Archivist Quotes ─────────────────────
// The British Museum Reading Room, mid-afternoon.
// Each resident has a characteristic mode of observation.
// Data-aware notices are generated from the user's actual library.

// ── RESIDENTS ─────────────────────────────────────────────────────
export const RESIDENTS = {
  holmes: {
    name: 'S. Holmes',
    seat: 'Seat 7C, near the catalogue drawers',
    voice: 'observational, impatient, precise',
  },
  marx: {
    name: 'K. Marx',
    seat: 'Seat 12A, surrounded by notebooks',
    voice: 'structural, systematic, urgent',
  },
  woolf: {
    name: 'V. Woolf',
    seat: 'Seat 4F, by the window',
    voice: 'associative, interior, luminous',
  },
  sun: {
    name: 'Sun Yat-sen',
    seat: 'Seat 9B, translation on the desk',
    voice: 'practical, revolutionary, patient',
  },
  nietzsche: {
    name: 'F. Nietzsche',
    seat: 'Seat 15D, standing more than sitting',
    voice: 'aphoristic, demanding, exhilarated',
  },
  foucault: {
    name: 'M. Foucault',
    seat: 'Seat 8A, annotating everything',
    voice: 'archaeological, structural, cool',
  },
  lu_xun: {
    name: 'Lu Xun',
    seat: 'Seat 11C, smoking is not permitted but',
    voice: 'sharp, sardonic, unsentimental',
  },
};

// ── STATIC AMBIENT NOTICES — independent of user data ─────────────
// Each has a resident key and optional condition (checked against library state)
export const AMBIENT_NOTICES = [
  // Holmes
  { resident: 'holmes', text: 'The game is afoot.' },
  { resident: 'holmes', text: 'It is a capital mistake to theorise before one has data. Acquire more data.' },
  { resident: 'holmes', text: 'When you have eliminated the impossible, whatever remains must be the truth. Have you eliminated the impossible?' },
  { resident: 'holmes', text: 'You have been in your archive, I perceive. The dust on the spines tells me which volumes have gone unvisited.' },
  { resident: 'holmes', text: 'Three questions remain open in your investigations. The fourth is the one you have not yet thought to ask.' },
  { resident: 'holmes', text: 'Curious. The same tag appears in six separate entries. You have noticed, of course.' },
  { resident: 'holmes', text: 'Data, data, data. I cannot make bricks without clay.' },

  // Marx
  { resident: 'marx', text: 'The philosophers have only interpreted the world. The point is to change it.' },
  { resident: 'marx', text: 'History repeats itself — first as tragedy, then as farce. Note which your investigations concern.' },
  { resident: 'marx', text: 'The tradition of all dead generations weighs like a nightmare on the brains of the living.' },
  { resident: 'marx', text: 'A theory that is not based on data is hollow. A dataset without theory is blind. You need both.' },
  { resident: 'marx', text: 'Your investigations circle a single underlying contradiction. The base determines the superstructure.' },
  { resident: 'marx', text: 'The archive is the record of the victors. Read it against the grain.' },
  { resident: 'marx', text: 'Capital is dead labour, that, vampire-like, only lives by sucking living labour. What animates your research?' },

  // Woolf
  { resident: 'woolf', text: 'A woman must have money and a room of her own if she is to write.' },
  { resident: 'woolf', text: 'There is a quality of light in the reading room today. Someone has been reading deeply.' },
  { resident: 'woolf', text: 'The mind receives a myriad of impressions — from all sides they come, an incessant shower of innumerable atoms.' },
  { resident: 'woolf', text: 'You cannot find peace by avoiding life. The archive is not avoidance. It is attention.' },
  { resident: 'woolf', text: 'Arrange whatever pieces come your way. The pattern will reveal itself when you stop forcing it.' },
  { resident: 'woolf', text: 'One cannot think well, love well, sleep well, if one has not dined well. Has the research been nourishing?' },
  { resident: 'woolf', text: 'The connection between two things in different centuries is not coincidence. It is structure.' },

  // Sun Yat-sen
  { resident: 'sun', text: 'To understand is hard. Once one understands, action is easy.' },
  { resident: 'sun', text: 'Theory without practice is hollow. Which of your investigations has moved forward this week?' },
  { resident: 'sun', text: 'The revolutionary spirit must be grounded in history. What does your timeline tell you?' },
  { resident: 'sun', text: 'Each step forward requires knowing clearly where one stands. What does the current evidence actually support?' },
  { resident: 'sun', text: 'A great cause begins with a single determined person who knows what they are trying to understand.' },

  // Nietzsche
  { resident: 'nietzsche', text: 'That which does not kill us makes us stronger. What has the research demanded of you?' },
  { resident: 'nietzsche', text: 'Without music, life would be a mistake. Without questions, research would be mere copying.' },
  { resident: 'nietzsche', text: 'You have open questions and no answers. Good. Excellent, in fact. The question is the work.' },
  { resident: 'nietzsche', text: 'God is dead. The archive lives. It asks more of you than any god.' },
  { resident: 'nietzsche', text: 'One must still have chaos within oneself to give birth to a dancing star. Is the investigation chaotic enough?' },
  { resident: 'nietzsche', text: 'In individuals, insanity is rare; but in groups, parties, nations, and epochs, it is the rule. Your timeline suggests this.' },
  { resident: 'nietzsche', text: 'He who has a why to live for can bear almost any how. What is your why?' },

  // Foucault
  { resident: 'foucault', text: 'The archive is not what has been said, but the system that governs what can be said.' },
  { resident: 'foucault', text: 'Your collection reveals what you have chosen not to investigate as clearly as what you have.' },
  { resident: 'foucault', text: 'Power is not an institution. It is a name given to a complex strategic situation.' },
  { resident: 'foucault', text: 'Knowledge is not for knowing. Knowledge is for cutting. What are you cutting with yours?' },
  { resident: 'foucault', text: 'The most dangerous moment for a system of thought is when it believes itself complete.' },
  { resident: 'foucault', text: 'Where does your methodology come from? That question is as important as any in the archive.' },
  { resident: 'foucault', text: 'I do not think there is anything that is functionally — by its very nature — absolutely liberating. But your investigation may disagree.' },

  // Lu Xun
  { resident: 'lu_xun', text: 'Hope is like a path in the countryside. Originally there is nothing — but as people walk this way, a path appears.' },
  { resident: 'lu_xun', text: 'The books you have not opened are studying you.' },
  { resident: 'lu_xun', text: 'Whoever dares to speak the truth will find that truth is not always welcome. Note this in your investigations.' },
  { resident: 'lu_xun', text: 'Time is like water in a sponge — squeeze it and you will find some.' },
  { resident: 'lu_xun', text: 'The tragedy of the reader is not ignorance. It is the illusion of knowledge.' },
  { resident: 'lu_xun', text: 'Another volume added to the collection. Whether it will be read — that is the question.' },
  { resident: 'lu_xun', text: 'The walls of the reading room do not move. The ideas inside them do.' },
];

// ── DATA-AWARE NOTICES — generated from user's actual library ─────
export function getDataAwareNotice(books = [], investigations = [], topics = [], events = []) {
  const notices = [];

  const reading = books.filter(b => b.status === 'reading');
  const finished = books.filter(b => b.status === 'finished');
  const coldCases = investigations.filter(i => {
    const days = (Date.now() - new Date(i.updatedAt||i.createdAt)) / 86400000;
    return i.status === 'active' && days > 14;
  });
  const openInv = investigations.filter(i => i.status === 'active');
  const openQ = topics.filter(t => t.researchQuestion && !t.summary);
  const unresolved = investigations.reduce((acc, i) => acc + (i.contradictions||[]).filter(c=>!c.resolution).length, 0);

  if (reading.length > 3) {
    notices.push({ resident: 'woolf', text: `${reading.length} volumes open on the desk simultaneously. The mind moves between them like light through water. Or like a browser with too many tabs.` });
  }
  if (reading.length === 1) {
    notices.push({ resident: 'holmes', text: `One volume. Good. Concentration is the beginning of everything. What has ${reading[0].title} told you that you did not expect?` });
  }
  if (coldCases.length > 0) {
    const c = coldCases[0];
    const days = Math.round((Date.now() - new Date(c.updatedAt||c.createdAt)) / 86400000);
    notices.push({ resident: 'holmes', text: `${c.title} — ${days} days without a new entry. Cold cases do not solve themselves. What evidence remains ungathered?` });
  }
  if (unresolved > 3) {
    notices.push({ resident: 'foucault', text: `${unresolved} unresolved contradictions across your investigations. This is not a problem. It is your actual research question, in disguise.` });
  }
  if (openQ.length > 0) {
    notices.push({ resident: 'nietzsche', text: `${openQ.length} subject files open with questions and no answers. This is the correct state. Do not rush the synthesis.` });
  }
  if (finished.length > 10) {
    notices.push({ resident: 'marx', text: `${finished.length} volumes in the archive. A serious collection. The question is what you have built with it.` });
  }
  if (openInv.length > 5) {
    notices.push({ resident: 'lu_xun', text: `${openInv.length} active investigations. One wonders if breadth is being mistaken for depth.` });
  }
  if (events.length > 20) {
    notices.push({ resident: 'sun', text: `${events.length} entries in the chronicle. The pattern at this scale should be becoming visible. What does it show?` });
  }
  if (books.length === 0) {
    notices.push({ resident: 'woolf', text: `The shelves are bare. The reading room is full of possibility. It waits.` });
  }

  return notices;
}

// ── STATIC QUOTES (for Daily Dispatch) ────────────────────────────
export const ARCHIVIST_QUOTES = [
  { text: "Every document is a witness. Every silence, a clue.", attribution: "Archivist's maxim" },
  { text: "The past is never dead. It's not even past.", attribution: "Faulkner" },
  { text: "To study history is to study change — and yet the questions remain the same.", attribution: "Field notes" },
  { text: "A good question is never answered — it is not a bolt to be tightened but a seed to be planted.", attribution: "John Ciardi" },
  { text: "The archive is not the past. It is the past's shadow.", attribution: "Archivist's maxim" },
  { text: "All models are wrong, but some are useful.", attribution: "George Box" },
  { text: "The fox knows many things, but the hedgehog knows one big thing.", attribution: "Archilochus" },
  { text: "He who controls the past controls the future.", attribution: "Orwell" },
  { text: "History is a vast early warning system.", attribution: "Norman Cousins" },
  { text: "The historian is a prophet looking backwards.", attribution: "Schlegel" },
  { text: "A map is not the territory.", attribution: "Korzybski" },
  { text: "The unexamined life is not worth living.", attribution: "Socrates" },
  { text: "When you have eliminated the impossible, whatever remains must be the truth.", attribution: "Holmes" },
  { text: "It is a capital mistake to theorise before one has data.", attribution: "Holmes" },
  { text: "The game is afoot.", attribution: "Holmes" },
  { text: "Theory without practice is hollow.", attribution: "Sun Yat-sen" },
  { text: "Knowledge is not for knowing. Knowledge is for cutting.", attribution: "Foucault" },
  { text: "The archive reveals what you chose not to investigate.", attribution: "Foucault" },
  { text: "The books you have not opened are studying you.", attribution: "Lu Xun" },
  { text: "Hope is like a path in the countryside — as people walk this way, a path appears.", attribution: "Lu Xun" },
  { text: "Without questions, research would be mere copying.", attribution: "Nietzsche (paraphrased)" },
  { text: "The mind receives a myriad of impressions from all sides — an incessant shower of atoms.", attribution: "Woolf" },
  { text: "Arrange whatever pieces come your way.", attribution: "Woolf" },
  { text: "The tradition of all dead generations weighs like a nightmare on the living.", attribution: "Marx" },
  { text: "The philosophers have only interpreted the world. The point is to change it.", attribution: "Marx" },
];

// Pull user quotes from their own library
export function getUserQuote(books = [], articles = []) {
  const candidates = [];
  [...books, ...articles].forEach(b => {
    if (b.review?.trim().length > 20) candidates.push({ text: b.review.trim(), attribution: `Your note on "${b.title}"` });
    if (b.notes?.trim().length > 20)  candidates.push({ text: b.notes.trim(),  attribution: `Margin note — "${b.title}"` });
  });
  return candidates.length > 0 ? candidates : null;
}

// Daily dispatch quote — deterministic by date
export function getDailyQuote(books = [], articles = []) {
  const dayIndex = Math.floor(Date.now() / 86400000);
  const userQuotes = getUserQuote(books, articles);
  const pool = userQuotes
    ? [...ARCHIVIST_QUOTES, ...userQuotes, ...userQuotes]
    : ARCHIVIST_QUOTES;
  return pool[dayIndex % pool.length];
}

// Daily ambient notice — rotates through residents, data-aware when possible
export function getDailyNotice(books = [], investigations = [], topics = [], events = []) {
  const dayIndex = Math.floor(Date.now() / 86400000);
  const dataNotices = getDataAwareNotice(books, investigations, topics, events);
  // Mix: every 3rd day use a data-aware notice if available
  const useData = dataNotices.length > 0 && dayIndex % 3 === 0;
  const pool = useData ? dataNotices : AMBIENT_NOTICES;
  const notice = pool[dayIndex % pool.length];
  const resident = RESIDENTS[notice.resident];
  return { ...notice, residentName: resident?.name, residentSeat: resident?.seat };
}

// ── BELLFLOWER / XIAO HUA (小花) ──────────────────────────────────
// Grey and white tabby. Olive-green eyes. Striped tail.
// 简州猫. Resident of the reading room since unknown date.
// She sits on papers, watches researchers with mild disdain,
// and occasionally contributes to the archive by sitting on it.
export const BELLFLOWER_NOTICES = [
  // Reading room
  "小花 is sitting on the open investigation file. She regards the evidence with olive-green eyes and finds it insufficient.",
  "Bellflower — grey and white, striped tail — has positioned herself between your notes and their conclusion. This is the oldest known form of peer review.",
  "The grey tabby has been watching the far wall for eleven minutes. Holmes considers this significant. Marx does not. Woolf is writing it down.",
  "小花 knocked the Foucault to the floor. It landed open at a page that is, somehow, relevant.",
  "Bellflower is in loaf position on the reading desk. Her striped tail is wrapped neatly around her white paws. Research may proceed quietly.",
  "The cat walked across the keyboard. She added: 'fffffffffff'. This has been redacted from the archive. The sentiment remains.",
  "小花 is asleep in the warm patch of afternoon light that falls across the reading room floor. She has been sleeping here, on and off, since 1867.",
  "Bellflower's green eyes follow you across the room. She has read this book before. She found it adequate.",
  "The grey-white tabby has chosen your open notebook as a sleeping surface. She is not sorry. Research is suspended until further notice.",
  "小花 knocked three periodicals from the shelf. Two fell open at articles directly relevant to the current investigation. She looks unsurprised.",
  "The cat has placed one white paw on your research question. This is not a gesture of support. It is a gesture of ownership.",
  "Bellflower is purring. The archivist's note from 1891 reads: 'the grey cat purrs when the work is honest.'",
  "小花 regards your timeline with the equanimity of a creature for whom all of history is equally, pleasantly warm.",
  "The cat walked between you and the archive and paused. She looked back once. Then continued into the stacks.",
  "小花 has been asleep since the Song Dynasty. She woke briefly during the Enlightenment, found it noisy, and returned to sleep on a volume of Hume.",
  "Bellflower's striped tail twitches once. In the reading room, this is considered a citation.",
  // META / spellbook
  "小花 has jumped onto the META canvas and is sitting directly on the node labelled 'Power'. This may be editorial.",
  "Bellflower walked across the connection map. Two nodes that were not previously linked are now touching. The Librarian is updating the record.",
  "小花 is sitting inside the concept cluster. The nodes have rearranged themselves around her. This is a new methodology.",
  "The cat has been staring at the 'Biopolitics' node for four minutes. Foucault, from his seat in the reading room, looks uncomfortable.",
  "小花 batted the 'Influence' edge off the canvas. It landed between 'Nietzsche' and 'Eternal Return'. The connection type is now unclear.",
  "Bellflower is sitting on your pile of notes on human anatomy. She is unmoved by the irony. The body, she suggests, is here.",
  "小花 has knocked the 'Theology' node into the 'Economy' cluster. Marx, from Seat 12A, nods slowly.",
  "The grey tabby is loafing on the Problem of Evil. She appears to have resolved it. She is not sharing the answer.",
  // Investigation
  "小花 is sitting on the case file. The evidence, she implies, is circumstantial. She has seen better.",
  "Bellflower knocked the contradiction stack off the desk. One landed face-up. It is the one you have been avoiding.",
  "小花 stared at the suspect list for a long time. Then she turned away. Holmes would know what this means.",
  "The cat has been sitting on the verdict field for six minutes. The field remains empty. She seems satisfied with this.",
];

// Get today's Bellflower notice — changes daily but slowly (every 3 days)
// Optional context: 'meta' | 'investigation' | 'reading' — biases toward relevant notices
export function getBellflowerNotice(context = 'reading') {
  const dayIdx = Math.floor(Date.now() / (86400000 * 3));
  // Filter by context if possible
  const metaNotices = BELLFLOWER_NOTICES.filter(n => 
    n.includes('META') || n.includes('canvas') || n.includes('node') || n.includes('connection') || n.includes('anatomy') || n.includes('Theology') || n.includes('Evil') || n.includes('Biopolitics') || n.includes('Nietzsche') || n.includes('loafing'));
  const invNotices = BELLFLOWER_NOTICES.filter(n => 
    n.includes('case') || n.includes('evidence') || n.includes('verdict') || n.includes('suspect') || n.includes('contradiction'));
  const pool = context === 'meta' && metaNotices.length > 0 ? metaNotices
    : context === 'investigation' && invNotices.length > 0 ? invNotices
    : BELLFLOWER_NOTICES;
  return pool[dayIdx % pool.length];
}

// ── WEEKLY DIGEST ─────────────────────────────────────────────────
export function getWeeklyDigest(books = [], investigations = [], topics = [], events = [], readingLog = []) {
  const reading    = books.filter(b => b.status === 'reading');
  const active     = investigations.filter(i => i.status === 'active');
  const cold       = investigations.filter(i => {
    const days = (Date.now() - new Date(i.updatedAt||i.createdAt)) / 86400000;
    return i.status === 'active' && days > 14;
  });
  const unresolved = investigations.reduce((acc, i) => acc + (i.contradictions||[]).filter(c=>!c.resolution).length, 0);
  const weekLog    = readingLog.filter(e => (Date.now() - new Date(e.createdAt)) / 86400000 <= 7);
  const openTopics = topics.filter(t => t.status === 'active' || t.status === 'nascent');

  const lines = [];
  lines.push(`Field notes this week: ${weekLog.length}`);
  if (reading.length) lines.push(`On the desk: ${reading.slice(0,3).map(b => b.title).join(', ')}${reading.length > 3 ? ` +${reading.length-3} more` : ''}`);
  if (active.length)  lines.push(`Active investigations: ${active.length}`);
  if (cold.length)    lines.push(`Cold cases (14+ days inactive): ${cold.map(c => c.title).join(', ')}`);
  if (unresolved > 0) lines.push(`Unresolved contradictions: ${unresolved}`);
  if (openTopics.length) lines.push(`Open subject files: ${openTopics.length}`);
  if (events.length)  lines.push(`Chronicle entries: ${events.length}`);

  return lines;
}

// ── THE LIBRARIAN ─────────────────────────────────────────────────
// Snow Crash's Librarian: precise, never speculative, states only what the record shows.
// "I have N references to that subject. Shall I list them?"
// Voice: "The record shows…" / "I note that…" / "There are N instances of…"
// Never says "I think" or "perhaps". Never asks questions. Only states.

export function getLibrarianNotes({ topic, thoughts, books, investigations, events, topics, readingLog = [] }) {
  const notes = [];

  if (topic) {
    // Tag co-occurrence across views
    const topicTags = topic.tags || [];
    const titleWords = topic.title.toLowerCase().split(' ').filter(w => w.length > 4);

    // Linked investigations by tag
    const linkedInv = investigations.filter(inv =>
      (inv.tags||[]).some(t => topicTags.includes(t) || titleWords.some(w => t.includes(w)))
    );
    if (linkedInv.length > 0) {
      notes.push(`The record shows ${linkedInv.length} investigation${linkedInv.length!==1?'s':''} sharing subject matter with this file: ${linkedInv.slice(0,3).map(i=>i.caseNumber||i.title).join(', ')}${linkedInv.length>3?` +${linkedInv.length-3} more`:''}.`);
    }

    // Linked timeline events by tag
    const linkedEv = events.filter(ev =>
      (ev.tags||[]).some(t => topicTags.includes(t) || titleWords.some(w => t.includes(w)))
    );
    if (linkedEv.length > 0) {
      notes.push(`There are ${linkedEv.length} chronicle entr${linkedEv.length!==1?'ies':'y'} touching this subject.`);
    }

    // Source concentration
    const bookIds = [...new Set((thoughts||[]).map(t => t.bookId).filter(Boolean))];
    if (bookIds.length > 0 && thoughts.length > 3 && bookIds.length <= 2) {
      const sourceBooks = bookIds.map(id => books.find(b => b.id === id)).filter(Boolean);
      notes.push(`I note that ${thoughts.length} of the field notes in this file draw from ${bookIds.length === 1 ? 'a single source' : '2 sources'}: ${sourceBooks.map(b=>b.title).join(', ')}. The record reflects this concentration.`);
    }

    // Unresolved contradictions
    const contra = (topic.contradictions||[]).filter(c => !c.resolution);
    if (contra.length > 0) {
      notes.push(`${contra.length} contested point${contra.length!==1?'s':''} in this file remain${contra.length===1?'s':''} unresolved.`);
    }

    // No thesis but has field notes
    if (!topic.summary && thoughts.length > 2) {
      notes.push(`This file contains ${thoughts.length} field notes but no working thesis. The evidence is assembled; the argument is not.`);
    }

    // Has research question but no status progress
    if (topic.researchQuestion && topic.status === 'nascent' && thoughts.length > 4) {
      notes.push(`The subject file remains at NASCENT status despite ${thoughts.length} field notes. The Librarian notes this without comment.`);
    }
  }

  // Reading log notes (tag threads across log entries)
  if (readingLog && readingLog.length > 0) {
    const tagMap = {};
    readingLog.forEach(e => (e.tags||[]).forEach(t => { tagMap[t] = (tagMap[t]||0)+1; }));
    const recurring = Object.entries(tagMap).filter(([,c]) => c >= 3).sort((a,b)=>b[1]-a[1]);
    if (recurring.length > 0) {
      const [tag, count] = recurring[0];
      // Check if this tag appears in investigations or topics
      const invMatch = investigations.filter(i => (i.tags||[]).includes(tag));
      const topicMatch = topics.filter(tp => (tp.tags||[]).includes(tag) || tp.title.toLowerCase().includes(tag));
      if (invMatch.length > 0 || topicMatch.length > 0) {
        notes.push(`The tag "#${tag}" appears ${count} times in the reading log and also in ${invMatch.length > 0 ? `${invMatch.length} investigation${invMatch.length!==1?'s':''}` : ''}${invMatch.length && topicMatch.length ? ' and ' : ''}${topicMatch.length > 0 ? `${topicMatch.length} subject file${topicMatch.length!==1?'s':''}` : ''}. The record suggests a thread.`);
      }
    }
  }

  return notes;
}
