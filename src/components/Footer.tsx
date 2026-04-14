import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import './Footer.css';

const ROUTE_MAP: Record<string, string> = {
  'How It Works': '/how-it-works',
  'Features': '/features',
  'Compare': '/compare',
  'Solution': '/solution',
  'Pricing': '/pricing',
  'Early Access': '/signup',
  Blog: '/blog',
  'About Us': '/about',
  FAQ: '/faq',
  Contact: '/contact',
  'Privacy Policy': '/privacy-policy',
  'Terms of Service': '/terms-of-service',
  'Cookie Policy': '/cookie-policy',
  "What's New": '/whats-new',
};

const LINKS = {
  Product: ['How It Works', 'Solution', 'Features', 'Pricing', "What's New"],
  Company: ['About Us', 'Blog', 'FAQ', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/pathwise-fit', shortLabel: 'IN' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <Logo variant="white" size={36} />
          </div>
          <p className="footer__tagline">
            "Your career is too important to leave to chance."
            <br />
            AI-Powered Career Orientation &amp; Professional Direction.
          </p>
          <div className="footer__social">
            {SOCIAL_LINKS.map(({ label, href, shortLabel }) => (
              <a key={label} href={href} className="footer__social-link" aria-label={label}>
                <span>{shortLabel}</span>
              </a>
            ))}
          </div>
        </div>

        {Object.entries(LINKS).map(([category, items]) => (
          <div key={category} className="footer__col">
            <h4 className="footer__col-title">{category}</h4>
            <ul className="footer__col-links">
              {items.map((item) => {
                const route = ROUTE_MAP[item];
                return (
                  <li key={item}>
                    {route ? (
                      <Link to={route} className="footer__link">
                        {item}
                      </Link>
                    ) : (
                      <span className="footer__link">{item}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>Copyright 2026 PathWise. All rights reserved.</p>
          <p>Built with care for every professional who dares to aim higher.</p>
        </div>
      </div>
    </footer>
  );
}
