require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { port } = require('./config/config');
const routes = require('./routes');
const { sequelize, User } = require('./models');
const puppeteerSender = require('./services/puppeteerSender');
const { startScheduler } = require('./services/scheduler');
let lastQr = null;
async function startServer() {
  const app = express();
  app.use(bodyParser.json());
  app.use('/api', routes);
  app.use('/uploads', express.static('uploads'));
  await sequelize.sync({ alter: true });
  const count = await User.count();
  if (count === 0) {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', passwordHash: hash });
    console.log('Created default user: admin / admin123');
  }
  puppeteerSender.initClient(qr => { lastQr = qr; });
  startScheduler();
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => { console.log(`Server listening on ${port}`); resolve(server); });
    server.on('error', reject);
  });
}
function isReady() { return puppeteerSender.isReady(); }
function getLastQr() { return lastQr; }
module.exports = { startServer, isReady, getLastQr };
