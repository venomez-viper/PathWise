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
    const colors = ['#8b4f2c', '#5ef6e6', '#fbbf24', '#f87171', '#34d399', '#c9a96e', '#ff7f50', '#60a5fa'];

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
        <div style={{ width: 32, height: 32, border: '3px solid rgba(139,79,44,0.2)', borderTopColor: '#8b4f2c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
        <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
          maxWidth: 780, margin: '0 auto',
          background: '#fffdf7',
          borderRadius: 0,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          border: '3px solid #c9a96e',
          position: 'relative',
        }}>
          {/* Ornate double border */}
          <div style={{
            position: 'absolute', inset: 8,
            border: '1px solid #c9a96e',
            pointerEvents: 'none', zIndex: 1,
          }} />
          <div style={{
            position: 'absolute', inset: 12,
            border: '1px solid rgba(201,169,110,0.3)',
            pointerEvents: 'none', zIndex: 1,
          }} />

          {/* Corner accents */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => (
            <svg key={corner} width="60" height="60" viewBox="0 0 60 60" style={{
              position: 'absolute', zIndex: 2,
              ...(corner.includes('top') ? { top: 4 } : { bottom: 4 }),
              ...(corner.includes('left') ? { left: 4 } : { right: 4 }),
              transform: `${corner.includes('right') ? 'scaleX(-1)' : ''} ${corner.includes('bottom') ? 'scaleY(-1)' : ''}`,
            }}>
              <path d="M5 5L5 25C5 15 15 5 25 5L5 5Z" fill="none" stroke="#c9a96e" strokeWidth="1.5"/>
              <circle cx="8" cy="8" r="2" fill="#c9a96e"/>
            </svg>
          ))}

          <div style={{ padding: '3.5rem 4rem', textAlign: 'center', position: 'relative', zIndex: 3 }}>
            {/* PathWise logo seal */}
            <div style={{
              width: 80, height: 80, margin: '0 auto 1.5rem',
              borderRadius: '50%', background: '#fff',
              border: '2px solid #c9a96e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(201,169,110,0.3)',
            }}>
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <path d="M10 75L35 45L50 65L75 25" stroke="#1A2B5F" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M35 45L50 65L75 25" stroke="#5D2A80" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M75 25L90 10M90 10H70M90 10V30" stroke="#FF7F50" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#c9a96e', marginBottom: '0.75rem' }}>
              PathWise Career Intelligence
            </p>

            <h2 style={{
              fontFamily: 'Georgia, "Times New Roman", "Palatino Linotype", serif',
              fontSize: '2.2rem', fontWeight: 400, color: '#1a1a2e',
              marginBottom: '0.5rem', letterSpacing: '0.08em',
              lineHeight: 1.2,
            }}>
              Certificate of Appreciation
            </h2>

            {/* Gold divider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '1.5rem auto', maxWidth: 300 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #c9a96e)' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a96e' }} />
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #c9a96e, transparent)' }} />
            </div>

            <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '0.5rem', fontStyle: 'italic' }}>This is to certify that</p>

            <h3 style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '2rem', fontWeight: 700, color: '#1a1a2e',
              marginBottom: '0.5rem',
              borderBottom: '2px solid #c9a96e',
              display: 'inline-block', paddingBottom: '0.3rem',
              letterSpacing: '0.02em',
            }}>
              {user?.name}
            </h3>

            <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0.75rem 0 0.5rem', lineHeight: 1.6 }}>
              has successfully completed the career development roadmap for
            </p>

            <h3 style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '1.6rem', fontWeight: 700, color: '#8b4f2c',
              margin: '0.25rem 0 1.5rem',
              letterSpacing: '0.02em',
            }}>
              {targetRole}
            </h3>

            <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 2rem' }}>
              demonstrating commitment to professional growth, skill development, and career advancement through the PathWise platform.
            </p>

            {/* Gold divider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '0 auto 2rem', maxWidth: 200 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #c9a96e)' }} />
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#c9a96e' }} />
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #c9a96e, transparent)' }} />
            </div>

            {/* Footer row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 540, margin: '0 auto' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c9a96e', marginBottom: 4, fontWeight: 700 }}>Date Issued</p>
                <p style={{ fontSize: '0.88rem', color: '#374151', fontWeight: 600 }}>{completedDate}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                {/* Signature */}
                <svg width="80" height="24" viewBox="0 0 80 24" fill="none" style={{ marginBottom: 6 }}>
                  <path d="M5 18C12 6 22 18 30 12C38 6 48 18 55 8C62 18 70 6 75 12" stroke="#c9a96e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
                <div style={{ width: 80, height: 1, background: '#c9a96e', margin: '0 auto 4px' }} />
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c9a96e', fontWeight: 700 }}>PathWise</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c9a96e', marginBottom: 4, fontWeight: 700 }}>Certificate ID</p>
                <p style={{ fontSize: '0.88rem', color: '#374151', fontWeight: 600, fontFamily: 'monospace' }}>{certId.current}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownload}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)',
              background: '#c9a96e', color: '#fff', border: 'none',
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
