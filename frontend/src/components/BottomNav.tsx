import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Users, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  { to: '/', icon: Home, label: '岛屿' },
  { to: '/sport', icon: Dumbbell, label: '运动' },
  { to: '/lumi', icon: Sparkles, label: 'Lumi', center: true },
  { to: '/social', icon: Users, label: '搭子' },
  { to: '/profile', icon: User, label: '我的' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-md">
      <div className="glass mx-3 mb-3 rounded-3xl px-2 py-2 flex justify-around items-end">
        {items.map(({ to, icon: Icon, label, center }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              center
                ? `relative flex flex-col items-center justify-center -mt-6`
                : `flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all ${
                    isActive ? 'text-glimmer-gold bg-white/5' : 'text-white/50'
                  }`
            }
          >
            {({ isActive }) => center ? (
              <>
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #FFD86B, #9C6BFF)'
                      : 'linear-gradient(135deg, rgba(255,216,107,0.7), rgba(156,107,255,0.7))',
                    boxShadow: '0 4px 20px rgba(255,216,107,0.4)',
                  }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                >
                  <Icon size={22} className="text-[#0B0A1F]" />
                </motion.div>
                <span className={`text-[10px] mt-0.5 ${isActive ? 'text-glimmer-gold' : 'text-white/60'}`}>{label}</span>
              </>
            ) : (
              <>
                <Icon size={20} />
                <span className="text-[10px]">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
