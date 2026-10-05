import { Router } from 'express';
import { db } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/', authRequired, (req, res) => {
  const { product_id, rating, title, body } = req.body || {};
  const r = parseInt(rating, 10);
  if (!product_id || !Number.isInteger(r) || r < 1 || r > 5)
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  if (!title || String(title).trim().length < 3)
    return res.status(400).json({ error: 'Please give your review a title' });
  if (!body || String(body).trim().length < 10)
    return res.status(400).json({ error: 'Please write a few words about the product' });

  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const result = db
    .prepare(
      'INSERT INTO reviews (product_id, user_name, rating, title, body) VALUES (?, ?, ?, ?, ?)'
    )
    .run(product_id, req.user.name, r, String(title).trim(), String(body).trim());

  // Recompute aggregate rating
  const agg = db
    .prepare('SELECT AVG(rating) AS avg_r, COUNT(*) AS n FROM reviews WHERE product_id = ?')
    .get(product_id);
  db.prepare('UPDATE products SET rating = ?, review_count = ? WHERE id = ?').run(
    Math.round(agg.avg_r * 10) / 10,
    agg.n,
    product_id
  );

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ review });
});

export default router;
