const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { sessionDir } = require('../config/config');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
let client = null;
let ready = false;
function initClient(onQr) {
  if (client) return client;
  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bulk-sender', dataPath: sessionDir }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] }
  });
  client.on('qr', (qr) => { qrcode.generate(qr, { small: true }); if (onQr) onQr(qr); console.log('[WA-QR] QR generated'); });
  client.on('ready', () => { ready = true; console.log('[WA] Client ready'); });
  client.on('auth_failure', (msg) => { console.error('[WA] Auth failure', msg); });
  client.on('disconnected', (reason) => { ready = false; console.log('[WA] Disconnected', reason); });
  client.initialize();
  return client;
}
async function sendText(toNumber, body) {
  if (!client) throw new Error('Client not initialized');
  if (!ready) throw new Error('Client not ready');
  const id = toNumber.includes('@') ? toNumber : `${toNumber}@c.us`;
  const msg = await client.sendMessage(id, body);
  return msg;
}
module.exports = { initClient, sendText, getClient: () => client, isReady: () => ready };
