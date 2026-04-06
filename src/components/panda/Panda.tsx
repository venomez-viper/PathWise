import './panda.css';

export type PandaMood =
  | 'happy' | 'thinking' | 'sleepy' | 'curious' | 'celebrating'
  | 'confused' | 'waving' | 'reading' | 'working'
  | 'cool' | 'loving' | 'sad' | 'sick' | 'hurt' | 'grumpy';

export interface PandaProps {
  mood: PandaMood;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
}

/** Map moods to the clean Panda Pack images */
const PANDA_IMAGES: Record<PandaMood, string> = {
  happy:        '/panda/calm_happy.png',
  thinking:     '/panda/thinking_question.png',
  sleepy:       '/panda/dizzy_flat.png',
  curious:      '/panda/thinking_question.png',
  celebrating:  '/panda/calm_happy.png',
  confused:     '/panda/thinking_question.png',
  waving:       '/panda/waving_wink.png',
  reading:      '/panda/thinking_question.png',
  working:      '/panda/cool_sunglasses.png',
  cool:         '/panda/cool_sunglasses.png',
  loving:       '/panda/love_heart.png',
  sad:          '/panda/crying_sad.png',
  sick:         '/panda/sick_blanket.png',
  hurt:         '/panda/hurt_bandage.png',
  grumpy:       '/panda/grumpy_crossed_arms.png',
};

export default function Panda({ mood, size = 100, className = '', style, animate = false }: PandaProps) {
  const cls = `panda${animate ? ' panda--animated' : ''}${className ? ` ${className}` : ''}`;
  const src = PANDA_IMAGES[mood] || PANDA_IMAGES.happy;

  return (
    <img
      className={cls}
      data-mood={mood}
      src={src}
      alt={`PathWise panda: ${mood}`}
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
