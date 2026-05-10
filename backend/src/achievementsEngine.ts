import { db } from './db';
import { todayStr } from './utils';

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  category: 'frequency' | 'intensity' | 'scene' | 'streak' | 'social';
  icon: string;
}

export const BADGES: BadgeDef[] = [
  { id: 'freq_7', name: '初心远行者', desc: '累计运动 7 天', category: 'frequency', icon: '🌱' },
  { id: 'freq_30', name: '坚毅长征', desc: '累计运动 30 天', category: 'frequency', icon: '🌿' },
  { id: 'freq_100', name: '世界树之子', desc: '累计运动 100 天', category: 'frequency', icon: '🌳' },
  { id: 'intense_500', name: '微光迸发', desc: '单次获得 500 能量', category: 'intensity', icon: '⚡' },
  { id: 'intense_1000', name: '心流之王', desc: '单次获得 1000 能量', category: 'intensity', icon: '🔥' },
  { id: 'scene_night', name: '深夜狩猎者', desc: '在 22:00-6:00 完成运动', category: 'scene', icon: '🌙' },
  { id: 'scene_rain', name: '风雪共路人', desc: '雨天坚持运动', category: 'scene', icon: '🌧️' },
  { id: 'streak_3', name: '微星连珠', desc: '连续运动 3 天', category: 'streak', icon: '✨' },
  { id: 'streak_7', name: '七日不熄', desc: '连续运动 7 天', category: 'streak', icon: '⭐' },
  { id: 'streak_21', name: '习惯炼成', desc: '连续运动 21 天', category: 'streak', icon: '💫' },
  { id: 'streak_30', name: '月行者', desc: '连续运动 30 天', category: 'streak', icon: '🌟' },
  { id: 'social_bond', name: '羁绊之光', desc: '与搭子连续履约 7 天', category: 'social', icon: '🤝' },
];

function uniqueDays(userId: number) {
  const rows = db.prepare(`SELECT DISTINCT date(created_at, 'unixepoch', 'localtime') as d FROM sport_records WHERE user_id = ? ORDER BY d DESC`).all(userId) as { d: string }[];
  return rows.map(r => r.d);
}

function maxStreak(days: string[]) {
  if (!days.length) return 0;
  const set = new Set(days);
  let best = 0;
  for (const d of days) {
    let len = 1;
    let cur = new Date(d);
    while (true) {
      cur.setDate(cur.getDate() - 1);
      const y = cur.toISOString().slice(0, 10);
      if (set.has(y)) len++;
      else break;
    }
    if (len > best) best = len;
  }
  return best;
}

// 计算每个徽章的 progress（0~1）和阈值描述，用于"即将解锁"展示
export function computeProgress(userId: number) {
  const days = uniqueDays(userId);
  const streak = maxStreak(days);
  const maxEnergy = (db.prepare('SELECT MAX(energy) as m FROM sport_records WHERE user_id = ?').get(userId) as any)?.m || 0;
  const map: Record<string, { current: number; target: number; hint: string }> = {
    freq_7: { current: days.length, target: 7, hint: `已累计 ${days.length}/7 天` },
    freq_30: { current: days.length, target: 30, hint: `已累计 ${days.length}/30 天` },
    freq_100: { current: days.length, target: 100, hint: `已累计 ${days.length}/100 天` },
    streak_3: { current: streak, target: 3, hint: `当前连续 ${streak}/3 天` },
    streak_7: { current: streak, target: 7, hint: `当前连续 ${streak}/7 天` },
    streak_21: { current: streak, target: 21, hint: `当前连续 ${streak}/21 天` },
    streak_30: { current: streak, target: 30, hint: `当前连续 ${streak}/30 天` },
    intense_500: { current: maxEnergy, target: 500, hint: `单次最高 ${maxEnergy}/500 能量` },
    intense_1000: { current: maxEnergy, target: 1000, hint: `单次最高 ${maxEnergy}/1000 能量` },
    scene_night: { current: 0, target: 1, hint: '在 22:00–06:00 完成一次运动' },
    scene_rain: { current: 0, target: 1, hint: '雨天坚持运动一次（首页可模拟）' },
    social_bond: { current: 0, target: 7, hint: '与搭子连续履约 7 天' },
  };
  return map;
}

export function evaluateAchievements(userId: number, ctx?: { type?: string; duration?: number; energy?: number; hour?: number }) {
  const owned = new Set((db.prepare('SELECT badge_id FROM achievements WHERE user_id = ?').all(userId) as any[]).map(r => r.badge_id));
  const unlocked: BadgeDef[] = [];
  const grant = (id: string) => {
    if (owned.has(id)) return;
    const b = BADGES.find(b => b.id === id);
    if (!b) return;
    db.prepare('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)').run(userId, id);
    owned.add(id);
    unlocked.push(b);
  };

  const days = uniqueDays(userId);
  if (days.length >= 7) grant('freq_7');
  if (days.length >= 30) grant('freq_30');
  if (days.length >= 100) grant('freq_100');

  const streak = maxStreak(days);
  if (streak >= 3) grant('streak_3');
  if (streak >= 7) grant('streak_7');
  if (streak >= 21) grant('streak_21');
  if (streak >= 30) grant('streak_30');

  if (ctx?.energy && ctx.energy >= 500) grant('intense_500');
  if (ctx?.energy && ctx.energy >= 1000) grant('intense_1000');
  if (ctx?.hour !== undefined && (ctx.hour >= 22 || ctx.hour < 6)) grant('scene_night');

  return unlocked;
}
