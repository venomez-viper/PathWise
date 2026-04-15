import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isInViewport = true;
    let particles: Array<{
      x: number; y: number; dx: number; dy: number; size: number;
    }> = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 180 };

    function init() {
      particles = [];
      const count = Math.min((canvas!.width * canvas!.height) / 20000, 55);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    }

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      init();
    }

    const GRID_SIZE = 135; // sqrt(18000) ≈ 134, round up

    function getGridKey(x: number, y: number) {
      return `${Math.floor(x / GRID_SIZE)},${Math.floor(y / GRID_SIZE)}`;
    }

    function animate() {
      if (!isInViewport || document.hidden) return; // Don't animate when off-screen
      animationFrameId = requestAnimationFrame(animate);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Update positions and batch-draw particles
      ctx!.fillStyle = 'rgba(167, 139, 250, 0.6)';
      ctx!.beginPath();
      for (const p of particles) {
        // Mouse repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.x -= (dx / dist) * force * 3;
            p.y -= (dy / dist) * force * 3;
          }
        }

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas!.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas!.height) p.dy *= -1;

        ctx!.moveTo(p.x + p.size, p.y);
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx!.fill();

      // Build spatial grid
      const grid: Record<string, number[]> = {};
      for (let i = 0; i < particles.length; i++) {
        const key = getGridKey(particles[i].x, particles[i].y);
        (grid[key] ??= []).push(i);
      }

      // Draw connections — only check neighboring cells
      ctx!.lineWidth = 0.5;
      ctx!.beginPath();
      for (let a = 0; a < particles.length; a++) {
        const gx = Math.floor(particles[a].x / GRID_SIZE);
        const gy = Math.floor(particles[a].y / GRID_SIZE);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighbors = grid[`${gx + dx},${gy + dy}`];
            if (!neighbors) continue;
            for (const b of neighbors) {
              if (b <= a) continue;
              const ddx = particles[a].x - particles[b].x;
              const ddy = particles[a].y - particles[b].y;
              const dist = ddx * ddx + ddy * ddy;
              if (dist < 18000) {
                const opacity = (1 - dist / 18000) * 0.15;
                ctx!.strokeStyle = `rgba(167, 139, 250, ${opacity})`;
                ctx!.moveTo(particles[a].x, particles[a].y);
                ctx!.lineTo(particles[b].x, particles[b].y);
                ctx!.stroke();
                ctx!.beginPath();
              }
            }
          }
        }
      }
    }

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = null; mouse.y = null; };

    const startLoop = () => {
      cancelAnimationFrame(animationFrameId);
      if (isInViewport && !document.hidden) animate();
    };

    const onVisChange = () => startLoop();

    // Pause animation when hero section scrolls out of viewport
    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry.isIntersecting;
        startLoop();
      },
      { threshold: 0 }
    );
    if (sectionRef.current) viewportObserver.observe(sectionRef.current);

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);
    document.addEventListener('visibilitychange', onVisChange);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      isInViewport = false;
      viewportObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      document.removeEventListener('visibilitychange', onVisChange);
      // Release canvas resources for GC
      particles = [];
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      canvas!.width = 0;
      canvas!.height = 0;
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero hero--premium">
      {/* Interactive particle canvas */}
      <canvas ref={canvasRef} className="hero__canvas" />

      {/* Gradient overlays */}
      <div className="hero__gradient hero__gradient--1" />
      <div className="hero__gradient hero__gradient--2" />

      <div className="container hero__center">
        <p className="hero__eyebrow">PathWise Career Intelligence</p>

        <h1 className="hero__headline">
          Map your career.
          <br />
          <span className="hero__headline--accent">Build your roadmap.</span>
        </h1>

        <p className="hero__sub">
          The platform that matches you to your ideal career,
          identifies your skill gaps, and gives you a step-by-step plan to get there.
        </p>

        <div className="hero__cta-row">
          <Link to="/signup" className="hero__cta-primary">
            Get Started, It's Free
            <ArrowRight size={18} />
          </Link>
          <Link to="/how-it-works" className="hero__cta-secondary">
            How it works
          </Link>
        </div>

        <p className="hero__proof">
          90+ career paths &nbsp;·&nbsp; 5-minute assessment &nbsp;·&nbsp; No credit card required
        </p>
      </div>
    </section>
  );
}
