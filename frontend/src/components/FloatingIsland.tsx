import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function FloatingIsland({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: 300, height: 300 }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* 树和内容 */}
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>

      {/* 岛屿底座 */}
      <svg className="absolute bottom-0 left-1/2 -translate-x-1/2" width="280" height="120" viewBox="0 0 280 120">
        <defs>
          <linearGradient id="islandTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7aaa6a" />
            <stop offset="100%" stopColor="#4a7a3a" />
          </linearGradient>
          <linearGradient id="islandBottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a4a2a" />
            <stop offset="100%" stopColor="#2a1a0a" />
          </linearGradient>
        </defs>
        <ellipse cx="140" cy="40" rx="130" ry="20" fill="url(#islandTop)" />
        <path d="M 10 40 Q 50 110 140 115 Q 230 110 270 40 Z" fill="url(#islandBottom)" />
      </svg>

      {/* 周围漂浮粒子 */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-glimmer-gold"
          style={{ left: `${15 + i * 12}%`, top: `${30 + (i % 3) * 20}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </motion.div>
  );
}
