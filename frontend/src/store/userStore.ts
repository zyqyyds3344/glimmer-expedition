import { create } from 'zustand';
import { api, clearToken, setToken } from '../api/client';
import type { Me } from '../services';

export type UserMe = Me;

interface S {
  me: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (nickname: string, password: string) => Promise<void>;
  register: (nickname: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<S>((set, get) => ({
  me: null,
  loading: false,
  async refresh() {
    set({ loading: true });
    try {
      const me = await api.get<Me>('/user/me');
      set({ me, loading: false });
    } catch {
      set({ me: null, loading: false });
    }
  },
  async login(nickname, password) {
    const r = await api.post<{ token: string }>('/auth/login', { nickname, password });
    setToken(r.token);
    await get().refresh();
  },
  async register(nickname, password) {
    const r = await api.post<{ token: string }>('/auth/register', { nickname, password });
    setToken(r.token);
    await get().refresh();
  },
  logout() {
    clearToken();
    set({ me: null });
  },
}));
