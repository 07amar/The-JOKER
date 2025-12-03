const express = require('express');
const router = express.Router();
const { initClient, isReady } = require('../services/puppeteerSender');
let lastQr = null;
router.get('/wa/qr', async (req, res) => { initClient(qr => { lastQr = qr; }); res.json({ ready: isReady(), qr: lastQr }); });
router.post('/incoming', async (req, res) => { res.json({ ok: true }); });
module.exports = router;
