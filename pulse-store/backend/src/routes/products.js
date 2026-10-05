import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

function parseColors(p) {
  try {
    return { ...p, colors: JSON.parse(p.colors || '[]') };
  } catch {
    return { ...p, colors: [] };
  }
}

router.get('/', (req, res) => {
  const { q, category, sort, featured, limit } = req.query;
  const where = [];
  const params = [];

  if (featured === '1') where.push('featured = 1');
  if (category) {
    where.push('category = ?');
    params.push(String(category));
  }
  if (q) {
    where.push('(name LIKE ? OR tagline LIKE ? OR description LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  let order = 'created_at DESC';
  if (sort === 'price_asc') order = 'price_cents ASC';
  else if (sort === 'price_desc') order = 'price_cents DESC';
  else if (sort === 'rating') order = 'rating DESC, review_count DESC';
  else if (sort === 'name') order = 'name ASC';

  let sql = `SELECT * FROM products`;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY ${order}`;
  const n = parseInt(limit, 10);
  if (Number.isFinite(n) && n > 0 && n <= 100) {
    sql += ` LIMIT ${n}`;
  }

  const rows = db.prepare(sql).all(...params);
  res.json({ products: rows.map(parseColors) });
});

router.get('/:slug', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const reviews = db
    .prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC')
    .all(product.id);
  const related = db
    .prepare('SELECT * FROM products WHERE category = ? AND id != ? ORDER BY rating DESC LIMIT 4')
    .all(product.category, product.id);

  res.json({
    product: parseColors(product),
    reviews,
    related: related.map(parseColors),
  });
});

export default router;
