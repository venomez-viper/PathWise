import { useState } from 'react';
import Footer from '@/components/Footer';
import './Blog.css';

const POSTS = [
  {
    id: 1,
    category: 'Career Discovery',
    title: 'How to Find Your Career Identity in 5 Steps',
    excerpt: 'Most people skip the most important step in career planning - understanding who they actually are. Here\'s a proven framework to map your strengths, values, and personality to real career paths.',
    author: 'PathWise Team',
    date: 'March 20, 2026',
    readTime: '6 min read',
    emoji: '🧬',
    accent: '#a78bfa',
    featured: true,
  },
  {
    id: 2,
    category: 'Skill Development',
    title: 'The Skill Gap Is Real - Here\'s How to Close It Fast',
    excerpt: 'Between where you are and where you want to be lies a gap. AI-powered analysis can now tell you exactly which skills to learn, in what order, and how long each will take.',
    author: 'PathWise Team',
    date: 'March 18, 2026',
    readTime: '5 min read',
    emoji: '📊',
    accent: '#5ef6e6',
  },
  {
    id: 3,
    category: 'Career Switching',
    title: 'Career Switching at 30: What No One Tells You',
    excerpt: 'Switching careers mid-stream is terrifying - and increasingly common. We\'ve mapped the paths of 500+ career switchers to find out what actually worked.',
    author: 'PathWise Team',
    date: 'March 15, 2026',
    readTime: '8 min read',
    emoji: '🔄',
    accent: '#fbbf24',
  },
  {
    id: 4,
    category: 'Job Readiness',
    title: 'Your Career Readiness Score: What It Means and How to Improve It',
    excerpt: 'A readiness score is more than a number - it\'s a diagnostic. Learn what factors go into calculating career readiness and the fastest levers to pull.',
    author: 'PathWise Team',
    date: 'March 12, 2026',
    readTime: '4 min read',
    emoji: '🏆',
    accent: '#f87171',
  },
  {
    id: 5,
    category: 'AI & Careers',
    title: 'How AI Is Changing Career Planning Forever',
    excerpt: 'Job boards show what\'s available today. AI career platforms show where you should be in 5 years - and exactly how to get there. Here\'s what\'s changed.',
    author: 'PathWise Team',
    date: 'March 10, 2026',
    readTime: '7 min read',
    emoji: '🤖',
    accent: '#a78bfa',
  },
  {
    id: 6,
    category: 'Networking',
    title: 'Strategic Networking: Quality Over Quantity',
    excerpt: 'Most networking advice is wrong. You don\'t need 500 LinkedIn connections - you need 5 meaningful relationships in the right places. Here\'s how to build them.',
    author: 'PathWise Team',
    date: 'March 8, 2026',
    readTime: '5 min read',
    emoji: '🌐',
    accent: '#5ef6e6',
  },
];

const CATEGORIES = ['All', 'Career Discovery', 'Skill Development', 'Career Switching', 'Job Readiness', 'AI & Careers', 'Networking'];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? POSTS
    : POSTS.filter(p => p.category === activeCategory);

  const featured = POSTS.find(p => p.featured);
  const grid = filtered.filter(p => !p.featured || activeCategory !== 'All');

  return (
    <>
      <section className="blog-page">
        <div className="blog-page__bg" />
        <div className="container">

          {/* Header */}
          <div className="blog-header">
            <span className="section-label">Blog</span>
            <h1 className="blog-header__title display-lg">
              Career insights,{' '}
              <span className="gradient-text">straight from the data</span>
            </h1>
            <p className="blog-header__sub">
              Guides, research, and frameworks for every stage of your career journey.
            </p>
          </div>

          {/* Featured post */}
          {activeCategory === 'All' && featured && (
            <div className="blog-featured card">
              <div className="blog-featured__emoji">{featured.emoji}</div>
              <div className="blog-featured__body">
                <span className="blog-post__cat" style={{ color: featured.accent }}>{featured.category}</span>
                <h2 className="blog-featured__title">{featured.title}</h2>
                <p className="blog-featured__excerpt">{featured.excerpt}</p>
                <div className="blog-post__meta">
                  <span>{featured.author}</span>
                  <span>·</span>
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span>{featured.readTime}</span>
                </div>
                <button className="btn btn-primary blog-featured__cta">Read Article →</button>
              </div>
            </div>
          )}

          {/* Category filters */}
          <div className="blog-filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`blog-filter-btn${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts grid */}
          <div className="blog-grid">
            {grid.map(post => (
              <article key={post.id} className="blog-card card">
                <div className="blog-card__emoji-wrap" style={{ background: `${post.accent}15`, color: post.accent }}>
                  {post.emoji}
                </div>
                <span className="blog-post__cat" style={{ color: post.accent }}>{post.category}</span>
                <h3 className="blog-card__title">{post.title}</h3>
                <p className="blog-card__excerpt">{post.excerpt}</p>
                <div className="blog-post__meta">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <button className="blog-card__link">Read more →</button>
              </article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="blog-newsletter glass-card">
            <div className="blog-newsletter__emoji">✉️</div>
            <h3 className="blog-newsletter__title">Get career insights in your inbox</h3>
            <p>Weekly articles on career planning, AI tools, and job market trends.</p>
            <form className="blog-newsletter__form" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className="blog-newsletter__input" />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>

        </div>
      </section>
      <Footer />
    </>
  );
}
