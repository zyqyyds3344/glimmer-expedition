import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, Heart, Trophy, Sticker, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useUserStore } from '../store/userStore';
import { sportService, achievementService, socialService } from '../services';

const SPORT_NAMES: Record<string, string> = {
  walk: '步行', run: '跑步', cycle: '骑行', swim: '游泳', ball: '球类', gym: '健身', yoga: '瑜伽', other: '其他',
};
const COLORS = ['#FFD86B', '#9C6BFF', '#5BA8FF', '#FF9C5B', '#7aaa6a', '#e773c1', '#5be7c1', '#aaa'];

const SPIRITS: Record<string, { emoji: string; name: string; desc: string }> = {
  walk: { emoji: '🌬️', name: '清风步灵', desc: '伴你游走每一寸路面' },
  run: { emoji: '🌅', name: '晨曦露精灵', desc: '迎着第一缕光奔跑' },
  cycle: { emoji: '🌪️', name: '旋风骑士', desc: '风从车辐中诞生' },
  swim: { emoji: '🌊', name: '水韵灵', desc: '在每一次划水中重生' },
  ball: { emoji: '🔥', name: '炽焰跃灵', desc: '燃烧的瞬间最闪耀' },
  gym: { emoji: '⛓️', name: '铁魄之灵', desc: '锤炼出钢铁之心' },
  yoga: { emoji: '🪷', name: '莲息仙子', desc: '一呼一吸都是道场' },
  other: { emoji: '✨', name: '微光散灵', desc: '万物皆可化光' },
};

