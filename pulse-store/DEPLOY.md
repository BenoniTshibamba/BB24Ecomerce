# Deploying BB24 to Render

The repo ships with `render.yaml` (one-click) and a `Dockerfile`. Two paths:

## Option A — Blueprint (one click)

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, select the repo.
3. Render reads `render.yaml` and creates the **bb24-store** Web Service:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - `JWT_SECRET` is generated automatically.
4. Click **Apply**. Your store is live at `https://bb24-store.onrender.com`.

## Option B — Manual Web Service

1. Push this repo to GitHub.
2. In Render: **New → Web Service**, select the repo.
3. Settings:
   - **Runtime:** Node
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Instance type:** Free
4. Under **Environment**, add `JWT_SECRET` → **Generate** a random value.
5. Click **Create Web Service**.

## Free-tier notes

- The free tier spins down after ~15 minutes of inactivity; the first request
  after idle takes ~30–60s to wake up.
- The free tier has an **ephemeral filesystem**: `data/store.db` is committed to
  the repo, so the store always boots with the full seeded catalog — but orders,
  users, and reviews created at runtime are **lost on redeploy or restart**.
- For a persistent database, add a **Render Disk** (paid tiers only) mounted at
  `/opt/render/project/src/data`, matching the `data/` directory the app uses.
  Alternative: migrate to Render Postgres later — the data layer is isolated in
  `backend/src/db.js`.

## Environment variables

| Key          | Required | Notes                                      |
| ------------ | -------- | ------------------------------------------ |
| `PORT`       | No       | Set by Render automatically                |
| `JWT_SECRET` | Yes      | Generate a long random string in production |
| `NODE_VERSION` | No     | `render.yaml` pins 22.14.0                 |

## Health check

`GET /api/health` returns `{ "ok": true, "service": "bb24-store" }` — useful as
Render's health check path.

---

BUILT WITH LOVE AND CAFFEINE BY BB24
