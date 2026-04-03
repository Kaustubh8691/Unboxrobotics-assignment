
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { initSchema } = require('./db/initSchema');
const speedRoutes = require('./routes/speed.routes');
const { setIo } = require('./socket/io');
const { startSensorSimulator } = require('./simulator/sensorSimulator');

const PORT = parseInt(process.env.PORT || '3001', 10);

function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || raw === '*') return '*';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Only Engine.IO / Socket.IO should use HTTP Upgrade on this server.
 * Paths like GET /health, POST /speed, or future /auth use plain HTTP — if a client sends
 * Upgrade elsewhere, close the socket so it cannot hijack the connection as a WebSocket.
 * Registered with prependListener so this runs before Socket.IO's internal upgrade handler.
 */
function attachUpgradeGuard(server) {
  server.prependListener('upgrade', (req, socket) => {
    const path = (req.url || '').split('?')[0];
    const isSocketIo = path === '/socket.io' || path.startsWith('/socket.io/');
    if (isSocketIo) {
      return;
    }
    socket.destroy();
  });
}

async function bootstrap() {
  const app = express();

  app.use(cors({ origin: parseCorsOrigins() }));
  app.use(express.json());

  // HTTP only (no WebSocket Upgrade); same idea as typical /auth or JSON APIs.
  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'speedometer-backend' });
  });

  app.use('/speed', speedRoutes);

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: parseCorsOrigins(),
      methods: ['GET', 'POST'],
    },
  });

  attachUpgradeGuard(server);

  setIo(io);

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', socket.id, reason);
    });
  });

  try {
    await initSchema();
  } catch (err) {
    const refused =
      err?.code === 'ECONNREFUSED' ||
      (Array.isArray(err?.errors) && err.errors.some((e) => e?.code === 'ECONNREFUSED'));
    if (refused) {
      const host = process.env.PGHOST || 'localhost';
      const port = process.env.PGPORT || '5432';
      console.error(
        `\nCannot reach PostgreSQL at ${host}:${port} (connection refused).\n` +
          'Start the database first, for example:\n' +
          '  • Docker: open Docker Desktop, then from the project root run: docker compose up -d postgres\n' +
          '  • Local install: ensure the PostgreSQL service is running and credentials in backend/.env match.\n'
      );
    }
    throw err;
  }

  const stopSimulator = startSensorSimulator();

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log('Socket.IO ready on same port');
  });

  const shutdown = () => {
    stopSimulator();
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error', err);
  process.exit(1);
});
