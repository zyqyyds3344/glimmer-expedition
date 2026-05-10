import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footprints, Bike, Waves, CircleDot, Dumbbell, Flower2, Activity, Sparkles, X, Wand2 } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { sportService, taskService } from '../services';
import { useToast } from '../lib/Toast';

const TYPES = [
  { id: 'run', name: '跑步', coef: 2.0, Icon: Activity },
  { id: 'walk', name: '步行', coef: 1.0, Icon: Footprints },
  { id: 'gym', name: '力量训练', coef: 1.8, Icon: Dumbbell },
  { id: 'yoga', name: '拉伸', coef: 1.2, Icon: Flower2 },
  { id: 'ball', name: '球类', coef: 2.0, Icon: CircleDot },
  { id: 'cycle', name: '骑行', coef: 1.5, Icon: Bike },
  { id: 'swim', name: '游泳', coef: 2.5, Icon: Waves },
  { id: 'other', name: '自定义', coef: 1.0, Icon: Sparkles },
];

const PRESET_DURATIONS = [5, 10, 20, 45];

const QUOTES = [
  '汗水是身体的微光，留住每一滴',
  '今日的脚步，是明日岛屿浮得更高的理由',
  '心流穿过，世界树就生长一寸',
  '凡走过，必留下光的痕迹',
  '强大不是终点，是过程里的每个回合',
];

