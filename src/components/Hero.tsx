import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number; y: number; dx: number; dy: number; size: number;
    }> = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 180 };

    function init() {
      particles = [];
      const count = Math.min((canvas!.width * canvas!.height) / 15000, 80);
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

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

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

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(167, 139, 250, 0.6)';
        ctx!.fill();
      }

      // Draw connections
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = dx * dx + dy * dy;
          if (dist < 18000) {
            const opacity = 1 - dist / 18000;
            ctx!.strokeStyle = `rgba(167, 139, 250, ${opacity * 0.15})`;
            ctx!.lineWidth = 0.5;
            ctx!.beginPath();
            ctx!.moveTo(particles[a].x, particles[a].y);
            ctx!.lineTo(particles[b].x, particles[b].y);
            ctx!.stroke();
          }
        }
      }
    }

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = null; mouse.y = null; };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="hero hero--premium">
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
          The AI-powered platform that matches you to your ideal career,
          identifies your skill gaps, and gives you a step-by-step plan to get there.
        </p>

        <div className="hero__cta-row">
          <Link to="/signup" className="hero__cta-primary">
            Get Started — It's Free
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
