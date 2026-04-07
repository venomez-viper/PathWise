import { useRef } from 'react';
import { Download, Share2, X } from 'lucide-react';

interface CertificateProps {
  userName: string;
  targetRole: string;
  completedDate: string;
  onClose: () => void;
}

function generateCertId(): string {
  return Math.random().toString(16).slice(2, 10).toUpperCase();
}

const CERT_ID = generateCertId();

export default function CompletionCertificate({
  userName,
  targetRole,
  completedDate,
  onClose,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const cert = certRef.current;
    if (!cert) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>PathWise Certificate — ${userName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f4f4f7;
              font-family: 'Inter', sans-serif;
            }
            @media print {
              body { background: #fff; }
              @page { margin: 0.5in; }
            }
          </style>
        </head>
        <body>${cert.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'PathWise Certificate of Completion',
      text: `I just completed my career roadmap for ${targetRole} on PathWise! 🎉`,
      url: 'https://pathwise.fit',
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled or share not supported
      }
    } else {
      await navigator.clipboard.writeText(
        `${shareData.text}\n${shareData.url}`
      );
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 14, 20, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto',
      }}
    >
      {/* Modal content — stop propagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 720, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close certificate"
          style={{
            alignSelf: 'flex-end',
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
          }}
        >
          <X size={18} />
        </button>

        {/* ── CERTIFICATE CARD ── */}
        <div
          ref={certRef}
          style={{
            width: '100%',
            background: '#ffffff',
            borderRadius: '1.25rem',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          {/* Decorative top border gradient */}
          <div style={{
            height: 8,
            background: 'linear-gradient(90deg, #6245a4 0%, #5ef6e6 100%)',
          }} />

          {/* Inner padding */}
          <div style={{ padding: '3rem 3.5rem 2.5rem', textAlign: 'center' }}>
            {/* PathWise logo / wordmark */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: '2rem',
            }}>
              {/* Logo mark */}
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6245a4 0%, #5ef6e6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 18 L11 4 L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 13 L15 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: '1.35rem',
                letterSpacing: '-0.03em',
                color: '#1a1a2e',
              }}>
                PathWise
              </span>
            </div>

            {/* Certificate heading */}
            <h1 style={{
              fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif",
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1a1a2e',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}>
              Certificate of Completion
            </h1>

            {/* Decorative divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              justifyContent: 'center',
              margin: '1.25rem 0',
            }}>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, #c9b8e8)' }} />
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6245a4, #5ef6e6)',
              }} />
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, #c9b8e8, transparent)' }} />
            </div>

            {/* Body text */}
            <p style={{
              fontSize: '0.95rem',
              color: '#6b6b7b',
              marginBottom: '1.25rem',
              letterSpacing: '0.01em',
            }}>
              This certifies that
            </p>

            {/* User name */}
            <p style={{
              fontFamily: "'Georgia', 'Palatino Linotype', serif",
              fontSize: '2.4rem',
              fontWeight: 700,
              color: '#1a1a2e',
              letterSpacing: '-0.01em',
              borderBottom: '2px solid #6245a4',
              display: 'inline-block',
              paddingBottom: '0.25rem',
              marginBottom: '1.5rem',
            }}>
              {userName}
            </p>

            <p style={{
              fontSize: '0.95rem',
              color: '#6b6b7b',
              marginBottom: '0.75rem',
              lineHeight: 1.6,
            }}>
              has successfully completed the career roadmap for
            </p>

            {/* Target role */}
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#6245a4',
              letterSpacing: '-0.02em',
              marginBottom: '2rem',
            }}>
              {targetRole}
            </p>

            {/* Second divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              maxWidth: 400,
            }}>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, #e0d4f5)' }} />
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#c9b8e8',
              }} />
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, #e0d4f5, transparent)' }} />
            </div>

            {/* Date + signature row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '2rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9b9bae', marginBottom: 4 }}>
                  Date Completed
                </p>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a2e' }}>
                  {completedDate}
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                {/* Signature flourish */}
                <svg width="120" height="36" viewBox="0 0 120 36" fill="none" style={{ display: 'block', margin: '0 auto 4px' }}>
                  <path d="M10 28 C20 8, 35 4, 50 20 C62 32, 70 8, 85 14 C95 18, 105 24, 115 18"
                    stroke="#6245a4" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
                </svg>
                <div style={{ borderTop: '1px solid #c9b8e8', paddingTop: 6 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a2e' }}>PathWise</p>
                  <p style={{ fontSize: '0.7rem', color: '#9b9bae' }}>AI Career Platform</p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9b9bae', marginBottom: 4 }}>
                  Certificate ID
                </p>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6245a4', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                  PW-{CERT_ID}
                </p>
              </div>
            </div>
          </div>

          {/* Decorative bottom border gradient */}
          <div style={{
            height: 4,
            background: 'linear-gradient(90deg, #5ef6e6 0%, #6245a4 100%)',
          }} />
        </div>

        {/* Action buttons below card */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0.7rem 1.5rem',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #6245a4 0%, #8b67d4 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(98,69,164,0.35)',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
          >
            <Download size={16} />
            Download as Image
          </button>

          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0.7rem 1.5rem',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: '1.5px solid rgba(255,255,255,0.25)',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; }}
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
