import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Dna, BrainCircuit, Signpost, ScanSearch, Flame, BadgeCheck, Check, ArrowRight,
} from 'lucide-react';
import Footer from '../components/Footer';

const FEATURES = [
  {
    icon: Dna,
    color: '#a78bfa',
    title: 'Scientific Assessment',
    desc: 'A 5-minute assessment that measures you across 10 dimensions - not a personality quiz, a psychometric instrument.',
    bullets: [
      'Four validated frameworks: Holland RIASEC, Big Five, Schwartz Values, aptitude mapping',
      'Scored against 90+ career profiles simultaneously',
      'Cross-dimensional synergy detection finds patterns single-framework tests miss',
    ],
  },
  {
    icon: BrainCircuit,
    color: '#5ef6e6',
    title: 'Career Brain',
    desc: 'A scoring engine that evaluates you across 12 independent dimensions using cosine similarity and Jaccard overlap scoring.',
    bullets: [
      '30 distinct career archetypes - not generic labels, but real personality-interest combinations',
      'Penalizes vague matches, rewards genuine alignment',
      'Zero surveillance - no browsing history, no social media, just your answers',
    ],
  },
  {
    icon: Signpost,
    color: '#3b82f6',
    title: 'Personalized Roadmaps',
    desc: 'Step-by-step career roadmaps for your top matches, broken into milestones you can actually follow.',
    bullets: [
      'Daily tasks broken down into actionable steps',
      'Milestone tracking with verifiable checkpoints',
      'Adapts as you complete tasks and develop skills',
    ],
  },
  {
    icon: ScanSearch,
    color: '#f43f5e',
    title: 'Skill Gap Analysis',
    desc: 'Know exactly what you\'re missing and what to learn next, prioritized by impact on your career matches.',
    bullets: [
      'Identifies gaps between your current skills and target careers',
      'Prioritized by which skills move the needle most',
      'Connected directly to your roadmap tasks',
    ],
  },
  {
    icon: Flame,
    color: '#f59e0b',
    title: 'Streaks & Achievements',
    desc: 'Built on behavioral science to help you build lasting career development habits.',
    bullets: [
      'Daily streak tracking rewards consistent progress',
      'Dynamic achievements tied to real milestones, not vanity metrics',
      'Designed using research on habit formation and intrinsic motivation',
    ],
  },
  {
    icon: BadgeCheck,
    color: '#34d399',
    title: 'Certificates',
    desc: 'Verifiable completion certificates that prove you did the work - not just took a quiz.',
    bullets: [
      'Shareable on LinkedIn and professional profiles',
      'Verification links for employers and recruiters',
      'Evidence of structured, science-backed career development',
    ],
  },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative bg-white rounded-2xl border border-gray-200 p-7 sm:p-8 flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/5 hover:-translate-y-1 hover:border-gray-300/80"
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${feature.color}08 0%, transparent 60%)`,
        }}
      />

      {/* Icon */}
      <div
        className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: feature.color + '15' }}
      >
        <Icon size={24} style={{ color: feature.color }} strokeWidth={1.8} />
      </div>

      {/* Title */}
      <h3 className="relative font-[var(--font-display)] text-lg font-semibold text-gray-900 mb-2.5">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="relative text-sm text-gray-500 leading-relaxed mb-6">
        {feature.desc}
      </p>

      {/* Bullet points */}
      <ul className="relative flex flex-col gap-3 mt-auto">
        {feature.bullets.map((bullet, j) => (
          <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
            <span
              className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: feature.color + '15' }}
            >
              <Check size={12} style={{ color: feature.color }} strokeWidth={3} />
            </span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <section className="bg-[var(--surface)] min-h-screen">
        <div className="max-w-[1100px] mx-auto px-6 pt-[calc(72px+3rem)] pb-20">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-block text-xs font-semibold uppercase tracking-widest text-[#6245a4] bg-[#6245a4]/10 px-4 py-1.5 rounded-full mb-5 border border-[#6245a4]/10"
            >
              Features
            </motion.span>

            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight leading-tight mb-5">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-[#6245a4] to-[#8b6fcc] bg-clip-text text-transparent">
                navigate your career.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              From scientific assessment to daily action plans - PathWise covers the full career guidance journey, not just the first step.
            </p>
          </motion.div>

          {/* Feature cards - 2 column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-20">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-center bg-white rounded-2xl border border-gray-200 py-16 px-8"
          >
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
              Ready to discover your career path?
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Take the free assessment and get personalized career guidance in minutes.
            </p>
            <Link
              to="/signup"
              className="btn btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold"
            >
              Take the Free Assessment <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}
