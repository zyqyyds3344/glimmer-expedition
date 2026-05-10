import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Sport from './pages/Sport';
import Social from './pages/Social';
import Achievement from './pages/Achievement';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Lumi from './pages/Lumi';
import { getToken } from './api/client';
import { ToastHost } from './lib/Toast';

function Protected({ children }: { children: JSX.Element }) {
  const me = useUserStore(s => s.me);
  const loading = useUserStore(s => s.loading);
  const location = useLocation();
  if (!getToken()) return <Navigate to="/login" state={{ from: location }} replace />;
  if (loading) return <div className="text-center text-white/50 mt-20">加载中…</div>;
  if (!me) return <div className="text-center text-white/50 mt-20">加载中…</div>;
  // 首次入口：未完成 onboarding 则跳转
  if (!me.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

export default function App() {
  const refresh = useUserStore(s => s.refresh);
  useEffect(() => { if (getToken()) refresh(); }, [refresh]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={
          <ProtectedNoOnboard>
            <Onboarding />
          </ProtectedNoOnboard>
        } />
        <Route path="/*" element={
          <Protected>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sport" element={<Sport />} />
                <Route path="/lumi" element={<Lumi />} />
                <Route path="/social" element={<Social />} />
                <Route path="/achievement" element={<Achievement />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          </Protected>
        } />
      </Routes>
      <ToastHost />
    </>
  );
}

// 允许访问 onboarding 页，但需为已登录用户
function ProtectedNoOnboard({ children }: { children: JSX.Element }) {
  const me = useUserStore(s => s.me);
  const loading = useUserStore(s => s.loading);
  if (!getToken()) return <Navigate to="/login" replace />;
  if (loading || !me) return <div className="text-center text-white/50 mt-20">加载中…</div>;
  if (me.onboarded) return <Navigate to="/" replace />;
  return children;
}
