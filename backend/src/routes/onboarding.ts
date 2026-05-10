import { Router } from 'express';
import { db } from '../db';
import { authMiddleware, AuthedRequest } from '../auth';

const r = Router();

interface OnboardingInput {
  goal: string;        // 减脂 / 体测冲刺 / 放松减压 / 塑形 / 社交运动
  level: string;       // 几乎不运动 / 偶尔运动 / 经常运动
  minutes: number;     // 5 / 15 / 30
  scenes: string[];    // 宿舍 / 操场 / 图书馆 / 健身房 / 校园道路
  prefs: string[];     // 跑步 / 步行 / 力量训练 / 拉伸 / 球类
}

interface PlanDay {
  day: number;
  title: string;
  task: string;
  minutes: number;
  energy: number;
  type: string;
  completed?: boolean;
}

// 奇幻世界观 7 天计划生成
function generatePlan(o: OnboardingInput): PlanDay[] {
  const m = o.minutes;
  const isLight = o.level === '几乎不运动';
  const dorm = o.scenes.includes('宿舍');
  const field = o.scenes.includes('操场') || o.scenes.includes('校园道路');
  const lib = o.scenes.includes('图书馆');
  const likeRun = o.prefs.includes('跑步');
  const likeWalk = o.prefs.includes('步行');
  const likeStretch = o.prefs.includes('拉伸');

  const safeMin = (base: number) => Math.max(5, isLight ? Math.min(base, m) : base);

  return [
    {
      day: 1,
      title: '点亮第一缕微光',
      task: lib ? '课间快走 10 分钟（围绕图书馆）' : '课间快走 10 分钟',
      minutes: safeMin(10), energy: 50, type: 'walk',
    },
    {
      day: 2,
      title: '唤醒幼苗',
      task: dorm || likeStretch ? '宿舍拉伸 8 分钟' : '轻松拉伸 8 分钟',
      minutes: safeMin(8), energy: 35, type: 'yoga',
    },
    {
      day: 3,
      title: '收集星尘',
      task: field && likeRun ? '操场慢跑 15 分钟' : likeWalk ? '校园快走 15 分钟' : '原地踏步 15 分钟',
      minutes: safeMin(15), energy: 60, type: likeRun && field ? 'run' : 'walk',
    },
    {
      day: 4,
      title: '恢复之雨',
      task: '轻松散步 3000 步',
      minutes: safeMin(20), energy: 40, type: 'walk',
    },
    {
      day: 5,
      title: '心流试炼',
      task: m >= 30 ? '连续运动 20 分钟，触发心流暴击' : '连续运动 20 分钟（可拆 2×10）',
      minutes: 20, energy: 90, type: likeRun ? 'run' : 'walk',
    },
    {
      day: 6,
      title: '搭子契约',
      task: '邀请 1 位同学一起完成今日任意运动',
      minutes: safeMin(15), energy: 55, type: 'other',
    },
    {
      day: 7,
      title: '微光复盘',
      task: '完成一次轻运动并领取本周徽章',
      minutes: safeMin(10), energy: 45, type: 'walk',
    },
  ];
}

r.post('/submit', authMiddleware, (req: AuthedRequest, res) => {
  const data = req.body as OnboardingInput;
  if (!data?.goal) return res.status(400).json({ error: 'invalid' });
  const plan = generatePlan(data);
  db.prepare('UPDATE users SET onboarding = ?, plan = ? WHERE id = ?').run(
    JSON.stringify(data), JSON.stringify(plan), req.userId
  );
  res.json({ onboarding: data, plan });
});

r.get('/plan', authMiddleware, (req: AuthedRequest, res) => {
  const u = db.prepare('SELECT onboarding, plan FROM users WHERE id = ?').get(req.userId) as any;
  res.json({
    onboarding: u?.onboarding ? JSON.parse(u.onboarding) : null,
    plan: u?.plan ? JSON.parse(u.plan) : null,
  });
});

r.post('/plan/complete/:day', authMiddleware, (req: AuthedRequest, res) => {
  const day = Number(req.params.day);
  const u = db.prepare('SELECT plan FROM users WHERE id = ?').get(req.userId) as any;
  if (!u?.plan) return res.status(404).json({ error: 'no plan' });
  const plan: PlanDay[] = JSON.parse(u.plan);
  const target = plan.find(p => p.day === day);
  if (!target) return res.status(404).json({ error: 'day not found' });
  target.completed = true;
  db.prepare('UPDATE users SET plan = ? WHERE id = ?').run(JSON.stringify(plan), req.userId);
  res.json({ plan });
});

export default r;
