// Mind Palace 42 — Storage Server
// Express on port 3001
// GET  /api/data/:key  → read JSON from data-dir
// POST /api/data/:key  → write JSON to data-dir
// Data stored in ~/Desktop/reading-mind-data/
// Start: node server.js

const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app      = express();
const PORT     = 3001;
const DATA_DIR = path.join(process.env.HOME, 'Desktop', 'reading-mind-data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory: ${DATA_DIR}`);
}

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '50mb' }));

// Sanitise key — only allow alphanumeric and underscores
const safeKey = (key) => /^[a-zA-Z0-9_]+$/.test(key);

// GET /api/data/:key
app.get('/api/data/:key', (req, res) => {
  const { key } = req.params;
  if (!safeKey(key)) return res.status(400).json({ error: 'Invalid key' });

  const file = path.join(DATA_DIR, `${key}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });

  try {
    const raw  = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(raw);
    res.json({ key, data });
  } catch (err) {
    console.error(`Read error [${key}]:`, err.message);
    res.status(500).json({ error: 'Read failed' });
  }
});

// POST /api/data/:key
app.post('/api/data/:key', (req, res) => {
  const { key } = req.params;
  if (!safeKey(key)) return res.status(400).json({ error: 'Invalid key' });

  const file = path.join(DATA_DIR, `${key}.json`);
  try {
    fs.writeFileSync(file, JSON.stringify(req.body.data, null, 2), 'utf8');
    res.json({ key, ok: true });
  } catch (err) {
    console.error(`Write error [${key}]:`, err.message);
    res.status(500).json({ error: 'Write failed' });
  }
});

// GET /api/keys — list all stored keys (useful for migration / debug)
app.get('/api/keys', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
    res.json({ keys: files });
  } catch (err) {
    res.status(500).json({ error: 'Could not list keys' });
  }
});

// DELETE /api/data/:key — emergency use only
app.delete('/api/data/:key', (req, res) => {
  const { key } = req.params;
  if (!safeKey(key)) return res.status(400).json({ error: 'Invalid key' });

  const file = path.join(DATA_DIR, `${key}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });

  try {
    fs.unlinkSync(file);
    res.json({ key, deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Mind Palace storage server running on http://localhost:${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});
