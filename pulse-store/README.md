# BB24 — Premium Wireless Audio Store

A complete full-stack e-commerce store for a premium wireless audio brand
(headphones, earbuds, speakers). Dark premium aesthetic, lime `#D4FF3F` accent,
Space Grotesk + Inter typography. All prices in CAD.

**Stack:** Node.js + Express backend (built-in `node:sqlite`, zero native deps),
JWT auth with bcryptjs, REST API under `/api`. React + Vite + Tailwind CSS
frontend. Express serves the built frontend from `frontend/dist` — one service,
one port.

## Quick start

```bash
npm run install:all   # install backend + frontend deps
npm run seed          # create data/store.db and seed it (also auto-seeds on boot)
npm start             # serve API + frontend on http://localhost:3000
```

Dev mode (hot reload):

```bash
npm run dev:backend    # Express with --watch on :3000
npm run dev:frontend   # Vite on :5173, proxies /api to :3000
```

## Scripts

| Command              | What it does                                  |
| -------------------- | --------------------------------------------- |
| `npm run install:all`| Install backend and frontend dependencies     |
| `npm run seed`       | Build + seed `data/store.db` (idempotent)     |
| `npm run build`      | Production build of the frontend              |
| `npm start`          | Start Express (serves API + `frontend/dist`)  |
| `npm run dev:backend`| Backend with file watching                    |
| `npm run dev:frontend`| Vite dev server with API proxy               |

## Demo accounts

| Role     | Email            | Password  |
| -------- | ---------------- | --------- |
| Admin    | admin@bb24.shop  | admin123  |
| Customer | demo@bb24.shop   | demo1234  |

The admin dashboard lives at `/admin` (role-gated): revenue/order/product stats,
products CRUD, and order management with a status dropdown.

## Store features

- Home: hero banner, marquee strip, featured products, category tiles, tech
  section, testimonials, newsletter signup (persisted to DB)
- Shop: live search, category filter, sort by price / rating / newest
- Product pages: color variants, quantity, stock states, reviews (logged-in
  users can post), related products
- Cart: slide-over drawer + full page, persisted in localStorage
- Checkout: 3 steps (contact → shipping → mock payment), order confirmation
  with order number (`BB24-000001` format). Demo card `4242 4242 4242 4242`.
- Orders: history + tracking timeline (processing → shipped → delivered)
- Auth: register / login with JWT, protected routes

## API surface

`GET /api/products` (q, category, sort, featured, limit) ·
`GET /api/products/:slug` · `GET /api/categories` ·
`POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` ·
`POST /api/reviews` (auth) · `POST /api/orders/checkout` ·
`GET /api/orders` (auth) · `GET /api/orders/:id` (auth) ·
`POST /api/newsletter` · `/api/admin/*` (admin: stats, products CRUD, orders)

## Notes

- `data/store.db` is intentionally committed to the repo so the seeded catalog
  ships with it (force-added past `.gitignore`).
- Set `JWT_SECRET` in production. The dev default is only for local use.
- Free shipping on orders over $150 CAD, otherwise $9.99 flat.

---

BUILT WITH LOVE AND CAFFEINE BY BB24
