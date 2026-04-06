import './panda.css';

export interface PandaProps {
  mood: 'happy' | 'thinking' | 'sleepy' | 'curious' | 'celebrating' | 'confused' | 'waving' | 'reading' | 'working';
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
}

/**
 * Sprite coordinates for panda-sprites-1x.png (704×384)
 * Each entry: [x, y, width, height] in the sprite sheet
 * Row 1 (y ~0-180): confused, curious, celebrating, thinking, working, happy
 * Row 2 (y ~180-384): waving, reading, chef(unused), explorer(unused), studying(=reading), sleepy
 */
const SPRITE_MAP: Record<PandaProps['mood'], [number, number, number, number]> = {
  confused:     [5,   10,  85,  165],   // detective panda
  curious:      [100, 5,   85,  175],   // magnifying glass panda
  celebrating:  [200, 5,   90,  175],   // party hat panda
  thinking:     [295, 5,   90,  175],   // lightbulb laptop panda
  working:      [400, 10,  95,  170],   // laptop graph panda
  happy:        [595, 5,   100, 175],   // watering plant panda
  waving:       [12,  195, 90,  170],   // thumbs up panda
  reading:      [420, 190, 100, 180],   // book-reading panda
  sleepy:       [540, 210, 160, 170],   // sleeping zzz panda
};

export default function Panda({ mood, size = 48, className = '', style, animate = false }: PandaProps) {
  const cls = `panda${animate ? ' panda--animated' : ''}${className ? ` ${className}` : ''}`;
  const [sx, sy, sw, sh] = SPRITE_MAP[mood] || SPRITE_MAP.happy;

  // Scale factor from sprite region to desired display size
  const scale = size / Math.max(sw, sh);
  const displayW = Math.round(sw * scale);
  const displayH = Math.round(sh * scale);

  // Full sprite sheet dimensions (1x = 704×384)
  const sheetW = 704;
  const sheetH = 384;

  // Scaled sheet dimensions
  const bgW = Math.round(sheetW * scale);
  const bgH = Math.round(sheetH * scale);

  // Background position (negative offsets)
  const bgX = -Math.round(sx * scale);
  const bgY = -Math.round(sy * scale);

  return (
    <div
      className={cls}
      data-mood={mood}
      role="img"
      aria-label={`Panda mascot: ${mood}`}
      style={{
        width: displayW,
        height: displayH,
        backgroundImage: 'url(/panda/panda-sprites-1x.png)',
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundRepeat: 'no-repeat',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
