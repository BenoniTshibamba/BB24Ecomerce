import { Router } from 'express';
import { db, orderNumber } from '../db.js';
import { adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(adminOnly);

const STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

router.get('/stats', (_req, res) => {
  const revenue = db
    .prepare("SELECT COALESCE(SUM(total_cents), 0) AS r FROM orders WHERE status != 'cancelled'")
    .get().r;
  const orders = db.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
  const products = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  const users = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const lowStock = db
    .prepare('SELECT id, name, stock FROM products WHERE stock < 20 ORDER BY stock ASC LIMIT 5')
    .all();
  const recent = db
    .prepare('SELECT id, email, total_cents, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5')
    .all()
    .map((o) => ({ ...o, order_number: orderNumber(o.id) }));
  res.json({
    revenue_cents: revenue,
    orders_count: orders,
    products_count: products,
    users_count: users,
    low_stock: lowStock,
    recent_orders: recent,
  });
});

// ---- Products CRUD ----
router.get('/products', (_req, res) => {
  res.json({ products: db.prepare('SELECT * FROM products ORDER BY id ASC').all() });
});

router.post('/products', (req, res) => {
  const p = req.body || {};
  if (!p.name || !p.slug || p.price_cents == null)
    return res.status(400).json({ error: 'Name, slug and price are required' });
  try {
    const r = db
      .prepare(
        `INSERT INTO products (slug, name, tagline, description, price_cents, compare_at_cents,
          category, image, colors, rating, review_count, stock, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`
      )
      .run(
        p.slug, p.name, p.tagline || '', p.description || '', p.price_cents,
        p.compare_at_cents || null, p.category || 'headphones', p.image || '',
        JSON.stringify(p.colors || []), p.stock ?? 0, p.featured ? 1 : 0
      );
    res.status(201).json({ product: db.prepare('SELECT * FROM products WHERE id = ?').get(r.lastInsertRowid) });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'Slug already exists' });
    throw e;
  }
});

router.put('/products/:id', (req, res) => {
  const p = req.body || {};
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  db.prepare(
    `UPDATE products SET name=?, tagline=?, description=?, price_cents=?, compare_at_cents=?,
      category=?, image=?, colors=?, stock=?, featured=? WHERE id=?`
  ).run(
    p.name ?? existing.name, p.tagline ?? existing.tagline, p.description ?? existing.description,
    p.price_cents ?? existing.price_cents, p.compare_at_cents ?? existing.compare_at_cents,
    p.category ?? existing.category, p.image ?? existing.image,
    p.colors ? JSON.stringify(p.colors) : existing.colors,
    p.stock ?? existing.stock, p.featured != null ? (p.featured ? 1 : 0) : existing.featured,
    req.params.id
  );
  res.json({ product: db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) });
});

router.delete('/products/:id', (req, res) => {
  const r = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ ok: true });
});

// ---- Orders ----
router.get('/orders', (_req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  const items = db.prepare('SELECT * FROM order_items').all();
  const byOrder = {};
  for (const it of items) (byOrder[it.order_id] = byOrder[it.order_id] || []).push(it);
  res.json({
    orders: orders.map((o) => ({
      ...o,
      order_number: orderNumber(o.id),
      items: byOrder[o.id] || [],
    })),
  });
});

router.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const r = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Order not found' });
  res.json({ ok: true, status });
});

export default router;
