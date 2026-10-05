import { Router } from 'express';
import { db, orderNumber } from '../db.js';
import { authOptional, authRequired } from '../middleware/auth.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FREE_SHIPPING_THRESHOLD = 15000; // $150 CAD
const SHIPPING_FLAT = 999; // $9.99 CAD

function withItems(order) {
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  return { ...order, order_number: orderNumber(order.id), items };
}

// POST /api/orders/checkout — mock payment, creates the order
router.post('/checkout', authOptional, (req, res) => {
  const { email, items, shipping, payment } = req.body || {};

  if (!email || !EMAIL_RE.test(String(email).trim()))
    return res.status(400).json({ error: 'A valid email is required' });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'Your cart is empty' });

  const s = shipping || {};
  for (const f of ['name', 'address', 'city', 'postal']) {
    if (!s[f] || String(s[f]).trim().length < 2)
      return res.status(400).json({ error: `Shipping ${f} is required` });
  }

  // Mock payment validation (no real charge)
  const p = payment || {};
  const card = String(p.card_number || '').replace(/\s/g, '');
  if (!/^\d{12,19}$/.test(card))
    return res.status(400).json({ error: 'Enter a valid card number for the demo checkout' });
  if (!p.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(String(p.expiry)))
    return res.status(400).json({ error: 'Enter the card expiry as MM/YY' });
  if (!p.cvc || !/^\d{3,4}$/.test(String(p.cvc)))
    return res.status(400).json({ error: 'Enter the 3-digit CVC' });

  // Resolve items against live product data, check stock
  const lines = [];
  let subtotal = 0;
  for (const it of items) {
    const qty = parseInt(it.qty, 10);
    if (!Number.isInteger(qty) || qty < 1)
      return res.status(400).json({ error: 'Invalid quantity in cart' });
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(it.product_id);
    if (!product) return res.status(400).json({ error: 'A product in your cart no longer exists' });
    if (product.stock < qty)
      return res.status(400).json({ error: `Only ${product.stock} × ${product.name} left in stock` });
    lines.push({ product, qty });
    subtotal += product.price_cents * qty;
  }

  const shippingCents = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shippingCents;

  let orderId;
  try {
    db.exec('BEGIN');
    const o = db
      .prepare(
        `INSERT INTO orders (user_id, email, status, subtotal_cents, shipping_cents, total_cents,
          shipping_name, shipping_address, shipping_city, shipping_postal)
         VALUES (?, ?, 'processing', ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        req.user ? req.user.id : null,
        String(email).trim().toLowerCase(),
        subtotal,
        shippingCents,
        total,
        String(s.name).trim(),
        String(s.address).trim(),
        String(s.city).trim(),
        String(s.postal).trim()
      );
    orderId = Number(o.lastInsertRowid);
    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, name, price_cents, qty) VALUES (?, ?, ?, ?, ?)'
    );
    const decStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    for (const { product, qty } of lines) {
      insertItem.run(orderId, product.id, product.name, product.price_cents, qty);
      decStock.run(qty, product.id);
    }
    db.exec('COMMIT');
  } catch (e) {
    try {
      db.exec('ROLLBACK');
    } catch {
      /* already rolled back */
    }
    throw e;
  }
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.status(201).json({ order: withItems(order) });
});

// GET /api/orders — own order history (auth required)
router.get('/', authRequired, (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json({ orders: orders.map(withItems) });
});

// GET /api/orders/:id — single order (owner or admin)
router.get('/:id', authRequired, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (req.user.role !== 'admin' && order.user_id !== req.user.id)
    return res.status(403).json({ error: 'Not your order' });
  res.json({ order: withItems(order) });
});

export default router;
