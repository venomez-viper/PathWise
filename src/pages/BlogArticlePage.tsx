import { Link, useParams } from 'react-router-dom';
import type { CSSProperties } from 'react';
import Footer from '@/components/Footer';
import { BLOG_ARTICLES, getBlogArticleBySlug } from './blogData';
import './Blog.css';

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getBlogArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <>
        <section className="blog-page">
          <div className="blog-page__bg" />
          <div className="container">
            <article className="blog-reader card">
              <div className="blog-reader__intro">
                <span className="blog-post__cat">Blog</span>
                <h1 className="blog-reader__title">Article not found</h1>
                <p className="blog-reader__lead">
                  That article does not exist anymore or the link is incorrect.
                </p>
                <Link to="/blog" className="btn btn-primary">
                  Back to blog
                </Link>
              </div>
            </article>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const relatedArticles = BLOG_ARTICLES.filter((entry) => entry.slug !== article.slug).slice(0, 3);

  return (
    <>
      <section className="blog-page">
        <div className="blog-page__bg" />
        <div className="container">
          <article className="blog-reader card" style={{ '--blog-accent': article.accent } as CSSProperties}>
            <div className="blog-reader__intro">
              <div className="blog-reader__nav">
                <Link to="/blog" className="blog-reader__back">
                  Back to blog
                </Link>
              </div>
              <div className="blog-reader__eyebrow">
                <span className="blog-post__cat">{article.category}</span>
                <span className="blog-reader__eyebrow-line" />
              </div>
              <h1 className="blog-reader__title">{article.title}</h1>
              <div className="blog-post__meta">
                <span>{article.author}</span>
                <span>/</span>
                <span>{article.date}</span>
                <span>/</span>
                <span>{article.readTime}</span>
              </div>
            </div>

            <figure className="blog-reader__figure">
              <img src={article.image.src} alt={article.image.alt} className="blog-reader__image" />
              <figcaption className="blog-reader__caption">
                <a href={article.image.creditHref} target="_blank" rel="noreferrer">
                  {article.image.credit}
                </a>
              </figcaption>
            </figure>

            <div className="blog-reader__body">
              {article.intro.map((paragraph) => (
                <p key={paragraph} className="blog-reader__lead">
                  {paragraph}
                </p>
              ))}

              {article.sections.map((section) => (
                <div key={section.heading} className="blog-reader__section">
                  <h2 className="blog-reader__section-title">{section.heading}</h2>
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
                  {article.takeaways.map((takeaway) => (
                    <li key={takeaway}>{takeaway}</li>
                  ))}
                </ul>
              </div>

              <div className="blog-reader__references">
                <h3>References and further reading</h3>
                <ol>
                  {article.references.map((reference) => (
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

          <div className="blog-related">
            <div className="blog-related__header">
              <span className="section-label">More Reads</span>
              <h2 className="section-title">More from the PathWise blog</h2>
            </div>

            <div className="blog-grid">
              {relatedArticles.map((entry) => (
                <article key={entry.id} className="blog-card card">
                  <div className="blog-card__image-wrap">
                    <img
                      src={entry.image.src}
                      alt={entry.image.alt}
                      className="blog-card__image"
                      loading="lazy"
                    />
                  </div>
                  <span className="blog-post__cat" style={{ color: entry.accent }}>
                    {entry.category}
                  </span>
                  <h3 className="blog-card__title">
                    <Link to={`/blog/${entry.slug}`} className="blog-card__title-link">
                      {entry.title}
                    </Link>
                  </h3>
                  <p className="blog-card__excerpt">{entry.excerpt}</p>
                  <div className="blog-post__meta">
                    <span>{entry.date}</span>
                    <span>/</span>
                    <span>{entry.readTime}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
