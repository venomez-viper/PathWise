import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'full' | 'icon' | 'white';
  size?: number;
}

export default function Logo({ variant = 'full', size = 32, className, ...props }: LogoProps) {
  const iconColor = variant === 'white' ? '#ffffff' : 'var(--brand-deep)';
  const accentColor = variant === 'white' ? 'rgba(255,255,255,0.72)' : 'var(--brand)';
  const warmColor = variant === 'white' ? '#f0bb5a' : 'var(--brand-warm)';

  return (
    <div
      className={cn('flex items-center gap-3 leading-none', className)}
      style={{ fontSize: size * 0.68 }}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 84 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect x="4" y="4" width="76" height="76" rx="24" fill={variant === 'white' ? 'rgba(255,255,255,0.12)' : 'rgba(30,90,82,0.08)'} />
        <path d="M18 54L33 39L43 47L60 28" stroke={iconColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M43 47L60 28" stroke={accentColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M58 28H67V37" stroke={warmColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {variant !== 'icon' && (
        <span
          className="font-['Space_Grotesk'] font-bold tracking-[-0.06em]"
          style={{ color: variant === 'white' ? '#ffffff' : 'var(--brand-deep)' }}
        >
          pathwise
        </span>
      )}
    </div>
  );
}
