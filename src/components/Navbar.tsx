import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchComponent from '@/components/ui/animated-glowing-search-bar';
import Logo from '@/components/ui/Logo';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Solution', href: '/solution' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <Logo size={40} />
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`navbar__link${isActive(link.href) ? ' navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Glowing Search Bar */}
        <div className="navbar__search">
          <SearchComponent />
        </div>

        {/* CTA */}
        <div className="navbar__actions">
          <Link to="/signin" className="btn btn-outline navbar__cta-secondary">
            Sign In
          </Link>
          <Link to="/signup" className="btn btn-primary navbar__cta">
            Get Started Free
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className="navbar__mobile-link"
            >
              {link.label}
            </Link>
          ))}
          <div className="navbar__mobile-search">
            <SearchComponent />
          </div>
          <Link to="/signin" className="btn btn-outline" style={{ textAlign: 'center' }}>
            Sign In
          </Link>
          <Link to="/signup" className="btn btn-primary">
            Get Started Free
          </Link>
        </div>
      )}
    </header>
  );
}
