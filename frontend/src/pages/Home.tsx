import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CloudRain, Sparkles, Shield, Award, ChevronRight, Gift, Check } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import WorldTree from '../components/WorldTree';
import FloatingIsland from '../components/FloatingIsland';
import { taskService, achievementService, DailyPreview, DailyTask } from '../services';
import { stageFeedback } from '../lib/concepts';
import { useToast } from '../lib/Toast';

const GREETINGS = [
  '今日的微光，等你点亮 ✨',
  '你的世界树，正在偷偷呼吸 🌿',
  '出发吧，远征者 🌟',
  '每一步都在让岛屿浮得更高',
];

export default function Home() {
  const me = useUserStore(s => s.me)!;
  const refresh = useUserStore(s => s.refresh);
  const nav = useNavigate();
  const push = useToast(s => s.push);
  const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  const [preview, setPreview] = useState<DailyPreview | null>(null);
  const [completing, setCompleting] = useState<number | null>(null);

  const loadPreview = () => taskService.todayPreview().then(setPreview).catch(() => {});
  useEffect(() => { loadPreview(); }, []);

  const pct = Math.min(100, Math.round((me.currentInLevel / me.needForNext) * 100));
  const completedCount = preview?.completed || 0;
  const totalCount = preview?.total || 0;

  const completeTask = async (t: DailyTask) => {
    setCompleting(t.id);
    try {
      const r = await taskService.complete(t.id);
      const growth = Math.round(r.energy / 10);
      push({
        title: `任务完成！获得 ${r.energy} 微光`,
        desc: `世界树成长 +${growth}%`,
        icon: 'sparkle',
      });
      await refresh();
      await loadPreview();
      // 集齐 3 张
      if (preview && preview.completed + 1 === preview.total) {
        setTimeout(() => {
          if (r.synthesized) {
            push({ title: '🛡️ 护盾合成成功！', desc: '今日能量卡集齐，护盾 +1', icon: 'shield' });
          } else {
            push({ title: '✨ 今日能量卡已集齐', desc: '护盾碎片 +1', icon: 'shield' });
          }
        }, 800);
      }
    } catch (e: any) {
      push({ title: '任务完成失败', desc: e?.message });
    } finally {
      setCompleting(null);
    }
  };

  const triggerRain = async () => {
    const r = await achievementService.triggerRain();
    if (r.unlocked) push({ title: `🏅 解锁徽章：${r.unlocked.name}`, desc: r.unlocked.desc, icon: 'trophy' });
    else push({ title: '☔ 雨天的微光也是微光', desc: '该场景徽章已解锁过' });
  };

  const energyToNext = me.needForNext - me.currentInLevel;

  return (
    <div>
      {/* 顶部用户状态区 */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-white/60 text-xs">{greeting}</p>
        <div className="flex items-center justify-between mt-1">
          <h2 className="font-display text-xl text-gradient-gold">{me.nickname} 的岛屿</h2>
          <button onClick={() => nav('/achievement')}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-glimmer-gold">
            <Award size={14} /> 徽章
          </button>
        </div>
      </motion.div>

      {/* 状态卡 */}
      <div className="glass rounded-2xl p-4 mt-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-2xl text-gradient-gold">Lv.{me.level}</span>
            <span className="text-xs text-white/60 px-2 py-0.5 rounded-full bg-white/5">{me.stageName}</span>
            {me.title && <span className="text-xs text-glimmer-gold">{me.title}</span>}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-glimmer-gold"><Shield size={12} /> {me.shields}</span>
            <span className="flex items-center gap-1 text-white/60"><Sparkles size={12} /> {me.shield_fragments}/3</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-white/50">微光进度</span>
          <span className="text-white/70">{me.currentInLevel} / {me.needForNext} 微光</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-2">
          <motion.div className="h-full bg-gradient-to-r from-glimmer-gold via-glimmer-purple to-glimmer-blue"
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-white/40">
          <span>今日能量卡 {completedCount}/{totalCount || 3}</span>
          <span>累计 {me.energy} 微光</span>
        </div>
      </div>

      {/* 浮岛 + 世界树 + 成长反馈 */}
      <FloatingIsland>
        <WorldTree level={me.level} />
      </FloatingIsland>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-center text-xs text-white/60 -mt-2 mb-4 px-4">
        🌱 {stageFeedback(me.level, energyToNext)}
      </motion.p>

      {/* 今日主线：能量卡片 */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-display text-base">今日主线 · 能量卡片</p>
          <p className="text-[10px] text-white/40">每张卡都是一次小小的远征</p>
        </div>
        <span className="text-xs text-glimmer-gold">{completedCount}/{totalCount || 3}</span>
      </div>

      {!preview ? (
        <p className="text-xs text-white/30 text-center py-6">加载中…</p>
      ) : (
        <div className="space-y-2 mb-4">
          {preview.tasks.map((t, i) => (
            <motion.div key={t.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass rounded-2xl p-3 flex items-center gap-3 ${t.completed ? 'opacity-60' : ''}`}>
              <div className="text-3xl">{t.card.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{t.card.name}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{t.card.minutes} 分钟 · 奖励 +{t.card.energy} 微光{t.card.scene ? ` · ${t.card.scene}` : ''}</p>
              </div>
              {t.completed ? (
                <div className="w-9 h-9 rounded-full bg-glimmer-gold/20 flex items-center justify-center text-glimmer-gold">
                  <Check size={16} />
                </div>
              ) : (
                <button onClick={() => completeTask(t)}
                  disabled={completing === t.id}
                  className="px-3 py-2 rounded-xl text-xs whitespace-nowrap bg-gradient-to-r from-glimmer-gold to-glimmer-purple text-[#0B0A1F] font-medium disabled:opacity-50">
                  {completing === t.id ? '处理…' : '完成'}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* 今日奖励预告 */}
      {preview && preview.completed < preview.total && (
        <motion.div className="rounded-2xl p-4 mb-4 border border-glimmer-gold/30"
          style={{ background: 'linear-gradient(135deg, rgba(255,216,107,0.08), rgba(156,107,255,0.08))' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-2 mb-2">
            <Gift size={14} className="text-glimmer-gold" />
            <span className="text-sm">完成 3/3 后可获得</span>
          </div>
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>+{preview.rewardEnergy} 微光</span>
            <span>+{preview.rewardFragment} 护盾碎片</span>
            <span>岛屿成长 +{preview.rewardGrowthPct}%</span>
          </div>
          <p className="text-[10px] text-white/40 mt-2">有机会解锁「校园漫步者」徽章</p>
        </motion.div>
      )}

      {/* 计划入口 + 调皮的雨 */}
      <div className="flex gap-2">
        <button onClick={() => nav('/lumi')}
          className="flex-1 glass rounded-2xl p-3 text-left flex items-center justify-between hover:bg-white/5 transition-all">
          <div>
            <p className="text-xs text-white/50">不知道做什么？</p>
            <p className="text-sm text-glimmer-gold">问问 Lumi</p>
          </div>
          <ChevronRight size={16} className="text-white/30" />
        </button>
        <button onClick={triggerRain}
          className="glass rounded-2xl p-3 flex items-center gap-2 text-xs text-white/50 hover:text-glimmer-blue">
          <CloudRain size={14} /> 模拟下雨
        </button>
      </div>

      {/* 7天计划进度 */}
      {me.plan && me.plan.length > 0 && (
        <PlanStrip />
      )}
    </div>
  );
}

function PlanStrip() {
  const me = useUserStore(s => s.me)!;
  const plan = me.plan || [];
  return (
    <div className="mt-4 glass rounded-2xl p-4">
      <p className="text-xs text-white/50 mb-2">📜 我的 7 天微光远征</p>
      <div className="flex gap-1.5">
        {plan.map(p => (
          <div key={p.day} className={`flex-1 h-10 rounded-lg flex flex-col items-center justify-center text-[10px] ${
            p.completed ? 'bg-gradient-to-b from-glimmer-gold/30 to-glimmer-purple/20 text-glimmer-gold' : 'bg-white/5 text-white/50'
          }`}>
            <span>D{p.day}</span>
            {p.completed && <Check size={9} />}
          </div>
        ))}
      </div>
    </div>
  );
}
