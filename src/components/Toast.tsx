/**
 * Toast notification system.
 *
 * The core implementation lives in src/lib/toast-context.tsx.
 * This file re-exports everything for convenience:
 *
 *   import { useToast } from '../lib/toast-context';
 *   const { toast } = useToast();
 *   toast('Task completed!', 'success');
 *
 * Types: 'success' (green), 'error' (red), 'info' (copper)
 */
export { ToastProvider, useToast } from '../lib/toast-context';
export type { ToastType, ToastItem } from '../lib/toast-context';
