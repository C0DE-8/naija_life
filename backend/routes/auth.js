const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();
const usernamePattern = /^[a-zA-Z0-9_]{3,24}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issueToken(player) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(
    { sub: String(player.id), username: player.username, role: player.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

function publicPlayer(player) {
  return {
    id: player.id,
    username: player.username,
    email: player.email,
    role: player.role,
    level: player.level,
    money: player.money,
    gold: player.gold,
    avatar: player.avatar,
  };
}

router.post('/signup', async (req, res, next) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!usernamePattern.test(username)) {
    return res.status(400).json({ message: 'Username must be 3–24 characters using letters, numbers, or underscores.' });
  }
  if (!emailPattern.test(email) || email.length > 254) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ message: 'Password must be between 8 and 72 characters.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[existing]] = await connection.execute(
      'SELECT id FROM players WHERE username = ? OR email = ? LIMIT 1',
      [username, email],
    );
    if (existing) {
      await connection.rollback();
      return res.status(409).json({ message: 'That username or email is already registered.' });
    }

    const [[settings]] = await connection.query('SELECT startmoney, startgold FROM settings ORDER BY id LIMIT 1');
    const [[language]] = await connection.query("SELECT langcode FROM languages ORDER BY (default_language = 'Yes') DESC, id LIMIT 1");
    const [[theme]] = await connection.query("SELECT id FROM themes ORDER BY (default_theme = 'Yes') DESC, id LIMIT 1");
    if (!language || !theme) {
      await connection.rollback();
      return res.status(503).json({ message: 'Game defaults are missing. Import the game seed data first.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await connection.execute(
      'INSERT INTO players (username, password, email, money, gold, theme, language, timeonline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, passwordHash, email, settings?.startmoney ?? 1500, settings?.startgold ?? 20, theme.id, language.langcode, String(Math.floor(Date.now() / 1000))],
    );
    await connection.commit();

    const player = {
      id: result.insertId,
      username,
      email,
      role: 'Player',
      level: 1,
      money: settings?.startmoney ?? 1500,
      gold: settings?.startgold ?? 20,
      avatar: 'images/icons/default-avatar.jpg',
    };
    return res.status(201).json({ token: issueToken(player), player });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'That username or email is already registered.' });
    }
    return next(error);
  } finally {
    connection.release();
  }
});

router.post('/signin', async (req, res, next) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!username || !password) {
    return res.status(400).json({ message: 'Enter your username and password.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, username, password, email, role, level, money, gold, avatar FROM players WHERE username = ? LIMIT 1',
      [username],
    );
    const player = rows[0];
    if (!player) return res.status(401).json({ message: 'Username or password is incorrect.' });

    const bcryptHash = player.password.startsWith('$2');
    const passwordMatches = bcryptHash
      ? await bcrypt.compare(password, player.password)
      : /^[a-f0-9]{64}$/i.test(player.password)
        && require('node:crypto').timingSafeEqual(
          Buffer.from(require('node:crypto').createHash('sha256').update(password).digest('hex'), 'hex'),
          Buffer.from(player.password, 'hex'),
        );
    if (!passwordMatches) return res.status(401).json({ message: 'Username or password is incorrect.' });

    if (!bcryptHash) {
      const upgradedHash = await bcrypt.hash(password, 12);
      await pool.execute('UPDATE players SET password = ? WHERE id = ?', [upgradedHash, player.id]);
    }

    delete player.password;
    return res.json({ token: issueToken(player), player: publicPlayer(player) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
