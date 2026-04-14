import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check, X, Minus, Zap, GitMerge, RefreshCw, ArrowRight, Shield, Star } from 'lucide-react';
import Footer from '../components/Footer';

/* ─── Table Data ─── */
const FEATURES = [
  { feature: 'Assessment Questions', pathwise: '80', careerExplorer: '100+', truity: '60 / test', sixteenP: '60', linkedin: 'None', youscience: '14 tests' },
  { feature: 'Dimensions Measured', pathwise: '10 (integrated)', careerExplorer: '6 (siloed)', truity: '1 per test', sixteenP: '5 (MBTI-like)', linkedin: 'None', youscience: 'Aptitudes only' },
  { feature: 'Post-Match Roadmap', pathwise: '✓ Daily tasks', careerExplorer: '✗', truity: '✗', sixteenP: '✗', linkedin: '✗', youscience: '✗' },
  { feature: 'Continuous Engagement', pathwise: '✓ Streaks + Certs', careerExplorer: 'One-time', truity: 'One-time', sixteenP: 'Social only', linkedin: 'Passive', youscience: 'One-time' },
  { feature: 'Cross-Dimension Scoring', pathwise: '✓ Synergy detection', careerExplorer: '✗ Independent', truity: '✗ Separate', sixteenP: '✗', linkedin: '✗', youscience: '✗' },
  { feature: 'Skill Gap Analysis', pathwise: '✓', careerExplorer: '✗', truity: '✗', sixteenP: '✗', linkedin: '✗', youscience: '✗' },
  { feature: 'Privacy-First', pathwise: '✓ No tracking', careerExplorer: 'Unknown', truity: 'Unknown', sixteenP: 'Unknown', linkedin: 'Profile-based', youscience: 'Unknown' },
];

const COMPETITORS = ['careerExplorer', 'truity', 'sixteenP', 'linkedin', 'youscience'] as const;
const COMPETITOR_LABELS: Record<string, string> = {
  careerExplorer: 'CareerExplorer', truity: 'Truity', sixteenP: '16Personalities', linkedin: 'LinkedIn', youscience: 'YouScience',
};

const GAPS = [
  { icon: Zap, color: '#f59e0b', title: 'The Action Gap', desc: 'No competitor connects assessment output to ongoing career development action. They give you matches and leave the rest to you. PathWise gives you a daily plan.' },
  { icon: GitMerge, color: '#a78bfa', title: 'The Integration Gap', desc: 'Other platforms score dimensions in parallel silos. PathWise detects when multiple dimensions simultaneously point to the same career — or when they contradict.' },
  { icon: RefreshCw, color: '#5ef6e6', title: 'The Temporal Gap', desc: 'Every other platform treats career guidance as a snapshot. PathWise updates as you grow — your profile at month six is built on real behavioral data.' },
];

/* ─── Corner Decorator ─── */
function CornerDecorator({ color }: { color: string }) {
  return (
    <>
      <span
        className="absolute top-0 right-0 w-20 h-20 opacity-[0.07] rounded-bl-[40px] pointer-events-none"
        style={{ background: color }}
      />
      <span
        className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ background: color }}
      />
      <span
        className="absolute top-2 right-5 w-1 h-1 rounded-full opacity-50 pointer-events-none"
        style={{ background: color }}
      />
    </>
  );
}

/* ─── Cell Renderer ─── */
function CellValue({ value, highlight }: { value: string; highlight?: boolean }) {
  if (value.startsWith('✓')) {
    const label = value.replace('✓', '').trim();
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white flex-shrink-0 shadow-sm shadow-emerald-500/30">
          <Check size={12} strokeWidth={3} />
        </span>
        {label && <span className={`text-xs font-medium ${highlight ? 'text-gray-900' : 'text-gray-600'}`}>{label}</span>}
      </span>
    );
  }
  if (value.startsWith('✗')) {
    const label = value.replace('✗', '').trim();
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-500 flex-shrink-0">
          <X size={11} strokeWidth={3} />
        </span>
        {label && <span className="text-xs text-gray-400">{label}</span>}
      </span>
    );
  }
  if (value === 'Unknown') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex-shrink-0">
          <Minus size={11} strokeWidth={3} />
        </span>
        <span className="text-xs text-gray-400">Unknown</span>
      </span>
    );
  }
  return <span className="text-xs text-gray-500">{value}</span>;
}

