import { useState, useEffect, useRef } from 'react';
import { X, Trash2, Save, Calendar, Tag, Flag, Layers } from 'lucide-react';

/* ── Types ── */
type Task = {
  id: string;
  userId?: string;
  milestoneId?: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  category?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt?: string;
};

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'No category' },
  { value: 'learning', label: 'Learning' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'networking', label: 'Networking' },
  { value: 'interview_prep', label: 'Interview Prep' },
  { value: 'certification', label: 'Certification' },
  { value: 'reflection', label: 'Reflection' },
];

const STATUS_OPTIONS: { value: Task['status']; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: Task['priority']; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#34d399' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: 'var(--error, #ef4444)' },
];

export default function TaskDetailPanel({ task, onClose, onSave, onDelete }: TaskDetailPanelProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Initialize form from task prop
  useEffect(() => {
    if (task) {
      setTitle(task.title ?? '');
      setStatus(task.status ?? 'todo');
      setPriority(task.priority ?? 'medium');
      setCategory(task.category ?? '');
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
      setDescription(task.description ?? '');
    }
  }, [task]);

  // Auto-focus title input when panel opens
  useEffect(() => {
    if (task) {
      // Delay slightly to allow slide-in animation to start
      const timer = setTimeout(() => titleRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [task]);

  if (!task) return null;

  const hasChanges =
    title !== (task.title ?? '') ||
    status !== (task.status ?? 'todo') ||
    priority !== (task.priority ?? 'medium') ||
    category !== (task.category ?? '') ||
    dueDate !== (task.dueDate ? task.dueDate.slice(0, 10) : '') ||
    description !== (task.description ?? '');

  const handleSave = async () => {
    if (saving || !hasChanges) return;
    setSaving(true);
    try {
      await onSave(task.id, {
        title,
        status,
        priority,
        category: category || undefined,
        dueDate: dueDate || undefined,
        description: description || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    const confirmed = window.confirm('Are you sure you want to delete this task? This cannot be undone.');
    if (!confirmed) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  };

  /* ── Styles ── */
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    zIndex: 1000,
    animation: 'taskPanelFadeIn 0.2s ease',
    cursor: 'pointer',
  };

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: 'min(480px, 90vw)',
    background: 'var(--surface-container-lowest)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    animation: 'taskPanelSlideIn 0.25s ease',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '1.5rem 1.5rem 1rem',
    borderBottom: '1px solid var(--outline-variant)',
  };

  const fieldGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--on-surface-variant)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1.5px solid var(--outline-variant)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface-container-low)',
    color: 'var(--on-surface)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
  };

  const inputStyle: React.CSSProperties = {
    ...selectStyle,
    cursor: 'text',
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--outline-variant)',
    background: 'var(--surface-container-low)',
    marginTop: 'auto',
  };

  return (
    <>
      {/* Animation keyframes */}
      <style>{`
        @keyframes taskPanelSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes taskPanelFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div style={overlayStyle} onClick={onClose} />

      {/* Panel */}
      <div style={panelStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              flex: 1,
              fontSize: '1.25rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'var(--on-surface)',
              background: 'transparent',
              border: '1.5px solid transparent',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }}
            onBlur={e => { e.target.style.borderColor = 'transparent'; }}
            placeholder="Task title"
          />
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--on-surface-variant)',
              padding: 6,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              marginTop: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Status */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}><Layers size={13} /> Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as Task['status'])} style={selectStyle}>
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}><Flag size={13} /> Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} style={selectStyle}>
              {PRIORITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              {PRIORITY_OPTIONS.map(o => (
                <span
                  key={o.value}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: o.color,
                    opacity: priority === o.value ? 1 : 0.25,
                    transition: 'opacity 0.15s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Category */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}><Tag size={13} /> Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
              {CATEGORY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}><Calendar size={13} /> Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 80,
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Metadata */}
          <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
              Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
            </span>
            {task.completedAt && (
              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                Completed: {new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {task.milestoneId && (
              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                Linked to milestone
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              background: hasChanges ? 'var(--primary)' : 'var(--outline-variant)',
              color: hasChanges ? '#fff' : 'var(--on-surface-variant)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              opacity: saving ? 0.7 : 1,
              transition: 'background 0.15s, opacity 0.15s',
            }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              background: 'transparent',
              color: 'var(--error, #ef4444)',
              border: '1.5px solid var(--error, #ef4444)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <Trash2 size={14} />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </>
  );
}
