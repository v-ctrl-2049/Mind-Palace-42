// ── Obsidian Export ───────────────────────────────────────────────
// Reads all Mind Palace JSON data and writes markdown files
// into an Obsidian vault.

const fs   = require('fs');
const path = require('path');

// ── Helpers ───────────────────────────────────────────────────────
function safeName(str) {
  return (str || 'Untitled').replace(/[/\\:*?"<>|]/g, '-').trim();
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function readData(dataDir, key) {
  try {
    const file = path.join(dataDir, `${key}.json`);
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return []; }
}

// ── Formatters ────────────────────────────────────────────────────

function bookToMd(book) {
  const tags = (book.tags || []).map(t => `  - ${t}`).join('\n');
  return `---
type: book
title: "${(book.title || '').replace(/"/g, '\\"')}"
author: "${book.author || ''}"
year: ${book.year || 'null'}
status: ${book.status || 'want-next'}
rating: ${book.rating || 'null'}
color: "${book.color || '#7a6a52'}"
mp42_id: ${book.id}
last_synced: ${new Date().toISOString()}
---

# ${book.title || 'Untitled'}
${book.author ? `**${book.author}**` : ''}${book.year ? ` · ${book.year}` : ''}${book.translator ? ` · tr. ${book.translator}` : ''}

${book.review ? `## My review\n${book.review}\n` : ''}
${book.notes ? `## Notes\n${book.notes}\n` : ''}
${book.summary ? `## Summary\n${book.summary}\n` : ''}
`;
}

function articleToMd(article) {
  return `---
type: article
title: "${(article.title || '').replace(/"/g, '\\"')}"
author: "${article.author || ''}"
year: ${article.year || 'null'}
journal: "${article.journal || ''}"
status: ${article.status || 'want-next'}
mp42_id: ${article.id}
last_synced: ${new Date().toISOString()}
---

# ${article.title || 'Untitled'}
${article.author ? `**${article.author}**` : ''}${article.journal ? ` · *${article.journal}*` : ''}${article.year ? ` · ${article.year}` : ''}

${article.abstract ? `## Abstract\n${article.abstract}\n` : ''}
${article.notes ? `## Notes\n${article.notes}\n` : ''}
`;
}

function topicToMd(topic, anatomy = []) {
  const quotes = (topic.quotes || []).map(q => `
> "${q.text}"
> — ${q.attribution}${q.page ? `, ${q.page}` : ''}
> *${q.type} — ${q.gloss || ''}*
`).join('\n');

  const contradictions = (topic.contradictions || []).map(c =>
    `- **${c.sourceA}** vs **${c.sourceB}**: ${c.claim}${c.resolved ? ' *(resolved)*' : ''}`
  ).join('\n');

  const linkedAnatomy = anatomy
    .filter(a => (a.topicIds || []).includes(topic.id))
    .map(a => `- [[${safeName(a.title)}]] (${a.type})`)
    .join('\n');

  return `---
type: topic
title: "${(topic.title || '').replace(/"/g, '\\"')}"
domains: [${(topic.domains || []).map(d => `"${d}"`).join(', ')}]
tags: [${(topic.tags || []).map(t => `"${t}"`).join(', ')}]
status: ${topic.status || 'nascent'}
mp42_id: ${topic.id}
last_synced: ${new Date().toISOString()}
---

# ${topic.title || 'Untitled'}

${topic.summary ? `## Summary\n${topic.summary}\n` : ''}

${quotes ? `## Evidence\n${quotes}\n` : ''}

${contradictions ? `## Contested\n${contradictions}\n` : ''}

${topic.essay ? `## The Analyst\n${topic.essay}\n` : ''}

${linkedAnatomy ? `## Teatro Anatomico\n${linkedAnatomy}\n` : ''}
`;
}

function anatomyToMd(entry) {
  return `---
