import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Trophy } from 'lucide-react';

export interface Toast {
  id: number;
  title: string;
  desc?: string;
  icon?: 'sparkle' | 'shield' | 'trophy';
}

interface S {
  list: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  remove: (id: number) => void;
}

export const useToast = create<S>((set) => ({
  list: [],
  push: (t) => {
    const id = Date.now() + Math.random();
    set((s) => ({ list: [...s.list, { ...t, id }] }));
    setTimeout(() => set((s) => ({ list: s.list.filter((x) => x.id !== id) })), 3200);
  },
  remove: (id) => set((s) => ({ list: s.list.filter((x) => x.id !== id) })),
}));

export function ToastHost() {
  const list = useToast((s) => s.list);
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="glass rounded-2xl px-4 py-3 flex items-center gap-3 max-w-sm w-full border border-glimmer-gold/30"
            style={{ background: 'linear-gradient(135deg, rgba(156,107,255,0.18), rgba(255,216,107,0.12))' }}
          >
            <div className="text-glimmer-gold">
              {t.icon === 'shield' ? <Shield size={20} /> : t.icon === 'trophy' ? <Trophy size={20} /> : <Sparkles size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{t.title}</p>
              {t.desc && <p className="text-xs text-white/60 mt-0.5">{t.desc}</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
