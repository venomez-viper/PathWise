import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { FlaskConical, Rocket, TrendingUp, ShieldCheck } from 'lucide-react';
import Footer from '../components/Footer';

const VALUES = [
  {
    icon: FlaskConical,
    title: 'Science First',
    desc: 'Built on four validated psychological frameworks - Holland RIASEC, Big Five personality, Schwartz Values theory, and aptitude mapping. Not pop psychology. Real research.',
    color: '#a78bfa',
  },
  {
    icon: Rocket,
    title: 'Action Over Labels',
    desc: 'We don\'t hand you a personality type and wish you luck. We generate daily tasks, milestone roadmaps, and skill-gap plans you can actually follow.',
    color: '#5ef6e6',
  },
  {
    icon: TrendingUp,
    title: 'Continuous Growth',
    desc: 'The assessment is the beginning, not the end. PathWise learns as you grow - your profile at month six is more accurate than day one.',
    color: '#f59e0b',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy Respected',
    desc: 'No social media scraping. No browsing history. No employer data. Just your honest answers, scored with mathematical precision.',
    color: '#34d399',
  },
];

const STATS = [
  { value: '90+', label: 'Careers Mapped' },
  { value: '10', label: 'Assessment Dimensions' },
  { value: '4', label: 'Research Frameworks' },
  { value: '1', label: 'Mission' },
];

export default function AboutPage() {
  return (
    <>
      <section style={{ padding: 0, background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', paddingTop: 'calc(72px + 3rem)', paddingBottom: '4rem' }}>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <div style={{
              display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)',
              background: 'var(--primary-fixed)', padding: '4px 14px',
              borderRadius: 'var(--radius-full)', marginBottom: 'var(--spacing-4)',
            }}>
              Our Story
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 5vw, 3.25rem)',
              fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.03em',
              lineHeight: 1.1, marginBottom: '1.25rem',
            }}>
              Built by students,{' '}
              <span style={{ color: 'var(--primary)' }}>for students.</span>
            </h1>
            <p style={{
              fontSize: '1.1rem', color: 'var(--on-surface-variant)', lineHeight: 1.7,
              maxWidth: 640, margin: '0 auto',
            }}>
              We're six students from DePaul University who saw that career guidance was broken -
              personality quizzes that give you a label and stop, generic advice that helps no one,
              and tools that treat your career like a one-time transaction. So we decided to fix it.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(98, 69, 164, 0.06) 0%, rgba(0, 106, 98, 0.04) 100%)',
              borderRadius: 'var(--radius-2xl)', padding: 'clamp(2rem, 4vw, 3rem)',
              textAlign: 'center', marginBottom: '4rem',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em',
              lineHeight: 1.2, marginBottom: '1rem',
            }}>
              Your career is too important to leave to chance.
            </h2>
            <p style={{
              fontSize: '1rem', color: 'var(--on-surface-variant)', lineHeight: 1.7,
              maxWidth: 600, margin: '0 auto',
            }}>
              We built PathWise on a simple thesis: career guidance should be continuous, not a single event.
              The assessment is just the entry point to an intelligence engine that turns real career science
              into a daily action plan - one that grows smarter the longer you use it.
            </p>
          </motion.div>

          {/* Values */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem', marginBottom: '4rem',
          }}>
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{
                  background: 'var(--surface-container-lowest)',
                  borderRadius: 'var(--radius-2xl)', padding: '2rem',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                  background: `${v.color}18`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                }}>
                  <v.icon size={24} color={v.color} />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.1rem',
                  fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem',
                }}>
                  {v.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1.5rem', marginBottom: '4rem', textAlign: 'center',
            }}
          >
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em',
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center' }}
          >
            <Link
              to="/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.9rem 2.5rem',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
                color: '#fff', border: 'none', borderRadius: 'var(--radius-full)',
                fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              Start Your Journey
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}
