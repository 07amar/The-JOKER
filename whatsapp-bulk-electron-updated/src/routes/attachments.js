const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: './uploads' });
const { Attachment } = require('../models');
const { authMiddleware } = require('../utils/auth');
router.post('/', authMiddleware, upload.single('file'), async (req, res) => { const file = req.file; if (!file) return res.status(400).json({ error: 'file required' }); const a = await Attachment.create({ filename: file.filename, originalname: file.originalname, mime: file.mimetype, size: file.size }); res.json(a); });
module.exports = router;
