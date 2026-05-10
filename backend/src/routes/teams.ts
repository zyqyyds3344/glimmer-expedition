import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthedRequest } from '../auth';
import { calcEnergy } from '../utils';

const r = Router();

r.get('/open', authMiddleware, (req: AuthedRequest, res) => {
  const rows = db.prepare(`
    SELECT t.*, u.nickname as host_name, u.avatar as host_avatar
    FROM quick_teams t JOIN users u ON u.id = t.host_id
    WHERE t.status = 'open' AND t.host_id != ?
    ORDER BY t.created_at DESC LIMIT 30
  `).all(req.userId);
  res.json(rows);
});

r.post('/create', authMiddleware, (req: AuthedRequest, res) => {
  const { sport_type, duration } = req.body || {};
  const info = db.prepare('INSERT INTO quick_teams (host_id, sport_type, duration) VALUES (?, ?, ?)').run(req.userId, sport_type, duration);
  res.json({ id: Number(info.lastInsertRowid) });
});

r.post('/join/:id', authMiddleware, (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const t = db.prepare('SELECT * FROM quick_teams WHERE id = ? AND status = "open"').get(id) as any;
  if (!t) return res.status(404).json({ error: 'not found' });
  db.prepare('UPDATE quick_teams SET partner_id = ?, status = "matched" WHERE id = ?').run(req.userId, id);
  res.json({ ok: true, host: t });
});

r.post('/finish/:id', authMiddleware, (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const t = db.prepare('SELECT * FROM quick_teams WHERE id = ?').get(id) as any;
  if (!t) return res.status(404).json({ error: 'not found' });
  const { energy } = calcEnergy(t.sport_type, t.duration);
  const bonus = Math.round(energy * 1.1);
  db.prepare('INSERT INTO sport_records (user_id, type, duration, energy, multiplier, note) VALUES (?, ?, ?, ?, ?, ?)').run(
    req.userId, t.sport_type, t.duration, bonus, 1.1, '搭子组队 +10%'
  );
  db.prepare('UPDATE users SET energy = energy + ? WHERE id = ?').run(bonus, req.userId);
  db.prepare('UPDATE quick_teams SET status = "done", finished_at = strftime(\'%s\',\'now\') WHERE id = ?').run(id);
  // 给 host 也加（如果是当前人 join）
  const partnerOf = req.userId === t.host_id ? t.partner_id : t.host_id;
  if (partnerOf) {
    db.prepare('INSERT INTO sport_records (user_id, type, duration, energy, multiplier, note) VALUES (?, ?, ?, ?, ?, ?)').run(
      partnerOf, t.sport_type, t.duration, bonus, 1.1, '搭子组队 +10%'
    );
    db.prepare('UPDATE users SET energy = energy + ? WHERE id = ?').run(bonus, partnerOf);
  }
  res.json({ energy: bonus });
});

export default r;
