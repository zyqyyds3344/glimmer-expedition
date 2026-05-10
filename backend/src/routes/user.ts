import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthedRequest } from '../auth';
import { levelFromTotalEnergy } from '../utils';

const r = Router();

r.get('/me', authMiddleware, (req: AuthedRequest, res) => {
  const u = db.prepare('SELECT id, nickname, avatar, preference, energy, shields, shield_fragments, title, onboarding, plan FROM users WHERE id = ?').get(req.userId) as any;
  if (!u) return res.status(404).json({ error: 'user not found' });
  const lvl = levelFromTotalEnergy(u.energy);
  const stage = lvl.level >= 100 ? 'legend' : lvl.level >= 51 ? 'growth' : 'sprout';
  const stageName = stage === 'legend' ? '传说期' : stage === 'growth' ? '成长期' : '幼苗期';
  res.json({
    ...u,
    ...lvl,
    stage,
    stageName,
    onboarded: !!u.onboarding,
    onboarding: u.onboarding ? JSON.parse(u.onboarding) : null,
    plan: u.plan ? JSON.parse(u.plan) : null,
  });
});

r.get('/list', authMiddleware, (req: AuthedRequest, res) => {
  const rows = db.prepare('SELECT id, nickname, avatar, preference, energy FROM users WHERE id != ? ORDER BY id ASC LIMIT 30').all(req.userId) as any[];
  res.json(rows.map(u => ({ ...u, ...levelFromTotalEnergy(u.energy) })));
});

r.put('/me', authMiddleware, (req: AuthedRequest, res) => {
  const { avatar, preference } = req.body || {};
  db.prepare('UPDATE users SET avatar = COALESCE(?, avatar), preference = COALESCE(?, preference) WHERE id = ?')
    .run(avatar, preference, req.userId);
  res.json({ ok: true });
});

export default r;
