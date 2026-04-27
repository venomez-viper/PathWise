import { useCallback, useState } from 'react';

const STORAGE_KEY = 'pathwise_focus_target';
const DEFAULT_TARGET = 4;
const MIN_TARGET = 1;
const MAX_TARGET = 12;

function clamp(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_TARGET;
  if (n < MIN_TARGET) return MIN_TARGET;
  if (n > MAX_TARGET) return MAX_TARGET;
  return Math.round(n);
}

function readInitial(): number {
  if (typeof window === 'undefined') return DEFAULT_TARGET;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) return DEFAULT_TARGET;
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return DEFAULT_TARGET;
    return clamp(parsed);
  } catch {
    return DEFAULT_TARGET;
  }
}

export function useDailyTarget(): {
  target: number;
  setTarget: (n: number) => void;
} {
  const [target, setTargetState] = useState<number>(readInitial);

  const setTarget = useCallback((n: number) => {
    const next = clamp(n);
    setTargetState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore quota / privacy mode failures
    }
  }, []);

  return { target, setTarget };
}
