import { db } from './db';

const VIRTUAL_USERS = [
  { nickname: '晨曦小鹿', preference: 'run', avatar: '🦌' },
  { nickname: '月下听风', preference: 'yoga', avatar: '🌙' },
  { nickname: '浪花骑士', preference: 'swim', avatar: '🌊' },
  { nickname: '山野追风', preference: 'cycle', avatar: '🚴' },
  { nickname: '铁壁阿星', preference: 'gym', avatar: '💪' },
  { nickname: '星河漫步', preference: 'walk', avatar: '✨' },
  { nickname: '灌篮少年', preference: 'ball', avatar: '🏀' },
  { nickname: '暮色行者', preference: 'walk', avatar: '🌆' },
];

export function seed() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (count.c > 0) return;
  const insert = db.prepare(
    'INSERT INTO users (nickname, password, avatar, preference, energy) VALUES (?, ?, ?, ?, ?)'
  );
  for (const u of VIRTUAL_USERS) {
    insert.run(u.nickname, '123456', u.avatar, u.preference, Math.floor(Math.random() * 3000) + 200);
  }
  console.log('[seed] virtual users created');
}
