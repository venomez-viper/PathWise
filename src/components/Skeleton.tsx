import type { CSSProperties } from 'react';

const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

// Inject keyframes once
let injected = false;
function injectShimmerStyles() {
  if (injected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
  injected = true;
}

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  style?: CSSProperties;
}

export default function Skeleton({ width, height, borderRadius = 'var(--radius-md)', style }: SkeletonProps) {
  injectShimmerStyles();

  return (
    <div
      aria-hidden="true"
      style={{
        width: width ?? '100%',
        height: height ?? 16,
        borderRadius,
        background: 'linear-gradient(90deg, var(--surface-container) 25%, var(--surface-container-low) 50%, var(--surface-container) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}
