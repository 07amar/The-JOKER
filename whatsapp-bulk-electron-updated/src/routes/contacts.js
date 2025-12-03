const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const csvParse = require('csv-parse');
const upload = multer({ dest: './uploads' });
const { Contact } = require('../models');
const { authMiddleware } = require('../utils/auth');
router.post('/import', authMiddleware, upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'file required' });
  const records = [];
  fs.createReadStream(file.path).pipe(csvParse({ columns: true, skip_empty_lines: true, trim: true })).on('data', row => records.push(row)).on('end', async () => {
    const created = [];
    for (const r of records) { if (!r.number) continue; const c = await Contact.create({ name: r.name || null, number: r.number, var1: r.var1 || null }); created.push(c); }
    res.json({ imported: created.length });
  }).on('error', err => res.status(500).json({ error: err.message }));
});
router.get('/', authMiddleware, async (req, res) => { const contacts = await Contact.findAll({ limit: 1000 }); res.json(contacts); });
router.post('/', authMiddleware, async (req, res) => { const { name, number, var1 } = req.body; const contact = await Contact.create({ name, number, var1 }); res.json(contact); });
module.exports = router;
