const express = require('express');
const router = express.Router();
router.use('/auth', require('./auth'));
router.use('/contacts', require('./contacts'));
router.use('/campaigns', require('./campaigns'));
router.use('/attachments', require('./attachments'));
router.use('/webhook', require('./webhook'));
router.use('/logs', require('./logs'));
module.exports = router;
