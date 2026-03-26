import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';

import HomePage from './pages/Home';
import HowItWorksPage from './pages/HowItWorksPage';
import SolutionPage from './pages/SolutionPage';
import PricingPage from './pages/PricingPage';
import BlogPage from './pages/BlogPage';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Tasks from './pages/Tasks';
import Progress from './pages/Progress';
import SettingsPage from './pages/Settings';
import Onboarding from './pages/Onboarding';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import './App.css';

function MarketingLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function AppLayout() {
  return (
    <div className="app-container">
      <AppHeader />
      <Outlet />
      <BottomNav />
    </div>
  );
}

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
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/solution" element={<SolutionPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blog" element={<BlogPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="progress" element={<Progress />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="onboarding" element={<Onboarding />} />
        </Route>

        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
