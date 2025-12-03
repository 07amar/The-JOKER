const cron = require('node-cron');
const { Campaign, CampaignContact, Contact, Attachment, Log } = require('../models');
const { providerSend } = require('./sendProvider');
const interpolate = require('../utils/interpolate');
const { Op } = require('sequelize');
async function appendLog(level, message, meta) { try { await Log.create({ level, message, meta }); } catch (e) { console.error('log failed', e); } }
function nextRetryDelay(campaign, retries) { const delays = (campaign.retryDelays && campaign.retryDelays.length) ? campaign.retryDelays : [60, 300, 900]; return delays[Math.min(retries, delays.length - 1)]; }
function startScheduler() {
  cron.schedule('* * * * *', async () => {
    console.log('[scheduler] tick', new Date().toISOString());
    try {
      const now = new Date();
      const dueCampaigns = await Campaign.findAll({ where: { status: { [Op.in]: ['scheduled','retrying'] }, scheduleAt: { [Op.lte]: now } } });
      for (const c of dueCampaigns) {
        const pending = await CampaignContact.findAll({ where: { CampaignId: c.id, status: { [Op.in]: ['pending', 'retry_scheduled'] } } });
        for (const pc of pending) {
          const contact = await Contact.findByPk(pc.ContactId);
          if (!contact) { pc.status = 'failed'; await pc.save(); continue; }
          const personalized = interpolate(c.messageTemplate || '', contact);
          let attachment = null;
          const atts = await c.getAttachments();
          if (atts && atts.length) attachment = atts[0];
          if (pc.status === 'retry_scheduled') {
            const nextAt = new Date(pc.providerResponse && pc.providerResponse.nextAttemptAt);
            if (nextAt && nextAt > new Date()) continue;
          }
          try {
            const resp = await providerSend({ provider: c.provider, to: contact.number, text: personalized, attachment });
            pc.status = 'sent';
            pc.sentAt = new Date();
            pc.providerResponse = { resp };
            await pc.save();
            await appendLog('info', 'Message sent', { campaignId: c.id, contactId: contact.id, to: contact.number });
          } catch (e) {
            const prev = (pc.providerResponse && pc.providerResponse.retryCount) ? pc.providerResponse.retryCount : 0;
            if (prev < c.maxRetries) {
              const retries = prev + 1;
              const delaySec = nextRetryDelay(c, prev);
              const nextAttempt = new Date(Date.now() + delaySec * 1000);
              pc.status = 'retry_scheduled';
              pc.providerResponse = { error: e.message, retryCount: retries, nextAttemptAt: nextAttempt.toISOString() };
              await pc.save();
              await appendLog('info', 'Scheduled retry', { campaignId: c.id, contactId: contact.id, retry: retries, nextAttempt });
            } else {
              pc.status = 'failed';
              pc.providerResponse = { error: e.message, retryCount: prev };
              await pc.save();
              await appendLog('error', 'Send failed permanently', { campaignId: c.id, contactId: contact.id, err: e.message });
            }
          }
        }
        const remaining = await CampaignContact.count({ where: { CampaignId: c.id, status: { [Op.in]: ['pending', 'retry_scheduled'] } } });
        if (remaining === 0) {
          c.status = 'sent'; await c.save(); await appendLog('info', 'Campaign completed', { campaignId: c.id });
        } else {
          c.status = 'retrying'; await c.save();
        }
      }
    } catch (e) {
      console.error('[scheduler] error', e);
    }
  });
}
module.exports = { startScheduler };
