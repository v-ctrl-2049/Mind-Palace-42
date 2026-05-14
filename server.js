// Mind Palace 42 — Storage Server
const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const { exportToObsidian } = require('./obsidian-export');

const app     = express();
const PORT    = process.env.PORT || 3001;

// Local: ~/Desktop/reading-mind-data/
// Railway: /app/data/ (relative to app root)
const DATA_DIR = process.env.DATA_DIR ||
  (process.env.HOME && fs.existsSync(path.join(process.env.HOME, 'Desktop'))
    ? path.join(process.env.HOME, 'Desktop', 'reading-mind-data')
    : path.join(__dirname, 'data'));

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory: ${DATA_DIR}`);
}

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://mind-palace-42-three.vercel.app',
  ]
}));
app.use(express.json({ limit: '50mb' }));

const safeKey = (key) => /^[a-zA-Z0-9_]+$/.test(key);

app.get('/api/data/:key', (req, res) => {
  const { key } = req.params;
  if (!safeKey(key)) return res.status(400).json({ error: 'Invalid key' });
  const file = path.join(DATA_DIR, `${key}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    res.json({ key, data });
  } catch (err) {
    res.status(500).json({ error: 'Read failed' });
  }
});

app.post('/api/data/:key', (req, res) => {
  const { key } = req.params;
  if (!safeKey(key)) return res.status(400).json({ error: 'Invalid key' });
  const file = path.join(DATA_DIR, `${key}.json`);
  try {
    fs.writeFileSync(file, JSON.stringify(req.body.data, null, 2), 'utf8');
    res.json({ key, ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Write failed' });
  }
});

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

app.get('/health', (req, res) => res.json({ ok: true, dataDir: DATA_DIR }));

app.post('/api/export/obsidian', (req, res) => {
  const vaultPath = req.body.vaultPath || '/Users/vxtl/Documents/MindPalace42';
  try {
    const results = exportToObsidian(DATA_DIR, vaultPath);
    res.json({ ok: true, written: results.written.length, errors: results.errors });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
app.listen(PORT, () => {
  console.log(`Mind Palace storage server running on port ${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});
