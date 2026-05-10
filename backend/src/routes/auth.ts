import { Router } from 'express';
import { db } from '../db';
import { signToken } from '../auth';

const r = Router();

r.post('/register', (req, res) => {
  const { nickname, password } = req.body || {};
  if (!nickname || !password) return res.status(400).json({ error: 'missing fields' });
  const exists = db.prepare('SELECT id FROM users WHERE nickname = ?').get(nickname);
  if (exists) return res.status(409).json({ error: '昵称已存在' });
  const info = db.prepare('INSERT INTO users (nickname, password, avatar) VALUES (?, ?, ?)').run(
    nickname,
    password,
    '🌟'
  );
  const userId = Number(info.lastInsertRowid);
  res.json({ token: signToken(userId), userId });
});

r.post('/login', (req, res) => {
  const { nickname, password } = req.body || {};
  const u = db.prepare('SELECT * FROM users WHERE nickname = ? AND password = ?').get(nickname, password) as any;
  if (!u) return res.status(401).json({ error: '账号或密码错误' });
  res.json({ token: signToken(u.id), userId: u.id });
});

export default r;
