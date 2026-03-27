import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import { BLOG_ARTICLES, BLOG_CATEGORIES } from './blogData';
import './Blog.css';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredArticles =
    activeCategory === 'All'
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter((article) => article.category === activeCategory);

  const featuredArticle = BLOG_ARTICLES.find((article) => article.featured) ?? BLOG_ARTICLES[0];
  const gridArticles =
    activeCategory === 'All'
      ? filteredArticles.filter((article) => article.id !== featuredArticle.id)
      : filteredArticles;

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
                <Link className="btn btn-primary blog-featured__cta" to={`/blog/${featuredArticle.slug}`}>
                  Read featured article
                </Link>
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
                <h3 className="blog-card__title">
                  <Link to={`/blog/${article.slug}`} className="blog-card__title-link">
                    {article.title}
                  </Link>
                </h3>
                <p className="blog-card__excerpt">{article.excerpt}</p>
                <div className="blog-post__meta">
                  <span>{article.date}</span>
                  <span>/</span>
                  <span>{article.readTime}</span>
                </div>
                <Link className="blog-card__link" to={`/blog/${article.slug}`}>
                  Read this article
                </Link>
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
