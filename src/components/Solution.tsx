import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Compass, Fingerprint, BarChart3,
  Map, GraduationCap, Sparkles,
  CalendarDays, TrendingUp,
  Trophy, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import './Solution.css';

const TOTAL_FRAMES = 60;
const SCROLL_HEIGHT_VH = 500;

const SECTIONS = [
  {
    id: 'discover',
    label: 'Discovery',
    title: 'Discover who you really are',
    desc: 'Our AI assessment maps your interests, personality, values, and work style to reveal your unique career DNA.',
    features: [
      { icon: Fingerprint, text: 'RIASEC + Big Five personality profiling' },
      { icon: Compass, text: '90+ career paths scored against your profile' },
      { icon: BarChart3, text: 'Personalized archetype and career matches' },
    ],
    frameRange: [0, 15],
    color: '#a78bfa',
  },
  {
    id: 'plan',
    label: 'Planning',
    title: 'Build your roadmap',
    desc: 'AI generates a step-by-step career roadmap with milestones, timelines, and skill-building tasks tailored to your goals.',
    features: [
      { icon: Map, text: 'Milestone-based roadmap with due dates' },
      { icon: GraduationCap, text: 'Curated learning resources per skill gap' },
      { icon: Sparkles, text: 'Adjustable timeline: 3, 6, or 12 months' },
    ],
    frameRange: [15, 35],
    color: '#5ef6e6',
  },
  {
    id: 'execute',
    label: 'Execution',
    title: 'Take action every day',
    desc: 'Your roadmap becomes daily tasks. Track streaks, earn achievements, and watch your career readiness score climb.',
    features: [
      { icon: CalendarDays, text: 'Daily task planner with priority levels' },
      { icon: TrendingUp, text: 'Progress dashboard and streak tracking' },
      { icon: Trophy, text: 'Achievements and completion certificates' },
    ],
    frameRange: [35, 59],
    color: '#fbbf24',
  },
];

/* ── Floating Elegant Shapes (background decoration) ── */
function ElegantShape({
  className, delay = 0, width = 400, height = 100, rotate = 0, gradient = 'from-white/[0.08]',
}: { className?: string; delay?: number; width?: number; height?: number; rotate?: number; gradient?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      className={cn('absolute', className)}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width, height }}
        className="relative"
      >
        <div className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-r to-transparent',
          gradient,
          'backdrop-blur-[2px] border-2 border-white/[0.15]',
          'shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]',
          'after:absolute after:inset-0 after:rounded-full',
          'after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]',
        )} />
      </motion.div>
    </motion.div>
  );
}

function preloadImages(count: number): HTMLImageElement[] {
  const images: HTMLImageElement[] = [];
  for (let i = 0; i < count; i++) {
    const img = new Image();
    img.src = `/cube/frame-${String(i).padStart(3, '0')}.jpg`;
    images.push(img);
  }
  return images;
}

export default function Solution() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => { imagesRef.current = preloadImages(TOTAL_FRAMES); }, []);

  const drawFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[frameIdx];
    if (!img || !img.complete) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrollHeight = container.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const pct = Math.max(0, Math.min(1, scrolled / scrollHeight));
      setProgress(pct);

      const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.floor(pct * TOTAL_FRAMES));
      if (frameIdx !== frameRef.current) {
        frameRef.current = frameIdx;
        drawFrame(frameIdx);
      }

      const sIdx = Math.min(SECTIONS.length - 1, Math.floor(pct * SECTIONS.length));
      setActiveSection(sIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(() => { drawFrame(0); handleScroll(); }, 200);
    return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(timer); };
  }, [drawFrame]);

  const getSectionOpacity = (idx: number) => {
    const sectionPct = progress * SECTIONS.length;
    const dist = Math.abs(sectionPct - idx - 0.5);
    return Math.max(0, 1 - dist * 1.8);
  };

  const getSectionTranslateY = (idx: number) => {
    const sectionPct = progress * SECTIONS.length;
    const diff = sectionPct - idx - 0.5;
    return diff * -40;
  };

  return (
    <section className="solution" id="solution" ref={containerRef} style={{ height: `${SCROLL_HEIGHT_VH}vh` }}>
      <div className="solution__sticky">
        {/* Cinematic dark bg */}
        <div className="solution__bg" />

        {/* Elegant floating shapes — background decoration */}
        <div className="solution__shapes">
          <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="from-[#6245a4]/[0.12]" className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]" />
          <ElegantShape delay={0.5} width={500} height={120} rotate={-15} gradient="from-[#006a62]/[0.10]" className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]" />
          <ElegantShape delay={0.4} width={300} height={80} rotate={-8} gradient="from-[#a78bfa]/[0.10]" className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]" />
          <ElegantShape delay={0.6} width={200} height={60} rotate={20} gradient="from-[#8b4f2c]/[0.10]" className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]" />
          <ElegantShape delay={0.7} width={150} height={40} rotate={-25} gradient="from-[#5ef6e6]/[0.08]" className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]" />
        </div>

        {/* Progress dots */}
        <div className="solution__progress-track">
          {SECTIONS.map((s, i) => (
            <button key={s.id} className={`solution__progress-dot${activeSection === i ? ' active' : ''}`} style={{ '--dot-color': s.color } as React.CSSProperties}>
              <span className="solution__progress-label">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="solution__content">
          {/* Text panels — left */}
          <div className="solution__text-side">
            {SECTIONS.map((s, i) => (
              <div key={s.id} className="solution__panel" style={{
                opacity: getSectionOpacity(i),
                transform: `translateY(${getSectionTranslateY(i)}px)`,
                pointerEvents: activeSection === i ? 'auto' : 'none',
              }}>
                <span className="solution__panel-label" style={{ color: s.color }}>{s.label}</span>
                <h2 className="solution__panel-title">{s.title}</h2>
                <p className="solution__panel-desc">{s.desc}</p>
                <div className="solution__panel-features">
                  {s.features.map((f, j) => {
                    const Icon = f.icon;
                    return (
                      <div key={j} className="solution__panel-feature">
                        <div className="solution__panel-feature-icon" style={{ color: s.color }}>
                          <Icon size={16} />
                        </div>
                        <span>{f.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Cube — right */}
          <div className="solution__cube-side">
            <canvas ref={canvasRef} className="solution__canvas" />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="solution__bottom-cta" style={{ opacity: progress > 0.85 ? 1 : 0, transform: `translateY(${progress > 0.85 ? 0 : 20}px)` }}>
          <Link to="/signup" className="solution__cta-btn">
            Start Your Journey <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
