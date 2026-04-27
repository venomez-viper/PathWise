/**
 * usePomodoroNotification — Thin wrapper around the Notification API for
 * end-of-phase desktop alerts. Engineered to never throw: Safari, private
 * browsing, embedded webviews, and locked-down enterprise browsers all reject
 * one or more steps of this flow.
 *
 * WHEN to call:
 *   - `request()` from a click handler the first time the user enables
 *     notifications (browsers ignore permission requests outside a gesture).
 *     Returns the resulting permission state, or 'denied' on failure.
 *   - `notify(title, body)` whenever a phase ends (work→break, break→work,
 *     session complete). No-ops if permission isn't 'granted'.
 *
 * Every notification ships with `icon: '/favicon.svg'` so the OS toast carries
 * PathWise branding instead of a generic browser glyph.
 */
import { useCallback } from 'react';

const ICON = '/favicon.svg';

const supported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

export function usePomodoroNotification(): {
  request: () => Promise<NotificationPermission>;
  notify: (title: string, body: string) => void;
} {
  const request = useCallback(async (): Promise<NotificationPermission> => {
    try {
      if (!supported()) return 'denied';
      if (Notification.permission !== 'default') return Notification.permission;
      // Some browsers return a promise, older ones used a callback API. The
      // modern shape is widely supported; fall back to the resolved value.
      const result = await Notification.requestPermission();
      return result ?? Notification.permission;
    } catch {
      return 'denied';
    }
  }, []);

  const notify = useCallback((title: string, body: string) => {
    try {
      if (!supported()) return;
      if (Notification.permission !== 'granted') return;
      new Notification(title, { body, icon: ICON });
    } catch {
      // Notification constructor can throw in unusual contexts (Safari private
      // mode, certain webviews). Silent failure is correct here.
    }
  }, []);

  return { request, notify };
}
