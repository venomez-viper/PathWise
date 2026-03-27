import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

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
import SignIn       from './pages/SignIn';
import SignUp       from './pages/SignUp';
import './App.css';

/** Marketing site layout */
function MarketingLayout() {
  return (
    <div className="marketing-root">
      <Navbar />
      <Outlet />
    </div>
  );
}

/** SaaS webapp layout — sidebar + main content */
function AppLayout() {
  return (
    <div className="saas-layout">
      <Sidebar />
      <main className="saas-main">
        <Outlet />
      </main>
    </div>
  );
}

/** Auth screens — no nav */
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
          <Route path="onboarding" element={<Onboarding />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
