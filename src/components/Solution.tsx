import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Compass, Fingerprint, BarChart3,
  Map, GraduationCap, Sparkles,
  CalendarDays,
  Trophy, ArrowRight, Brain, Dna,
  FlaskConical, Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import './Solution.css';

const TOTAL_FRAMES = 60;

const SECTIONS = [
  {
    id: 'science',
    label: 'Scientific Assessment',
    title: 'Built on decades of career science',
    desc: 'Most career tools ask you what job you want. We measure who you are. Our assessment combines four validated psychological frameworks to build a multi-dimensional picture of your career identity. Five minutes. That is all it takes.',
    features: [
      { icon: Dna, text: 'Holland RIASEC interest mapping, the gold standard in vocational psychology' },
      { icon: Fingerprint, text: 'Big Five personality profiling tied to workplace performance research' },
      { icon: Compass, text: 'Schwartz Values and O*NET work context alignment' },
    ],
    color: '#a78bfa',
  },
  {
    id: 'brain',
    label: 'AI Career Brain',
    title: 'Intelligence without surveillance',
    desc: "Here is what makes us different: we do not need years of your browsing history, job applications, or social media data. Our AI career brain uses vector-space scoring to match you against 90+ deeply researched career profiles, using only what you tell us in the assessment.",
    features: [
      { icon: Brain, text: 'Multi-dimensional scoring across 12 career dimensions simultaneously' },
      { icon: FlaskConical, text: '30 unique archetypes derived from RIASEC and Big Five combinations' },
      { icon: Target, text: 'Accurate recommendations from minimal data. No tracking. No profiling.' },
    ],
    color: '#5ef6e6',
  },
  {
    id: 'research',
    label: 'Deep Research',
    title: 'Every career path, thoroughly mapped',
    desc: 'Each of our 90+ career profiles was built from extensive research. Real salary ranges, growth outlooks, skill gap analysis, certification paths, portfolio recommendations, and networking strategies. Not scraped. Not generated. Researched and validated.',
    features: [
      { icon: BarChart3, text: 'Real salary data, growth outlooks, and industry demand signals' },
      { icon: GraduationCap, text: 'Curated certifications and learning resources per career path' },
      { icon: Sparkles, text: 'Personalised "why this fits you" reasoning for every match' },
    ],
    color: '#fbbf24',
  },
  {
    id: 'roadmap',
    label: 'Personalised Roadmap',
    title: 'From clarity to action, in one click',
    desc: "Your career match becomes a living roadmap. Milestones with due dates, daily tasks, skill tracking, and streak-based motivation. Choose 3, 6, or 12 months. Adjust anytime. Your progress is always preserved.",
    features: [
      { icon: Map, text: 'AI-generated milestones scaled to your chosen timeline' },
      { icon: CalendarDays, text: 'Daily task planner with priorities and progress tracking' },
      { icon: Trophy, text: 'Achievements, certificates, and career readiness score' },
    ],
    color: '#f87171',
  },
];

/* ── Elegant floating shape ── */
function ElegantShape({
  className, delay = 0, width = 400, height = 100, rotate = 0, gradient = 'from-white/[0.08]',
}: { className?: string; delay?: number; width?: number; height?: number; rotate?: number; gradient?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number], opacity: { duration: 1.2 } }}
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
        )} />
      </motion.div>
    </motion.div>
  );
}

function preloadImages(count: number): Promise<HTMLImageElement[]> {
  return Promise.all(
    Array.from({ length: count }, (_, i) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = `/cube/frame-${String(i).padStart(3, '0')}.jpg`;
      });
    })
  );
}

