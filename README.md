## Distributed Tracing Demo (Sentry)

A minimal three-tier demo for a tech talk:

- React frontend (CDN) calls a Gateway service
- Gateway (Node/Express) forwards to Downstream service
- Downstream (Node/Express) queries PostgreSQL
- All instrumented with Sentry for distributed tracing

### Prerequisites

- Node 22+
- Docker and Docker Compose (for PostgreSQL)
- Sentry project DSNs

### Structure

- `frontend/index.html`: Static page with React and Sentry Browser init
- `services/gateway`: Express gateway service
- `services/downstream`: Express downstream service with PostgreSQL
- `docker-compose.yml`: PostgreSQL database container

### Quick start

1. Start PostgreSQL database

```bash
docker-compose up -d postgres
```

2. Install dependencies

```bash
(cd services/gateway && npm install) && (cd services/downstream && npm install)
```

3. Configure env (optional but recommended for tracing):

- Create `services/gateway/.env` from `.env.example` and set `SENTRY_DSN`
- Create `services/downstream/.env` from `.env.example` and set `SENTRY_DSN`

Example gateway `.env`:

```
PORT=4000
DOWNSTREAM_URL=http://localhost:4001
SENTRY_DSN=<your-backend-dsn>
```

Example downstream `.env`:

```
PORT=4001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=distributed_tracing_demo
POSTGRES_USER=demo_user
POSTGRES_PASSWORD=demo_password
SENTRY_DSN=<your-backend-dsn>
```

4. Run services (separate terminals):

```bash
cd services/downstream && npm start
cd services/gateway && npm start
```

5. Open the frontend:

- Open `frontend/index.html` in your browser (file:// or via a static server)
- Optionally paste a Frontend Sentry DSN in the input
- Click "Fetch data"

### What to demo in Sentry

- A transaction starting from the browser request
- Trace propagates to Gateway, then to Downstream
- Downstream spans include DB query span

### Notes

- This is intentionally minimal for presentations.
- Increase realism by adding latency, errors, or more spans.
