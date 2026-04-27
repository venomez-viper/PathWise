/**
 * AmbientParticles
 * ----------------
 * A subtle full-screen particle overlay that mood-matches the active ambient
 * track in Focus Mode. Sits as a fixed canvas above the wallpaper but below
 * all UI (zIndex 0, pointer-events: none).
 *
 * Contract:
 *   - Renders only when `active` is true AND `trackId` has a configured
 *     particle behaviour. For ids with no particles ("brown", "white", or
 *     unknown ids) the component returns null.
 *   - Honours `prefers-reduced-motion: reduce` — returns null in that mode.
 *   - Cleans up its requestAnimationFrame loop on unmount or when `active`
 *     flips to false.
 *   - Resizes its backing canvas on `window.resize` so it always covers the
 *     viewport at device pixel ratio.
 *
 * Performance:
 *   - Per-frame work targeted at <= 1.5ms on a typical desktop. Particle
 *     counts are intentionally low and the per-particle math is trivial
 *     (no trig per frame except where strictly necessary).
 */

import { useEffect, useRef, useState, type JSX } from 'react';

type ParticleKind =
  | 'rain'
  | 'ocean'
  | 'forest'
  | 'stream'
  | 'birds'
  | 'fireplace'
  | 'thunder'
  | 'cafe'
  | 'library'
  | 'lofi'
  | 'piano'
  | 'crickets'
  | 'wind';

const KIND_BY_TRACK: Record<string, ParticleKind | null> = {
  rain: 'rain',
  ocean: 'ocean',
  forest: 'forest',
  stream: 'stream',
  birds: 'birds',
  fireplace: 'fireplace',
  thunder: 'thunder',
  cafe: 'cafe',
  library: 'library',
  lofi: 'lofi',
  piano: 'piano',
  crickets: 'crickets',
  wind: 'wind',
  brown: null,
  white: null,
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number; // 0..1, used by some kinds for fading
  hue?: number; // optional palette index
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function makeParticles(kind: ParticleKind, w: number, h: number): Particle[] {
  const rand = (min: number, max: number) => min + Math.random() * (max - min);
  const arr: Particle[] = [];
  switch (kind) {
    case 'rain': {
      for (let i = 0; i < 80; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: 1.2,
          vy: rand(7, 11),
          size: rand(8, 14),
          life: 1,
        });
      }
      return arr;
    }
    case 'thunder': {
      for (let i = 0; i < 120; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: 1.6,
          vy: rand(9, 14),
          size: rand(8, 16),
          life: 1,
        });
      }
      return arr;
    }
    case 'ocean': {
      for (let i = 0; i < 18; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(h * 0.3, h),
          vx: rand(0.4, 1.0),
          vy: 0,
          size: rand(40, 110),
          life: 1,
        });
      }
      return arr;
    }
    case 'forest': {
      for (let i = 0; i < 10; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(-50, h),
          vx: rand(-0.4, 0.4),
          vy: rand(0.4, 0.9),
          size: rand(14, 20),
          life: 1,
          hue: Math.floor(rand(0, 3)),
        });
      }
      return arr;
    }
    case 'stream': {
      for (let i = 0; i < 40; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(0.3, 0.9),
          vy: rand(-0.2, 0.2),
          size: rand(1.5, 3),
          life: rand(0, 1),
        });
      }
      return arr;
    }
    case 'birds':
    case 'cafe':
    case 'library': {
      const count = kind === 'birds' ? 28 : kind === 'cafe' ? 35 : 25;
      for (let i = 0; i < count; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.15, 0.15),
          vy: rand(-0.1, 0.1),
          size: rand(1, 2.5),
          life: rand(0, 1),
        });
      }
      return arr;
    }
    case 'fireplace': {
      for (let i = 0; i < 35; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(h * 0.6, h),
          vx: rand(-0.3, 0.3),
          vy: rand(-1.6, -0.7),
          size: rand(1.5, 3),
          life: rand(0.4, 1),
        });
      }
      return arr;
    }
    case 'lofi': {
      for (let i = 0; i < 22; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.25, 0.25),
          vy: rand(-0.15, 0.15),
          size: rand(2, 3.5),
          life: rand(0, 1),
          hue: Math.random() < 0.5 ? 0 : 1, // pink vs purple
        });
      }
      return arr;
    }
    case 'piano': {
      for (let i = 0; i < 18; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.15, 0.15),
          vy: rand(-0.1, 0.1),
          size: rand(2.5, 4),
          life: rand(0, 1),
        });
      }
      return arr;
    }
    case 'crickets': {
      for (let i = 0; i < 16; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.2, 0.2),
          vy: rand(-0.15, 0.15),
          size: rand(2, 3),
          life: Math.random(),
        });
      }
      return arr;
    }
    case 'wind': {
      for (let i = 0; i < 30; i++) {
        arr.push({
          x: rand(-50, w),
          y: rand(0, h),
          vx: rand(4, 8),
          vy: rand(-0.3, 0.3),
          size: rand(10, 22),
          life: 1,
        });
      }
      return arr;
    }
  }
}

