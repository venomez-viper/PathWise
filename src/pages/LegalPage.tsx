import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, FileText, Shield, Cookie, ChevronRight } from 'lucide-react';
import Footer from '@/components/Footer';
import { LEGAL_DOCUMENTS } from './legalData';
import './LegalPage.css';

type LegalDocKey = keyof typeof LEGAL_DOCUMENTS;

const DOC_ICONS: Record<LegalDocKey, typeof FileText> = {
  terms: FileText,
  privacy: Shield,
  cookies: Cookie,
};

const DOC_LABELS: Record<LegalDocKey, string> = {
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  cookies: 'Cookie Policy',
};

const DOC_ROUTES: Record<LegalDocKey, string> = {
  privacy: '/privacy-policy',
  terms: '/terms-of-service',
  cookies: '/cookie-policy',
};

export default function LegalPage({ docKey }: { docKey: LegalDocKey }) {
  const document = LEGAL_DOCUMENTS[docKey];
  const Icon = DOC_ICONS[docKey];
  const [activeSection, setActiveSection] = useState(0);
  const [readProgress, setReadProgress] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = -rect.top + window.innerHeight * 0.3;
      setReadProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveSection(idx);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );
    sectionRefs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [docKey]);

  const scrollToSection = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const otherDocs = (Object.keys(LEGAL_DOCUMENTS) as LegalDocKey[]).filter((k) => k !== docKey);

  return (
    <>
      {/* Reading progress */}
      <div className="legal-progress" style={{ width: `${readProgress}%` }} />

      {/* Hero */}
      <section className="legal-hero">
        <div className="container legal-hero__inner">
          <Link to="/" className="legal-hero__back">
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <div className="legal-hero__icon-wrap">
            <Icon size={24} />
          </div>

          <h1 className="legal-hero__title">{document.title}</h1>
          <p className="legal-hero__summary">{document.summary}</p>

          <div className="legal-hero__meta">
            <span className="legal-hero__updated">Last updated {document.lastUpdated}</span>
            <span className="legal-hero__divider" />
            <span className="legal-hero__count">{document.sections.length} sections</span>
          </div>
        </div>
      </section>

      {/* Body: TOC sidebar + content */}
      <section className="legal-body" ref={contentRef}>
        <div className="container legal-body__grid">
          {/* Sticky TOC */}
          <aside className="legal-toc">
            <div className="legal-toc__sticky">
              <p className="legal-toc__heading">On this page</p>
              <nav className="legal-toc__nav">
                {document.sections.map((section, i) => (
                  <button
                    key={section.title}
                    className={`legal-toc__item ${activeSection === i ? 'legal-toc__item--active' : ''}`}
                    onClick={() => scrollToSection(i)}
                  >
                    <span className="legal-toc__num">{String(i + 1).padStart(2, '0')}</span>
                    {section.title.replace(/^\d+\.\s*/, '')}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="legal-content">
            {document.sections.map((section, i) => (
              <div
                key={section.title}
                className="legal-section"
                ref={(el) => { sectionRefs.current[i] = el; }}
                id={`section-${i}`}
              >
                <div className="legal-section__header">
                  <span className="legal-section__num">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="legal-section__title">{section.title.replace(/^\d+\.\s*/, '')}</h2>
                </div>
                <div className="legal-section__body">
                  {section.paragraphs.map((paragraph, pi) => (
                    <p key={pi} className="legal-section__text">{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Disclaimer */}
            <div className="legal-disclaimer">
              This document is provided for informational purposes and does not constitute legal advice.
            </div>

            {/* Contact card */}
            <div className="legal-contact">
              <div className="legal-contact__icon">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="legal-contact__title">Questions about this policy?</h3>
                <p className="legal-contact__desc">
                  Our team is happy to help clarify anything. Reach out anytime.
                </p>
              </div>
              <a href="mailto:support@pathwise.fit" className="legal-contact__btn">
                support@pathwise.fit
              </a>
            </div>

            {/* Other legal docs */}
            <div className="legal-related">
              <p className="legal-related__heading">Related policies</p>
              <div className="legal-related__links">
                {otherDocs.map((key) => {
                  const OtherIcon = DOC_ICONS[key];
                  return (
                    <Link key={key} to={DOC_ROUTES[key]} className="legal-related__card">
                      <span className="legal-related__card-icon">
                        <OtherIcon size={16} />
                      </span>
                      <span className="legal-related__card-label">{DOC_LABELS[key]}</span>
                      <ChevronRight size={14} className="legal-related__card-arrow" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </>
  );
}