type: anatomy_${entry.type || 'concept'}
title: "${(entry.title || '').replace(/"/g, '\\"')}"
definition: "${(entry.definition || '').replace(/"/g, '\\"')}"
domains: [${(entry.domains || []).map(d => `"${d}"`).join(', ')}]
tags: [${(entry.tags || []).map(t => `"${t}"`).join(', ')}]
mp42_id: ${entry.id}
last_synced: ${new Date().toISOString()}
---

# ${entry.title || 'Untitled'}
*${entry.definition || ''}*

${entry.keyQuote ? `> "${entry.keyQuote}"\n> — ${entry.keyQuoteAttribution || ''}\n` : ''}

${entry.body ? `## Corpus\n${entry.body}\n` : ''}

${(entry.relatedIds || []).length > 0 ? `## Echoes\n${entry.relatedIds.map(id => `- [[${id}]]`).join('\n')}\n` : ''}
`;
}

function investigationToMd(inv) {
  return `---
type: investigation
title: "${(inv.title || '').replace(/"/g, '\\"')}"
status: ${inv.status || 'active'}
case_number: "${inv.caseNumber || ''}"
mp42_id: ${inv.id}
last_synced: ${new Date().toISOString()}
---

# ${inv.title || 'Untitled'}
**Case** ${inv.caseNumber || ''} · ${inv.status?.toUpperCase() || 'ACTIVE'}

${inv.hypothesis ? `## Hypothesis\n${inv.hypothesis}\n` : ''}
${inv.summary ? `## Summary\n${inv.summary}\n` : ''}
${inv.analysis ? `## Analysis\n${inv.analysis}\n` : ''}
${inv.verdict ? `## Verdict\n${inv.verdict}\n` : ''}
`;
}

function eventToMd(event, books = []) {
  const linkedBooks = books
    .filter(b => (event.bookIds || []).includes(b.id))
    .map(b => `- [[${safeName(b.title)}]]`)
    .join('\n');

  return `---
type: event
title: "${(event.title || '').replace(/"/g, '\\"')}"
date: "${event.dateRaw || ''}"
region: ${event.region || ''}
event_type: ${event.type || ''}
tags: [${(event.tags || []).map(t => `"${t}"`).join(', ')}]
mp42_id: ${event.id}
last_synced: ${new Date().toISOString()}
---

# ${event.title || 'Untitled'}
**${event.dateRaw || ''}** · ${event.region || ''} · ${event.type || ''}

${event.quote ? `> "${event.quote}"\n` : ''}
${event.note ? `## Notes\n${event.note}\n` : ''}
${linkedBooks ? `## Sources\n${linkedBooks}\n` : ''}
`;
}

function vaultEntryToMd(entry, books = []) {
  const linkedBooks = books
    .filter(b => (entry.bookIds || []).includes(b.id))
    .map(b => `- [[${safeName(b.title)}]]`)
    .join('\n');

  return `---
type: primary_source
media_type: ${entry.mediaType || 'text'}
title: "${(entry.title || '').replace(/"/g, '\\"')}"
date: "${entry.date || ''}"
provenance: "${entry.provenance || ''}"
archival_location: "${entry.archivalLocation || ''}"
tags: [${(entry.tags || []).map(t => `"${t}"`).join(', ')}]
mp42_id: ${entry.id}
last_synced: ${new Date().toISOString()}
---

# ${entry.title || 'Untitled'}
**${entry.date || ''}** · ${entry.provenance || ''} · *${entry.mediaType || 'text'}*

${entry.archivalLocation ? `**Location:** ${entry.archivalLocation}\n` : ''}

${entry.transcription ? `## Transcription\n${entry.transcription}\n` : ''}
${entry.significance ? `## Significance\n${entry.significance}\n` : ''}
${linkedBooks ? `## Source Books\n${linkedBooks}\n` : ''}
`;
}

// ── Daily note template ───────────────────────────────────────────
function dailyNoteTemplate() {
  const today = new Date().toISOString().split('T')[0];
  return `---
type: daily
date: ${today}
observatory: []
---

## Today I noticed


## Reading


## Thinking about


## Questions

