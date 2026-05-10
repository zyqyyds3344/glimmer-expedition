import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import Starfield from '../components/Starfield';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useUserStore(s => s.login);
  const register = useUserStore(s => s.register);
  const nav = useNavigate();

  const submit = async () => {
    if (!nickname || !password) { setErr('请填写昵称与密码'); return; }
    setLoading(true); setErr('');
    try {
      if (mode === 'login') await login(nickname, password);
      else await register(nickname, password);
      nav('/');
    } catch (e: any) {
      setErr(e.message || '操作失败');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Starfield />
      <div className="min-h-screen flex items-center justify-center px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block"
            >
              <Sparkles className="text-glimmer-gold" size={48} />
            </motion.div>
            <h1 className="font-display text-3xl text-gradient-gold mt-2">微光远征</h1>
            <p className="text-white/50 text-sm mt-1">把每次运动，化作世界树的微光</p>
          </div>

          <input className="input mb-3" placeholder="昵称"
            value={nickname} onChange={e => setNickname(e.target.value)} />
          <input className="input mb-3" type="password" placeholder="密码"
            value={password} onChange={e => setPassword(e.target.value)} />

          {err && <p className="text-red-400 text-xs mb-3">{err}</p>}

          <button className="btn btn-primary w-full" onClick={submit} disabled={loading}>
            {loading ? '...' : mode === 'login' ? '进入岛屿' : '创建岛屿'}
          </button>

          <p className="text-center text-white/40 text-xs mt-4 cursor-pointer"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? '还没有岛屿？点此注册' : '已有岛屿？点此登录'}
          </p>

          <div className="mt-4 p-3 bg-white/5 rounded-xl text-xs text-white/50">
            预设账号：<span className="text-glimmer-gold">晨曦小鹿</span> / 123456
          </div>
        </motion.div>
      </div>
    </>
  );
}
