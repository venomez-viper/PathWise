import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  dismissing: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId;
    setToasts(prev => {
      const next = [...prev, { id, message, type, dismissing: false }];
      // Keep only the last MAX_VISIBLE
      return next.slice(-MAX_VISIBLE);
    });

    // Start dismiss animation after 2.5s
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, dismissing: true } : t));
    }, 2500);

    // Remove after animation completes (3s total)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <Toast key={t.id} item={t} />
      ))}
    </div>
  );
}

/* ── Individual toast ── */

import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const TYPE_CONFIG: Record<ToastType, { color: string; Icon: typeof CheckCircle2 }> = {
  success: { color: '#16a34a', Icon: CheckCircle2 },
  error:   { color: '#ef4444', Icon: AlertCircle },
  info:    { color: 'var(--copper, #8b4f2c)', Icon: Info },
};

function Toast({ item }: { item: ToastItem }) {
  const { color, Icon } = TYPE_CONFIG[item.type];

  return (
    <div
      style={{
        maxWidth: 360,
        minWidth: 220,
        background: '#fff',
        boxShadow: 'var(--shadow-md, 0 4px 40px rgba(98,69,164,0.06)), 0 2px 8px rgba(0,0,0,0.08)',
        borderRadius: 'var(--radius-sm, 0.75rem)',
        borderLeft: `4px solid ${color}`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-body, Inter, sans-serif)',
        fontSize: '0.875rem',
        color: 'var(--on-surface, #1a1c1f)',
        pointerEvents: 'auto',
        animation: item.dismissing
          ? 'toast-fade-out 0.5s ease forwards'
          : 'toast-slide-up 0.3s ease',
      }}
    >
      <Icon size={18} color={color} style={{ flexShrink: 0 }} />
      <span>{item.message}</span>

      {/* Keyframe injection (once) */}
      <style>{toastKeyframes}</style>
    </div>
  );
}

const toastKeyframes = `
@keyframes toast-slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes toast-fade-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(8px); }
}
`;
