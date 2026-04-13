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
    stat: '4 frameworks',
    title: 'We do not guess. We measure.',
    desc: 'Other platforms hand you a personality quiz and call it career guidance. We built ours on the same validated frameworks used by occupational psychologists, career researchers, and the U.S. Department of Labor. Four of them, working together, in a single five-minute assessment.',
    features: [
      { icon: Dna, text: 'Holland RIASEC model: six interest dimensions mapped to real occupations, backed by 60+ years of research' },
      { icon: Fingerprint, text: 'Big Five personality traits: the most replicated finding in all of psychology, now tied to career fit' },
      { icon: Compass, text: 'Schwartz Values theory and O*NET work context data: what matters to you, matched to roles that deliver it' },
    ],
    color: '#a78bfa',
  },
  {
    id: 'brain',
    label: 'AI Career Brain',
    stat: '12 dimensions',
    title: 'Precise matching. Zero surveillance.',
    desc: 'Most AI career tools need your entire digital footprint to make a recommendation. Ours needs five minutes. Our scoring engine evaluates you across 12 independent dimensions simultaneously, using a blend of cosine similarity and Jaccard overlap scoring that penalises vague matches and rewards genuine alignment.',
    features: [
      { icon: Brain, text: 'Vector-space scoring engine: each career profile is a point in 12-dimensional space, and we find the closest ones to you' },
      { icon: FlaskConical, text: '30 distinct career archetypes: not generic labels, but real personality-interest combinations like "The Digital Storyteller" or "The Analytical Architect"' },
      { icon: Target, text: 'No browsing history. No social media scraping. No employer data. Just your honest answers, scored with mathematical precision' },
    ],
    color: '#5ef6e6',
  },
  {
    id: 'research',
    label: 'Deep Research',
    stat: '90+ careers',
    title: 'Hand-built career intelligence.',
    desc: 'Every one of our career profiles was researched and written by humans. Not scraped from job boards. Not hallucinated by a language model. Each profile contains salary benchmarks, growth projections, skill gap analysis, certification recommendations, portfolio project ideas, networking strategies, and real job targets. That is what 90+ profiles of original research looks like.',
    features: [
      { icon: BarChart3, text: 'Real salary ranges sourced from industry data, broken down by experience level and region' },
      { icon: GraduationCap, text: 'Curated certifications with direct links, cost, duration, and why each one matters for that specific role' },
      { icon: Sparkles, text: 'Personalised "why this fits you" reasoning generated from the intersection of your profile and the career requirements' },
    ],
    color: '#fbbf24',
  },
  {
    id: 'roadmap',
    label: 'Personalised Roadmap',
    stat: '3 to 12 months',
    title: 'Your plan. Your pace. Your progress.',
    desc: 'Knowing where to go means nothing without knowing how to get there. Every career match becomes a living, breathing roadmap: milestones with real deadlines, tasks you can act on today, and a progress system that makes career growth feel like a game you are winning. Change your timeline whenever you want. Your completed work stays completed.',
    features: [
      { icon: Map, text: 'AI-generated milestones with due dates that scale proportionally when you adjust your timeline' },
      { icon: CalendarDays, text: 'Daily task planner with priority levels, streak tracking, and smart notifications when you hit milestones' },
      { icon: Trophy, text: 'Achievement badges, completion certificates, and a career readiness percentage that climbs as you work' },
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
  const cubeSideRef = useRef<HTMLDivElement>(null);
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

  // Scroll handler — lerp-smoothed animation loop for buttery transitions
  useEffect(() => {
    // Smoothed value that lerps toward target scroll percentage
    const smooth = { pct: 0 };
    let targetPct = 0;
    let running = true;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const EASE = 0.08; // lower = smoother/slower, higher = snappier

    const tick = () => {
      if (!running) return;

      // Read target from DOM
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const scrollHeight = container.offsetHeight - window.innerHeight;
        if (scrollHeight > 0) {
          const scrolled = -rect.top;
          targetPct = Math.max(0, Math.min(1, scrolled / scrollHeight));
        }
      }

      // Lerp toward target
      smooth.pct = lerp(smooth.pct, targetPct, EASE);
      // Snap when close enough to avoid infinite micro-updates
      if (Math.abs(smooth.pct - targetPct) < 0.0001) smooth.pct = targetPct;

      const pct = smooth.pct;

      // Update frame (direct canvas draw, no state)
      const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.floor(pct * TOTAL_FRAMES));
      if (frameIdx !== frameRef.current) {
        frameRef.current = frameIdx;
        drawFrame(frameIdx);
      }

      // Apple-style cube transforms: scale up from 0.85 to 1.15, subtle perspective tilt
      if (cubeSideRef.current) {
        const scale = 0.85 + pct * 0.3;
        const rotateY = (pct - 0.5) * -8;
        const rotateX = Math.sin(pct * Math.PI) * 3;
        cubeSideRef.current.style.transform = `perspective(1200px) scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
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

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      running = false;
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
            We built what career guidance{' '}
            <span className="solution-hero__title-accent">should have been</span>
          </h1>
          <p className="solution-hero__desc">
            Four frameworks. Ninety career profiles. Twelve scoring dimensions.
            Zero data harvesting. Scroll to see what went into this.
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
                  <div className="solution__panel-top">
                    <span className="solution__panel-label" style={{ color: s.color }}>{s.label}</span>
                    <span className="solution__panel-stat" style={{ color: s.color }}>{s.stat}</span>
                  </div>
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
            <div ref={cubeSideRef} className="solution__cube-side">
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
