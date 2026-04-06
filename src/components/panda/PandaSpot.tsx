import Panda from './Panda';
import type { PandaMood } from './Panda';

interface PandaSpotProps {
  context: 'empty-state' | 'loading' | 'success' | 'error' | 'welcome' | 'tip' | 'achievement' | 'idle' | 'progress';
  position?: 'inline' | 'corner-br' | 'corner-bl' | 'peek-right' | 'peek-bottom';
  opacity?: number;
  message?: string;
  size?: number;
  animate?: boolean;
}

const CONTEXT_MOOD: Record<PandaSpotProps['context'], PandaMood> = {
  'empty-state': 'sleepy',
  loading: 'thinking',
  success: 'celebrating',
  error: 'confused',
  welcome: 'waving',
  tip: 'curious',
  achievement: 'happy',
  idle: 'sleepy',
  progress: 'working',
};

export default function PandaSpot({
  context,
  position = 'inline',
  opacity,
  message,
  size = 100,
  animate = false,
}: PandaSpotProps) {
  const mood = CONTEXT_MOOD[context];
  const resolvedOpacity = opacity ?? (position === 'inline' ? 1 : 0.85);

  return (
    <span
      className={`panda-spot panda-spot--${position}`}
      style={{ opacity: resolvedOpacity }}
    >
      <Panda mood={mood} size={size} animate={animate} />
      {message && (
        <span className="panda-spot__bubble">{message}</span>
      )}
    </span>
  );
}
