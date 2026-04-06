export type Task = {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  category?: string;
  dueDate?: string;
  milestoneId?: string;
  completedAt?: string;
};

export type Milestone = { id: string; title: string; status: string };

/* ── Category display map ── */
export const CATEGORY_LABELS: Record<string, string> = {
  learning: 'Learning',
  portfolio: 'Portfolio',
  networking: 'Networking',
  interview_prep: 'Interview Prep',
  certification: 'Certification',
  reflection: 'Reflection',
};

/* ── Category colors for progress bars ── */
export const CATEGORY_COLORS: Record<string, string> = {
  learning: '#7c3aed',
  portfolio: '#2563eb',
  networking: '#0d9488',
  interview_prep: '#b45309',
  certification: '#059669',
  reflection: '#6b7280',
  research: '#8b4f2c',
};

/* ── Widget title style helper ── */
export const widgetTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '0.85rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--on-surface)',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};
