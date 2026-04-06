import './panda.css';

export interface PandaProps {
  mood: 'happy' | 'thinking' | 'sleepy' | 'curious' | 'celebrating' | 'confused' | 'waving' | 'reading' | 'working';
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
}

/*
  Color palette:
  - body: #2d2d2d
  - belly: #ffffff
  - ear inner: #ffb3b3
  - cheeks: #ffccd5
  - nose: #2d2d2d
*/

export default function Panda({ mood, size = 48, className = '', style, animate = false }: PandaProps) {
  const cls = `panda${animate ? ' panda--animated' : ''}${className ? ` ${className}` : ''}`;

  return (
    <svg
      className={cls}
      data-mood={mood}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      aria-hidden="true"
    >
      {renderMood(mood)}
    </svg>
  );
}

function renderMood(mood: PandaProps['mood']) {
  switch (mood) {
    case 'happy':
      return <HappyPanda />;
    case 'thinking':
      return <ThinkingPanda />;
    case 'sleepy':
      return <SleepyPanda />;
    case 'curious':
      return <CuriousPanda />;
    case 'celebrating':
      return <CelebratingPanda />;
    case 'confused':
      return <ConfusedPanda />;
    case 'waving':
      return <WavingPanda />;
    case 'reading':
      return <ReadingPanda />;
    case 'working':
      return <WorkingPanda />;
    default:
      return <HappyPanda />;
  }
}

/* ── Shared base: head, ears, belly patch ── */
function PandaBase() {
  return (
    <>
      {/* Left ear */}
      <circle cx="18" cy="14" r="7" fill="#2d2d2d" />
      <circle cx="18" cy="14" r="4" fill="#ffb3b3" />
      {/* Right ear */}
      <circle cx="46" cy="14" r="7" fill="#2d2d2d" />
      <circle cx="46" cy="14" r="4" fill="#ffb3b3" />
      {/* Head */}
      <circle cx="32" cy="28" r="17" fill="#ffffff" />
      <circle cx="32" cy="28" r="17" stroke="#2d2d2d" strokeWidth="2.5" fill="none" />
      {/* Eye patches */}
      <ellipse cx="24" cy="26" rx="5" ry="4.5" fill="#2d2d2d" />
      <ellipse cx="40" cy="26" rx="5" ry="4.5" fill="#2d2d2d" />
      {/* Nose */}
      <ellipse cx="32" cy="32" rx="2.5" ry="1.8" fill="#2d2d2d" />
      {/* Cheeks */}
      <circle cx="20" cy="33" r="3" fill="#ffccd5" opacity="0.6" />
      <circle cx="44" cy="33" r="3" fill="#ffccd5" opacity="0.6" />
    </>
  );
}

/* Body shoulders hint */
function PandaBody() {
  return (
    <ellipse cx="32" cy="54" rx="14" ry="9" fill="#2d2d2d" />
  );
}

function BellyPatch() {
  return (
    <ellipse cx="32" cy="53" rx="8" ry="6" fill="#ffffff" />
  );
}

/* ── Happy: ^_^ eyes, smile, arms slightly up ── */
function HappyPanda() {
  return (
    <>
      <PandaBody />
      <BellyPatch />
      {/* Arms slightly up */}
      <ellipse cx="17" cy="50" rx="4" ry="6" fill="#2d2d2d" transform="rotate(-15 17 50)" />
      <ellipse cx="47" cy="50" rx="4" ry="6" fill="#2d2d2d" transform="rotate(15 47 50)" />
      <PandaBase />
      {/* ^_^ eyes */}
      <path d="M22 25 Q24 23 26 25" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M38 25 Q40 23 42 25" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Smile */}
      <path d="M28 35 Q32 38 36 35" stroke="#2d2d2d" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </>
  );
}

