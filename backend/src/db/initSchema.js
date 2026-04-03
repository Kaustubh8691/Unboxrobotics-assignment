const { pool } = require('../config/database');

/**
 * Creates speed_data table if it does not exist.
 * id: serial PK, speed: integer km/h (or arbitrary unit), created_at: server default now().
 */
async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS speed_data (
      id SERIAL PRIMARY KEY,
      speed INTEGER NOT NULL CHECK (speed >= 0 AND speed <= 120),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('Database schema ready (speed_data).');
}

module.exports = { initSchema };
