const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, error: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    logger.warn(`Bad JWT: ${err.message}`);
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

/** optional enrichment — callers can skip if lean */
async function attachUser(req, res, next) {
  if (!req.userId) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  try {
    const user = await User.findById(req.userId).select('email name role');
    if (!user) return res.status(401).json({ ok: false, error: 'User gone' });
    req.user = user;
    next();
  } catch (err) {
    logger.error(`attachUser failed: ${err.message}`);
    return res.status(500).json({ ok: false, error: 'Something broke' });
  }
}

module.exports = { authenticate, attachUser };