export default function Profile() {
  const me = useUserStore(s => s.me)!;
  const logout = useUserStore(s => s.logout);
  const nav = useNavigate();
  const [stats, setStats] = useState<any>({ byType: {}, byDay: {} });
  const [achs, setAchs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    sportService.stats().then(setStats);
    achievementService.list().then(setAchs);
    socialService.myContracts().then(setContracts);
    sportService.list().then(setHistory);
  }, []);

  // 身份资产统计
  const totalDays = useMemo(() => new Set(history.map(h => new Date(h.created_at * 1000).toISOString().slice(0, 10))).size, [history]);
  const totalMinutes = history.reduce((s, h) => s + (h.duration || 0), 0);
  const flowCards = history.filter(h => h.is_critical).length;

  const pieData = Object.entries(stats.byType || {}).map(([k, v]) => ({ name: SPORT_NAMES[k] || k, value: v as number, key: k }));
  const days = Object.keys(stats.byDay || {}).sort().slice(-14);
  const lineData = days.map(d => ({ date: d.slice(5), energy: stats.byDay[d] }));

  const spirit = SPIRITS[me.preference || 'other'];
  const unlockedAchs = achs.filter(a => a.unlocked);
  const title = me.title || (me.level >= 100 ? '传说远征者' : me.level >= 51 ? '坚毅远行者' : me.level >= 10 ? '初心探光者' : '微光新生');

  return (
    <div>
      {/* 角色主页头 */}
      <div className="relative rounded-3xl p-5 mb-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(156,107,255,0.25), rgba(255,216,107,0.15), rgba(91,168,255,0.20))' }}>
        <motion.div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle, rgba(255,216,107,0.6), transparent 70%)' }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{me.avatar || '🌟'}</div>
            <div>
              <p className="font-display text-xl text-white">{me.nickname}</p>
              <p className="text-xs text-glimmer-gold mt-0.5">· {title} ·</p>
              <p className="text-[10px] text-white/60 mt-0.5">Lv.{me.level} {me.stageName} · 累计 {me.energy} 微光</p>
            </div>
          </div>
          <button onClick={logout} className="text-white/40 hover:text-red-300"><LogOut size={18} /></button>
        </div>
      </div>

      {/* 身份资产总览 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <AssetCell icon="🌿" label="精灵" value={spirit.name.replace(/[^\u4e00-\u9fa5]/g, '').slice(0, 2) || '精灵'} />
        <AssetCell icon="🏖️" label="岛屿" value={me.stageName} />
        <AssetCell icon="🏅" label="徽章" value={`${unlockedAchs.length}/${achs.length}`} />
        <AssetCell icon="🛡️" label="护盾" value={`${me.shields}张`} />
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <AssetCell icon="📆" label="运动天数" value={`${totalDays}天`} />
        <AssetCell icon="⏱️" label="总时长" value={`${totalMinutes}分`} />
        <AssetCell icon="⚡" label="心流卡" value={`${flowCards}张`} />
        <AssetCell icon="🤝" label="契约" value={`${contracts.length}份`} />
      </div>

      {/* 微光精灵 */}
      <div className="glass rounded-2xl p-4 mb-4">
        <p className="text-xs text-white/50 mb-2 flex items-center gap-1"><Sparkles size={12} /> 你的微光精灵</p>
        <div className="flex items-center gap-3">
          <motion.div className="text-5xl" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            {spirit.emoji}
          </motion.div>
          <div>
            <p className="font-display">{spirit.name}</p>
            <p className="text-xs text-white/50">{spirit.desc}</p>
          </div>
        </div>
      </div>

      {/* 统计 */}
      {pieData.length > 0 && (
        <div className="glass rounded-2xl p-4 mb-4">
          <p className="text-xs text-white/50 mb-2">运动类型分布</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--tooltip-text)' }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
                labelStyle={{ color: 'var(--tooltip-text)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {lineData.length > 0 && (
        <div className="glass rounded-2xl p-4 mb-4">
          <p className="text-xs text-white/50 mb-2">近 14 天能量趋势</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--tooltip-text)' }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
                labelStyle={{ color: 'var(--tooltip-text)' }} />
              <Line type="monotone" dataKey="energy" stroke="#FFD86B" strokeWidth={2} dot={{ fill: '#FFD86B' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 羁绊 */}
      <div className="glass rounded-2xl p-4 mb-4">
        <p className="text-xs text-white/50 mb-2 flex items-center gap-1"><Heart size={12} /> 羁绊搭子（{contracts.length}）</p>
        {contracts.length === 0 ? (
          <p className="text-xs text-white/30">还没有羁绊</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto">
            {contracts.map(c => {
              const isA = c.user_a === me.id;
              return (
                <div key={c.id} className="text-center min-w-[60px]">
                  <div className="text-2xl">{isA ? c.user_b_avatar : c.user_a_avatar}</div>
                  <p className="text-[10px] text-white/60 truncate">{isA ? c.user_b_name : c.user_a_name}</p>
                  <p className="text-[10px] text-glimmer-gold">🔥{c.streak}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 心流艺术卡画廊 */}
      {flowCards > 0 && (
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/50 flex items-center gap-1"><Sticker size={12} /> 心流艺术卡画廊</p>
            <span className="text-[10px] text-glimmer-gold">{flowCards} 张</span>
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
            {history.filter(h => h.is_critical).slice(0, 8).map(h => (
              <div key={h.id} className="flex-shrink-0 w-20 h-24 rounded-xl p-2 text-center"
                style={{ background: 'linear-gradient(135deg, #9C6BFF, #FFD86B, #5BA8FF)' }}>
                <p className="text-[10px] text-white/90">⚡⚡ {h.multiplier}×</p>
                <p className="font-display text-base text-white mt-1">+{h.energy}</p>
                <p className="text-[9px] text-white/80 mt-1">{SPORT_NAMES[h.type]}</p>
                <p className="text-[9px] text-white/70 mt-0.5">{h.duration}分</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 已解锁徽章 */}
      <button onClick={() => nav('/achievement')}
        className="glass rounded-2xl p-4 mb-4 w-full text-left">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-white/50 flex items-center gap-1"><Trophy size={12} /> 解锁徽章（{unlockedAchs.length}/{achs.length}）</p>
          <ChevronRight size={14} className="text-white/40" />
        </div>
        {unlockedAchs.length === 0 ? (
          <p className="text-xs text-white/30">尚未解锁，继续运动！</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {unlockedAchs.slice(0, 8).map(b => (
              <div key={b.id} className="px-2 py-1 rounded-lg bg-glimmer-gold/10 text-xs text-glimmer-gold">
                {b.icon} {b.name}
              </div>
            ))}
            {unlockedAchs.length > 8 && <span className="text-[10px] text-white/40 px-2 py-1">+{unlockedAchs.length - 8}</span>}
          </div>
        )}
      </button>
    </div>
  );
}

function AssetCell({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-2 text-center">
      <div className="text-2xl">{icon}</div>
      <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
      <p className="text-xs text-glimmer-gold mt-0.5 truncate">{value}</p>
    </div>
  );
}
