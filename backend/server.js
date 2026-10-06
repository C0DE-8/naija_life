require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { pool } = require('./db');
const apiRouter = require('./routes');

const app = express();
const port = Number(process.env.PORT || 3000);
const apiBasePath = process.env.API_BASE_PATH || '/api';

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Naija City is running' });
});

app.use(apiBasePath, apiRouter);

app.use((error, _req, res, _next) => {
  console.error('[api] Request failed:', error.message);
  res.status(503).json({ status: 'error', message: 'Service temporarily unavailable' });
});

let server;

async function start() {
  // Fail fast on invalid credentials instead of reporting a healthy server with no database.
  const connection = await pool.getConnection();
  connection.release();

  if (process.env.ENABLE_CRON_JOBS === 'true') {
    const { startEnergyRefillJob } = require('./cron/energy-refill');
    startEnergyRefillJob();
  }

  server = app.listen(port, () => {
    console.info(`Naija City backend listening on port ${port}`);
  });
}

async function shutdown(signal) {
  console.info(`${signal} received; shutting down`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await pool.end();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

if (require.main === module) {
  start().catch(async (error) => {
    console.error('Could not start Naija City backend:', error.message);
    await pool.end();
    process.exit(1);
  });
}

module.exports = { app, start };