/* ─── Page ─── */
export default function ComparePage() {
  return (
    <>
      <section className="bg-[var(--surface)] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 pt-[calc(72px+3rem)] pb-20">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#6245a4] bg-[#6245a4]/10 px-3.5 py-1.5 rounded-full mb-5"
            >
              <Shield size={12} />
              Compare
            </motion.span>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
              See how PathWise <span className="bg-gradient-to-r from-[#6245a4] to-[#a78bfa] bg-clip-text text-transparent">stacks up.</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              We built PathWise because existing tools measure too little, too shallowly, and only once. Here's the data.
            </p>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-20"
          >
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/[0.06]">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-4 pl-6 font-semibold text-gray-900 bg-gray-50/80 border-b border-gray-200 w-[180px]">
                      Feature
                    </th>
                    {/* PathWise column */}
                    <th className="text-center p-4 font-semibold text-white bg-gradient-to-b from-[#6245a4] to-[#513794] border-b border-[#6245a4] relative min-w-[140px]">
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-900 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md shadow-amber-400/30">
                        <Star size={9} fill="currentColor" />
                        Recommended
                      </span>
                      PathWise
                    </th>
                    {COMPETITORS.map(key => (
                      <th key={key} className="text-center p-4 font-medium text-gray-500 bg-gray-50/80 border-b border-gray-200 min-w-[120px]">
                        {COMPETITOR_LABELS[key]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={`group transition-colors duration-200 hover:bg-[#6245a4]/[0.02] ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}
                    >
                      <td className="p-4 pl-6 font-medium text-gray-900 border-b border-gray-100">
                        {row.feature}
                      </td>
                      <td className="p-4 text-center border-b border-gray-100 bg-[#6245a4]/[0.04]">
                        <div className="flex justify-center">
                          <CellValue value={row.pathwise} highlight />
                        </div>
                      </td>
                      {COMPETITORS.map(key => (
                        <td key={key} className="p-4 text-center border-b border-gray-100">
                          <div className="flex justify-center">
                            <CellValue value={(row as Record<string, string>)[key]} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3 sm:hidden">
              Scroll horizontally to see all competitors
            </p>
          </motion.div>

          {/* What Competitors Miss */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-20"
          >
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
              What every competitor misses
            </h2>
            <p className="text-gray-500 text-center mb-12 max-w-lg mx-auto">
              Three fundamental gaps that no other platform addresses.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {GAPS.map((g, i) => (
                <motion.div
                  key={g.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl hover:shadow-gray-900/[0.06] transition-all duration-300 hover:-translate-y-1 hover:border-gray-300"
                >
                  <CornerDecorator color={g.color} />
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: g.color + '18' }}
                  >
                    <g.icon size={24} color={g.color} strokeWidth={2} />
                  </div>
                  <h3 className="font-[var(--font-display)] text-lg font-bold text-gray-900 mb-3">
                    {g.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {g.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative text-center bg-white rounded-2xl border border-gray-200 py-16 px-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#6245a4]/[0.02] via-transparent to-[#a78bfa]/[0.03] pointer-events-none" />
            <div className="relative">
              <h2 className="font-[var(--font-display)] text-3xl font-bold text-gray-900 mb-3">
                Experience the difference.
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Join thousands discovering their career path with science, not guesswork.
              </p>
              <Link
                to="/signup"
                className="btn btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold"
              >
                Take the Free Assessment <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}
