import { Router } from 'express';
import { db } from '../db.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', (req, res) => {
  const { email } = req.body || {};
  if (!email || !EMAIL_RE.test(String(email).trim()))
    return res.status(400).json({ error: 'Please enter a valid email address' });
  const normalized = String(email).trim().toLowerCase();
  try {
    db.prepare('INSERT INTO newsletter (email) VALUES (?)').run(normalized);
  } catch {
    return res.status(409).json({ error: 'You are already subscribed' });
  }
  res.status(201).json({ ok: true });
});

export default router;
