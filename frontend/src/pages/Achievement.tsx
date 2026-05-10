import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { achievementService, Badge } from '../services';

const CATS = [
  { id: 'all', name: '全部' },
  { id: 'frequency', name: '频次' },
  { id: 'intensity', name: '强度' },
  { id: 'scene', name: '场景' },
  { id: 'streak', name: '连续' },
  { id: 'social', name: '社交' },
];

export default function Achievement() {
  const [list, setList] = useState<Badge[]>([]);
  const [cat, setCat] = useState('all');
  const [active, setActive] = useState<Badge | null>(null);

  useEffect(() => { achievementService.list().then(setList); }, []);

  const filtered = cat === 'all' ? list : list.filter(b => b.category === cat);
  const unlockedCount = list.filter(b => b.unlocked).length;

  // 即将解锁：未解锁中比率最高的前 3 条
  const soon = useMemo(() => {
    return list.filter(b => !b.unlocked && b.ratio > 0)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 3);
  }, [list]);

  return (
    <div>
      <h2 className="font-display text-2xl text-gradient-gold mb-1">徽章墙</h2>
      <p className="text-xs text-white/50 mb-4">已解锁 {unlockedCount} / {list.length}</p>

      {/* 即将解锁 */}
      {soon.length > 0 && (
        <div className="rounded-2xl p-4 mb-4 border border-glimmer-gold/30"
          style={{ background: 'linear-gradient(135deg, rgba(255,216,107,0.08), rgba(156,107,255,0.08))' }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-glimmer-gold" />
            <span className="text-xs text-glimmer-gold">即将解锁</span>
          </div>
          <div className="space-y-2">
            {soon.map(b => (
              <button key={b.id} onClick={() => setActive(b)}
                className="w-full flex items-center gap-3 text-left">
                <div className="text-2xl grayscale opacity-60">{b.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80">{b.name}</p>
                  <div className="h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-glimmer-gold to-glimmer-purple"
                      initial={{ width: 0 }} animate={{ width: `${b.ratio * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">{b.hint}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        {CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
              cat === c.id ? 'bg-glimmer-gold/20 text-glimmer-gold' : 'bg-white/5 text-white/60'
            }`}>{c.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {filtered.map((b, i) => (
          <motion.button key={b.id} layout onClick={() => setActive(b)}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-2 overflow-hidden text-center ${
              b.unlocked ? 'bg-gradient-to-br from-glimmer-purple/30 via-glimmer-gold/20 to-glimmer-blue/30 border border-glimmer-gold/40' : 'bg-white/5 border border-white/5'
            }`}>
            {b.unlocked && (
              <motion.div className="absolute inset-0 pointer-events-none"
                animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,216,107,0.4), transparent 70%)' }} />
            )}
            <div className={`text-3xl ${b.unlocked ? '' : 'grayscale opacity-30'}`}>{b.icon}</div>
            <p className={`text-xs mt-1 ${b.unlocked ? 'text-glimmer-gold' : 'text-white/40'}`}>{b.name}</p>
            {!b.unlocked && b.ratio > 0 && (
              <div className="h-0.5 bg-white/10 rounded-full mt-1.5 overflow-hidden w-full">
                <div className="h-full bg-glimmer-gold/50" style={{ width: `${b.ratio * 100}%` }} />
              </div>
            )}
            {!b.unlocked && <Lock size={10} className="absolute top-2 right-2 text-white/30" />}
          </motion.button>
        ))}
      </div>

      {active && <BadgeDetail b={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function BadgeDetail({ b, onClose }: { b: Badge; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div onClick={e => e.stopPropagation()}
        initial={{ y: 60 }} animate={{ y: 0 }}
        className={`rounded-3xl p-6 w-full max-w-sm text-center relative overflow-hidden ${
          b.unlocked ? 'bg-gradient-to-br from-glimmer-purple/40 via-glimmer-gold/30 to-glimmer-blue/40 border border-glimmer-gold/40' : 'glass'
        }`}>
        {b.unlocked && (
          <motion.div className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,216,107,0.5), transparent 70%)' }} />
        )}
        <div className={`text-6xl my-4 ${b.unlocked ? '' : 'grayscale opacity-40'}`}>{b.icon}</div>
        <p className="font-display text-xl text-gradient-gold">{b.name}</p>
        <p className="text-xs text-white/60 mt-1">{b.desc}</p>
        <div className="mt-5 p-3 rounded-xl bg-black/30 text-left">
          <p className="text-[11px] text-white/50">解锁进度</p>
          <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-glimmer-gold to-glimmer-purple"
              initial={{ width: 0 }} animate={{ width: `${b.ratio * 100}%` }} />
          </div>
          <p className="text-xs text-white/70 mt-2">{b.hint || `${b.current}/${b.target}`}</p>
        </div>
        {b.unlocked && (
          <p className="text-[10px] text-white/40 mt-3">解锁于 {b.unlocked_at ? new Date(b.unlocked_at * 1000).toLocaleDateString() : ''}</p>
        )}
        <button onClick={onClose} className="btn btn-ghost w-full mt-4">关闭</button>
      </motion.div>
    </motion.div>
  );
}
