export const SPORT_COEFF: Record<string, number> = {
  walk: 1.0, run: 2.0, cycle: 1.5, swim: 2.5, ball: 2.0, gym: 1.8, yoga: 1.2, other: 1.0,
};

export function calcEnergy(type: string, duration: number) {
  const coeff = SPORT_COEFF[type] ?? 1.0;
  let multiplier = 1.0;
  if (duration >= 45) multiplier = 2.0;
  else if (duration >= 20) multiplier = 1.5;
  const base = duration * coeff;
  const energy = Math.round(base * multiplier);
  return { energy, multiplier, base: Math.round(base), critical: multiplier > 1 };
}

// 升级所需能量：当前等级 × 100
export function energyForNextLevel(level: number) {
  return level * 100;
}

// 总能量 → 等级
export function levelFromTotalEnergy(totalEnergy: number) {
  let lvl = 1;
  let used = 0;
  while (used + energyForNextLevel(lvl) <= totalEnergy) {
    used += energyForNextLevel(lvl);
    lvl++;
  }
  return { level: lvl, currentInLevel: totalEnergy - used, needForNext: energyForNextLevel(lvl) };
}

export function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
