const sequelize = require('../db/sequelize');
const User = require('./user');
const Contact = require('./contact');
const Campaign = require('./campaign');
const CampaignContact = require('./campaignContact');
const Attachment = require('./attachment');
const AutoReplyRule = require('./autoReplyRule');
const Log = require('./log');

User.hasMany(Campaign);
Campaign.belongsTo(User);

Campaign.belongsToMany(Contact, { through: CampaignContact });
Contact.belongsToMany(Campaign, { through: CampaignContact });

Campaign.hasMany(Attachment);
Attachment.belongsTo(Campaign);

module.exports = { sequelize, User, Contact, Campaign, CampaignContact, Attachment, AutoReplyRule, Log };
