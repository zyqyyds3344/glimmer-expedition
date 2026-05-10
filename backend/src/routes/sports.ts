import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthedRequest } from '../auth';
import { calcEnergy, todayStr } from '../utils';
import { evaluateAchievements } from '../achievementsEngine';

const r = Router();

r.post('/record', authMiddleware, (req: AuthedRequest, res) => {
  const { type, duration, note, hour } = req.body || {};
  if (!type || !duration) return res.status(400).json({ error: 'missing' });
  const { energy, multiplier, critical, base } = calcEnergy(type, Number(duration));

  db.prepare('INSERT INTO sport_records (user_id, type, duration, energy, multiplier, is_critical, note) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    req.userId, type, duration, energy, multiplier, critical ? 1 : 0, note || ''
  );
  db.prepare('UPDATE users SET energy = energy + ? WHERE id = ?').run(energy, req.userId);

  const newAchievements = evaluateAchievements(req.userId!, { type, duration, energy, hour });
  res.json({ energy, base, multiplier, critical, newAchievements });
});

r.get('/list', authMiddleware, (req: AuthedRequest, res) => {
  const rows = db.prepare('SELECT * FROM sport_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 200').all(req.userId);
  res.json(rows);
});

r.get('/stats', authMiddleware, (req: AuthedRequest, res) => {
  const rows = db.prepare('SELECT * FROM sport_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 365').all(req.userId) as any[];
  // 类型分布
  const byType: Record<string, number> = {};
  // 最近 14 天能量
  const byDay: Record<string, number> = {};
  for (const row of rows) {
    byType[row.type] = (byType[row.type] || 0) + row.energy;
    const day = todayStr(new Date(row.created_at * 1000));
    byDay[day] = (byDay[day] || 0) + row.energy;
  }
  res.json({ byType, byDay, total: rows.length });
});

export default r;
