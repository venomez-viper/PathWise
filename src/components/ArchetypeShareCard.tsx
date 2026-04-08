import { useRef, type CSSProperties } from 'react';
import ShareButton from './ShareButton';

/* ─── Types ─────────────────────────────────────────────────────── */
export interface ArchetypeShareCardProps {
  archetypeName: string;
  archetypeTagline: string;
  riasec: {
    realistic: number;
    investigative: number;
    artistic: number;
    social: number;
    enterprising: number;
    conventional: number;
  };
  topMatches: { title: string; score: number }[];
  userName?: string;
}

/* ─── Constants ─────────────────────────────────────────────────── */
const DARK_BG = '#1a1a2e';
const DARK_SURFACE = '#16213e';
const TEAL = '#00c9bb';
const TEAL_DIM = 'rgba(0,201,187,0.18)';
const TEAL_BORDER = 'rgba(0,201,187,0.35)';
const COPPER = '#d4874a';
const WHITE = '#ffffff';
const WHITE_60 = 'rgba(255,255,255,0.6)';
const WHITE_30 = 'rgba(255,255,255,0.3)';
const WHITE_10 = 'rgba(255,255,255,0.08)';

/* ─── RIASEC Mini Hexagon (dark-themed) ─────────────────────────── */

const RIASEC_KEYS: (keyof ArchetypeShareCardProps['riasec'])[] = [
  'realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional',
];
const RIASEC_SHORT = ['R', 'I', 'A', 'S', 'E', 'C'];

function polarToXY(angleDeg: number, r: number, cx: number, cy: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function MiniHexagon({ riasec, size = 160 }: { riasec: ArchetypeShareCardProps['riasec']; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const step = 60;

  const gridLevels = [0.33, 0.66, 1];
  const profilePoints = RIASEC_KEYS.map((k, i) => {
    const r = (riasec[k] / 100) * maxR;
    return polarToXY(i * step, r, cx, cy);
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="RIASEC profile">
      {/* Grid rings */}
      {gridLevels.map((lv) => {
        const pts = Array.from({ length: 6 }, (_, i) => {
          const p = polarToXY(i * step, maxR * lv, cx, cy);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <polygon key={lv} points={pts} fill="none"
            stroke={WHITE_30} strokeWidth={0.75} />
        );
      })}

      {/* Axes */}
      {RIASEC_KEYS.map((_, i) => {
        const p = polarToXY(i * step, maxR, cx, cy);
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke={WHITE_30} strokeWidth={0.75} />
        );
      })}

      {/* Profile fill */}
      <polygon
        points={profilePoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill={TEAL_DIM}
        stroke={TEAL}
        strokeWidth={1.5}
      />

      {/* Vertex dots */}
      {profilePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={TEAL} />
      ))}

      {/* Labels */}
      {RIASEC_KEYS.map((_, i) => {
        const p = polarToXY(i * step, maxR + 14, cx, cy);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 11, fontWeight: 700, fill: WHITE_60, fontFamily: 'system-ui, sans-serif' }}>
            {RIASEC_SHORT[i]}
          </text>
        );
      })}
    </svg>
  );
}

