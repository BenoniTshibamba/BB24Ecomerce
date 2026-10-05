import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const cats = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  const counts = db
    .prepare('SELECT category, COUNT(*) AS n FROM products GROUP BY category')
    .all();
  const byCat = Object.fromEntries(counts.map((c) => [c.category, c.n]));
  res.json({
    categories: cats.map((c) => ({ ...c, product_count: byCat[c.slug] || 0 })),
  });
});

export default router;
