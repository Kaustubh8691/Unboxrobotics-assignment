const speedService = require('../services/speed.service');
const { emitSpeedUpdate } = require('../socket/io');

/**
 * Generates a random integer in [0, max] inclusive.
 */
function randomSpeed(max = 120) {
  return Math.floor(Math.random() * (max + 1));
}

/**
 * Starts a 1 Hz “sensor”: inserts into PostgreSQL and broadcasts via Socket.IO.
 * Returns stop() to clear the interval (useful for tests or graceful shutdown).
 */
function startSensorSimulator() {
  const tick = async () => {
    const speed = randomSpeed(120);
    try {
      const row = await speedService.insertSpeed(speed);
      emitSpeedUpdate(row);
    } catch (err) {
      console.error('[sensor] insert/emit failed', err.message);
    }
  };

  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}

module.exports = { startSensorSimulator, randomSpeed };
