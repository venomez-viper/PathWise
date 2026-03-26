import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SearchComponent from '@/components/ui/animated-glowing-search-bar';
import Logo from '@/components/ui/Logo';

const NAV_LINKS = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Solution', href: '/solution' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleNavigate = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div
        className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 rounded-[28px] border px-4 py-3 backdrop-blur-xl transition-all duration-300 md:px-5"
        style={{
          background: scrolled ? 'rgba(255, 249, 242, 0.92)' : 'rgba(255, 249, 242, 0.72)',
          borderColor: 'var(--line)',
          boxShadow: scrolled ? '0 18px 42px rgba(69, 44, 20, 0.14)' : '0 10px 28px rgba(69, 44, 20, 0.08)',
        }}
      >
        <Link to="/" className="shrink-0" onClick={handleNavigate}>
          <Logo size={34} />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-[color:var(--line)] bg-white/55 p-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={handleNavigate}
                className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  background: active ? 'rgba(30, 90, 82, 0.1)' : 'transparent',
                  color: active ? 'var(--brand)' : 'var(--ink-soft)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden flex-1 justify-center xl:flex">
          <SearchComponent />
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/blog" className="text-sm font-medium text-[color:var(--ink-soft)]" onClick={handleNavigate}>
            Insights
          </Link>
          <Link to="/pricing" className="btn-primary" onClick={handleNavigate}>
            Join the Waitlist
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/70 text-[color:var(--ink)] md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="mx-auto mt-3 max-w-[1180px] rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-4 shadow-[0_20px_46px_rgba(69,44,20,0.16)] backdrop-blur-xl md:hidden">
          <div className="mb-4">
            <SearchComponent />
          </div>
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={handleNavigate}
                className="rounded-2xl border border-[color:var(--line)] bg-white/50 px-4 py-3 text-sm font-medium text-[color:var(--ink)]"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/pricing" className="btn-primary mt-2" onClick={handleNavigate}>
              Join the Waitlist
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
