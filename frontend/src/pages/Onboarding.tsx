import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { onboardingService, OnboardingInput, PlanDay } from '../services';
import { useUserStore } from '../store/userStore';
import Starfield from '../components/Starfield';

const GOALS = ['减脂', '体测冲刺', '放松减压', '塑形', '社交运动'];
const LEVELS = ['几乎不运动', '偶尔运动', '经常运动'];
const MINS = [5, 15, 30];
const SCENES = ['宿舍', '操场', '图书馆', '健身房', '校园道路'];
const PREFS = ['跑步', '步行', '力量训练', '拉伸', '球类'];

export default function Onboarding() {
  const refresh = useUserStore(s => s.refresh);
  const me = useUserStore(s => s.me);
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingInput>({
    goal: '', level: '', minutes: 15, scenes: [], prefs: [],
  });
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<PlanDay[] | null>(null);

  const toggle = (key: 'scenes' | 'prefs', v: string) => setData(d => ({
    ...d,
    [key]: d[key].includes(v) ? d[key].filter(x => x !== v) : [...d[key], v],
  }));

  const canNext = (() => {
    if (step === 0) return !!data.goal;
    if (step === 1) return !!data.level;
    if (step === 2) return !!data.minutes;
    if (step === 3) return data.scenes.length > 0;
    if (step === 4) return data.prefs.length > 0;
    return true;
  })();

  const submit = async () => {
    setGenerating(true);
    try {
      // 模拟 AI 生成耗时
      await new Promise(r => setTimeout(r, 1400));
      const r = await onboardingService.submit(data);
      setPlan(r.plan);
      await refresh();
    } finally {
      setGenerating(false);
    }
  };

  const finish = () => nav('/', { replace: true });

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <div className="mx-auto max-w-md min-h-screen px-5 pt-10 pb-10 relative">
        {!plan && !generating && (
          <>
            <div className="mb-6">
              <p className="text-xs text-white/50">嗨，{me?.nickname}</p>
              <h1 className="font-display text-2xl text-gradient-gold mt-1">开启你的微光远征</h1>
              <p className="text-xs text-white/60 mt-1">回答 5 个小问题，Lumi 将为你定制 7 天计划。</p>
            </div>

            {/* 进度条 */}
            <div className="flex gap-1 mb-6">
              {[0,1,2,3,4].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-glimmer-gold' : 'bg-white/10'}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}>
                {step === 0 && <Choice
                  title="你的运动目标是？" subtitle="选一个最贴近的"
                  options={GOALS} selected={data.goal ? [data.goal] : []}
                  onPick={g => setData(d => ({ ...d, goal: g }))} />}
                {step === 1 && <Choice
                  title="目前的运动水平？" subtitle="诚实就好，方案会根据你来定"
                  options={LEVELS} selected={data.level ? [data.level] : []}
                  onPick={g => setData(d => ({ ...d, level: g }))} />}
                {step === 2 && <Choice
                  title="每天能挤出多少时间？" subtitle="哪怕 5 分钟，世界树也能长一点"
                  options={MINS.map(m => `${m} 分钟`)} selected={[`${data.minutes} 分钟`]}
                  onPick={s => setData(d => ({ ...d, minutes: Number(s.replace(' 分钟', '')) }))} />}
                {step === 3 && <Choice
                  title="你常出现在哪里？" subtitle="可多选"
                  multi options={SCENES} selected={data.scenes}
                  onPick={s => toggle('scenes', s)} />}
                {step === 4 && <Choice
                  title="你喜欢哪种运动？" subtitle="可多选，Lumi 会优先安排你喜欢的"
                  multi options={PREFS} selected={data.prefs}
                  onPick={s => toggle('prefs', s)} />}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(s => Math.max(0, s - 1))}
                className="btn btn-ghost flex-1" disabled={step === 0}>
                <ChevronLeft size={16} /> 上一步
              </button>
              {step < 4 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
                  className="btn btn-primary flex-1">
                  下一步 <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={submit} disabled={!canNext}
                  className="btn btn-primary flex-1">
                  <Sparkles size={16} /> 生成我的微光远征计划
                </button>
              )}
            </div>
          </>
        )}

        {generating && <Generating />}

        {plan && (
          <PlanReveal plan={plan} onDone={finish} />
        )}
      </div>
    </div>
  );
}

function Choice({ title, subtitle, options, selected, onPick, multi }: {
  title: string; subtitle?: string; options: string[]; selected: string[]; onPick: (v: string) => void; multi?: boolean;
}) {
  return (
    <div>
      <h3 className="font-display text-lg text-white">{title}</h3>
      {subtitle && <p className="text-xs text-white/50 mt-1 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-2 gap-3">
        {options.map(o => {
          const active = selected.includes(o);
          return (
            <button key={o} onClick={() => onPick(o)}
              className={`relative rounded-2xl py-4 px-3 text-sm transition-all ${
                active
                  ? 'bg-gradient-to-br from-glimmer-gold/30 to-glimmer-purple/30 border border-glimmer-gold/60 text-white'
                  : 'bg-white/5 border border-white/10 text-white/70'
              }`}>
              {active && <Check size={14} className="absolute top-2 right-2 text-glimmer-gold" />}
              {o}
            </button>
          );
        })}
      </div>
      {multi && <p className="text-[10px] text-white/30 mt-3">已选 {selected.length} 项</p>}
    </div>
  );
}

function Generating() {
  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ background: 'conic-gradient(from 0deg, #FFD86B, #9C6BFF, #5BA8FF, #FFD86B)' }}>
        <div className="w-20 h-20 rounded-full bg-[#0B0A1F] flex items-center justify-center">
          <Sparkles className="text-glimmer-gold" size={32} />
        </div>
      </motion.div>
      <p className="mt-6 text-white/80 font-display">Lumi 正在为你撰写远征卷轴…</p>
      <div className="mt-3 space-y-1 text-xs text-white/40">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>分析你的目标与节奏</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>匹配适合你的微光路径</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>组装 7 天奇幻任务</motion.p>
      </div>
    </div>
  );
}

function PlanReveal({ plan, onDone }: { plan: PlanDay[]; onDone: () => void }) {
  return (
    <div>
      <div className="text-center mb-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="inline-block text-5xl">📜</motion.div>
        <h2 className="font-display text-2xl text-gradient-gold mt-2">你的 7 天远征计划</h2>
        <p className="text-xs text-white/60 mt-1">每完成一天，世界树就生长一寸</p>
      </div>

      <div className="space-y-2">
        {plan.map((p, i) => (
          <motion.div key={p.day}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-4 flex items-center gap-3 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-glimmer-gold/30 to-glimmer-purple/30 flex items-center justify-center text-xs text-glimmer-gold">
              D{p.day}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{p.title}</p>
              <p className="text-xs text-white/50 mt-0.5 truncate">{p.task}</p>
            </div>
            <div className="text-right">
              <p className="text-glimmer-gold text-sm">+{p.energy}</p>
              <p className="text-[10px] text-white/40">{p.minutes}分</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button onClick={onDone} className="btn btn-primary w-full mt-6">
        <Sparkles size={16} /> 开启远征
      </button>
    </div>
  );
}
