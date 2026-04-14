import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate, Link } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { Menu } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/auth-context';

// Shared layout components (eagerly loaded)
import Navbar          from './components/Navbar';
import Sidebar         from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import { AppWidgetPanel } from './components/widgets';
import './App.css';

// ── Lazy-loaded page components ──────────────────────────────

// Marketing pages
const HomePage         = lazy(() => import('./pages/Home'));
const HowItWorksPage   = lazy(() => import('./pages/HowItWorksPage'));
const SolutionPage     = lazy(() => import('./pages/SolutionPage'));
const PricingPage      = lazy(() => import('./pages/PricingPage'));
const BlogPage         = lazy(() => import('./pages/BlogPage'));
const BlogArticlePage  = lazy(() => import('./pages/BlogArticlePage'));
const LegalPage        = lazy(() => import('./pages/LegalPage'));
const ContactPage      = lazy(() => import('./pages/Contact'));
const WhatsNewPage     = lazy(() => import('./pages/WhatsNew'));
const AboutPage        = lazy(() => import('./pages/AboutPage'));
const FAQPage          = lazy(() => import('./pages/FAQPage'));
const FeaturesPage     = lazy(() => import('./pages/FeaturesPage'));
const ComparePage      = lazy(() => import('./pages/ComparePage'));

// Auth pages
const SignIn           = lazy(() => import('./pages/SignIn'));
const SignUp           = lazy(() => import('./pages/SignUp'));
const ForgotPassword   = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword    = lazy(() => import('./pages/ResetPassword'));
const LogoutPage       = lazy(() => import('./pages/Logout'));

// App pages
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const Roadmap          = lazy(() => import('./pages/Roadmap'));
const Tasks            = lazy(() => import('./pages/Tasks'));
const Progress         = lazy(() => import('./pages/Progress'));
const SettingsPage     = lazy(() => import('./pages/Settings'));
const Onboarding       = lazy(() => import('./pages/Onboarding'));
const SupportPage      = lazy(() => import('./pages/Support'));
const CertificatePage  = lazy(() => import('./pages/Certificate'));
const Assessment       = lazy(() => import('./pages/Assessment'));
const AssessmentV2     = lazy(() => import('./pages/AssessmentV2'));
const AssessmentV2Results = lazy(() => import('./pages/AssessmentV2/Results'));
const SkillGaps        = lazy(() => import('./pages/SkillGaps'));
const SkillGapAssessment = lazy(() => import('./pages/SkillGapAssessment'));
const ProPage          = lazy(() => import('./pages/Pro'));
const Streaks          = lazy(() => import('./pages/Streaks'));
const AchievementsPage = lazy(() => import('./pages/Achievements'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));
const CertificatesPage = lazy(() => import('./pages/Certificates'));
const HelpFAQ          = lazy(() => import('./pages/HelpFAQ'));
const WhatsNewAppPage  = lazy(() => import('./pages/WhatsNewApp'));
const CareerMatchDetail = lazy(() => import('./pages/CareerMatchDetail'));
const SearchPage       = lazy(() => import('./pages/Search'));

// Admin pages
const AdminPage        = lazy(() => import('./pages/Admin'));

