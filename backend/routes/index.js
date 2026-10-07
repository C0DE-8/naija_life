const express = require('express');
const { checkDatabase } = require('../db');

const router = express.Router();
const authRouter = require('./auth');
const gameRouter = require('./game');
const { authenticate } = require('../middleware/authenticate');

router.use('/auth', authRouter);
router.use('/game', authenticate, gameRouter);

router.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Naija Life API router is working' });
});

router.get('/health', async (_req, res, next) => {
  try {
    await checkDatabase();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
