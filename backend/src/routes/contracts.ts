import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthedRequest } from '../auth';
import { todayStr } from '../utils';

const r = Router();

function loadContract(id: number) {
  const c = db.prepare('SELECT * FROM contracts WHERE id = ?').get(id) as any;
  if (!c) return null;
  c.weekdays = JSON.parse(c.weekdays);
  c.fulfilled_days = JSON.parse(c.fulfilled_days);
  c.breached_days = JSON.parse(c.breached_days);
  return c;
}

r.get('/mine', authMiddleware, (req: AuthedRequest, res) => {
  const rows = db.prepare(`
    SELECT c.*, ua.nickname as user_a_name, ua.avatar as user_a_avatar,
           ub.nickname as user_b_name, ub.avatar as user_b_avatar
    FROM contracts c
    JOIN users ua ON ua.id = c.user_a
    JOIN users ub ON ub.id = c.user_b
    WHERE c.user_a = ? OR c.user_b = ?
    ORDER BY c.created_at DESC
  `).all(req.userId, req.userId) as any[];
  res.json(rows.map(c => ({
    ...c,
    weekdays: JSON.parse(c.weekdays),
    fulfilled_days: JSON.parse(c.fulfilled_days),
    breached_days: JSON.parse(c.breached_days),
  })));
});

r.post('/create', authMiddleware, (req: AuthedRequest, res) => {
  const { name, partner_id, sport_type, weekdays, duration_days, time_slot } = req.body || {};
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + Number(duration_days));
  const info = db.prepare(`
    INSERT INTO contracts (name, user_a, user_b, sport_type, weekdays, duration_days, start_date, end_date, time_slot)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, req.userId, partner_id, sport_type, JSON.stringify(weekdays), duration_days, todayStr(start), todayStr(end), time_slot || '');
  res.json({ id: Number(info.lastInsertRowid) });
});

// 检查履约：今天该用户是否在合约要求的运动类型完成了
r.post('/checkin/:id', authMiddleware, (req: AuthedRequest, res) => {
  const c = loadContract(Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'not found' });
  const today = todayStr();
  const dow = new Date().getDay(); // 0=Sun
  const required = c.weekdays.includes(dow);
  if (!required) return res.json({ ok: true, message: '今日无需履约' });

  const hasRecord = db.prepare(`
    SELECT 1 FROM sport_records
    WHERE user_id = ? AND type = ?
      AND date(created_at, 'unixepoch', 'localtime') = ?
    LIMIT 1
  `).get(req.userId, c.sport_type, today);

  if (hasRecord) {
    if (!c.fulfilled_days.includes(today)) {
      c.fulfilled_days.push(today);
      const newStreak = c.streak + 1;
      db.prepare('UPDATE contracts SET fulfilled_days = ?, streak = ? WHERE id = ?')
        .run(JSON.stringify(c.fulfilled_days), newStreak, c.id);
      if (newStreak >= 7) {
        db.prepare('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?), (?, ?)').run(
          c.user_a, 'social_bond', c.user_b, 'social_bond'
        );
      }
    }
    return res.json({ ok: true, fulfilled: true });
  }
  return res.json({ ok: true, fulfilled: false });
});

// 模拟违约
r.post('/breach/:id', authMiddleware, (req: AuthedRequest, res) => {
  const c = loadContract(Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'not found' });
  // 检查护盾
  const u = db.prepare('SELECT shields FROM users WHERE id = ?').get(req.userId) as any;
  if (u.shields > 0) {
    db.prepare('UPDATE users SET shields = shields - 1 WHERE id = ?').run(req.userId);
    return res.json({ shielded: true, message: '护盾抵挡了违约！' });
  }
  const today = todayStr();
  if (!c.breached_days.includes(today)) c.breached_days.push(today);
  db.prepare('UPDATE contracts SET breached_days = ?, streak = 0 WHERE id = ?')
    .run(JSON.stringify(c.breached_days), c.id);
  res.json({ shielded: false, message: '违约！需要救回小人' });
});

// 补救违约
r.post('/rescue/:id', authMiddleware, (req: AuthedRequest, res) => {
  const c = loadContract(Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'not found' });
  // 移除最近一次违约
  c.breached_days.pop();
  db.prepare('UPDATE contracts SET breached_days = ? WHERE id = ?').run(JSON.stringify(c.breached_days), c.id);
  res.json({ ok: true });
});

export default r;