`;
}

// ── Main export function ──────────────────────────────────────────
function exportToObsidian(dataDir, vaultPath) {
  const results = { written: [], errors: [] };

  try {
    // Read all data
    const books         = readData(dataDir, 'rm_books');
    const articles      = readData(dataDir, 'rm_articles');
    const topics        = readData(dataDir, 'rm_topics');
    const anatomy       = readData(dataDir, 'rm_anatomy');
    const investigations = readData(dataDir, 'rm_investigations');
    const events        = readData(dataDir, 'rm_events');
    const vault         = readData(dataDir, 'rm_vault');

    // ── Library ───────────────────────────────────────────────────
    books.forEach(book => {
      try {
        const p = path.join(vaultPath, 'Library', 'Books', `${safeName(book.title)}.md`);
        writeFile(p, bookToMd(book));
        results.written.push(p);
      } catch(e) { results.errors.push(`book:${book.title}: ${e.message}`); }
    });

    articles.forEach(article => {
      try {
        const p = path.join(vaultPath, 'Library', 'Articles', `${safeName(article.title)}.md`);
        writeFile(p, articleToMd(article));
        results.written.push(p);
      } catch(e) { results.errors.push(`article:${article.title}: ${e.message}`); }
    });

    // ── Mind Palace ───────────────────────────────────────────────
    topics.forEach(topic => {
      try {
        const p = path.join(vaultPath, 'Mind Palace', 'Topics', `${safeName(topic.title)}.md`);
        writeFile(p, topicToMd(topic, anatomy));
        results.written.push(p);
      } catch(e) { results.errors.push(`topic:${topic.title}: ${e.message}`); }
    });

    anatomy.forEach(entry => {
      try {
        const p = path.join(vaultPath, 'Mind Palace', 'Teatro Anatomico', `${safeName(entry.title)}.md`);
        writeFile(p, anatomyToMd(entry));
        results.written.push(p);
      } catch(e) { results.errors.push(`anatomy:${entry.title}: ${e.message}`); }
    });

    investigations.forEach(inv => {
      try {
        const p = path.join(vaultPath, 'Mind Palace', 'Investigations', `${safeName(inv.title)}.md`);
        writeFile(p, investigationToMd(inv));
        results.written.push(p);
      } catch(e) { results.errors.push(`inv:${inv.title}: ${e.message}`); }
    });

    events.forEach(event => {
      try {
        const p = path.join(vaultPath, 'Mind Palace', 'Timeline', `${safeName(event.title)}.md`);
        writeFile(p, eventToMd(event, books));
        results.written.push(p);
      } catch(e) { results.errors.push(`event:${event.title}: ${e.message}`); }
    });

    vault.forEach(entry => {
      try {
        const p = path.join(vaultPath, 'Mind Palace', 'Vault', `${safeName(entry.title)}.md`);
        writeFile(p, vaultEntryToMd(entry, books));
        results.written.push(p);
      } catch(e) { results.errors.push(`vault:${entry.title}: ${e.message}`); }
    });

    // ── Field Notes templates ──────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const dailyPath = path.join(vaultPath, 'Field Notes', 'Daily', `${today}.md`);
    if (!fs.existsSync(dailyPath)) {
      writeFile(dailyPath, dailyNoteTemplate());
      results.written.push(dailyPath);
    }

    // ── Index ─────────────────────────────────────────────────────
    const indexContent = `# Mind Palace 42 — Index
*Last exported: ${new Date().toLocaleString()}*

## Library
- ${books.length} books
- ${articles.length} articles

## Mind Palace
- ${topics.length} topics in The Stacks
- ${anatomy.length} entries in Teatro Anatomico
- ${investigations.length} investigations
- ${events.length} timeline events
- ${vault.length} primary sources in The Vault

## Field Notes
Daily notes live in \`Field Notes/Daily/\`
Use the template to capture observations for the Observatory.
`;
    writeFile(path.join(vaultPath, '_index.md'), indexContent);
    results.written.push(path.join(vaultPath, '_index.md'));

  } catch(e) {
    results.errors.push(`Fatal: ${e.message}`);
  }

  return results;
}

module.exports = { exportToObsidian };
