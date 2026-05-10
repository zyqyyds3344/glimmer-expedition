import { ReactNode } from 'react';
import { Sun, Moon } from 'lucide-react';
import Starfield from './Starfield';
import BottomNav from './BottomNav';
import { useTheme } from '../lib/theme';

export default function Layout({ children }: { children: ReactNode }) {
  const theme = useTheme(s => s.theme);
  const toggle = useTheme(s => s.toggle);
  return (
    <>
      <Starfield />
      <div className="mx-auto max-w-md min-h-screen pb-28 px-4 pt-6 relative">
        {/* 主题切换按钮：贴在手机容器右上角 */}
        <button onClick={toggle} aria-label="切换主题"
          title={theme === 'dark' ? '切换为浅色' : '切换为深色'}
          className="absolute top-2 right-2 z-30 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #FFD86B, #FF9C5B)'
              : 'linear-gradient(135deg, #9C6BFF, #5BA8FF)',
            color: '#fff',
          }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {children}
      </div>
      <BottomNav />
    </>
  );
}
