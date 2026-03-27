import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <Logo variant="white" size={40} />
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

        {/* CTA */}
        <div className="navbar__actions">
          <Link to="/pricing" className="btn btn-primary navbar__cta">
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
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/pricing" className="btn btn-primary" onClick={closeMenu}>
            Get Started Free
          </Link>
        </div>
      )}
    </header>
  );
}
