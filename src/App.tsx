import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate, Link } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { Menu } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/auth-context';

// Marketing site components
import Navbar          from './components/Navbar';
import HomePage        from './pages/Home';
import HowItWorksPage  from './pages/HowItWorksPage';
import SolutionPage    from './pages/SolutionPage';
import PricingPage     from './pages/PricingPage';
import BlogPage        from './pages/BlogPage';
import BlogArticlePage from './pages/BlogArticlePage';
import LegalPage       from './pages/LegalPage';
import ContactPage     from './pages/Contact';

// Webapp components
import Sidebar      from './components/Sidebar';
import { AppWidgetPanel } from './components/widgets';
import Dashboard    from './pages/Dashboard';
import Roadmap      from './pages/Roadmap';
import Tasks        from './pages/Tasks';
import Progress     from './pages/Progress';
import SettingsPage from './pages/Settings';
import Onboarding   from './pages/Onboarding';
import Assessment   from './pages/Assessment';
import SkillGaps    from './pages/SkillGaps';
import SkillGapAssessment from './pages/SkillGapAssessment';
import SignIn       from './pages/SignIn';
import SignUp       from './pages/SignUp';
import LogoutPage   from './pages/Logout';
import Streaks      from './pages/Streaks';
import AchievementsPage from './pages/Achievements';
import NotificationsPage from './pages/Notifications';
import CertificatesPage from './pages/Certificates';
import HelpFAQ      from './pages/HelpFAQ';
import CareerMatchDetail from './pages/CareerMatchDetail';
import SearchPage   from './pages/Search';
import AdminPage    from './pages/Admin';
import PublicProfile from './pages/PublicProfile';
import './App.css';

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', color: 'var(--on-surface)', gap: '1rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>404</h1>
      <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>Page not found.</p>
      <Link to="/" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>← Back to home</Link>
    </div>
  );
}

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(98,69,164,0.2)', borderTopColor: '#6245a4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (!user) return null;

  return (
    <div className="saas-layout">
      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="saas-main" style={{ display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            className="sidebar-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <Outlet />
        </div>
        <AppWidgetPanel />
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
    <Sentry.ErrorBoundary fallback={<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>Something went wrong</h1>
      <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>The error has been reported. Please refresh the page.</p>
      <button onClick={() => window.location.reload()} style={{ padding: '0.6rem 1.5rem', borderRadius: '999px', background: '#334042', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Refresh Page</button>
    </div>}>
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
            <Route path="/blog/:slug"   element={<BlogArticlePage />} />
            <Route path="/privacy-policy" element={<LegalPage docKey="privacy" />} />
            <Route path="/terms-of-service" element={<LegalPage docKey="terms" />} />
            <Route path="/cookie-policy" element={<LegalPage docKey="cookies" />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* ── Public profile (standalone, no layout) ── */}
          <Route path="/u/:slug" element={<PublicProfile />} />

          {/* ── Auth screens ── */}
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/logout" element={<LogoutPage />} />
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
            <Route path="skill-gaps" element={<SkillGaps />} />
            <Route path="skill-gap-assessment" element={<SkillGapAssessment />} />
            <Route path="streaks"       element={<Streaks />} />
            <Route path="achievements"  element={<AchievementsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="certificates"  element={<CertificatesPage />} />
            <Route path="help"          element={<HelpFAQ />} />
            <Route path="career-match"  element={<CareerMatchDetail />} />
            <Route path="search"        element={<SearchPage />} />
            <Route path="admin"         element={<AdminPage />} />
          </Route>

          {/* ── 404 catch-all ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}
