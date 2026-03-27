import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'full' | 'icon' | 'white';
  size?: number;
}

export default function Logo({ variant = 'full', size = 32, className, ...props }: LogoProps) {
  const iconSize = size;
  const textSize = size * 0.8;
  const isWhiteVariant = variant === 'white';
  const palette = isWhiteVariant
    ? {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.78)',
        accent: '#ff9f76',
        text: '#ffffff',
      }
    : {
        primary: 'var(--primary-light)',
        secondary: 'var(--brand-purple)',
        accent: 'var(--accent-orange)',
        text: 'var(--on-surface)',
      };

  return (
    <div
      className={cn("flex items-center gap-2 font-display font-bold leading-none", className)}
      style={{ fontSize: textSize, color: palette.text }}
      {...props}
    >
      {/* SVG Icon */}
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* The ZigZag Path - Recreated from brand guide */}
        <path 
          d="M10 75L35 45L50 65L75 25" 
          stroke="currentColor" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ color: palette.primary }}
        />
        <path
          d="M35 45L50 65L75 25"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: palette.secondary }}
        />
        {/* Arrow Tip */}
        <path
          d="M75 25L90 10M90 10H70M90 10V30"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: palette.accent }}
        />
      </svg>

      {/* Wordmark */}
      {(variant === 'full' || variant === 'white') && (
        <span className="tracking-tight mt-1">
          pathwise
        </span>
      )}
    </div>
  );
}
