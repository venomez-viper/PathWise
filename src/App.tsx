import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

// Marketing site components
import Navbar          from './components/Navbar';
import HomePage        from './pages/Home';
import HowItWorksPage  from './pages/HowItWorksPage';
import SolutionPage    from './pages/SolutionPage';
import PricingPage     from './pages/PricingPage';
import BlogPage        from './pages/BlogPage';

// Webapp components
import AppHeader    from './components/AppHeader';
import BottomNav    from './components/BottomNav';
import Dashboard    from './pages/Dashboard';
import Roadmap      from './pages/Roadmap';
import Tasks        from './pages/Tasks';
import Progress     from './pages/Progress';
import SettingsPage from './pages/Settings';
import Onboarding   from './pages/Onboarding';
import SignIn       from './pages/SignIn';
import SignUp       from './pages/SignUp';
import './App.css';

/** Marketing site layout — uses top Navbar */
function MarketingLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

/** Webapp layout — uses AppHeader + BottomNav */
function AppLayout() {
  return (
    <div className="app-container">
      <AppHeader />
      <Outlet />
      <BottomNav />
    </div>
  );
}

/** Auth screens — no nav at all */
function AuthLayout() {
  return (
    <div className="app-container">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Marketing site (/  /how-it-works  /solution  /pricing  /blog) ── */}
        <Route element={<MarketingLayout />}>
          <Route path="/"             element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/solution"     element={<SolutionPage />} />
          <Route path="/pricing"      element={<PricingPage />} />
          <Route path="/blog"         element={<BlogPage />} />
        </Route>

        {/* ── Auth screens (/signin  /signup) ── */}
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        {/* ── Webapp (/app/*) ── */}
        <Route path="/app" element={<AppLayout />}>
          <Route index                    element={<Dashboard />} />
          <Route path="roadmap"           element={<Roadmap />} />
          <Route path="tasks"             element={<Tasks />} />
          <Route path="progress"          element={<Progress />} />
          <Route path="settings"          element={<SettingsPage />} />
          <Route path="onboarding"        element={<Onboarding />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
