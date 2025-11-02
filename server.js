// server.js
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// multer in-memory storage (no disk files)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// default keywords (extend as needed)
const DEFAULT_KEYWORDS = [
  'javascript','react','node','express','python','machine learning','data','sql','aws','docker','kubernetes','git','html','css'
];

function textFromBuffer(fileBuffer, mimeType, originalName) {
  const lower = (originalName || '').toLowerCase();
  if (mimeType === 'application/pdf' || lower.endsWith('.pdf')) {
    return pdfParse(fileBuffer).then(data => data.text);
  }
  // fallback assume text file
  return Promise.resolve(fileBuffer.toString('utf8'));
}

function simpleATSEvaluator(text, keywords = DEFAULT_KEYWORDS) {
  const normalized = (text || '').toLowerCase();

  let matches = [];
  for (const kw of keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('\\b' + escaped + '\\b', 'gi');
    const m = normalized.match(re);
    const count = m ? m.length : 0;
    if (count > 0) matches.push({ keyword: kw, count });
  }

  const uniqueFound = matches.length;
  const totalMatches = matches.reduce((s, x) => s + x.count, 0);

  const kwFactor = Math.min(1, uniqueFound / Math.max(1, keywords.length));
  const mentionFactor = Math.min(1, totalMatches / Math.max(1, keywords.length * 2));
  const score = Math.round((kwFactor * 0.5 + mentionFactor * 0.5) * 100);

  const snippets = matches.map(m => {
    const idx = normalized.indexOf(m.keyword);
    const start = Math.max(0, idx - 40);
    const snippet = text.substring(start, Math.min(text.length, idx + 120)).replace(/\n+/g, ' ');
    return { keyword: m.keyword, count: m.count, snippet };
  });

  return { score, uniqueFound, totalMatches, matches: snippets };
}

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: 'No file uploaded' });

    const buffer = req.file.buffer;
    const mimeType = req.file.mimetype || '';
    const originalName = req.file.originalname || 'file.txt';

    const text = await textFromBuffer(buffer, mimeType, originalName);

    if (!text || text.trim().length === 0) {
      return res.status(200).json({ ok: false, error: 'Unable to extract text from file', text: '' });
    }

    const extraKeywords = req.body.keywords ? (() => {
      try { return JSON.parse(req.body.keywords); } catch { return []; }
    })() : [];

    const keywords = Array.isArray(extraKeywords) && extraKeywords.length ? extraKeywords.concat(DEFAULT_KEYWORDS) : DEFAULT_KEYWORDS;

    const result = simpleATSEvaluator(text, keywords);
    res.json({ ok: true, result, text: text.slice(0, 100000) }); // text included for debugging (remove in production)
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ ok: false, error: 'Server error during analysis', details: err.message });
  }
});

// fallback: serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
