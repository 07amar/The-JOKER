const axios = require('axios');
const { whatsappApiUrl, whatsappApiToken } = require('../config/config');
const puppeteerSender = require('./puppeteerSender');
async function providerSend({ provider='puppeteer', to, text, attachment }) {
  if (provider === 'whatsapp_api') {
    if (!whatsappApiUrl || !whatsappApiToken) throw new Error('WhatsApp API not configured');
    const payload = { to, type: attachment ? 'media' : 'text', text: { body: text } };
    const res = await axios.post(whatsappApiUrl, payload, { headers: { Authorization: `Bearer ${whatsappApiToken}` } });
    return res.data;
  } else {
    if (!puppeteerSender.isReady()) throw new Error('Puppeteer sender not ready');
    const resp = await puppeteerSender.sendText(to, text);
    return resp;
  }
}
module.exports = { providerSend };
