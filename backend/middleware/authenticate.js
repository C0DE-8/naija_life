const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET);
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const [[revoked]] = await pool.execute('SELECT token_hash FROM revoked_tokens WHERE token_hash = ? AND expires_at > NOW()', [hash]);
    if (revoked) return res.status(401).json({ message: 'Your session has ended. Sign in again.' });
    const [players] = await pool.execute(
      'SELECT id, username, email, avatar, role, level, money, gold, respect, health, energy, power, agility, endurance, intelligence, character_id, home_id, garage_id, hangar_id, quay_id, bank, spins, theme, language, timeonline FROM players WHERE id = ? LIMIT 1',
      [claims.sub],
    );
    if (!players[0]) return res.status(401).json({ message: 'Player account no longer exists.' });
    req.player = players[0];
    req.token = token;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Your session has expired. Sign in again.' });
    }
    return next(error);
  }
}

module.exports = { authenticate };
