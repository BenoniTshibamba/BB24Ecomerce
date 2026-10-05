import jwt from 'jsonwebtoken';
import { db, JWT_SECRET } from '../db.js';

export function authOptional(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = db
        .prepare('SELECT id, name, email, role FROM users WHERE id = ?')
        .get(payload.id);
      if (user) req.user = user;
    } catch {
      // invalid/expired token -> treat as guest
    }
  }
  next();
}

export function authRequired(req, res, next) {
  authOptional(req, res, () => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    next();
  });
}

export function adminOnly(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== 'admin')
      return res.status(403).json({ error: 'Admin access required' });
    next();
  });
}
