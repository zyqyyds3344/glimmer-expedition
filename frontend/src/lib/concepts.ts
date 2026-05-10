// 全局产品概念与文案常量（统一术语）
export const CONCEPT = {
  energy: '微光',
  card: '能量卡片',
  shield: '护盾',
  worldTree: '世界树',
  flowCrit: '心流暴击',
  lumi: '微光精灵 Lumi',
  contract: '微光之约',
  quickTeam: '即刻发车',
  expedition: '微光远征',
};

// 运动类型映射
export const SPORT_TYPES: Record<string, { name: string; coef: number }> = {
  walk: { name: '步行', coef: 1.0 },
  run: { name: '跑步', coef: 2.0 },
  cycle: { name: '骑行', coef: 1.5 },
  swim: { name: '游泳', coef: 2.5 },
  ball: { name: '球类', coef: 2.0 },
  gym: { name: '力量训练', coef: 1.8 },
  yoga: { name: '拉伸', coef: 1.2 },
  other: { name: '其他', coef: 1.0 },
};

// 阶段中文
export const STAGE_NAME: Record<string, string> = {
  sprout: '幼苗期',
  growth: '成长期',
  legend: '传说期',
};

// 三阶段成长反馈文案
export function stageFeedback(level: number, energyToNext: number): string {
  if (level >= 100) return '世界树已进入传说期，每一片叶子都在发光。';
  if (level >= 51) return `成长期 · 还需 ${energyToNext} 微光，世界树将更加挺拔。`;
  if (level >= 30) return `世界树还需要 ${energyToNext} 微光进入成长期。`;
  return `幼苗期 · 完成今日能量卡，可让岛屿降下一场微光雨。`;
}

// 心流暴击说明
export function flowHint(minutes: number): { multiplier: number; text: string } | null {
  if (minutes >= 45) return { multiplier: 2.0, text: '⚡⚡ 心流暴击 2.0×' };
  if (minutes >= 20) return { multiplier: 1.5, text: '⚡ 心流暴击 1.5×' };
  return null;
}
