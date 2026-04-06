import './panda.css';

export type PandaMood = 'happy' | 'thinking' | 'sleepy' | 'curious' | 'celebrating' | 'confused' | 'waving' | 'reading' | 'working' | 'shy' | 'loving' | 'sad' | 'cold' | 'cool' | 'angry';

export interface PandaProps {
  mood: PandaMood;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
}

const PANDA_IMAGES: Record<PandaMood, string> = {
  happy:        '/panda/panda-happy.png',
  thinking:     '/panda/panda-thinking.png',
  sleepy:       '/panda/panda-sleepy.png',
  curious:      '/panda/panda-curious.png',
  celebrating:  '/panda/panda-celebrating.png',
  confused:     '/panda/panda-confused.png',
  waving:       '/panda/panda-waving.png',
  reading:      '/panda/panda-reading.png',
  working:      '/panda/panda-working.png',
  shy:          '/panda/panda-shy.png',
  loving:       '/panda/panda-loving.png',
  sad:          '/panda/panda-sad.png',
  cold:         '/panda/panda-cold.png',
  cool:         '/panda/panda-cool.png',
  angry:        '/panda/panda-angry.png',
};

export default function Panda({ mood, size = 100, className = '', style, animate = false }: PandaProps) {
  const cls = `panda${animate ? ' panda--animated' : ''}${className ? ` ${className}` : ''}`;
  const src = PANDA_IMAGES[mood] || PANDA_IMAGES.happy;

  return (
    <img
      className={cls}
      data-mood={mood}
      src={src}
      alt={`Panda: ${mood}`}
      width={size}
      height={size}
      style={{
        objectFit: 'contain',
        pointerEvents: 'none',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
      draggable={false}
    />
  );
}
