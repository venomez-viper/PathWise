import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Footer from '../components/Footer';

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

const CATEGORIES = ['All', 'Getting Started', 'The Science', 'Your Data', 'Features'];

const FAQS: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'What is PathWise?',
    answer: 'PathWise is a Career Intelligence Platform that combines validated psychological frameworks with data-driven scoring to create personalized career roadmaps. Unlike personality quizzes that give you a label and stop, PathWise turns your assessment into daily tasks, milestone tracking, and certificates.',
  },
  {
    category: 'Getting Started',
    question: 'How does the assessment work?',
    answer: 'Our 5-minute assessment measures you across 10 dimensions using four validated frameworks: Holland RIASEC interests, Big Five personality, Schwartz Values theory, and self-assessed aptitudes. Your results are scored against 90+ career profiles to find your best matches.',
  },
  {
    category: 'Getting Started',
    question: 'Is PathWise free?',
    answer: 'PathWise offers a free tier with full assessment access and basic roadmap features. Pro unlocks advanced career brain insights, unlimited roadmaps, and priority support.',
  },
  {
    category: 'The Science',
    question: 'What makes PathWise different from a personality test?',
    answer: 'Personality tests measure one or two dimensions and hand you a label. PathWise integrates four validated psychological frameworks into a single scoring engine that then generates an actionable career roadmap. The assessment is the beginning, not the end.',
  },
  {
    category: 'The Science',
    question: 'What research is PathWise built on?',
    answer: "Our scoring engine is built on Holland's RIASEC model (60+ years of research), Big Five personality science (the most replicated finding in psychology), Schwartz Values theory, and O*NET occupational data from the U.S. Department of Labor.",
  },
  {
    category: 'The Science',
    question: 'How accurate are the career matches?',
    answer: 'Our engine evaluates you across 10 integrated dimensions using cosine similarity and Jaccard overlap scoring. Unlike platforms that score dimensions independently, we detect cross-dimensional synergies — when multiple dimensions simultaneously point to the same career.',
  },
  {
    category: 'Your Data',
    question: 'Is my data safe?',
    answer: "Yes. We don't scrape social media, track browsing history, or sell data to employers. Your assessment results and roadmap progress are yours.",
  },
  {
    category: 'Your Data',
    question: 'Can I retake the assessment?',
    answer: 'Yes! PathWise is designed for continuous growth. As you develop new skills and complete roadmap milestones, retaking the assessment shows how your career profile evolves over time.',
  },
  {
    category: 'Features',
    question: 'What are career roadmaps?',
    answer: 'After your assessment, PathWise generates a step-by-step roadmap for your top career matches. Each roadmap breaks down into daily tasks, skill milestones, and verifiable checkpoints so you always know exactly what to do next.',
  },
  {
    category: 'Features',
    question: 'What are streaks and achievements?',
    answer: 'Streaks reward consistent daily progress on your roadmap. Achievements unlock as you hit milestones. Both are designed using behavioral science principles to help you build lasting career development habits.',
  },
];

function FAQAccordionItem({
  faq,
  isOpen,
  onToggle,
  index,
}: {
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="border-b border-gray-200"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="font-[var(--font-display)] text-base font-semibold text-gray-900 pr-4 group-hover:text-[#6245a4] transition-colors">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          <ChevronDown size={18} className="text-gray-400" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-gray-500 leading-relaxed pr-8">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    return FAQS.filter((faq) => activeCategory === 'All' || faq.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
      <section className="bg-[var(--surface)] min-h-screen">
        <div className="max-w-2xl mx-auto px-6 pt-[calc(72px+3rem)] pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#6245a4] bg-[#6245a4]/10 px-3.5 py-1 rounded-full mb-4">
              FAQ
            </span>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight leading-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-base text-gray-500 leading-relaxed max-w-lg mx-auto">
              Everything you need to know about PathWise, our science, and how it works.
            </p>
          </motion.div>

          {/* Category pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap gap-2 justify-center mb-10"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenIndex(null);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#6245a4] text-white shadow-md shadow-[#6245a4]/25'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </motion.div>

          {/* Accordion */}
          <div className="mb-16">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                No questions in this category.
              </div>
            )}
            {filtered.map((faq, i) => {
              const globalIndex = FAQS.indexOf(faq);
              return (
                <FAQAccordionItem
                  key={globalIndex}
                  faq={faq}
                  isOpen={openIndex === globalIndex}
                  onToggle={() =>
                    setOpenIndex(openIndex === globalIndex ? null : globalIndex)
                  }
                  index={i}
                />
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center bg-white rounded-2xl p-10 border border-gray-100 shadow-sm"
          >
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-gray-900 mb-2">
              Still have questions?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              We'd love to help. Reach out and we'll get back to you within 24 hours.
            </p>
            <Link
              to="/contact"
              className="btn btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}
