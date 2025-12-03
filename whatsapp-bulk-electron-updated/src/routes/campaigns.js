const express = require('express');
const router = express.Router();
const { Campaign, Contact, CampaignContact, Attachment } = require('../models');
const { authMiddleware } = require('../utils/auth');
router.post('/', authMiddleware, async (req, res) => {
  const { name, messageTemplate, scheduleAt, contactIds = [], attachmentIds = [], provider, maxRetries, retryDelays } = req.body;
  const c = await Campaign.create({ name, messageTemplate, scheduleAt: scheduleAt ? new Date(scheduleAt) : null, provider: provider || 'puppeteer', status: 'scheduled', UserId: req.userId, maxRetries: maxRetries || 3, retryDelays: retryDelays || [60,300,900] });
  if (contactIds.length) {
    const contacts = await Contact.findAll({ where: { id: contactIds } });
    await c.addContacts(contacts);
    for (const contact of contacts) { await CampaignContact.create({ CampaignId: c.id, ContactId: contact.id, status: 'pending' }); }
  }
  if (attachmentIds.length) {
    for (const aid of attachmentIds) { const a = await Attachment.findByPk(aid); if (a) await c.addAttachment(a); }
  }
  res.json({ campaignId: c.id });
});
router.get('/', authMiddleware, async (req, res) => { const list = await Campaign.findAll({ order: [['id', 'DESC']] }); res.json(list); });
router.get('/:id', authMiddleware, async (req, res) => { const c = await Campaign.findByPk(req.params.id); if (!c) return res.status(404).json({ error: 'not_found' }); const contacts = await c.getContacts(); res.json({ campaign: c, contacts }); });
module.exports = router;