export default function Solution() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const frameRef = useRef(0);
  const canvasSized = useRef(false);
  const rafId = useRef(0);

  // Preload all frames
  useEffect(() => {
    preloadImages(TOTAL_FRAMES).then(imgs => {
      imagesRef.current = imgs;
      setImagesLoaded(true);
      drawFrame(0);
    });
  }, []);

  const drawFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[frameIdx];
    if (!img || !img.complete || !img.naturalWidth) return;
    // Only set canvas size once
    if (!canvasSized.current) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvasSized.current = true;
    }
    ctx.drawImage(img, 0, 0);
  }, []);

  // Scroll handler — uses refs, no React state, rAF-throttled
  useEffect(() => {
    let ticking = false;

    const updatePanels = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrollHeight = container.offsetHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrolled = -rect.top;
      const pct = Math.max(0, Math.min(1, scrolled / scrollHeight));

      // Update frame (direct canvas draw, no state)
      const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.floor(pct * TOTAL_FRAMES));
      if (frameIdx !== frameRef.current) {
        frameRef.current = frameIdx;
        drawFrame(frameIdx);
      }

      // Update text panels via DOM (no React re-render)
      const sectionPct = pct * SECTIONS.length;
      const activeIdx = Math.min(SECTIONS.length - 1, Math.floor(sectionPct));

      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        const dist = Math.abs(sectionPct - i - 0.5);
        const opacity = Math.max(0, 1 - dist * 1.6);
        const ty = (sectionPct - i - 0.5) * -50;
        panel.style.opacity = String(opacity);
        panel.style.transform = `translateY(${ty}px)`;
        panel.style.pointerEvents = i === activeIdx ? 'auto' : 'none';
      });

      // Update dots
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        if (i === activeIdx) dot.classList.add('active');
        else dot.classList.remove('active');
      });

      // Update CTA
      if (ctaRef.current) {
        ctaRef.current.style.opacity = pct > 0.85 ? '1' : '0';
        ctaRef.current.style.transform = `translateY(${pct > 0.85 ? 0 : 20}px)`;
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId.current = requestAnimationFrame(updatePanels);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updatePanels();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [drawFrame, imagesLoaded]);

  return (
    <>
      {/* ── Hero intro (before scroll section) ── */}
      <div className="solution-hero">
        <div className="solution-hero__shapes">
          <ElegantShape delay={0.2} width={500} height={120} rotate={12} gradient="from-[#6245a4]/[0.12]" className="left-[-8%] top-[20%]" />
          <ElegantShape delay={0.4} width={400} height={100} rotate={-15} gradient="from-[#006a62]/[0.10]" className="right-[-3%] top-[65%]" />
          <ElegantShape delay={0.6} width={200} height={50} rotate={20} gradient="from-[#8b4f2c]/[0.10]" className="right-[20%] top-[12%]" />
        </div>

        <motion.div
          className="solution-hero__content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
        >
          <span className="solution-hero__label">Our Approach</span>
          <h1 className="solution-hero__title">
            Career guidance that{' '}
            <span className="solution-hero__title-accent">actually works</span>
          </h1>
          <p className="solution-hero__desc">
            Four layers of intelligence. Zero data harvesting. Scroll to see how we solve
            the career puzzle differently.
          </p>
          <div className="solution-hero__scroll-hint">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight size={20} style={{ transform: 'rotate(90deg)' }} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── Scroll-driven cube section ── */}
      <section className="solution" id="solution" ref={containerRef} style={{ height: '500vh' }}>
        <div className="solution__sticky">
          <div className="solution__bg" />

          {/* Progress dots */}
          <div className="solution__progress-track">
            {SECTIONS.map((s, i) => (
              <button key={s.id} ref={el => { dotRefs.current[i] = el; }} className="solution__progress-dot" style={{ '--dot-color': s.color } as React.CSSProperties}>
                <span className="solution__progress-label">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="solution__content">
            {/* Text panels */}
            <div className="solution__text-side">
              {SECTIONS.map((s, i) => (
                <div key={s.id} ref={el => { panelRefs.current[i] = el; }} className="solution__panel" style={{ opacity: 0 }}>
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

            {/* Cube */}
            <div className="solution__cube-side">
              <div className="solution__cube-glow" />
              <canvas ref={canvasRef} className="solution__canvas" />
              {!imagesLoaded && (
                <div className="solution__cube-loading">
                  <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              )}
            </div>
          </div>

          {/* Bottom CTA */}
          <div ref={ctaRef} className="solution__bottom-cta" style={{ opacity: 0 }}>
            <Link to="/signup" className="solution__cta-btn">
              Start Your Journey <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
