import './Footer.css';

const LINKS = {
  Product: ['How It Works', 'Solution', 'Pricing', 'Early Access'],
  Company: ['About', 'Careers', 'Blog', 'Press'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/logo.png" alt="PathWise" />
            <span>PathWise</span>
          </div>
          <p className="footer__tagline">
            "Your career is too important to leave to chance."<br />
            AI-Powered Career Orientation & Professional Direction.
          </p>
          <div className="footer__social">
            {['𝕏', 'in', '▶'].map((icon, i) => (
              <a key={i} href="#" className="footer__social-link">{icon}</a>
            ))}
          </div>
        </div>

        {Object.entries(LINKS).map(([category, items]) => (
          <div key={category} className="footer__col">
            <h4 className="footer__col-title">{category}</h4>
            <ul className="footer__col-links">
              {items.map((item, i) => (
                <li key={i}><a href="#" className="footer__link">{item}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© 2026 PathWise (Zafuture Group 5). All rights reserved.</p>
          <p>Built with ✦ for every professional who dares to aim higher.</p>
        </div>
      </div>
    </footer>
  );
}
