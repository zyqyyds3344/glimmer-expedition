import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthedRequest } from '../auth';
import { BADGES, evaluateAchievements, computeProgress } from '../achievementsEngine';

const r = Router();

r.get('/', authMiddleware, (req: AuthedRequest, res) => {
  const owned = db.prepare('SELECT badge_id, unlocked_at FROM achievements WHERE user_id = ?').all(req.userId) as any[];
  const ownedMap = new Map(owned.map(o => [o.badge_id, o.unlocked_at]));
  const progress = computeProgress(req.userId!);
  const list = BADGES.map(b => {
    const p = progress[b.id] || { current: 0, target: 1, hint: '' };
    const ratio = Math.min(1, p.target > 0 ? p.current / p.target : 0);
    return {
      ...b,
      unlocked: ownedMap.has(b.id),
      unlocked_at: ownedMap.get(b.id) || null,
      current: p.current,
      target: p.target,
      hint: p.hint,
      ratio,
    };
  });
  res.json(list);
});

r.post('/trigger-rain', authMiddleware, (req: AuthedRequest, res) => {
  const owned = db.prepare('SELECT badge_id FROM achievements WHERE user_id = ? AND badge_id = ?').get(req.userId, 'scene_rain');
  if (!owned) {
    db.prepare('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)').run(req.userId, 'scene_rain');
    const b = BADGES.find(b => b.id === 'scene_rain');
    return res.json({ unlocked: b });
  }
  res.json({ unlocked: null });
});

r.post('/recheck', authMiddleware, (req: AuthedRequest, res) => {
  const u = evaluateAchievements(req.userId!);
  res.json({ unlocked: u });
});

export default r;