// Public pages
const PublicProfile    = lazy(() => import('./pages/PublicProfile'));

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--surface-variant, rgba(98,69,164,0.15))', borderTopColor: 'var(--primary, #6245a4)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

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
      {/* Notification bell — fixed top-right, above all content */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <NotificationBell />
      </div>
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
            <Route path="/"             element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
            <Route path="/how-it-works" element={<Suspense fallback={<PageLoader />}><HowItWorksPage /></Suspense>} />
            <Route path="/solution"     element={<Suspense fallback={<PageLoader />}><SolutionPage /></Suspense>} />
            <Route path="/pricing"      element={<Suspense fallback={<PageLoader />}><PricingPage /></Suspense>} />
            <Route path="/blog"         element={<Suspense fallback={<PageLoader />}><BlogPage /></Suspense>} />
            <Route path="/blog/:slug"   element={<Suspense fallback={<PageLoader />}><BlogArticlePage /></Suspense>} />
            <Route path="/privacy-policy" element={<Suspense fallback={<PageLoader />}><LegalPage docKey="privacy" /></Suspense>} />
            <Route path="/terms-of-service" element={<Suspense fallback={<PageLoader />}><LegalPage docKey="terms" /></Suspense>} />
            <Route path="/cookie-policy" element={<Suspense fallback={<PageLoader />}><LegalPage docKey="cookies" /></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
            <Route path="/whats-new" element={<Suspense fallback={<PageLoader />}><WhatsNewPage /></Suspense>} />
            <Route path="/about" element={<Suspense fallback={<PageLoader />}><AboutPage /></Suspense>} />
            <Route path="/faq" element={<Suspense fallback={<PageLoader />}><FAQPage /></Suspense>} />
            <Route path="/features" element={<Suspense fallback={<PageLoader />}><FeaturesPage /></Suspense>} />
            <Route path="/compare" element={<Suspense fallback={<PageLoader />}><ComparePage /></Suspense>} />
          </Route>

          {/* ── Public profile (standalone, no layout) ── */}
          <Route path="/u/:slug" element={<Suspense fallback={<PageLoader />}><PublicProfile /></Suspense>} />

          {/* ── Auth screens ── */}
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<Suspense fallback={<PageLoader />}><SignIn /></Suspense>} />
            <Route path="/signup" element={<Suspense fallback={<PageLoader />}><SignUp /></Suspense>} />
            <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense>} />
            <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
            <Route path="/logout" element={<Suspense fallback={<PageLoader />}><LogoutPage /></Suspense>} />
          </Route>

          {/* ── Webapp (/app/*) ── */}
          <Route path="/app" element={<AppLayout />}>
            <Route index             element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
            <Route path="roadmap"    element={<Suspense fallback={<PageLoader />}><Roadmap /></Suspense>} />
            <Route path="tasks"      element={<Suspense fallback={<PageLoader />}><Tasks /></Suspense>} />
            <Route path="progress"   element={<Suspense fallback={<PageLoader />}><Progress /></Suspense>} />
            <Route path="settings"   element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
            <Route path="onboarding"  element={<Suspense fallback={<PageLoader />}><Onboarding /></Suspense>} />
            <Route path="assessment"  element={<Suspense fallback={<PageLoader />}><Assessment /></Suspense>} />
            <Route path="assessment-v2" element={<Suspense fallback={<PageLoader />}><AssessmentV2 /></Suspense>} />
            <Route path="assessment-v2/results" element={<Suspense fallback={<PageLoader />}><AssessmentV2Results /></Suspense>} />
            <Route path="skill-gaps" element={<Suspense fallback={<PageLoader />}><SkillGaps /></Suspense>} />
            <Route path="skill-gap-assessment" element={<Suspense fallback={<PageLoader />}><SkillGapAssessment /></Suspense>} />
            <Route path="streaks"       element={<Suspense fallback={<PageLoader />}><Streaks /></Suspense>} />
            <Route path="achievements"  element={<Suspense fallback={<PageLoader />}><AchievementsPage /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>} />
            <Route path="certificates"  element={<Suspense fallback={<PageLoader />}><CertificatesPage /></Suspense>} />
            <Route path="help"          element={<Suspense fallback={<PageLoader />}><HelpFAQ /></Suspense>} />
            <Route path="support"       element={<Suspense fallback={<PageLoader />}><SupportPage /></Suspense>} />
            <Route path="certificate"   element={<Suspense fallback={<PageLoader />}><CertificatePage /></Suspense>} />
            <Route path="career-match"  element={<Suspense fallback={<PageLoader />}><CareerMatchDetail /></Suspense>} />
            <Route path="search"        element={<Suspense fallback={<PageLoader />}><SearchPage /></Suspense>} />
            <Route path="admin"         element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
            <Route path="whats-new"     element={<Suspense fallback={<PageLoader />}><WhatsNewAppPage /></Suspense>} />
            <Route path="pro"          element={<Suspense fallback={<PageLoader />}><ProPage /></Suspense>} />
          </Route>

          {/* ── 404 catch-all ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}