export default function Sport() {
  const me = useUserStore(s => s.me)!;
  const refresh = useUserStore(s => s.refresh);
  const push = useToast(s => s.push);
  const [type, setType] = useState('run');
  const [duration, setDuration] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [preview, setPreview] = useState<{ completed: number; total: number } | null>(null);

  const load = () => sportService.list().then(setHistory);
  useEffect(() => {
    load();
    taskService.todayPreview().then(p => setPreview({ completed: p.completed, total: p.total })).catch(() => {});
  }, []);

  // AI 推荐：根据 onboarding 偏好、今日任务完成状态、最近记录 给一句推荐文案
  const recommendation = useMemo(() => {
    const onb = me.onboarding;
    const todayDone = preview ? preview.completed >= preview.total : false;
    const likeRun = onb?.prefs?.includes('跑步');
    const likeWalk = onb?.prefs?.includes('步行');
    const likeStretch = onb?.prefs?.includes('拉伸');
    if (todayDone) return {
      title: '今日任务已完成，加餐吗？',
      desc: '再加一次 20 分钟运动可触发心流暴击 1.5×。建议选你喜欢的运动类型。',
      type: likeRun ? 'run' : likeWalk ? 'walk' : 'yoga',
      minutes: 20,
    };
    if (me.energy < 50) return {
      title: '你今天还没收集到微光',
      desc: '建议完成 10 分钟课间快走，预计获得 50 微光。',
      type: 'walk',
      minutes: 10,
    };
    if (likeRun) return {
      title: '今天适合一次中强度跑步',
      desc: '20 分钟慊跑，触发心流暴击 1.5×，预计获得 60 微光。',
      type: 'run',
      minutes: 20,
    };
    if (likeStretch) return {
      title: '身体该柔软一下了',
      desc: '15 分钟拉伸，不出宿舍就能完成。',
      type: 'yoga',
      minutes: 15,
    };
    return {
      title: 'Lumi 推荐你今日走一走',
      desc: '10 分钟轻松快走，重启一下身体。',
      type: 'walk',
      minutes: 10,
    };
  }, [me, preview]);

  const adoptRec = () => {
    setType(recommendation.type);
    setDuration(recommendation.minutes);
    push({ title: '已采纳推荐', desc: '运动类型与时长已为你填好', icon: 'sparkle' });
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await sportService.record({ type, duration, hour: new Date().getHours() });
      setResult({ ...r, type, duration, quote: QUOTES[Math.floor(Math.random() * QUOTES.length)] });
      if (r.critical) {
        push({ title: `⚡心流暴击 ${r.multiplier}×`, desc: `获得 ${r.energy} 微光`, icon: 'sparkle' });
      } else {
        push({ title: `运动完成！+${r.energy} 微光`, icon: 'sparkle' });
      }
      if (r.newAchievements?.length) {
        for (const b of r.newAchievements) {
          push({ title: `🏅 解锁徽章：${b.name}`, desc: b.desc, icon: 'trophy' });
        }
      }
      await refresh();
      load();
    } finally { setSubmitting(false); }
  };

  const TypeIcon = TYPES.find(t => t.id === type)!.Icon;

  return (
    <div>
      <h2 className="font-display text-2xl text-gradient-gold mb-1">开始一次远征</h2>
      <p className="text-xs text-white/50 mb-4">记录一次真实运动，换取微光</p>

      {/* AI 今日推荐 */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 mb-4 border border-glimmer-gold/30"
        style={{ background: 'linear-gradient(135deg, rgba(156,107,255,0.15), rgba(255,216,107,0.10))' }}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-glimmer-gold" />
          <span className="text-xs text-glimmer-gold">Lumi 今日推荐</span>
        </div>
        <p className="text-sm text-white">{recommendation.title}</p>
        <p className="text-xs text-white/60 mt-1">{recommendation.desc}</p>
        <button onClick={adoptRec}
          className="mt-3 text-xs px-3 py-1.5 rounded-full bg-white/10 text-glimmer-gold hover:bg-glimmer-gold/20 inline-flex items-center gap-1">
          <Wand2 size={11} /> 采纳推荐
        </button>
      </motion.div>

      <div className="glass rounded-2xl p-4 mb-4">
        <p className="text-xs text-white/50 mb-2">选择运动类型</p>
        <div className="grid grid-cols-4 gap-2">
          {TYPES.map(({ id, name, Icon }) => (
            <button key={id} onClick={() => setType(id)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                type === id ? 'bg-glimmer-gold/20 text-glimmer-gold border border-glimmer-gold/50' : 'bg-white/5 text-white/70'
              }`}>
              <Icon size={20} />
              <span className="text-xs">{name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/50">运动时长</span>
          <span className="text-glimmer-gold font-display text-xl">{duration} 分钟</span>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {PRESET_DURATIONS.map(d => (
            <button key={d} onClick={() => setDuration(d)}
              className={`py-2 rounded-xl text-sm transition-all ${
                duration === d ? 'bg-gradient-to-r from-glimmer-gold/30 to-glimmer-purple/30 text-white border border-glimmer-gold/50' : 'bg-white/5 text-white/70'
              }`}>
              {d} 分{d === 20 ? ' ⚡' : d === 45 ? ' ⚡⚡' : ''}
            </button>
          ))}
        </div>
        <input type="range" min={3} max={90} value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          className="w-full accent-glimmer-gold" />
        <div className="flex justify-between text-[10px] text-white/30 mt-1">
          <span>3</span><span>20⚡</span><span>45⚡⚡</span><span>90</span>
        </div>
        {duration >= 45 && <p className="text-xs text-glimmer-gold mt-2">⚡⚡ 连续运动 ≥ 45 分，触发心流暴击 2.0×</p>}
        {duration >= 20 && duration < 45 && <p className="text-xs text-glimmer-gold mt-2">⚡ 连续运动 ≥ 20 分，触发心流暴击 1.5×</p>}
      </div>

      <button onClick={submit} disabled={submitting} className="btn btn-primary w-full">
        <TypeIcon size={18} /> {submitting ? '正在转化…' : '完成运动 · 灌溉世界树'}
      </button>

      {/* 历史记录 */}
      <h3 className="text-sm text-white/60 mt-6 mb-2">最近记录</h3>
      {history.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-6">还没有记录，先来一次吧</p>
      ) : (
        <div className="space-y-2">
          {history.slice(0, 8).map(h => {
            const T = TYPES.find(t => t.id === h.type);
            const Icon = T?.Icon || Activity;
            return (
              <div key={h.id} className="glass rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm">{T?.name} · {h.duration} 分钟</p>
                    <p className="text-[10px] text-white/40">{new Date(h.created_at * 1000).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-glimmer-gold text-sm">+{h.energy}</p>
                  {h.is_critical ? <p className="text-[10px] text-glimmer-purple">⚡心流</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 心流暴击艺术卡片 / 普通能量动画 */}
      <AnimatePresence>
        {result && <ResultCard result={result} onClose={() => setResult(null)} />}
      </AnimatePresence>
    </div>
  );
}

function ResultCard({ result, onClose }: { result: any; onClose: () => void }) {
  const TypeMeta = TYPES.find(t => t.id === result.type)!;
  const Icon = TypeMeta.Icon;
  const isCrit = result.critical;

  const downloadCard = () => {
    const card = document.getElementById('art-card');
    if (!card) return;
    // 提示用户截图（简化方案，避免引入 html2canvas）
    alert('长按 / 右键卡片即可保存为图片');
  };

  return (
    <motion.div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        id="art-card"
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.7, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
        className={`relative rounded-3xl p-6 w-full max-w-sm overflow-hidden ${isCrit ? 'bg-gradient-to-br from-glimmer-purple via-glimmer-gold to-glimmer-blue' : 'glass'}`}
        style={isCrit ? {} : { background: 'linear-gradient(135deg, #161430, #0B0A1F)' }}
      >
        <button className="absolute top-3 right-3 text-white/70" onClick={onClose}><X size={18} /></button>

        {isCrit && <div className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
          style={{ background: 'radial-gradient(circle at 30% 30%, #fff, transparent 60%)' }} />}

        <div className="relative z-10 text-center">
          <p className="text-xs tracking-widest opacity-70">
            {isCrit ? `⚡ ${result.multiplier}× 心流暴击 ⚡` : '微光记录'}
          </p>
          <Icon size={48} className="mx-auto my-4 text-white drop-shadow-lg" />
          <p className="font-display text-4xl text-white drop-shadow">+{result.energy}</p>
          <p className="text-xs opacity-70 mt-1">{TypeMeta.name} · {result.duration} 分钟</p>

          <div className="my-4 h-px bg-white/30" />
          <p className="font-display text-base leading-relaxed">"{result.quote}"</p>
          <p className="text-[10px] opacity-50 mt-3">— 微光远征 · {new Date().toLocaleDateString()}</p>

          {result.newAchievements?.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-black/30">
              <p className="text-xs mb-1">🏅 解锁成就</p>
              {result.newAchievements.map((b: any) => (
                <p key={b.id} className="text-sm">{b.icon} {b.name}</p>
              ))}
            </div>
          )}

          <button onClick={downloadCard} className="btn btn-ghost w-full mt-5 text-sm">保存这张卡片</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