/* ─── Score Bar (for top matches) ───────────────────────────────── */

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? TEAL : score >= 70 ? '#7ec8c0' : COPPER;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
      <div style={{
        flex: 1, height: 4, borderRadius: 2,
        background: WHITE_10, overflow: 'hidden',
      }}>
        <div style={{
          width: `${score}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 2,
        }} />
      </div>
      <span style={{
        fontSize: 13, fontWeight: 700, color,
        fontFamily: 'system-ui, sans-serif', minWidth: 36, textAlign: 'right',
      }}>
        {score}%
      </span>
    </div>
  );
}

/* ─── PathWise Logo (inline for share card) ─────────────────────── */

function InlineLogo({ size = 26 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M10 75L35 45L50 65L75 25"
          stroke={TEAL} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35 45L50 65L75 25"
          stroke="rgba(0,201,187,0.55)" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M75 25L90 10M90 10H70M90 10V30"
          stroke={COPPER} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{
        fontSize: size * 0.78, fontWeight: 700, color: WHITE,
        letterSpacing: '-0.02em', fontFamily: 'system-ui, sans-serif',
      }}>
        pathwise
      </span>
    </div>
  );
}

/* ─── The Share Card (1200x630 OG ratio) ────────────────────────── */

function CardBody({
  archetypeName, archetypeTagline, riasec, topMatches, userName,
}: ArchetypeShareCardProps) {
  const containerStyle: CSSProperties = {
    width: 600,
    height: 315,
    background: `linear-gradient(135deg, ${DARK_BG} 0%, #0f3460 100%)`,
    borderRadius: 20,
    padding: '28px 32px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  return (
    <div style={containerStyle}>
      {/* Decorative glow */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200,
        background: `radial-gradient(circle, ${TEAL}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -40, left: 40,
        width: 160, height: 160,
        background: `radial-gradient(circle, ${COPPER}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Top row: logo + label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <InlineLogo size={22} />
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
          color: WHITE_60, textTransform: 'uppercase',
        }}>
          Career DNA
        </span>
      </div>

      {/* Middle: hexagon + archetype info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, marginTop: 16 }}>
        {/* Hexagon */}
        <div style={{ flexShrink: 0 }}>
          <MiniHexagon riasec={riasec} size={130} />
        </div>

        {/* Archetype text + matches */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Glass pill */}
          <div style={{
            display: 'inline-block',
            background: TEAL_DIM,
            border: `1px solid ${TEAL_BORDER}`,
            borderRadius: 100,
            padding: '3px 12px',
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: TEAL, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              My Career Archetype
            </span>
          </div>

          <h2 style={{
            margin: '0 0 4px',
            fontSize: 18,
            fontWeight: 800,
            color: WHITE,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}>
            {archetypeName}
          </h2>
          <p style={{
            margin: '0 0 14px',
            fontSize: 12,
            color: COPPER,
            fontStyle: 'italic',
            lineHeight: 1.4,
          }}>
            "{archetypeTagline}"
          </p>

          {/* Top matches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, color: WHITE_60,
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2,
            }}>
              Top Matches
            </span>
            {topMatches.slice(0, 3).map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: WHITE_60, minWidth: 136 }}>
                  {m.title}
                </span>
                <ScoreBar score={m.score} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12,
        borderTop: `1px solid ${WHITE_10}`,
      }}>
        {userName ? (
          <span style={{ fontSize: 11, color: WHITE_60 }}>
            {userName}'s results
          </span>
        ) : (
          <span style={{ fontSize: 11, color: WHITE_60 }}>
            Discover your career DNA
          </span>
        )}
        <span style={{
          fontSize: 11, fontWeight: 700, color: TEAL,
          letterSpacing: '0.02em',
        }}>
          pathwise.fit
        </span>
      </div>
    </div>
  );
}

/* ─── Exported Component ─────────────────────────────────────────── */

export default function ArchetypeShareCard(props: ArchetypeShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = () => {
    const card = cardRef.current;
    if (!card) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>My Career DNA - PathWise</title>
      <style>*{margin:0;padding:0;}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f4f4f7;}</style>
    </head><body>${card.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const shareText = `I just discovered my Career DNA on PathWise — ${props.archetypeName}! "${props.archetypeTagline}" Find yours at pathwise.fit`;

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.25rem',
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const downloadBtnStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '0.55rem 1.25rem',
    borderRadius: '2rem',
    background: DARK_BG,
    color: TEAL,
    border: `1px solid ${TEAL_BORDER}`,
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
    transition: 'background 0.15s',
    letterSpacing: '0.01em',
  };

  return (
    <div style={wrapperStyle}>
      {/* The card itself — captured for download */}
      <div ref={cardRef} style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
        <CardBody {...props} />
      </div>

      {/* Action buttons below the card */}
      <div style={actionsStyle}>
        <button
          onClick={downloadCard}
          style={downloadBtnStyle}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#0f3460')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = DARK_BG)}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Card
        </button>

        <ShareButton
          url="https://pathwise.fit"
          title="My Career DNA — PathWise"
          text={shareText}
          variant="secondary"
        />
      </div>
    </div>
  );
}
