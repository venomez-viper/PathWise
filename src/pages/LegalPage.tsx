import Footer from '@/components/Footer';
import { LEGAL_DOCUMENTS } from './legalData';
import './LegalPage.css';

type LegalDocKey = keyof typeof LEGAL_DOCUMENTS;

export default function LegalPage({ docKey }: { docKey: LegalDocKey }) {
  const document = LEGAL_DOCUMENTS[docKey];

  return (
    <>
      {/* Hero */}
      <section className="legal-hero-section">
        {/* Ambient orbs */}
        <div className="legal-hero-orb legal-hero-orb--purple" />
        <div className="legal-hero-orb legal-hero-orb--teal" />

        <div className="container legal-hero-inner">
          <span className="section-label">Legal</span>
          <h1 className="legal-hero__title display-lg">{document.title}</h1>
          <p className="legal-hero__summary">{document.summary}</p>
          <p className="legal-hero__updated">Last updated {document.lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="legal-content-section">
        <div className="container">
          <article className="legal-glass-card">
            {document.sections.map((section, i) => (
              <div key={section.title} className="legal-section">
                <div className="legal-section__number">{String(i + 1).padStart(2, '0')}</div>
                <h2 className="legal-section__title">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="legal-section__text">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}

            <div className="legal-note">
              <p>
                This document is provided for informational purposes and does not constitute legal
                advice.
              </p>
              <p>
                Questions? Contact us at{' '}
                <a href="mailto:support@pathwise.fit">support@pathwise.fit</a>
              </p>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </>
  );
}
