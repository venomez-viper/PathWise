import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  variant?: 'primary' | 'secondary';
}

export default function ShareButton({ url, title, text, variant = 'secondary' }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {} // User cancelled
    } else {
      setOpen(true);
    }
  };

  const isPrimary = variant === 'primary';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={() => (navigator.share ? shareNative() : setOpen(o => !o))}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: isPrimary ? '0.7rem 1.25rem' : '0.5rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: isPrimary ? 'var(--primary)' : 'var(--surface-container-lowest)',
          color: isPrimary ? '#fff' : 'var(--on-surface)',
          border: isPrimary ? 'none' : '1px solid var(--surface-container-high)',
          fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
          transition: 'box-shadow 0.15s, transform 0.15s',
        }}
      >
        <Share2 size={14} />
        Share
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          background: 'var(--surface-container-lowest)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          border: '1px solid var(--surface-container-high)',
          padding: '0.5rem', minWidth: 200, zIndex: 1000,
        }}>
          <button onClick={copyLink} style={dropdownItemStyle}>
            {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button onClick={shareTwitter} style={dropdownItemStyle}>
            <ExternalLink size={16} />
            Share on X
          </button>
          <button onClick={shareLinkedIn} style={dropdownItemStyle}>
            <ExternalLink size={16} />
            Share on LinkedIn
          </button>
        </div>
      )}
    </div>
  );
}

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
  padding: '0.6rem 0.75rem', border: 'none', background: 'none',
  borderRadius: 'var(--radius-md)', cursor: 'pointer',
  fontSize: '0.85rem', fontWeight: 500, color: 'var(--on-surface)',
  transition: 'background 0.1s',
};
