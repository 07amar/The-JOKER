const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Campaign = sequelize.define('Campaign', {
  name: DataTypes.STRING,
  messageTemplate: DataTypes.TEXT,
  scheduleAt: DataTypes.DATE,
  provider: { type: DataTypes.STRING, defaultValue: 'puppeteer' },
  status: { type: DataTypes.STRING, defaultValue: 'draft' },
  retryDelays: { type: DataTypes.JSON, defaultValue: [60,300,900] },
  maxRetries: { type: DataTypes.INTEGER, defaultValue: 3 }
});
module.exports = Campaign;
