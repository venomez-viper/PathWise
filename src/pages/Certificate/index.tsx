import { useState, useEffect, useRef } from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { roadmap as roadmapApi } from '../../lib/api';
import { Panda } from '../../components/panda';
import ShareButton from '../../components/ShareButton';

export default function CertificatePage() {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState('');
  const [completedDate, setCompletedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const certId = useRef(`PW-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);

  useEffect(() => {
    if (!user) return;
    roadmapApi.get(user.id).then((res: any) => {
      const r = res?.roadmap;
      if (!r) { setLoading(false); return; }
      setTargetRole(r.targetRole ?? '');
      const milestones = r.milestones ?? [];
      const allDone = milestones.length > 0 && milestones.every((m: any) => m.status === 'completed');
      setEligible(allDone);
      if (allDone) {
        const lastCompleted = milestones.reduce((latest: string, m: any) => {
          if (m.completedAt && m.completedAt > latest) return m.completedAt;
          return latest;
        }, '');
        setCompletedDate(lastCompleted
          ? new Date(lastCompleted).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        );
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  // Fireworks animation
  useEffect(() => {
    if (!eligible || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      alpha: number; color: string; size: number; decay: number;
    }

    const particles: Particle[] = [];
    const colors = ['#6245a4', '#5ef6e6', '#fbbf24', '#f87171', '#34d399', '#a78bfa', '#ff7f50', '#60a5fa'];

    function createBurst(x: number, y: number) {
      for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
          decay: 0.012 + Math.random() * 0.008,
        });
      }
    }

    // Launch sequence
    const launches = [
      { delay: 200, x: 0.3, y: 0.3 },
      { delay: 600, x: 0.7, y: 0.25 },
      { delay: 1000, x: 0.5, y: 0.2 },
      { delay: 1400, x: 0.2, y: 0.35 },
      { delay: 1800, x: 0.8, y: 0.3 },
      { delay: 2200, x: 0.4, y: 0.15 },
      { delay: 2800, x: 0.6, y: 0.25 },
      { delay: 3500, x: 0.5, y: 0.3 },
    ];

    const timers = launches.map(l =>
      setTimeout(() => createBurst(canvas.width * l.x, canvas.height * l.y), l.delay)
    );

    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.alpha -= p.decay;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }
        ctx!.globalAlpha = p.alpha;
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [eligible]);

  const handleDownload = () => {
    const cert = certRef.current;
    if (!cert) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>PathWise Certificate - ${user?.name}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box;}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}@media print{body{background:#fff;}}</style>
    </head><body>${cert.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(98,69,164,0.2)', borderTopColor: '#6245a4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <Panda mood="thinking" size={120} animate />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)', marginTop: '1rem' }}>
          Certificate Not Available Yet
        </h2>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem', maxWidth: 400, lineHeight: 1.6 }}>
          Complete all milestones in your career roadmap to earn your PathWise completion certificate.
        </p>
        <Link to="/app/roadmap" className="btn-page-action" style={{ marginTop: '1.5rem' }}>
          View Roadmap
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Fireworks canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--on-surface-variant)', textDecoration: 'none', fontWeight: 600, marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Congrats banner */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Panda mood="celebrating" size={120} animate />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)', marginTop: '1rem', letterSpacing: '-0.03em' }}>
            Congratulations, {user?.name?.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
            You've completed your entire career roadmap for {targetRole}.
          </p>
        </div>

        {/* Certificate */}
        <div ref={certRef} style={{
          maxWidth: 720, margin: '0 auto',
          background: '#fff', borderRadius: '1rem', overflow: 'hidden',
          boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
        }}>
          {/* Top gradient border */}
          <div style={{ height: 6, background: 'linear-gradient(90deg, #6245a4, #5ef6e6)' }} />

          <div style={{ padding: '3rem 3rem 2.5rem', textAlign: 'center' }}>
            {/* Logo */}
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 1.5rem' }}>
              <path d="M10 75L35 45L50 65L75 25" stroke="#1A2B5F" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M35 45L50 65L75 25" stroke="#5D2A80" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M75 25L90 10M90 10H70M90 10V30" stroke="#FF7F50" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9ca3af', marginBottom: '0.5rem' }}>
              PathWise Career Intelligence
            </p>

            <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '2rem', fontWeight: 400, color: '#1a1a2e', marginBottom: '2rem', letterSpacing: '0.05em' }}>
              Certificate of Completion
            </h2>

            <p style={{ fontSize: '0.88rem', color: '#6b7280', marginBottom: '0.75rem' }}>This certifies that</p>

            <h3 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '1.75rem', fontWeight: 700, color: '#6245a4', marginBottom: '0.75rem', borderBottom: '2px solid #6245a4', display: 'inline-block', paddingBottom: '0.25rem' }}>
              {user?.name}
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#6b7280', marginBottom: '0.75rem' }}>has successfully completed the career roadmap for</p>

            <h3 style={{ fontFamily: 'var(--font-display, Georgia)', fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '2rem' }}>
              {targetRole}
            </h3>

            {/* Divider */}
            <div style={{ width: 80, height: 1, background: '#e5e7eb', margin: '0 auto 1.5rem' }} />

            {/* Footer row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 500, margin: '0 auto' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: 4 }}>Date</p>
                <p style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>{completedDate}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none" style={{ marginBottom: 4 }}>
                  <path d="M5 15C15 5 25 15 30 10C35 5 45 15 55 5" stroke="#6245a4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>PathWise</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: 4 }}>Certificate ID</p>
                <p style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600, fontFamily: 'monospace' }}>{certId.current}</p>
              </div>
            </div>
          </div>

          {/* Bottom gradient border */}
          <div style={{ height: 6, background: 'linear-gradient(90deg, #5ef6e6, #6245a4)' }} />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownload}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)',
              background: 'var(--primary)', color: '#fff', border: 'none',
              fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
            }}
          >
            <Download size={16} /> Download Certificate
          </button>
          <ShareButton
            url="https://pathwise.fit"
            title={`${user?.name} completed the ${targetRole} roadmap on PathWise!`}
            text={`I just completed my ${targetRole} career roadmap on PathWise! 🎉`}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}
