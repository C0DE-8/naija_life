const express = require('express');
const { checkDatabase } = require('../db');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Naija City API router is working' });
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
