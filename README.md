# Real-time Speedometer — Assignment Submission

Full-stack app: **time-series speed** sampled **every 1 second**, **persisted in PostgreSQL**, **speedometer UI updates in real time** when new rows are inserted (via **Socket.IO**). Built with **Node.js**, **PostgreSQL**, **React**, and **Docker Compose**.

---

## Assignment checklist (what this repo delivers)

| Requirement | How it is met |
|-------------|----------------|
| **1 Hz speed data** | Backend sensor simulator inserts a random integer **0–120** every **1 s** (`backend/src/simulator/sensorSimulator.js`). |
| **Stored in DB** | Table **`speed_data`** (`id`, `speed`, `created_at`) in **PostgreSQL** via **`pg`** (`backend/src/db/initSchema.js`, `services/speed.service.js`). |
| **Live speedometer** | After each insert, server emits **`speed_update`**; React listens and updates **gauge + number + last-10 chart** (`frontend/src/hooks/useSpeedData.js`). |
| **Tech stack** | **Node** (Express), **PostgreSQL**, **React** (Vite, Tailwind). |
| **Dockerized** | **`docker-compose.yml`**: `postgres`, `backend`, `frontend` + Dockerfiles. |
| **Structured code + comments** | Split into `routes/`, `services/`, `socket/`, `simulator/`, `components/`, `hooks/`; key files commented (e.g. `server.js`). |

**Optional for your PDF:** add a **block diagram** (e.g. `diagram.svg` in repo root) and a short **challenges / opportunities** section in the written submission—the README below supports both.

---

## Quick start

| Mode | Command | UI | API + Socket.IO |
|------|---------|-----|-----------------|
| **Docker** (recommended) | From repo root: `docker compose up --build` | http://localhost:8080 | http://localhost:3001 |
| **Local dev** | Postgres running + `npm start` in `backend` + `npm run dev` in `frontend` | http://localhost:8080 | http://localhost:3001 |

- **Postgres (Docker):** `localhost:5432` — user `speeduser`, password `speedpass`, database `speedometer`.
- Stop stack: `docker compose down` (data stays in the `pgdata` volume unless removed).

---

## 1. What the system does (overview)

1. A **sensor simulator** (in-process, not a separate binary) produces a new speed **once per second**.
2. Each value is **written** to **`speed_data`**.
3. The server **broadcasts** the new row to all browsers with **`speed_update`**.
4. The **React** dashboard shows a **circular gauge**, **numeric speed**, and a **line chart of the last 10 readings**; initial history comes from **`GET /speed/recent`** (Axios), then Socket.IO keeps it live.

You can also **`POST /speed`** with a body `{ "speed": <0–120> }` to insert manually—the same **insert + emit** path runs.

---

## 2. Architecture (reviewer-friendly)

### Data flow: sensor → database → UI

1. **Sensor simulator** → backend service → **`INSERT`** into PostgreSQL.
2. On success → **`io.emit('speed_update', row)`**.
3. **React** → `socket.on('speed_update', …)` → update state → gauge/chart re-render.

### Why Socket.IO instead of polling?

- **Polling** repeats `GET` on a timer: extra delay, wasted traffic when nothing changed, heavier under many clients.
- **Socket.IO** keeps a **push** channel so the UI can update **as soon as** a row is stored—suited to **streaming / live** data.

### REST vs real-time (same server, different roles)

- **`/health`**, **`/speed/*`** → normal **HTTP** (JSON). Typical for **auth** or CRUD-style APIs.
- **`/socket.io`** → Engine.IO / WebSocket traffic. **`server.js`** uses an **`upgrade` guard** so only **`/socket.io`** may upgrade; other `Upgrade` requests are closed—REST stays clearly **non-WebSocket**.

### Persistence and scale (brief)

- **Persistence:** reload the page; history can be refetched from the DB (`/speed/latest`, `/speed/recent`).
- **Scale (future):** multiple Node instances + **Redis adapter** for Socket.IO; pool/replicas for PostgreSQL; static UI on a CDN.

---

## 3. Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express, Socket.IO, `pg` |
| Database | PostgreSQL 16 (image in Compose) |
| Frontend | React 18, Vite, Tailwind CSS, Axios |
| Real-time | Socket.IO (server + client) |
| Charts | `react-gauge-chart`, Recharts |
| Containers | Docker, Docker Compose |

---

## 4. Setup (detailed)

### Prerequisites

- **Docker:** Docker Desktop (or compatible engine) for Compose.
- **Local (no Docker):** Node **18+**, PostgreSQL **14+**, database/user matching `backend/.env.example`.

### Local (without Docker)

1. **Database:** create DB and user (or match `backend/.env.example`).
2. **Backend:**

   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm start
   ```

3. **Frontend:**

   ```bash
   cd frontend
   cp .env.example .env
   # Leave VITE_BACKEND_URL empty to use Vite proxy to :3001, or set http://localhost:3001
   npm install
   npm run dev
   ```

Open **http://localhost:8080**.

### Docker Compose

From the **repository root**:

```bash
docker compose up --build
```

The frontend image is built with **`VITE_BACKEND_URL=http://localhost:3001`** so the **browser** (on your machine) reaches the API on the host.

---

## 5. API reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness JSON |
| `POST` | `/speed` | Body `{ "speed": <integer 0–120> }` — insert + emit `speed_update` |
| `GET` | `/speed/latest` | Latest row or `404` |
| `GET` | `/speed/recent?limit=10` | Recent rows, chronological (chart bootstrap; max 100) |

Example:

```bash
curl -X POST http://localhost:3001/speed -H "Content-Type: application/json" -d "{\"speed\": 72}"
```

---

## 6. Real-time contract (Socket.IO)

- **Event name:** `speed_update`
- **Payload:** `{ id, speed, created_at }` (same shape as a DB row)
- **Server:** emits after **simulator insert** or **`POST /speed`**
- **Client:** `socket.on('speed_update', handler)`; connection errors and reconnect are reflected in the UI

---

## 7. Repository layout

```text
backend/src/
  config/database.js       # PostgreSQL pool + env
  db/initSchema.js         # CREATE TABLE IF NOT EXISTS
  routes/speed.routes.js   # REST
  services/speed.service.js
  socket/io.js             # Shared io + emitSpeedUpdate
  simulator/sensorSimulator.js
  server.js                # Express + Socket.IO + upgrade guard

frontend/src/
  components/              # Gauge, chart, connection status
  hooks/useSpeedData.js    # Axios + Socket.IO + last-10 buffer
  App.jsx
```

---

## 8. Possible extensions

- Real hardware ingest (MQTT/HTTP) instead of the simulator  
- Authentication on REST; optional Socket.IO middleware  
- Rate limiting, validation (e.g. Zod), metrics, E2E tests  
- Horizontal scaling (Redis adapter for Socket.IO)  

---


