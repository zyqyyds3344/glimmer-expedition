import { motion } from 'framer-motion';

interface Props {
  level: number;
}

// 三阶段世界树 SVG
export default function WorldTree({ level }: Props) {
  const stage = level >= 100 ? 3 : level >= 51 ? 2 : 1;

  return (
    <div className="relative flex items-end justify-center" style={{ height: 220 }}>
      {/* 光晕 */}
      {stage === 3 && (
        <motion.div
          className="absolute inset-0 m-auto w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,216,107,0.6), transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <motion.svg
        viewBox="0 0 200 220"
        width={stage === 3 ? 200 : stage === 2 ? 170 : 120}
        height={stage === 3 ? 220 : stage === 2 ? 190 : 140}
        className="relative z-10"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {stage === 1 && (
          <>
            {/* 幼苗 */}
            <rect x="95" y="180" width="10" height="30" fill="#5a4a2a" rx="3" />
            <ellipse cx="80" cy="170" rx="22" ry="18" fill="#4a7a3a" opacity="0.9" />
            <ellipse cx="120" cy="170" rx="22" ry="18" fill="#5a8a4a" opacity="0.9" />
            <ellipse cx="100" cy="155" rx="20" ry="20" fill="#6a9a5a" />
          </>
        )}
        {stage === 2 && (
          <>
            {/* 成长期 */}
            <rect x="92" y="150" width="16" height="60" fill="#6b4a2a" rx="4" />
            <circle cx="100" cy="100" r="55" fill="#5a8a4a" />
            <circle cx="70" cy="115" r="38" fill="#4a7a3a" />
            <circle cx="130" cy="115" r="38" fill="#6a9a5a" />
            <circle cx="100" cy="80" r="40" fill="#7aaa6a" />
            {/* 果实 */}
            <circle cx="80" cy="110" r="5" fill="#FFD86B" />
            <circle cx="120" cy="100" r="5" fill="#FF9C5B" />
            <circle cx="105" cy="130" r="4" fill="#FFD86B" />
            <circle cx="90" cy="85" r="4" fill="#FFD86B" />
          </>
        )}
        {stage === 3 && (
          <>
            {/* 传说期：发光巨树 + 树根 */}
            <path d="M 70 210 Q 60 200 50 210 M 130 210 Q 140 200 150 210 M 100 210 L 100 200" stroke="#FFD86B" strokeWidth="2" fill="none" opacity="0.6" />
            <rect x="88" y="120" width="24" height="90" fill="#8b5a2b" rx="4" />
            <circle cx="100" cy="80" r="65" fill="#7aaa6a" />
            <circle cx="60" cy="110" r="42" fill="#5a8a4a" />
            <circle cx="140" cy="110" r="42" fill="#6a9a5a" />
            <circle cx="100" cy="50" r="50" fill="#9aca8a" />
            {/* 发光果实 */}
            {[
              [80, 90], [120, 75], [70, 60], [135, 100], [95, 110], [105, 35], [75, 130], [125, 130],
            ].map(([x, y], i) => (
              <motion.circle
                key={i}
                cx={x} cy={y} r={5}
                fill="#FFD86B"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </>
        )}
      </motion.svg>
    </div>
  );
}