/* ── Thinking: squinted eye, hand on chin, dots ── */
function ThinkingPanda() {
  return (
    <>
      <PandaBody />
      <BellyPatch />
      {/* Left arm up to chin */}
      <ellipse cx="17" cy="50" rx="4" ry="6" fill="#2d2d2d" transform="rotate(-15 17 50)" />
      <ellipse cx="47" cy="48" rx="4" ry="6" fill="#2d2d2d" transform="rotate(25 47 48)" />
      <circle cx="43" cy="39" r="3" fill="#2d2d2d" />
      <PandaBase />
      {/* Left eye normal */}
      <circle cx="24" cy="25" r="2" fill="#fff" />
      {/* Right eye slightly squinted */}
      <ellipse cx="40" cy="25" rx="2" ry="1.2" fill="#fff" />
      {/* Neutral mouth */}
      <path d="M29 35 L35 35" stroke="#2d2d2d" strokeWidth="1.3" strokeLinecap="round" />
      {/* Thought dots */}
      <circle cx="50" cy="16" r="1.2" fill="#2d2d2d" opacity="0.4" />
      <circle cx="53" cy="12" r="1.5" fill="#2d2d2d" opacity="0.3" />
      <circle cx="57" cy="8" r="1.8" fill="#2d2d2d" opacity="0.2" />
    </>
  );
}

/* ── Sleepy: crescent eyes, zzz, head tilted ── */
function SleepyPanda() {
  return (
    <g transform="rotate(5 32 32)">
      <PandaBody />
      <BellyPatch />
      <ellipse cx="17" cy="50" rx="4" ry="6" fill="#2d2d2d" />
      <ellipse cx="47" cy="50" rx="4" ry="6" fill="#2d2d2d" />
      <PandaBase />
      {/* Crescent closed eyes */}
      <path d="M22 26 Q24 23.5 26 26" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M38 26 Q40 23.5 42 26" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Tiny open mouth (yawn) */}
      <ellipse cx="32" cy="36" rx="2" ry="1.5" fill="#2d2d2d" opacity="0.5" />
      {/* ZZZ */}
      <g className="panda-zzz">
        <text x="48" y="12" fontSize="7" fontWeight="800" fill="#2d2d2d" opacity="0.35" fontFamily="sans-serif">z</text>
        <text x="52" y="7" fontSize="5.5" fontWeight="800" fill="#2d2d2d" opacity="0.25" fontFamily="sans-serif">z</text>
        <text x="55" y="3" fontSize="4" fontWeight="800" fill="#2d2d2d" opacity="0.15" fontFamily="sans-serif">z</text>
      </g>
    </g>
  );
}

/* ── Curious: wide eyes, head tilted, ear perked ── */
function CuriousPanda() {
  return (
    <g transform="rotate(-4 32 32)">
      <PandaBody />
      <BellyPatch />
      <ellipse cx="17" cy="50" rx="4" ry="6" fill="#2d2d2d" />
      <ellipse cx="47" cy="50" rx="4" ry="6" fill="#2d2d2d" />
      {/* Head */}
      <circle cx="18" cy="14" r="7" fill="#2d2d2d" />
      <circle cx="18" cy="14" r="4" fill="#ffb3b3" />
      {/* Right ear perked up higher */}
      <circle cx="46" cy="11" r="7.5" fill="#2d2d2d" />
      <circle cx="46" cy="11" r="4.2" fill="#ffb3b3" />
      <circle cx="32" cy="28" r="17" fill="#ffffff" />
      <circle cx="32" cy="28" r="17" stroke="#2d2d2d" strokeWidth="2.5" fill="none" />
      <ellipse cx="24" cy="26" rx="5" ry="4.5" fill="#2d2d2d" />
      <ellipse cx="40" cy="26" rx="5" ry="4.5" fill="#2d2d2d" />
      <ellipse cx="32" cy="32" rx="2.5" ry="1.8" fill="#2d2d2d" />
      <circle cx="20" cy="33" r="3" fill="#ffccd5" opacity="0.6" />
      <circle cx="44" cy="33" r="3" fill="#ffccd5" opacity="0.6" />
      {/* Wide eyes */}
      <circle cx="24" cy="25" r="2.5" fill="#fff" />
      <circle cx="24" cy="25" r="1" fill="#2d2d2d" />
      <circle cx="40" cy="25" r="2.5" fill="#fff" />
      <circle cx="40" cy="25" r="1" fill="#2d2d2d" />
      {/* Small o mouth */}
      <circle cx="32" cy="36" r="1.5" stroke="#2d2d2d" strokeWidth="1.2" fill="none" />
    </g>
  );
}

