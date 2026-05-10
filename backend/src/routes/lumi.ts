import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthedRequest } from '../auth';

const r = Router();

// 快捷问题 + 温和鼓励式回复（mock AI）
export const LUMI_PROMPTS = [
  { id: 'lazy', q: '今天不想运动怎么办？' },
  { id: 'dorm5', q: '给我一个 5 分钟宿舍训练' },
  { id: 'pe', q: '体测快到了怎么练？' },
  { id: 'recover', q: '我已经中断 3 天了，怎么恢复？' },
  { id: 'replace_run', q: '跑步太累，有替代方案吗？' },
  { id: 'today_intensity', q: '今天适合高强度还是轻运动？' },
];

// 每条回复包含主回复文案 + 可选的"采纳建议"动作（替换今日任务为低门槛任务）
const REPLIES: Record<string, { text: string; action?: { type: 'soften_today'; tasks: { name: string; minutes: number; energy: number; icon: string }[] } }> = {
  lazy: {
    text: '没关系，今天可以只点亮一点点微光。试试这件最小的事：从椅子上站起来走一圈，然后做 10 个深蹲。完成它，你就赢了今天。',
    action: {
      type: 'soften_today',
      tasks: [
        { name: '原地踏步 2 分钟', minutes: 2, energy: 15, icon: '🚶' },
        { name: '舒展拉伸 3 分钟', minutes: 3, energy: 20, icon: '🧘' },
      ],
    },
  },
  dorm5: {
    text: '5 分钟宿舍微训练给你：开合跳 30 秒 ×3 + 深蹲 15 个 ×2 + 俯卧撑 10 个 ×2。组间休息 30 秒。完成可获得 35 微光。',
  },
  pe: {
    text: '体测三件套节奏：1) 800/1000 米 → 操场慢跑 15 分钟，每周 2 次；2) 立定跳远 → 深蹲 + 弓步，每周 3 次；3) 仰卧起坐 → 平板支撑 1 分钟 ×3。 重点是先搭建节奏，不追求一次到位。',
  },
  recover: {
    text: '没关系，中断不代表失败。今天只需要完成一个 5 分钟恢复任务：原地踏步 2 分钟 + 拉伸 3 分钟。重新开始本身就是一次胜利。我可以帮你把今日任务降低到恢复模式。',
    action: {
      type: 'soften_today',
      tasks: [
        { name: '原地踏步 2 分钟', minutes: 2, energy: 15, icon: '🚶' },
        { name: '颈肩拉伸 3 分钟', minutes: 3, energy: 20, icon: '🧘' },
      ],
    },
  },
  replace_run: {
    text: '不喜欢跑没关系。可以试：快走 20 分钟（强度比慢跑温柔很多），或者跳绳 5 分钟 ×3，或者爬楼 10 分钟。这些一样能积累微光，也能解锁连续打卡徽章。',
  },
  today_intensity: {
    text: '看你今日状态：精力一般 → 推荐轻运动（10 分钟快走 + 拉伸）；精力充沛 → 推荐 20 分钟连续运动（触发 1.5× 心流暴击）。如果不确定，就先做 5 分钟，做完再决定要不要继续。',
  },
};

r.get('/prompts', authMiddleware, (_req, res) => {
  res.json(LUMI_PROMPTS);
});

r.post('/ask', authMiddleware, (req: AuthedRequest, res) => {
  const { id, text } = req.body || {};
  // 优先 id，否则模糊关键词
  if (id && REPLIES[id]) {
    return res.json({ reply: REPLIES[id], promptId: id });
  }
  const t = (text || '').toString();
  let matched: string | null = null;
  if (/不想|懒|累/.test(t)) matched = 'lazy';
  else if (/5\s*分钟|宿舍/.test(t)) matched = 'dorm5';
  else if (/体测|跳远|仰卧/.test(t)) matched = 'pe';
  else if (/中断|断了|恢复/.test(t)) matched = 'recover';
  else if (/跑步|代替|替代/.test(t)) matched = 'replace_run';
  else if (/强度|今天|状态/.test(t)) matched = 'today_intensity';
  if (matched) return res.json({ reply: REPLIES[matched], promptId: matched });
  res.json({
    reply: {
      text: '我听到啦。今天不用追求完美，挑一件你最容易做到的：3 分钟拉伸、500 步散步、一组深蹲。完成最小动作，世界树就长一点点。',
    },
    promptId: null,
  });
});

// "采纳 Lumi 建议" → 替换今日任务为温和恢复任务
r.post('/adopt-soften', authMiddleware, (req: AuthedRequest, res) => {
  const today = new Date().toISOString().slice(0, 10);
  // 标记现有未完成任务为完成度低门槛：这里采用方案：将 daily_tasks 全部清空并重写为软任务
  db.prepare('DELETE FROM daily_tasks WHERE user_id = ? AND date = ?').run(req.userId, today);
  const soft = ['stretch7', 'classwalk', 'wallsquat'];
  for (const id of soft) {
    db.prepare('INSERT INTO daily_tasks (user_id, card_id, date) VALUES (?, ?, ?)').run(req.userId, id, today);
  }
  res.json({ ok: true, tasks: soft });
});

export default r;
