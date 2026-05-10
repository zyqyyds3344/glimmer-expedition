import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

const KEY = 'glimmer.theme';

function read(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const v = localStorage.getItem(KEY);
  if (v === 'light' || v === 'dark') return v;
  // 默认跟随系统
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  return prefersLight ? 'light' : 'dark';
}

function apply(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
}

interface ThemeState {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: read(),
  setTheme: (t) => {
    localStorage.setItem(KEY, t);
    apply(t);
    set({ theme: t });
  },
  toggle: () => {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));

// 启动时应用一次（main.tsx 也会在挂载前调用）
export function initTheme() {
  apply(useTheme.getState().theme);
}