/* ── Celebrating: arms up, sparkles, big smile ── */
function CelebratingPanda() {
  return (
    <>
      <PandaBody />
      <BellyPatch />
      {/* Arms up */}
      <ellipse cx="14" cy="44" rx="4" ry="6" fill="#2d2d2d" transform="rotate(-35 14 44)" />
      <ellipse cx="50" cy="44" rx="4" ry="6" fill="#2d2d2d" transform="rotate(35 50 44)" />
      <PandaBase />
      {/* Happy eyes */}
      <path d="M22 25 Q24 23 26 25" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M38 25 Q40 23 42 25" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Big smile */}
      <path d="M26 34 Q32 40 38 34" stroke="#2d2d2d" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Sparkle stars */}
      <g opacity="0.5">
        <path d="M8 8 L9 11 L12 12 L9 13 L8 16 L7 13 L4 12 L7 11Z" fill="#f59e0b" />
        <path d="M54 6 L55 8.5 L57.5 9.5 L55 10.5 L54 13 L53 10.5 L50.5 9.5 L53 8.5Z" fill="#f59e0b" />
        <circle cx="10" cy="20" r="1.2" fill="#f59e0b" />
        <circle cx="56" cy="18" r="1" fill="#f59e0b" />
      </g>
    </>
  );
}

/* ── Confused: ? above head, eyebrow raised ── */
function ConfusedPanda() {
  return (
    <>
      <PandaBody />
      <BellyPatch />
      <ellipse cx="17" cy="50" rx="4" ry="6" fill="#2d2d2d" />
      <ellipse cx="47" cy="50" rx="4" ry="6" fill="#2d2d2d" />
      <PandaBase />
      {/* Left eye normal */}
      <circle cx="24" cy="25" r="2" fill="#fff" />
      {/* Right eye with raised eyebrow */}
      <circle cx="40" cy="25" r="2" fill="#fff" />
      <path d="M37 20 Q40 17 43 19" stroke="#2d2d2d" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Wobbly mouth */}
      <path d="M28 35 Q30 37 32 35 Q34 33 36 35" stroke="#2d2d2d" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      {/* Question mark */}
      <text x="32" y="5" textAnchor="middle" fontSize="10" fontWeight="800" fill="#2d2d2d" opacity="0.35" fontFamily="sans-serif">?</text>
      {/* Swirl */}
      <path d="M52 22 Q56 18 54 14 Q52 10 48 12" stroke="#2d2d2d" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.25" />
    </>
  );
}

/* ── Waving: one arm raised, friendly smile ── */
function WavingPanda() {
  return (
    <>
      <PandaBody />
      <BellyPatch />
      {/* Left arm normal */}
      <ellipse cx="17" cy="50" rx="4" ry="6" fill="#2d2d2d" />
      {/* Right arm waving */}
      <g className="panda-wave-arm">
        <ellipse cx="50" cy="40" rx="4" ry="7" fill="#2d2d2d" transform="rotate(40 50 40)" />
        {/* Hand/paw */}
        <circle cx="55" cy="34" r="3" fill="#2d2d2d" />
      </g>
      <PandaBase />
      {/* Friendly eyes */}
      <circle cx="24" cy="25" r="2" fill="#fff" />
      <circle cx="40" cy="25" r="2" fill="#fff" />
      {/* Smile */}
      <path d="M28 35 Q32 38 36 35" stroke="#2d2d2d" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </>
  );
}

