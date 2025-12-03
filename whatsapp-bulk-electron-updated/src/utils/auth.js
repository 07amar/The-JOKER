const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing Authorization' });
  const token = header.replace('Bearer ', '');
  try { const payload = jwt.verify(token, jwtSecret); req.userId = payload.id; next(); } catch (e) { return res.status(401).json({ error: 'Invalid token' }); }
}
module.exports = { authMiddleware };
