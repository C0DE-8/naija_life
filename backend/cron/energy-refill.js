const cron = require('node-cron');
const { pool } = require('../db');

function startEnergyRefillJob() {
  const schedule = process.env.ENERGY_REFILL_CRON || '0 * * * *';
  const amount = Math.max(1, Number(process.env.ENERGY_REFILL_AMOUNT || 10));

  if (!cron.validate(schedule)) {
    throw new Error(`Invalid ENERGY_REFILL_CRON schedule: ${schedule}`);
  }

  const task = cron.schedule(schedule, async () => {
    try {
      const [result] = await pool.execute(
        'UPDATE players SET energy = LEAST(100, energy + ?) WHERE energy < 100',
        [amount],
      );
      console.info(`[cron] Energy refill updated ${result.affectedRows} players`);
    } catch (error) {
      console.error('[cron] Energy refill failed:', error.message);
    }
  });

  console.info(`[cron] Energy refill scheduled: ${schedule} (+${amount}, max 100)`);
  return task;
}

module.exports = { startEnergyRefillJob };
