import { useMemo, useState } from 'react';
import { ArrowRight, Brain, BriefcaseBusiness, Compass, Newspaper, Sparkles, TrendingUp, Users } from 'lucide-react';
import Footer from '@/components/Footer';

const POSTS = [
  {
    id: 1,
    category: 'Career Discovery',
    title: 'How to find your career identity in five grounded steps',
    excerpt: 'A practical framework for turning vague strengths and preferences into a clearer professional direction.',
    date: 'March 20, 2026',
    readTime: '6 min read',
    icon: Brain,
    featured: true,
  },
  {
    id: 2,
    category: 'Skill Development',
    title: 'Close the skill gap without wasting six months on the wrong things',
    excerpt: 'The fastest path is not more learning. It is better sequencing and better evidence.',
    date: 'March 18, 2026',
    readTime: '5 min read',
    icon: TrendingUp,
  },
  {
    id: 3,
    category: 'Career Switching',
    title: 'What people underestimate when changing careers',
    excerpt: 'Switching roles is less about courage alone and more about designing the right bridge.',
    date: 'March 15, 2026',
    readTime: '8 min read',
    icon: Compass,
  },
  {
    id: 4,
    category: 'Job Readiness',
    title: 'A better way to think about career readiness',
    excerpt: 'Readiness becomes visible when your skills, narrative, and timing start aligning.',
    date: 'March 12, 2026',
    readTime: '4 min read',
    icon: BriefcaseBusiness,
  },
  {
    id: 5,
    category: 'AI and Careers',
    title: 'How AI changes the way people plan a career',
    excerpt: 'The real shift is not automation. It is decision support that is finally personal enough to matter.',
    date: 'March 10, 2026',
    readTime: '7 min read',
    icon: Sparkles,
  },
  {
    id: 6,
    category: 'Networking',
    title: 'Why five strong career relationships beat 500 weak ones',
    excerpt: 'Quality networks unlock better feedback loops, more confidence, and better timing.',
    date: 'March 8, 2026',
    readTime: '5 min read',
    icon: Users,
  },
];

const CATEGORIES = ['All', 'Career Discovery', 'Skill Development', 'Career Switching', 'Job Readiness', 'AI and Careers', 'Networking'];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const featured = POSTS.find((post) => post.featured);
  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return POSTS.filter((post) => !post.featured);
    return POSTS.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
      <section className="container pt-28 md:pt-36">
        <div className="section-shell px-6 py-8 md:px-8 md:py-10">
          <div className="max-w-3xl">
            <div className="section-label">
              <span className="eyebrow-dot" />
              PathWise journal
            </div>
            <h1 className="mt-5 section-title">Career insight for people building on purpose.</h1>
            <p className="mt-5 section-copy">
              Research-backed thinking on career discovery, progress, and smarter long-term moves.
            </p>
          </div>

          {featured && activeCategory === 'All' && (
            <div className="mt-10 grid gap-6 rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-dark)] p-6 text-white lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[24px] bg-white/5 p-6">
                <div className="section-label bg-white/10 text-white">
                  <span className="eyebrow-dot bg-[color:var(--brand-gold)]" />
                  Featured article
                </div>
                <h2 className="mt-5 text-3xl font-bold">{featured.title}</h2>
                <p className="mt-4 text-base leading-7 text-white/70">{featured.excerpt}</p>
              </div>
              <div className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-white/5 p-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/55">{featured.category}</p>
                  <div className="mt-4 flex items-center gap-3 text-sm text-white/65">
                    <Newspaper className="h-4 w-4 text-[color:var(--brand-gold)]" />
                    {featured.date}
                    <span>/</span>
                    {featured.readTime}
                  </div>
                </div>
                <button type="button" className="btn-primary mt-6 w-fit">
                  Read featured piece
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  background: activeCategory === category ? 'rgba(30, 90, 82, 0.12)' : 'rgba(255,255,255,0.68)',
                  border: '1px solid var(--line)',
                  color: activeCategory === category ? 'var(--brand)' : 'var(--ink)',
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => {
              const Icon = post.icon;
              return (
                <article key={post.id} className="rounded-[28px] border border-[color:var(--line)] bg-white/72 p-6">
                  <div className="rounded-2xl bg-[rgba(216,109,61,0.1)] p-3 text-[color:var(--brand-warm)] w-fit">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--brand)]">{post.category}</p>
                  <h2 className="mt-3 text-2xl font-bold text-[color:var(--ink)]">{post.title}</h2>
                  <p className="mt-4 text-base leading-7 text-[color:var(--ink-soft)]">{post.excerpt}</p>
                  <div className="mt-5 text-sm text-[color:var(--ink-soft)]">
                    {post.date} / {post.readTime}
                  </div>
                  <button type="button" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--brand)]">
                    Read article
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
