require('dotenv').config();
const path = require('path');
module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  dbUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/whatsapp_bulk',
  sessionDir: process.env.WHATSAPP_SESSION_DIR || path.join(__dirname, '..', '..', 'sessions'),
  whatsappApiUrl: process.env.WHATSAPP_API_URL || '',
  whatsappApiToken: process.env.WHATSAPP_API_TOKEN || ''
};
