import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/auth-context';

// Marketing site components
import Navbar          from './components/Navbar';
import HomePage        from './pages/Home';
import HowItWorksPage  from './pages/HowItWorksPage';
import SolutionPage    from './pages/SolutionPage';
import PricingPage     from './pages/PricingPage';
import BlogPage        from './pages/BlogPage';

// Webapp components
import Sidebar      from './components/Sidebar';
import Dashboard    from './pages/Dashboard';
import Roadmap      from './pages/Roadmap';
import Tasks        from './pages/Tasks';
import Progress     from './pages/Progress';
import SettingsPage from './pages/Settings';
import Onboarding   from './pages/Onboarding';
import Assessment   from './pages/Assessment';
import SignIn       from './pages/SignIn';
import SignUp       from './pages/SignUp';
import './App.css';

function MarketingLayout() {
  return (
    <div className="marketing-root">
      <Navbar />
      <Outlet />
    </div>
  );
}

function AppLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate('/signin', { replace: true });
  }, [ready, user, navigate]);

  if (!ready) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0b1e' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(167,139,250,0.3)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (!user) return null;

  return (
    <div className="saas-layout">
      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="saas-main">
        <button
          className="sidebar-hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <Outlet />
      </main>
    </div>
  );
}

function AuthLayout() {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Marketing site ── */}
          <Route element={<MarketingLayout />}>
            <Route path="/"             element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/solution"     element={<SolutionPage />} />
            <Route path="/pricing"      element={<PricingPage />} />
            <Route path="/blog"         element={<BlogPage />} />
          </Route>

          {/* ── Auth screens ── */}
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* ── Webapp (/app/*) ── */}
          <Route path="/app" element={<AppLayout />}>
            <Route index             element={<Dashboard />} />
            <Route path="roadmap"    element={<Roadmap />} />
            <Route path="tasks"      element={<Tasks />} />
            <Route path="progress"   element={<Progress />} />
            <Route path="settings"   element={<SettingsPage />} />
            <Route path="onboarding"  element={<Onboarding />} />
            <Route path="assessment"  element={<Assessment />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
