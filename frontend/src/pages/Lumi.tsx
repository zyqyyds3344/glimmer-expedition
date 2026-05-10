import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Wand2 } from 'lucide-react';
import { lumiService, LumiPrompt, LumiReply } from '../services';
import { useToast } from '../lib/Toast';

interface Msg {
  id: number;
  role: 'lumi' | 'me';
  text: string;
  reply?: LumiReply['reply'];
}

export default function Lumi() {
  const [prompts, setPrompts] = useState<LumiPrompt[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: 1, role: 'lumi',
      text: '我是你的微光精灵 Lumi。今天不用追求完美，只要点亮一点微光就很好。✨',
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const push = useToast(s => s.push);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lumiService.prompts().then(setPrompts).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, thinking]);

  const ask = async (q: string, id?: string) => {
    setMsgs(m => [...m, { id: Date.now(), role: 'me', text: q }]);
    setInput('');
    setThinking(true);
    try {
      // 模拟思考
      await new Promise(r => setTimeout(r, 700));
      const r = await lumiService.ask({ id, text: id ? undefined : q });
      setMsgs(m => [...m, { id: Date.now() + 1, role: 'lumi', text: r.reply.text, reply: r.reply }]);
    } finally {
      setThinking(false);
    }
  };

  const adoptSoften = async (replyText: string) => {
    await lumiService.adoptSoften();
    push({ title: 'Lumi 已为你换上恢复模式', desc: '今日任务已替换为更温和的微光任务', icon: 'sparkle' });
    setMsgs(m => [...m, { id: Date.now(), role: 'lumi', text: '✓ 已为你把今日任务调到恢复模式。回岛屿页看看吧。' }]);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 160px)' }}>
      {/* 顶部 Lumi 卡 */}
      <div className="glass rounded-3xl p-4 mb-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(156,107,255,0.18), rgba(255,216,107,0.10))' }}>
        <motion.div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'radial-gradient(circle, #FFD86B, #9C6BFF)' }}
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}>
          <Sparkles className="text-[#0B0A1F]" size={22} />
        </motion.div>
        <div className="flex-1">
          <p className="font-display text-base text-gradient-gold">微光精灵 Lumi</p>
          <p className="text-[10px] text-white/50">你的 AI 运动陪伴 · 温和、低压力</p>
        </div>
      </div>

      {/* 对话区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pb-2">
        <AnimatePresence initial={false}>
          {msgs.map(m => (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'me'
                  ? 'bg-glimmer-gold/20 text-white rounded-br-sm'
                  : 'glass text-white/90 rounded-bl-sm'
              }`}>
                <p>{m.text}</p>
                {m.reply?.action?.type === 'soften_today' && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[11px] text-white/60 mb-2">建议任务：</p>
                    <ul className="space-y-1 mb-3">
                      {m.reply.action.tasks.map((t, i) => (
                        <li key={i} className="text-xs flex items-center justify-between">
                          <span>{t.icon} {t.name}</span>
                          <span className="text-glimmer-gold">+{t.energy}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => adoptSoften(m.text)}
                      className="btn btn-primary w-full text-xs py-2">
                      <Wand2 size={12} /> 采用 Lumi 建议
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="glass rounded-2xl px-3.5 py-2.5">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-glimmer-gold"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 快捷问题 */}
      {msgs.length <= 4 && prompts.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] text-white/40 mb-1.5">试试这些问题</p>
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
            {prompts.map(p => (
              <button key={p.id} onClick={() => ask(p.q, p.id)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs whitespace-nowrap bg-white/5 border border-white/10 text-white/80 hover:bg-glimmer-gold/10 hover:text-glimmer-gold transition-all">
                {p.q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入框 */}
      <div className="glass rounded-2xl p-2 flex items-center gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && input.trim() && ask(input)}
          placeholder="问问 Lumi…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 px-2 outline-none"
        />
        <button onClick={() => input.trim() && ask(input)}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30"
          style={{ background: 'linear-gradient(135deg, #FFD86B, #9C6BFF)' }}>
          <Send size={14} className="text-[#0B0A1F]" />
        </button>
      </div>
    </div>
  );
}
