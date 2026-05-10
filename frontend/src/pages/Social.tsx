import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, Plus, Check, X, Droplet, Rainbow, MapPin, Clock, Bell } from 'lucide-react';
import { socialService, userService } from '../services';
import { useUserStore } from '../store/userStore';
import { useToast } from '../lib/Toast';

// 随机为每条即刻发车 mock 一个合理的时间/地点/人数显示
const PLACES = ['东区操场', '西区球场', '主楼前草坪', '图书馆外环', '映山路', '南门广场'];
function quickMeta(id: number) {
  const minutes = ((id * 7) % 50) + 5; // 5~55 分钟后
const place = PLACES[id % PLACES.length];
  const joined = (id * 3) % 4; // 0~3 人已加入
  return { minutes, place, joined };
}

const SPORT_NAMES: Record<string, string> = {
  walk: '步行', run: '跑步', cycle: '骑行', swim: '游泳', ball: '球类', gym: '健身', yoga: '瑜伽', other: '其他',
};

export default function Social() {
  const [tab, setTab] = useState<'quick' | 'contract'>('quick');
  return (
    <div>
      <h2 className="font-display text-2xl text-gradient-gold mb-4">搭子契约</h2>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('quick')}
          className={`flex-1 py-2 rounded-xl text-sm ${tab === 'quick' ? 'bg-glimmer-gold/20 text-glimmer-gold' : 'bg-white/5 text-white/60'}`}>
          <Zap size={14} className="inline mr-1" /> 即刻发车
        </button>
        <button onClick={() => setTab('contract')}
          className={`flex-1 py-2 rounded-xl text-sm ${tab === 'contract' ? 'bg-glimmer-gold/20 text-glimmer-gold' : 'bg-white/5 text-white/60'}`}>
          <Heart size={14} className="inline mr-1" /> 微光之约
        </button>
      </div>
      {tab === 'quick' ? <QuickTeams /> : <Contracts />}
    </div>
  );
}

function QuickTeams() {
  const refresh = useUserStore(s => s.refresh);
  const push = useToast(s => s.push);
  const [teams, setTeams] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [matched, setMatched] = useState<any>(null);

  const load = () => socialService.openTeams().then(setTeams);
  useEffect(() => { load(); }, []);

  const create = async (sport_type: string, duration: number) => {
    await socialService.createTeam({ sport_type, duration });
    push({ title: '已发起即刻组队', desc: '等不及了吗，在路上召唤一位吧', icon: 'sparkle' });
    setCreating(false);
    load();
  };
  const join = async (id: number) => {
    const r = await socialService.joinTeam(id);
    setMatched(r.host);
    setTimeout(async () => {
      await socialService.finishTeam(id);
      await refresh(); load();
    }, 3000);
  };

  return (
    <div>
      <button onClick={() => setCreating(true)} className="btn btn-primary w-full mb-4">
        <Plus size={16} /> 我要发起即刻组队
      </button>

      {teams.length === 0 ? (
        <p className="text-xs text-white/40 text-center py-8">暂无开放组队，自己发起一个吧</p>
      ) : (
        <div className="space-y-2">
          {teams.map(t => {
            const meta = quickMeta(t.id);
            return (
              <motion.div key={t.id} layout className="glass rounded-2xl p-4"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-3xl">{t.host_avatar || '🌟'}</div>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{t.host_name} · {SPORT_NAMES[t.sport_type]}</p>
                      <p className="text-[11px] text-white/50 mt-0.5">{t.duration} 分钟 · 已有 {meta.joined} 人加入</p>
                    </div>
                  </div>
                  <button onClick={() => join(t.id)} className="btn btn-primary text-sm py-1 px-3 flex-shrink-0">加入</button>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-white/50">
                  <span className="inline-flex items-center gap-1"><Clock size={10} /> {meta.minutes} 分钟后出发</span>
                  <span className="inline-flex items-center gap-1"><MapPin size={10} /> {meta.place}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {creating && <CreateTeamModal onClose={() => setCreating(false)} onCreate={create} />}
        {matched && <MatchedAnimation host={matched} onDone={() => setMatched(null)} />}
      </AnimatePresence>
    </div>
  );
}

function CreateTeamModal({ onClose, onCreate }: any) {
  const [type, setType] = useState('run');
  const [dur, setDur] = useState(20);
  return (
    <motion.div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="glass rounded-3xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}
        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
        <h3 className="font-display text-lg text-gradient-gold mb-3">发起即刻组队</h3>
        <p className="text-xs text-white/50 mb-2">运动类型</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {Object.entries(SPORT_NAMES).map(([id, name]) => (
            <button key={id} onClick={() => setType(id)}
              className={`py-2 rounded-lg text-xs ${type === id ? 'bg-glimmer-gold/20 text-glimmer-gold' : 'bg-white/5'}`}>
              {name}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/50 mb-2">时长</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[15, 20, 30].map(d => (
            <button key={d} onClick={() => setDur(d)}
              className={`py-2 rounded-lg text-sm ${dur === d ? 'bg-glimmer-gold/20 text-glimmer-gold' : 'bg-white/5'}`}>
              {d} 分钟
            </button>
          ))}
        </div>
        <button onClick={() => onCreate(type, dur)} className="btn btn-primary w-full">发起</button>
      </motion.div>
    </motion.div>
  );
}

function MatchedAnimation({ host, onDone }: any) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }}>
        <div className="flex items-center justify-center gap-6 mb-6">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-6xl">🌟</motion.div>
          <Rainbow className="text-glimmer-gold animate-pulse" size={48} />
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }} className="text-6xl">{host?.host_avatar || '🌙'}</motion.div>
        </div>
        <p className="font-display text-2xl text-gradient-gold">微光相遇</p>
        <p className="text-xs text-white/60 mt-2">双方世界树下出现了对方的小精灵分身…</p>
        <p className="text-xs text-glimmer-gold mt-4 animate-pulse">+10% 能量加成</p>
        <button onClick={onDone} className="mt-6 text-xs text-white/40">点击跳过</button>
      </motion.div>
    </motion.div>
  );
}

function Contracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const me = useUserStore(s => s.me)!;
  const push = useToast(s => s.push);

  const load = () => Promise.all([socialService.myContracts(), userService.list()]).then(([c, u]) => {
    setContracts(c); setUsers(u);
  });
  useEffect(() => { load(); }, []);

  const checkin = async (id: number) => {
    await socialService.contractCheckin(id);
    push({ title: '已履约打卡', desc: '连续连珠 +1', icon: 'sparkle' });
    load();
  };
  const breach = async (id: number) => {
    const r = await socialService.contractBreach(id);
    push({ title: '这次没打上卡也没关系', desc: r.message });
    load();
  };
  const rescue = async (id: number) => {
    await socialService.contractRescue(id);
    push({ title: '拯救成功！', desc: '听火的小人游回岸上了', icon: 'sparkle' });
    load();
  };
  const remind = (name: string) => {
    push({ title: `已向 ${name} 发送微光提醒`, desc: '偶尔温柔一下就好', icon: 'sparkle' });
  };

  return (
    <div>
      <button onClick={() => setShowCreate(true)} className="btn btn-primary w-full mb-4">
        <Heart size={16} /> 缔结新契约
      </button>

      {contracts.length === 0 ? (
        <p className="text-xs text-white/40 text-center py-8">还没有契约，与一位搭子立下「微光之约」</p>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => {
            const isA = c.user_a === me.id;
            const partnerName = isA ? c.user_b_name : c.user_a_name;
            const partnerAvatar = isA ? c.user_b_avatar : c.user_a_avatar;
            const breached = c.breached_days.length > 0;
            // 本周目标 = 每周起设定的天数
            const weeklyTarget = c.weekdays.length || 3;
            // 我的履约进度（本周）
            const myProgress = Math.min(weeklyTarget, c.fulfilled_days.length);
            // 对方进度：mock，基于 streak 与 id 新型估算
            const partnerProgress = Math.min(weeklyTarget, Math.max(0, Math.floor((c.streak + (c.id % 3)) / 2)));
            return (
              <div key={c.id} className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-display text-base">{c.name}</p>
                    <p className="text-xs text-white/50">与 {partnerAvatar} {partnerName} · {SPORT_NAMES[c.sport_type]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-glimmer-gold text-sm">🔥 {c.streak}天</p>
                    <p className="text-[10px] text-white/40">连续履约</p>
                  </div>
                </div>

                {/* 本周双方进度 */}
                <div className="mb-2 p-3 rounded-xl bg-white/5">
                  <p className="text-[11px] text-white/60 mb-2">
                    本周目标 · 运动 {weeklyTarget} 次
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <ProgressRow name="你" current={myProgress} total={weeklyTarget} />
                    <ProgressRow name={partnerName} current={partnerProgress} total={weeklyTarget} />
                  </div>
                </div>

                {/* 彩虹桥 */}
                <div className="my-3 relative h-8 flex items-center">
                  <span className="text-2xl">🏝️</span>
                  <div className={`flex-1 mx-2 h-1.5 rounded-full ${breached ? 'bg-red-500/60' : 'bg-gradient-to-r from-glimmer-gold via-glimmer-purple to-glimmer-blue'}`}>
                    {breached && <motion.div className="h-full bg-black/50" animate={{ opacity: [0.2, 0.7, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40%', marginLeft: '30%' }} />}
                  </div>
                  <span className="text-2xl">🏝️</span>
                </div>

                {/* 落水小人 */}
                <AnimatePresence>
                  {breached && (
                    <motion.div className="flex items-center gap-2 p-2 rounded-xl bg-red-500/10 text-xs text-red-300 mb-2"
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <Droplet size={14} />
                      对方小人不慎落入喷泉！需要一次额外运动来拯救（或消耗护盾）
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 text-xs">
                  <button onClick={() => checkin(c.id)} className="btn btn-ghost flex-1 py-2">
                    <Check size={12} /> 履约打卡
                  </button>
                  <button onClick={() => remind(partnerName)} className="btn btn-ghost flex-1 py-2 text-glimmer-blue">
                    <Bell size={12} /> 提醒
                  </button>
                  {breached ? (
                    <button onClick={() => rescue(c.id)} className="btn btn-primary flex-1 py-2">拯救小人</button>
                  ) : (
                    <button onClick={() => breach(c.id)} className="btn btn-ghost flex-1 py-2 text-red-300">
                      <X size={12} /> 模拟违约
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-white/30 mt-2">期限 {c.start_date} ~ {c.end_date} · 已履约 {c.fulfilled_days.length} 天</p>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <CreateContract users={users} onClose={() => setShowCreate(false)} onDone={load} />}
      </AnimatePresence>
    </div>
  );
}

function ProgressRow({ name, current, total }: { name: string; current: number; total: number }) {
  const pct = Math.min(100, total > 0 ? (current / total) * 100 : 0);
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-white/70 truncate max-w-[80px]">{name}</span>
        <span className="text-[11px] text-glimmer-gold">{current}/{total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-glimmer-gold to-glimmer-purple"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CreateContract({ users, onClose, onDone }: any) {
  const [name, setName] = useState('一周夜跑之约');
  const [partner, setPartner] = useState<number | null>(null);
  const [sport, setSport] = useState('run');
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [dur, setDur] = useState(7);
  const [slot, setSlot] = useState('20:00-21:00');

  const toggle = (d: number) => setDays(s => s.includes(d) ? s.filter(x => x !== d) : [...s, d]);

  const submit = async () => {
    if (!partner) { return; }
    await socialService.createContract({
      name, partner_id: partner, sport_type: sport, weekdays: days, duration_days: dur, time_slot: slot,
    });
    onDone(); onClose();
  };

  return (
    <motion.div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="glass rounded-3xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
        <h3 className="font-display text-lg text-gradient-gold mb-3">缔结微光之约</h3>

        <input className="input mb-3" value={name} onChange={e => setName(e.target.value)} placeholder="契约名称" />

        <p className="text-xs text-white/50 mb-2">选择搭子</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {users.slice(0, 8).map((u: any) => (
            <button key={u.id} onClick={() => setPartner(u.id)}
              className={`p-2 rounded-lg text-xs ${partner === u.id ? 'bg-glimmer-gold/20' : 'bg-white/5'}`}>
              <div className="text-xl">{u.avatar}</div>
              <div className="truncate">{u.nickname}</div>
            </button>
          ))}
        </div>

        <p className="text-xs text-white/50 mb-2">运动</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {Object.entries(SPORT_NAMES).map(([id, n]) => (
            <button key={id} onClick={() => setSport(id)}
              className={`py-1.5 rounded-lg text-xs ${sport === id ? 'bg-glimmer-gold/20 text-glimmer-gold' : 'bg-white/5'}`}>{n}</button>
          ))}
        </div>

        <p className="text-xs text-white/50 mb-2">每周哪几天</p>
        <div className="flex gap-1 mb-3">
          {['日', '一', '二', '三', '四', '五', '六'].map((n, i) => (
            <button key={i} onClick={() => toggle(i)}
              className={`flex-1 py-1.5 rounded-lg text-xs ${days.includes(i) ? 'bg-glimmer-gold/20 text-glimmer-gold' : 'bg-white/5'}`}>{n}</button>
          ))}
        </div>

        <p className="text-xs text-white/50 mb-2">持续</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setDur(d)}
              className={`py-1.5 rounded-lg text-xs ${dur === d ? 'bg-glimmer-gold/20 text-glimmer-gold' : 'bg-white/5'}`}>{d} 天</button>
          ))}
        </div>

        <input className="input mb-4" value={slot} onChange={e => setSlot(e.target.value)} placeholder="约定时段，如 20:00-21:00" />

        <button onClick={submit} className="btn btn-primary w-full">立约</button>
      </motion.div>
    </motion.div>
  );
}
