import { useCallback } from 'react';
import { streaks } from '../../../lib/api';

const FLAG_PREFIX = 'pathwise_focus_streak_recorded_';

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${FLAG_PREFIX}${y}-${m}-${day}`;
}

function alreadyRecorded(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function markRecorded(key: string): void {
  try {
    window.sessionStorage.setItem(key, '1');
  } catch {
    // ignore
  }
}

export function useStreakSync(userId: string | undefined): {
  recordPomodoro: () => void;
} {
  const recordPomodoro = useCallback(() => {
    if (!userId) return;
    const key = todayKey();
    if (alreadyRecorded(key)) return;
    // Optimistically mark first to dedupe rapid double-fires.
    markRecorded(key);
    void (async () => {
      try {
        await streaks.recordActivity(userId);
      } catch {
        // Silent — streaks are best-effort and the day already counts
        // when any task is completed via the normal flow.
      }
    })();
  }, [userId]);

  return { recordPomodoro };
}
