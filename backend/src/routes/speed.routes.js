const express = require('express');
const speedService = require('../services/speed.service');
const { emitSpeedUpdate } = require('../socket/io');

const router = express.Router();

/**
 * POST /speed — body: { "speed": number } — inserts and emits speed_update.
 */
router.post('/', async (req, res) => {
  const raw = req.body?.speed;
  const speed = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);

  if (!Number.isInteger(speed) || speed < 0 || speed > 120) {
    return res.status(400).json({
      error: 'Invalid speed',
      message: 'speed must be an integer between 0 and 120',
    });
  }

  try {
    const row = await speedService.insertSpeed(speed);
    emitSpeedUpdate(row);
    return res.status(201).json(row);
  } catch (err) {
    console.error('POST /speed failed', err);
    return res.status(500).json({ error: 'Failed to insert speed' });
  }
});

/**
 * GET /speed/latest — returns newest row or 404 if table empty.
 */
router.get('/latest', async (req, res) => {
  try {
    const row = await speedService.getLatestSpeed();
    if (!row) {
      return res.status(404).json({ error: 'No speed data yet' });
    }
    return res.json(row);
  } catch (err) {
    console.error('GET /speed/latest failed', err);
    return res.status(500).json({ error: 'Failed to read latest speed' });
  }
});

/**
 * GET /speed/recent?limit=10 — chronological list for chart bootstrap.
 */
router.get('/recent', async (req, res) => {
  try {
    const rows = await speedService.getRecentSpeeds(req.query.limit);
    return res.json(rows);
  } catch (err) {
    console.error('GET /speed/recent failed', err);
    return res.status(500).json({ error: 'Failed to read recent speeds' });
  }
});

module.exports = router;
