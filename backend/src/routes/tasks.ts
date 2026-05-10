import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthedRequest } from '../auth';
import { todayStr } from '../utils';

const r = Router();

export const TASK_CARDS = [
  { id: 'highknee', name: '5 分钟高抬腿挑战', minutes: 5, energy: 40, icon: '�', desc: '心率拉满，宿舍也能练', scene: '宿舍' },
  { id: 'classwalk', name: '课间快走 10 分钟', minutes: 10, energy: 50, icon: '🚶', desc: '别坐着了，起来转转', scene: '校园' },
  { id: 'libwalk', name: '绕图书馆散步一圈', minutes: 12, energy: 30, icon: '📚', desc: '换换脑子，呼吸新鲜空气', scene: '图书馆' },
  { id: 'stretch7', name: '7 分钟宿舍拉伸', minutes: 7, energy: 35, icon: '🧘', desc: '跟着节奏舒展身体', scene: '宿舍' },
  { id: 'stairs', name: '一首歌时间楼梯攀登', minutes: 4, energy: 35, icon: '�', desc: '听一首歌爬上去', scene: '宿舍楼' },
  { id: 'wallsquat', name: '靠墙静蹲 3 分钟', minutes: 3, energy: 25, icon: '🧱', desc: '腿部紧实利器', scene: '宿舍' },
  { id: 'fieldjog', name: '操场慢跑 15 分钟', minutes: 15, energy: 60, icon: '🏃', desc: '让风给你一点动力', scene: '操场' },
  { id: 'plank', name: '平板支撑 1 分钟×3', minutes: 5, energy: 30, icon: '🪵', desc: '核心稳，世界树才稳', scene: '宿舍' },
];

function pickToday(userId: number) {
  const today = todayStr();
  const exist = db.prepare('SELECT * FROM daily_tasks WHERE user_id = ? AND date = ?').all(userId, today) as any[];
  if (exist.length === 3) return exist;
  // 随机抽 3 张
  const ids = TASK_CARDS.map(c => c.id).sort(() => Math.random() - 0.5).slice(0, 3);
  db.prepare('DELETE FROM daily_tasks WHERE user_id = ? AND date = ?').run(userId, today);
  for (const id of ids) {
    db.prepare('INSERT INTO daily_tasks (user_id, card_id, date) VALUES (?, ?, ?)').run(userId, id, today);
  }
  return db.prepare('SELECT * FROM daily_tasks WHERE user_id = ? AND date = ?').all(userId, today);
}

r.get('/today', authMiddleware, (req: AuthedRequest, res) => {
  const tasks = pickToday(req.userId!) as any[];
  res.json(tasks.map(t => ({ ...t, card: TASK_CARDS.find(c => c.id === t.card_id) })));
});

r.post('/complete/:id', authMiddleware, (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const t = db.prepare('SELECT * FROM daily_tasks WHERE id = ? AND user_id = ?').get(id, req.userId) as any;
  if (!t) return res.status(404).json({ error: 'not found' });
  if (t.completed) return res.json({ already: true });
  const card = TASK_CARDS.find(c => c.id === t.card_id);
  if (!card) return res.status(404).json({ error: 'card missing' });

  db.prepare('UPDATE daily_tasks SET completed = 1 WHERE id = ?').run(id);
  db.prepare('INSERT INTO sport_records (user_id, type, duration, energy, note) VALUES (?, ?, ?, ?, ?)').run(
    req.userId, 'other', card.minutes, card.energy, '能量卡片：' + card.name
  );
  // 累积护盾碎片
  const u = db.prepare('SELECT shield_fragments, shields FROM users WHERE id = ?').get(req.userId) as any;
  let frag = u.shield_fragments + 1;
  let shields = u.shields;
  let synthesized = false;
  if (frag >= 3 && shields < 3) {
    frag -= 3;
    shields += 1;
    synthesized = true;
  }
  db.prepare('UPDATE users SET energy = energy + ?, shield_fragments = ?, shields = ? WHERE id = ?')
    .run(card.energy, frag, shields, req.userId);
  res.json({ energy: card.energy, fragments: frag, shields, synthesized, card });
});

// 今日预告
r.get('/today/preview', authMiddleware, (req: AuthedRequest, res) => {
  const tasks = pickToday(req.userId!) as any[];
  const enriched = tasks.map(t => ({ ...t, card: TASK_CARDS.find(c => c.id === t.card_id) }));
  const totalEnergy = enriched.reduce((s, t) => s + (t.card?.energy || 0), 0);
  const completed = enriched.filter(t => t.completed).length;
  res.json({
    tasks: enriched,
    completed,
    total: enriched.length,
    rewardEnergy: totalEnergy,
    rewardFragment: 1,
    rewardGrowthPct: Math.round(totalEnergy / 10),
  });
});

export default r;
