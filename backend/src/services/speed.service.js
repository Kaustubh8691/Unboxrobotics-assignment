const { pool } = require('../config/database');

/**
 * Inserts a speed reading and returns the full row (including id, created_at).
 */
async function insertSpeed(speed) {
  const result = await pool.query(
    `INSERT INTO speed_data (speed) VALUES ($1)
     RETURNING id, speed, created_at`,
    [speed]
  );
  return result.rows[0];
}

/**
 * Returns the most recent row by created_at.
 */
async function getLatestSpeed() {
  const result = await pool.query(
    `SELECT id, speed, created_at
     FROM speed_data
     ORDER BY created_at DESC, id DESC
     LIMIT 1`
  );
  return result.rows[0] || null;
}

/**
 * Returns the N most recent readings (oldest-first in array) for charts / history UI.
 */
async function getRecentSpeeds(limit = 10) {
  const safeLimit = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
  const result = await pool.query(
    `SELECT id, speed, created_at
     FROM speed_data
     ORDER BY created_at DESC, id DESC
     LIMIT $1`,
    [safeLimit]
  );
  // Chart-friendly order: chronological
  return result.rows.reverse();
}

module.exports = {
  insertSpeed,
  getLatestSpeed,
  getRecentSpeeds,
};
