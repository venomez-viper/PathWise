import Footer from '@/components/Footer';
import { LEGAL_DOCUMENTS } from './legalData';
import './LegalPage.css';

type LegalDocKey = keyof typeof LEGAL_DOCUMENTS;

export default function LegalPage({ docKey }: { docKey: LegalDocKey }) {
  const document = LEGAL_DOCUMENTS[docKey];

  return (
    <>
      <section className="legal-page">
        <div className="legal-page__bg" />
        <div className="container legal-page__container">
          <header className="legal-hero">
            <span className="section-label">Legal</span>
            <h1 className="legal-hero__title display-lg">{document.title}</h1>
            <p className="legal-hero__summary">{document.summary}</p>
            <p className="legal-hero__updated">Last updated {document.lastUpdated}</p>
          </header>

          <article className="legal-card card">
            {document.sections.map((section) => (
              <div key={section.title} className="legal-section">
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
                This page is provided for general information about how PathWise operates today. It
                is not legal advice.
              </p>
            </div>
          </article>
        </div>
      </section>
      <Footer />
    </>
  );
}