/* ── Reading: holding tiny book, eyes down ── */
function ReadingPanda() {
  return (
    <>
      <PandaBody />
      <BellyPatch />
      {/* Arms holding book */}
      <ellipse cx="19" cy="50" rx="4" ry="6" fill="#2d2d2d" transform="rotate(10 19 50)" />
      <ellipse cx="45" cy="50" rx="4" ry="6" fill="#2d2d2d" transform="rotate(-10 45 50)" />
      {/* Tiny book */}
      <rect x="24" y="47" width="16" height="11" rx="1.5" fill="#e8d5c4" stroke="#8b4f2c" strokeWidth="1" />
      <line x1="32" y1="47" x2="32" y2="58" stroke="#8b4f2c" strokeWidth="0.8" />
      {/* Book lines */}
      <line x1="26" y1="50" x2="30" y2="50" stroke="#8b4f2c" strokeWidth="0.5" opacity="0.4" />
      <line x1="26" y1="52" x2="30" y2="52" stroke="#8b4f2c" strokeWidth="0.5" opacity="0.4" />
      <line x1="34" y1="50" x2="38" y2="50" stroke="#8b4f2c" strokeWidth="0.5" opacity="0.4" />
      <line x1="34" y1="52" x2="38" y2="52" stroke="#8b4f2c" strokeWidth="0.5" opacity="0.4" />
      <PandaBase />
      {/* Eyes looking down */}
      <circle cx="24" cy="27" r="2" fill="#fff" />
      <circle cx="24" cy="28" r="0.8" fill="#2d2d2d" />
      <circle cx="40" cy="27" r="2" fill="#fff" />
      <circle cx="40" cy="28" r="0.8" fill="#2d2d2d" />
      {/* Focused slight smile */}
      <path d="M30 35 L34 35" stroke="#2d2d2d" strokeWidth="1.2" strokeLinecap="round" />
    </>
  );
}

/* ── Working: tiny laptop, determined eyes ── */
function WorkingPanda() {
  return (
    <>
      <PandaBody />
      <BellyPatch />
      {/* Arms on laptop */}
      <ellipse cx="19" cy="50" rx="4" ry="6" fill="#2d2d2d" transform="rotate(10 19 50)" />
      <ellipse cx="45" cy="50" rx="4" ry="6" fill="#2d2d2d" transform="rotate(-10 45 50)" />
      {/* Laptop base */}
      <rect x="20" y="52" width="24" height="2" rx="1" fill="#6b7280" />
      {/* Laptop screen */}
      <rect x="22" y="44" width="20" height="9" rx="1.5" fill="#374151" stroke="#6b7280" strokeWidth="0.8" />
      {/* Screen glow */}
      <rect x="24" y="46" width="16" height="5" rx="0.5" fill="#93c5fd" opacity="0.5" />
      {/* Screen lines */}
      <line x1="26" y1="47.5" x2="34" y2="47.5" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
      <line x1="26" y1="49" x2="32" y2="49" stroke="#fff" strokeWidth="0.5" opacity="0.4" />
      <PandaBase />
      {/* Determined eyes — slight flat bottom */}
      <circle cx="24" cy="25" r="2" fill="#fff" />
      <circle cx="24" cy="25" r="0.8" fill="#2d2d2d" />
      <circle cx="40" cy="25" r="2" fill="#fff" />
      <circle cx="40" cy="25" r="0.8" fill="#2d2d2d" />
      {/* Determined brow lines */}
      <line x1="21" y1="21" x2="27" y2="22" stroke="#2d2d2d" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="43" y1="21" x2="37" y2="22" stroke="#2d2d2d" strokeWidth="1.2" strokeLinecap="round" />
      {/* Focused mouth */}
      <path d="M30 35 L34 35" stroke="#2d2d2d" strokeWidth="1.2" strokeLinecap="round" />
    </>
  );
}
