const express = require('express');
const router = express.Router();
const { Log } = require('../models');
const { authMiddleware } = require('../utils/auth');
router.get('/', authMiddleware, async (req, res) => {
  const logs = await Log.findAll({ order: [['id', 'DESC']], limit: 500 });
  res.json(logs);
});
module.exports = router;
