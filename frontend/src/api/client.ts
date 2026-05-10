const TOKEN_KEY = 'glimmer_token';

export function setToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any),
  };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const base = (import.meta.env.VITE_API_BASE as string | undefined) || '/api';
  const res = await fetch(base + path, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'request failed' }));
    throw new Error(err.error || 'error');
  }
  return res.json();
}

export const api = {
  get: <T = any>(p: string) => request<T>(p),
  post: <T = any>(p: string, body?: any) => request<T>(p, { method: 'POST', body: JSON.stringify(body || {}) }),
  put: <T = any>(p: string, body?: any) => request<T>(p, { method: 'PUT', body: JSON.stringify(body || {}) }),
};
