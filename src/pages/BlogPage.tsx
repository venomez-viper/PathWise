import { useRef, useState, type CSSProperties } from 'react';
import Footer from '@/components/Footer';
import { BLOG_ARTICLES, BLOG_CATEGORIES } from './blogData';
import './Blog.css';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeArticleId, setActiveArticleId] = useState(BLOG_ARTICLES[0].id);
  const readerRef = useRef<HTMLElement | null>(null);

  const filteredArticles =
    activeCategory === 'All'
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter((article) => article.category === activeCategory);

  const activeArticle =
    filteredArticles.find((article) => article.id === activeArticleId) ??
    filteredArticles[0] ??
    BLOG_ARTICLES[0];

  const featuredArticle = BLOG_ARTICLES.find((article) => article.featured) ?? BLOG_ARTICLES[0];
  const gridArticles = filteredArticles.filter((article) => article.id !== activeArticle.id);

  const openArticle = (articleId: number) => {
    setActiveArticleId(articleId);
    window.requestAnimationFrame(() => {
      readerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <>
      <section className="blog-page">
        <div className="blog-page__bg" />
        <div className="container">
          <div className="blog-header">
            <span className="section-label">Blog</span>
            <h1 className="blog-header__title display-lg">
              Career insight that feels useful,
              <span className="gradient-text"> not generic</span>
            </h1>
            <p className="blog-header__sub">
              Long-form reads on career planning, skill building, job readiness, and the real work
              of figuring out what comes next.
            </p>
          </div>

          {activeCategory === 'All' && featuredArticle && (
            <article className="blog-featured card">
              <div className="blog-featured__content">
                <span className="blog-post__cat" style={{ color: featuredArticle.accent }}>
                  Featured article
                </span>
                <h2 className="blog-featured__title">{featuredArticle.title}</h2>
                <p className="blog-featured__excerpt">{featuredArticle.excerpt}</p>
                <div className="blog-post__meta">
                  <span>{featuredArticle.author}</span>
                  <span>/</span>
                  <span>{featuredArticle.date}</span>
                  <span>/</span>
                  <span>{featuredArticle.readTime}</span>
                </div>
                <button
                  className="btn btn-primary blog-featured__cta"
                  onClick={() => openArticle(featuredArticle.id)}
                  type="button"
                >
                  Read featured article
                </button>
              </div>
              <div className="blog-featured__media">
                <img
                  src={featuredArticle.image.src}
                  alt={featuredArticle.image.alt}
                  className="blog-featured__image"
                />
              </div>
            </article>
          )}

          <div className="blog-filters" aria-label="Filter blog posts by category">
            {BLOG_CATEGORIES.map((category) => (
              <button
                key={category}
                className={`blog-filter-btn${activeCategory === category ? ' active' : ''}`}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>

          <article
            className="blog-reader card"
            ref={readerRef}
            style={{ '--blog-accent': activeArticle.accent } as CSSProperties}
          >
            <div className="blog-reader__intro">
              <div className="blog-reader__eyebrow">
                <span className="blog-post__cat">{activeArticle.category}</span>
                <span className="blog-reader__eyebrow-line" />
              </div>
              <h2 className="blog-reader__title">{activeArticle.title}</h2>
              <div className="blog-post__meta">
                <span>{activeArticle.author}</span>
                <span>/</span>
                <span>{activeArticle.date}</span>
                <span>/</span>
                <span>{activeArticle.readTime}</span>
              </div>
            </div>

            <figure className="blog-reader__figure">
              <img
                src={activeArticle.image.src}
                alt={activeArticle.image.alt}
                className="blog-reader__image"
              />
              <figcaption className="blog-reader__caption">
                <a href={activeArticle.image.creditHref} target="_blank" rel="noreferrer">
                  {activeArticle.image.credit}
                </a>
              </figcaption>
            </figure>

            <div className="blog-reader__body">
              {activeArticle.intro.map((paragraph) => (
                <p key={paragraph} className="blog-reader__lead">
                  {paragraph}
                </p>
              ))}

              {activeArticle.sections.map((section) => (
                <div key={section.heading} className="blog-reader__section">
                  <h3 className="blog-reader__section-title">{section.heading}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ))}
            </div>

            <div className="blog-reader__footer">
              <div className="blog-reader__takeaways">
                <h3>What to keep in mind</h3>
                <ul>
                  {activeArticle.takeaways.map((takeaway) => (
                    <li key={takeaway}>{takeaway}</li>
                  ))}
                </ul>
              </div>

              <div className="blog-reader__references">
                <h3>References and further reading</h3>
                <ol>
                  {activeArticle.references.map((reference) => (
                    <li key={reference.href}>
                      <a href={reference.href} target="_blank" rel="noreferrer">
                        {reference.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </article>

          <div className="blog-grid">
            {gridArticles.map((article) => (
              <article key={article.id} className="blog-card card">
                <div className="blog-card__image-wrap">
                  <img
                    src={article.image.src}
                    alt={article.image.alt}
                    className="blog-card__image"
                    loading="lazy"
                  />
                </div>
                <span className="blog-post__cat" style={{ color: article.accent }}>
                  {article.category}
                </span>
                <h3 className="blog-card__title">{article.title}</h3>
                <p className="blog-card__excerpt">{article.excerpt}</p>
                <div className="blog-post__meta">
                  <span>{article.date}</span>
                  <span>/</span>
                  <span>{article.readTime}</span>
                </div>
                <button
                  className="blog-card__link"
                  onClick={() => openArticle(article.id)}
                  type="button"
                >
                  Read this article
                </button>
              </article>
            ))}
          </div>

          <div className="blog-newsletter glass-card">
            <span className="blog-newsletter__eyebrow">Weekly brief</span>
            <h3 className="blog-newsletter__title">Get career insights in your inbox</h3>
            <p>
              Thoughtful reads on career planning, AI tools, and how to move with more confidence.
            </p>
            <form className="blog-newsletter__form" onSubmit={(event) => event.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="blog-newsletter__input"
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