const FOREST_GLYPHS = ['\u{1F343}']; // 🍃

export function AmbientParticles({
  trackId,
  active,
}: {
  trackId: string;
  active: boolean;
}): JSX.Element | null {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 1 });
  const flashRef = useRef<{ alpha: number; nextAt: number }>({ alpha: 0, nextAt: 0 });

  const kind = KIND_BY_TRACK[trackId] ?? null;
  const shouldRender = active && !reduced && kind !== null;

  useEffect(() => {
    if (!shouldRender) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Re-seed positions only when first sizing or when we have none, to
      // avoid jarring redistribution on every resize.
      if (particlesRef.current.length === 0) {
        particlesRef.current = makeParticles(kind as ParticleKind, w, h);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      const { w, h } = sizeRef.current;
      const particles = particlesRef.current;
      ctx.clearRect(0, 0, w, h);

      switch (kind) {
        case 'rain':
        case 'thunder': {
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1.1;
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx, p.y - p.size);
            ctx.stroke();
            p.x += p.vx;
            p.y += p.vy;
            if (p.y > h + 10) {
              p.y = -10;
              p.x = Math.random() * w;
            }
          }
          if (kind === 'thunder') {
            const now = performance.now();
            if (flashRef.current.nextAt === 0) {
              flashRef.current.nextAt = now + 6000 + Math.random() * 9000;
            }
            if (now >= flashRef.current.nextAt) {
              flashRef.current.alpha = 0.55;
              flashRef.current.nextAt = now + 7000 + Math.random() * 11000;
            }
            if (flashRef.current.alpha > 0.001) {
              ctx.fillStyle = `rgba(255,255,255,${flashRef.current.alpha})`;
              ctx.fillRect(0, 0, w, h);
              flashRef.current.alpha *= 0.86;
            }
          }
          break;
        }
        case 'ocean': {
          ctx.fillStyle = 'rgba(255,255,255,0.30)';
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.size, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx;
            if (p.x - p.size > w) {
              p.x = -p.size;
              p.y = h * 0.3 + Math.random() * h * 0.7;
            }
          }
          break;
        }
        case 'forest': {
          ctx.font = '18px serif';
          ctx.textBaseline = 'middle';
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const tint = p.hue === 0 ? 'rgba(180,220,140,0.85)' : p.hue === 1 ? 'rgba(220,200,120,0.85)' : 'rgba(150,200,120,0.85)';
            ctx.fillStyle = tint;
            ctx.font = `${p.size}px serif`;
            ctx.fillText(FOREST_GLYPHS[0], p.x, p.y);
            p.x += p.vx + Math.sin((p.y + i) * 0.01) * 0.3;
            p.y += p.vy;
            if (p.y > h + 20) {
              p.y = -20;
              p.x = Math.random() * w;
            }
          }
          break;
        }
        case 'stream': {
          ctx.fillStyle = 'rgba(220,240,255,0.55)';
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const a = 0.3 + Math.abs(Math.sin((p.life + i) * 0.7)) * 0.5;
            ctx.fillStyle = `rgba(220,240,255,${a.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            p.life += 0.02;
            if (p.x > w + 5) {
              p.x = -5;
              p.y = Math.random() * h;
            }
          }
          break;
        }
        case 'birds': {
          ctx.fillStyle = 'rgba(255,240,210,0.55)';
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -5) p.x = w + 5;
            if (p.x > w + 5) p.x = -5;
            if (p.y < -5) p.y = h + 5;
            if (p.y > h + 5) p.y = -5;
          }
          break;
        }
        case 'cafe':
        case 'library': {
          const alpha = kind === 'cafe' ? 0.32 : 0.22;
          ctx.fillStyle = `rgba(255,250,235,${alpha})`;
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -5) p.x = w + 5;
            if (p.x > w + 5) p.x = -5;
            if (p.y < -5) p.y = h + 5;
            if (p.y > h + 5) p.y = -5;
          }
          break;
        }
        case 'fireplace': {
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            // colour shifts orange (255,140,40) -> red (200,40,20) as it fades
            const t = 1 - p.life;
            const r = Math.round(255 - t * 55);
            const g = Math.round(140 - t * 100);
            const b = Math.round(40 - t * 20);
            ctx.fillStyle = `rgba(${r},${g},${b},${p.life.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.008;
            if (p.life <= 0 || p.y < -10) {
              p.x = Math.random() * w;
              p.y = h * 0.6 + Math.random() * h * 0.4;
              p.life = 0.4 + Math.random() * 0.6;
              p.vy = -(0.7 + Math.random() * 0.9);
              p.vx = (Math.random() - 0.5) * 0.6;
            }
          }
          break;
        }
        case 'lofi': {
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const colour = p.hue === 0 ? 'rgba(255,140,210,0.55)' : 'rgba(180,140,255,0.55)';
            ctx.fillStyle = colour;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -5) p.x = w + 5;
            if (p.x > w + 5) p.x = -5;
            if (p.y < -5) p.y = h + 5;
            if (p.y > h + 5) p.y = -5;
          }
          break;
        }
        case 'piano': {
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const a = 0.25 + Math.abs(Math.sin((p.life + i) * 0.4)) * 0.35;
            ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            p.life += 0.015;
            if (p.x < -5) p.x = w + 5;
            if (p.x > w + 5) p.x = -5;
            if (p.y < -5) p.y = h + 5;
            if (p.y > h + 5) p.y = -5;
          }
          break;
        }
        case 'crickets': {
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const pulse = 0.4 + Math.abs(Math.sin((p.life + i) * 1.6)) * 0.6;
            ctx.fillStyle = `rgba(220,255,150,${(pulse * 0.7).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx;
            p.y += p.vy;
            p.life += 0.04;
            if (p.x < -5) p.x = w + 5;
            if (p.x > w + 5) p.x = -5;
            if (p.y < -5) p.y = h + 5;
            if (p.y > h + 5) p.y = -5;
          }
          break;
        }
        case 'wind': {
          ctx.strokeStyle = 'rgba(255,255,255,0.35)';
          ctx.lineWidth = 1;
          ctx.lineCap = 'round';
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.size, p.y - p.vy * 0.2);
            ctx.stroke();
            p.x += p.vx;
            p.y += p.vy;
            if (p.x - p.size > w) {
              p.x = -p.size;
              p.y = Math.random() * h;
            }
          }
          break;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      particlesRef.current = [];
      flashRef.current = { alpha: 0, nextAt: 0 };
    };
  }, [shouldRender, kind]);

  if (!shouldRender) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        // Sits ABOVE the wallpaper scrim (zIndex 0) so the particles read
        // against the toned photo. Content wrapper has zIndex 2 so UI is
        // still on top of the particles.
        zIndex: 1,
      }}
    />
  );
}
