import { useState, useEffect, useMemo } from 'react';
import {
  Shield, Users, Trash2, Search, BarChart3, CheckCircle2, AlertTriangle,
  X, Download, ExternalLink, Copy, Monitor, ChevronDown, MessageSquare,
  Mail, Send,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { admin as adminApi } from '../../lib/api';

const ADMIN_EMAILS = ['akashagakash@gmail.com', 'eaintkphyu98@gmail.com'];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  lastLoginAt?: string | null;
  avatarUrl?: string;
  oauthProviders?: string[];
}

interface TaskStat {
  userId: string;
  taskCount: number;
  completedTaskCount: number;
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  avatarUrl?: string;
  oauthProviders?: string[];
  assessment?: { topCareer?: string; score?: number } | null;
  taskStats?: { total: number; completed: number } | null;
}

type SortKey = 'name' | 'email' | 'plan' | 'createdAt' | 'assessment' | 'tasks';
type SortDir = 'asc' | 'desc';
type TabKey = 'users' | 'analytics' | 'system' | 'tickets';

/* ─────────── User Detail Panel ─────────── */

function UserDetailPanel({
  user,
  taskStat,
  hasAssessment,
  onClose,
  onPlanChange,
  onDelete,
}: {
  user: AdminUser;
  taskStat?: TaskStat;
  hasAssessment: boolean;
  onClose: () => void;
  onPlanChange: (userId: string, plan: string) => void;
  onDelete: (user: AdminUser) => void;
}) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [impersonating, setImpersonating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const isAdmin = ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    setLoadingDetail(true);
    Promise.allSettled([
      adminApi.getUserDetail(user.id),
      adminApi.getAssessment(user.id),
    ]).then(([detailRes, assessRes]) => {
      const d = detailRes.status === 'fulfilled' ? detailRes.value : null;
      const a = assessRes.status === 'fulfilled' ? assessRes.value : null;
      setDetail({
        ...user,
        ...(d ?? {}),
        assessment: a ?? null,
        taskStats: taskStat ? { total: taskStat.taskCount, completed: taskStat.completedTaskCount } : null,
      });
    }).finally(() => setLoadingDetail(false));
  }, [user.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      const res = await adminApi.impersonate(user.id);
      await navigator.clipboard.writeText(res.token);
      showToast(`Token copied! Open incognito, paste in console: localStorage.setItem('pathwise_token', '${res.token.slice(0, 8)}...'); then refresh.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Impersonate failed');
    } finally {
      setImpersonating(false);
    }
  };

  const handleTogglePlan = () => {
    const newPlan = user.plan === 'premium' ? 'free' : 'premium';
    onPlanChange(user.id, newPlan);
  };

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const completionRate = taskStat && taskStat.taskCount > 0
    ? Math.round((taskStat.completedTaskCount / taskStat.taskCount) * 100)
    : 0;

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const authMethods: string[] = [];
  if (detail?.oauthProviders?.includes('google')) authMethods.push('Google');
  if (detail?.oauthProviders?.includes('apple')) authMethods.push('Apple');
  if (!detail?.oauthProviders?.length || detail.oauthProviders.length === 0) authMethods.push('Password');

  const sectionLabel: React.CSSProperties = {
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--on-surface-variant)',
    marginBottom: '0.5rem',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '100vw',
        zIndex: 1000, background: 'var(--surface)', borderLeft: '1px solid var(--outline-variant)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', overflowY: 'auto',
        animation: 'slideInRight 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--outline-variant)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0 }}>User Detail</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 4, borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem' }}>
            {user.avatarUrl?.trim() ? (
              <img
                src={user.avatarUrl}
                alt=""
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => {
                  const img = e.currentTarget;
                  const fallback = document.createElement('div');
                  Object.assign(fallback.style, {
                    width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '700', fontSize: '1.1rem', fontFamily: 'var(--font-display)',
                  });
                  fallback.textContent = initials;
                  img.replaceWith(fallback);
                }}
              />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-display)',
              }}>
                {initials}
              </div>
            )}
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0, fontFamily: 'var(--font-display)' }}>{user.name}</p>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', margin: 0 }}>{user.email}</p>
              {isAdmin && <span style={{ fontSize: '0.65rem', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, marginTop: 4, display: 'inline-block' }}>Admin</span>}
            </div>
          </div>

          {/* Plan toggle */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Plan</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700,
                background: user.plan === 'premium' ? '#fbbf2418' : 'var(--surface-container)',
                color: user.plan === 'premium' ? '#b8860b' : 'var(--on-surface-variant)',
                border: user.plan === 'premium' ? '1px solid #fbbf2444' : '1px solid var(--outline-variant)',
              }}>
                {user.plan === 'premium' ? 'Premium' : 'Free'}
              </span>
              {!isAdmin && (
                <button
                  onClick={handleTogglePlan}
                  style={{
                    background: 'none', border: '1px solid var(--outline-variant)', borderRadius: '999px',
                    padding: '4px 12px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                    color: 'var(--primary)',
                  }}
                >
                  Switch to {user.plan === 'premium' ? 'Free' : 'Premium'}
                </button>
              )}
            </div>
          </div>

          {/* Signup date */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Signed Up</p>
            <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--on-surface)' }}>{formatDate(user.createdAt)}</p>
          </div>

          {/* Auth method */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Auth Method</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {authMethods.map(m => (
                <span key={m} style={{
                  padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                  background: 'var(--surface-container)', border: '1px solid var(--outline-variant)',
                  color: 'var(--on-surface-variant)',
                }}>{m}</span>
              ))}
            </div>
          </div>

          {/* Assessment */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>Assessment</p>
            {loadingDetail ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', margin: 0 }}>Loading...</p>
            ) : detail?.assessment?.topCareer ? (
              <div style={{ background: 'var(--surface-container)', borderRadius: '1rem', padding: '0.75rem 1rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 4px' }}>{detail.assessment.topCareer}</p>
                {detail.assessment.score != null && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', margin: 0 }}>Score: {detail.assessment.score}%</p>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', margin: 0 }}>
                {hasAssessment ? 'Assessment taken (details unavailable)' : 'No assessment yet'}
              </p>
            )}
          </div>

          {/* Task stats */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={sectionLabel}>Tasks</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'var(--surface-container)', borderRadius: '1rem', padding: '0.75rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)' }}>{taskStat?.taskCount ?? 0}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</p>
              </div>
              <div style={{ background: 'var(--surface-container)', borderRadius: '1rem', padding: '0.75rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: '#22c55e' }}>{taskStat?.completedTaskCount ?? 0}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Done</p>
              </div>
              <div style={{ background: 'var(--surface-container)', borderRadius: '1rem', padding: '0.75rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{completionRate}%</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isAdmin && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleImpersonate}
                disabled={impersonating}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '0.6rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                  background: 'var(--copper)', color: '#fff', border: 'none', cursor: 'pointer',
                  opacity: impersonating ? 0.6 : 1,
                }}
              >
                <Copy size={14} />
                {impersonating ? 'Copying...' : 'Impersonate'}
              </button>
              <button
                onClick={() => onDelete(user)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '0.6rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                  background: 'none', color: '#ef4444', border: '1px solid #ef444444', cursor: 'pointer',
                }}
              >
                <Trash2 size={14} />
                Delete User
              </button>
            </div>
          )}
        </div>

        {/* Toast */}
        {toastMsg && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1001,
            background: 'var(--on-surface)', color: 'var(--surface)', padding: '0.75rem 1.25rem',
            borderRadius: '1rem', fontSize: '0.8rem', maxWidth: 400, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.2s ease',
          }}>
            {toastMsg}
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────── Email Compose Modal ─────────── */

interface ComposeModal {
  initialMode: 'reply' | 'broadcast';
  reply?: {
    ticketId: string;
    recipientName: string;
    recipientEmail: string;
    originalSubject: string;
  };
  users: { id: string; name: string; email: string; plan: string }[];
}

function EmailTagInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  const addTag = (raw: string) => {
    const email = raw.trim().toLowerCase();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !tags.includes(email)) {
      onChange([...tags, email]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          padding: '0.5rem 0.75rem', borderRadius: '0.75rem', minHeight: 42,
          border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
          cursor: 'text',
        }}
        onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}
      >
        {tags.map(tag => (
          <span key={tag} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px 2px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 500,
            background: '#6245a418', color: '#6245a4', whiteSpace: 'nowrap',
          }}>
            {tag}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(tags.filter(t => t !== tag)); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6245a4', lineHeight: 1, display: 'flex' }}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ''}
          style={{
            flex: 1, minWidth: 140, border: 'none', outline: 'none', background: 'transparent',
            fontSize: '0.88rem', color: 'var(--on-surface)', padding: '2px 0',
          }}
        />
      </div>
      <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: '4px 0 0' }}>
        Press Enter, comma, or Space after each email address
      </p>
    </div>
  );
}

function EmailComposeModal({ target, onClose }: { target: ComposeModal; onClose: () => void }) {
  const [mode, setMode] = useState<'reply' | 'broadcast'>(target.initialMode);
  const isReply = mode === 'reply';

  const [subject, setSubject] = useState(
    target.reply ? `Re: ${target.reply.originalSubject || 'Your support request'}` : ''
  );
  const [message, setMessage] = useState('');
  const [additionalTo, setAdditionalTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(target.users.map(u => u.id)));
  const [userSearch, setUserSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Reset subject when toggling mode
  useEffect(() => {
    if (isReply && target.reply) {
      setSubject(`Re: ${target.reply.originalSubject || 'Your support request'}`);
    } else {
      setSubject('');
    }
    setError('');
  }, [mode]);

  const filteredUsers = useMemo(() =>
    target.users.filter(u =>
      !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    ), [target.users, userSearch]);

  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedIds.has(u.id));

  const toggleUser = (id: string) => setSelectedIds(prev => {
    const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next;
  });

  const toggleAllFiltered = () => setSelectedIds(prev => {
    const next = new Set(prev);
    if (allFilteredSelected) filteredUsers.forEach(u => next.delete(u.id));
    else filteredUsers.forEach(u => next.add(u.id));
    return next;
  });

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) { setError('Subject and message are required.'); return; }
    if (isReply && !target.reply) { setError('No ticket selected for reply.'); return; }
    if (!isReply && selectedIds.size === 0) { setError('Select at least one recipient.'); return; }
    setSending(true); setError('');
    try {
      if (isReply && target.reply) {
        await adminApi.replyToTicket(target.reply.ticketId, {
          subject, message,
          additionalTo: additionalTo.length > 0 ? additionalTo : undefined,
          cc: cc.length > 0 ? cc : undefined,
        });
        setSentCount(1 + additionalTo.length);
      } else {
        const targetEmails = target.users.filter(u => selectedIds.has(u.id)).map(u => u.email);
        const res = await adminApi.broadcastEmail({ subject, message, targetEmails });
        setSentCount(res.sent);
      }
      setSent(true);
      setTimeout(onClose, 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email.');
    } finally { setSending(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.875rem', borderRadius: '0.75rem',
    border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
    color: 'var(--on-surface)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6,
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, backdropFilter: 'blur(3px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 2001, width: '100%', maxWidth: 640,
        background: 'var(--surface)', borderRadius: '1.75rem',
        boxShadow: '0 32px 80px rgba(0,0,0,0.28)', padding: 0,
        animation: 'fadeIn 0.15s ease', maxHeight: '92vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* ── Modal header ── */}
        <div style={{ padding: '1.5rem 1.75rem 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#6245a4,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #6245a440' }}>
                <Mail size={18} color="#fff" />
              </div>
              <p style={{ fontWeight: 800, fontSize: '1.05rem', margin: 0, color: 'var(--on-surface)' }}>Compose Email</p>
            </div>
            <button onClick={onClose} style={{ background: 'var(--surface-container)', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 6, borderRadius: '50%', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>

          {/* ── Mode toggle ── */}
          <div style={{ display: 'flex', background: 'var(--surface-container)', borderRadius: '0.75rem', padding: 4, gap: 4, marginBottom: '1.25rem' }}>
            {(['reply', 'broadcast'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={m === 'reply' && !target.reply}
                style={{
                  flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none',
                  fontSize: '0.82rem', fontWeight: 700, cursor: m === 'reply' && !target.reply ? 'not-allowed' : 'pointer',
                  background: mode === m ? 'var(--surface)' : 'transparent',
                  color: mode === m ? '#6245a4' : 'var(--on-surface-variant)',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s',
                  opacity: m === 'reply' && !target.reply ? 0.4 : 1,
                }}
              >
                {m === 'reply'
                  ? target.reply ? `Reply to ${target.reply.recipientName.split(' ')[0]}` : 'Reply (no ticket)'
                  : `Broadcast · ${selectedIds.size} users`}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: 'auto', padding: '0 1.75rem 1.75rem', flex: 1 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <CheckCircle2 size={56} color="#22c55e" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 6px' }}>Sent!</p>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.88rem', margin: 0 }}>
                Delivered to {sentCount} {sentCount === 1 ? 'recipient' : 'recipients'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* ── Reply context chip ── */}
              {isReply && target.reply && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0.875rem', background: '#6245a408', borderRadius: '0.75rem', border: '1px solid #6245a420' }}>
                  <MessageSquare size={14} color="#6245a4" />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#6245a4' }}>{target.reply.recipientName}</p>
                    <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{target.reply.recipientEmail}</p>
                  </div>
                </div>
              )}

              {/* ── Reply: To + CC ── */}
              {isReply && (
                <>
                  <EmailTagInput label="Add recipients (To)" tags={additionalTo} onChange={setAdditionalTo} placeholder="Add email addresses..." />
                  <EmailTagInput label="CC" tags={cc} onChange={setCc} placeholder="Add CC addresses..." />
                </>
              )}

              {/* ── Broadcast: user picker ── */}
              {!isReply && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={lbl}>Recipients</label>
                    <button onClick={toggleAllFiltered} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6245a4', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {allFilteredSelected ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." style={{ ...inp, marginBottom: 8 }} />
                  <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--outline-variant)', borderRadius: '0.75rem', background: 'var(--surface-container)' }}>
                    {filteredUsers.length === 0
                      ? <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.82rem', margin: 0 }}>No users found</p>
                      : filteredUsers.map((u, i) => (
                        <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.5rem 0.875rem', cursor: 'pointer', borderBottom: i < filteredUsers.length - 1 ? '1px solid var(--outline-variant)' : 'none', background: selectedIds.has(u.id) ? '#6245a408' : 'transparent' }}>
                          <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleUser(u.id)} style={{ accentColor: '#6245a4', width: 15, height: 15, flexShrink: 0 }} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.83rem', fontWeight: 600, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                            <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                          </div>
                          <span style={{ flexShrink: 0, fontSize: '0.68rem', fontWeight: 700, padding: '1px 7px', borderRadius: '999px', background: u.plan === 'premium' ? '#7c3aed18' : '#6b728018', color: u.plan === 'premium' ? '#7c3aed' : '#6b7280' }}>{u.plan}</span>
                        </label>
                      ))}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', margin: '4px 0 0' }}>{selectedIds.size} of {target.users.length} recipients selected</p>
                </div>
              )}

              {/* Subject */}
              <div>
                <label style={lbl}>Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..." style={inp} />
              </div>

              {/* Message */}
              <div>
                <label style={lbl}>Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message here..." rows={7}
                  style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }} />
                <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', margin: '4px 0 0' }}>Sent as branded PathWise HTML email · logo, signature &amp; footer included</p>
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button onClick={onClose} style={{ padding: '0.65rem 1.25rem', borderRadius: '999px', fontSize: '0.83rem', fontWeight: 600, background: 'none', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)', cursor: 'pointer' }}>Cancel</button>
                <button
                  onClick={handleSend}
                  disabled={sending || !subject.trim() || !message.trim() || (!isReply && selectedIds.size === 0)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.5rem', borderRadius: '999px',
                    fontSize: '0.83rem', fontWeight: 700, background: 'linear-gradient(135deg,#6245a4,#8b5cf6)', color: '#fff', border: 'none',
                    cursor: sending ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #6245a440',
                    opacity: sending || !subject.trim() || !message.trim() || (!isReply && selectedIds.size === 0) ? 0.55 : 1,
                  }}
                >
                  <Send size={14} />
                  {sending ? 'Sending...' : `Send${isReply ? '' : ` to ${selectedIds.size}`}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────── Tickets Panel ─────────── */

interface TicketsPanelProps {
  tickets: any[];
  loading: boolean;
  expandedTicket: string | null;
  setExpandedTicket: (id: string | null) => void;
  statusColors: Record<string, { bg: string; color: string }>;
  formatDate: (d: string) => string;
  onStatusChange: (ticketId: string, status: string) => void;
  onDelete: (ticketId: string) => void;
  onReply: (ticket: any) => void;
  onBroadcast: () => void;
}

function TicketsPanel({
  tickets, loading, expandedTicket, setExpandedTicket,
  statusColors, formatDate, onStatusChange, onDelete, onReply, onBroadcast,
}: TicketsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'closed'>('all');
  const [composeAny, setComposeAny] = useState(false);
  const [anyTo, setAnyTo] = useState('');
  const [anySubject, setAnySubject] = useState('');
  const [anyMsg, setAnyMsg] = useState('');
  const [anySending, setAnySending] = useState(false);
  const [anyErr, setAnyErr] = useState('');
  const [anySuccess, setAnySuccess] = useState(false);

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter);
  const selected = expandedTicket ? tickets.find(t => t.id === expandedTicket) : null;

  const statusMeta: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    open:        { label: 'Open',        bg: '#fef2f2', color: '#dc2626', dot: '#dc2626' },
    in_progress: { label: 'In Progress', bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
    closed:      { label: 'Closed',      bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  };

  const counts = { all: tickets.length, open: 0, in_progress: 0, closed: 0 };
  tickets.forEach(t => { if (t.status in counts) (counts as any)[t.status]++; });

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = ['#6245a4', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid var(--outline-variant)', background: 'var(--surface)',
    color: 'var(--on-surface)', fontSize: '0.875rem', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.15s',
  };

  const handleSendAny = async () => {
    const emails = anyTo.split(',').map(e => e.trim()).filter(Boolean);
    if (!emails.length || !anySubject.trim() || !anyMsg.trim()) return;
    setAnySending(true); setAnyErr(''); setAnySuccess(false);
    try {
      const { admin: adminApi2 } = await import('../../lib/api');
      await adminApi2.broadcastEmail({ subject: anySubject.trim(), message: anyMsg.trim(), targetEmails: emails });
      setAnySuccess(true);
      setTimeout(() => { setComposeAny(false); setAnyTo(''); setAnySubject(''); setAnyMsg(''); setAnySuccess(false); }, 1800);
    } catch (e) {
      setAnyErr(e instanceof Error ? e.message : 'Failed to send.');
    } finally { setAnySending(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'flex-start', minHeight: 520 }}>

      {/* ── Left column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button onClick={() => { setComposeAny(true); setExpandedTicket(null); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', borderRadius: 10, border: '1.5px solid var(--outline-variant)', background: 'var(--surface-container)', color: 'var(--on-surface)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
            <Mail size={14} /> Email Anyone
          </button>
          <button onClick={onBroadcast}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6245a4,#8b5cf6)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px #6245a430' }}>
            <Send size={14} /> Broadcast
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--surface-container)', border: '1.5px solid var(--outline-variant)', borderRadius: 10, padding: 4 }}>
          {(['all', 'open', 'in_progress', 'closed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1, padding: '6px 4px', borderRadius: 7, border: 'none', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              background: filter === f ? '#fff' : 'transparent',
              color: filter === f ? '#6245a4' : 'var(--on-surface-variant)',
              boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}>
              {f === 'all' ? `All ${counts.all}` : f === 'in_progress' ? `Progress ${counts.in_progress}` : `${f.charAt(0).toUpperCase() + f.slice(1)} ${(counts as any)[f]}`}
            </button>
          ))}
        </div>

        {/* Ticket list */}
        <div style={{ background: 'var(--surface-container)', border: '1.5px solid var(--outline-variant)', borderRadius: 14, overflow: 'hidden', maxHeight: 540, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--outline-variant)', borderTopColor: '#6245a4', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', margin: 0 }}>Loading tickets…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <MessageSquare size={32} style={{ color: 'var(--on-surface-variant)', opacity: 0.25, marginBottom: 10 }} />
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', margin: 0 }}>No tickets found</p>
            </div>
          ) : (
            filtered.map((t, i) => {
              const sm = statusMeta[t.status] ?? { label: t.status, bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };
              const isActive = expandedTicket === t.id;
              return (
                <div key={t.id} onClick={() => setExpandedTicket(isActive ? null : t.id)}
                  style={{
                    padding: '14px 16px', cursor: 'pointer',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--outline-variant)' : 'none',
                    background: isActive ? 'linear-gradient(90deg,#6245a408,#8b5cf605)' : 'transparent',
                    borderLeft: isActive ? '3px solid #6245a4' : '3px solid transparent',
                    transition: 'all 0.15s',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}
                >
                  {/* Avatar */}
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: getAvatarColor(t.name ?? ''), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.72rem', fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                    {getInitials(t.name ?? '?')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.855rem', color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{t.name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.66rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: sm.bg, color: sm.color, flexShrink: 0 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.dot, display: 'inline-block' }} />
                        {sm.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{t.subject || '(No subject)'}</div>
                    <div style={{ fontSize: '0.71rem', color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.message?.slice(0, 55)}{(t.message?.length ?? 0) > 55 ? '…' : ''}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 4, opacity: 0.6 }}>{t.createdAt ? formatDate(t.createdAt) : ''}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right column ── */}
      <div style={{ minWidth: 0 }}>
        {composeAny ? (
          /* Email Anyone compose */
          <div style={{ background: 'var(--surface-container)', border: '1.5px solid var(--outline-variant)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6245a4,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--on-surface)' }}>New Email</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>Send to any email address</div>
                </div>
              </div>
              <button onClick={() => setComposeAny(false)} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--on-surface-variant)' }}><X size={15} /></button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</label>
                <input value={anyTo} onChange={e => setAnyTo(e.target.value)} placeholder="email@example.com, another@example.com" style={inp} />
                <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>Separate multiple addresses with commas</div>
              </div>
              <div>
                <label style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</label>
                <input value={anySubject} onChange={e => setAnySubject(e.target.value)} placeholder="What's this email about?" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</label>
                <textarea value={anyMsg} onChange={e => setAnyMsg(e.target.value)} placeholder="Write your message here…" rows={8}
                  style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.75 }} />
                <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>Sent as branded PathWise email with logo & signature</div>
              </div>
              {anyErr && <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.82rem' }}>{anyErr}</div>}
              {anySuccess && <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.82rem', fontWeight: 600 }}>Email sent successfully!</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button onClick={() => setComposeAny(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid var(--outline-variant)', background: 'none', color: 'var(--on-surface)', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}>Discard</button>
                <button onClick={handleSendAny} disabled={anySending || !anyTo.trim() || !anySubject.trim() || !anyMsg.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6245a4,#8b5cf6)', color: '#fff', fontSize: '0.84rem', fontWeight: 700, cursor: anySending ? 'not-allowed' : 'pointer', boxShadow: '0 2px 12px #6245a430', opacity: anySending || !anyTo.trim() || !anySubject.trim() || !anyMsg.trim() ? 0.5 : 1, transition: 'opacity 0.15s' }}>
                  <Send size={14} />{anySending ? 'Sending…' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>

        ) : selected ? (
          /* Ticket detail */
          <div style={{ background: 'var(--surface-container)', border: '1.5px solid var(--outline-variant)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Detail header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: getAvatarColor(selected.name ?? ''), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.85rem', fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}>
                  {getInitials(selected.name ?? '?')}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--on-surface)' }}>{selected.subject || '(No subject)'}</span>
                    {(() => { const sm = statusMeta[selected.status] ?? { label: selected.status, bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' }; return (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: sm.bg, color: sm.color }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.dot }} />{sm.label}
                      </span>
                    ); })()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                    <strong style={{ color: 'var(--on-surface)' }}>{selected.name}</strong>
                    {' · '}
                    <a href={`mailto:${selected.email}`} style={{ color: '#6245a4', textDecoration: 'none' }}>{selected.email}</a>
                    {selected.createdAt ? ` · ${formatDate(selected.createdAt)}` : ''}
                  </div>
                </div>
              </div>
              <button onClick={() => setExpandedTicket(null)} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--on-surface-variant)', flexShrink: 0 }}><X size={15} /></button>
            </div>

            {/* Message body */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--outline-variant)' }}>
              <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--outline-variant)', padding: '20px 24px', fontSize: '0.9rem', color: 'var(--on-surface)', lineHeight: 1.8, whiteSpace: 'pre-wrap', minHeight: 80 }}>
                {selected.message}
              </div>
            </div>

            {/* Actions bar */}
            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => onReply(selected)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6245a4,#8b5cf6)', color: '#fff', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 10px #6245a428' }}>
                <Mail size={14} /> Reply
              </button>

              {/* Status pills */}
              <div style={{ display: 'flex', gap: 6 }}>
                {(['open', 'in_progress', 'closed'] as const).map(s => {
                  const sm = statusMeta[s];
                  const isActive = selected.status === s;
                  return (
                    <button key={s} onClick={() => onStatusChange(selected.id, s)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: isActive ? 'none' : '1.5px solid var(--outline-variant)', background: isActive ? sm.bg : 'transparent', color: isActive ? sm.color : 'var(--on-surface-variant)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                      {sm.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginLeft: 'auto' }}>
                <button onClick={() => onDelete(selected.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: '1.5px solid #fecaca', background: 'transparent', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>

        ) : (
          /* Empty state */
          <div style={{ background: 'var(--surface-container)', border: '1.5px solid var(--outline-variant)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 420, padding: 48, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#6245a415,#8b5cf610)', border: '1.5px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <MessageSquare size={28} color="#6245a4" style={{ opacity: 0.5 }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--on-surface)', marginBottom: 6 }}>No ticket selected</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, maxWidth: 260, marginBottom: 24 }}>
              Pick a ticket from the list to read it and reply, or compose a fresh email to anyone.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setComposeAny(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: '1.5px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                <Mail size={14} /> Email Anyone
              </button>
              <button onClick={onBroadcast} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6245a4,#8b5cf6)', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                <Send size={14} /> Broadcast to All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────── Main Admin Page ─────────── */

export default function AdminPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStat[]>([]);
  const [assessmentUserIds, setAssessmentUserIds] = useState<string[]>([]);
  const [roadmapStatuses, setRoadmapStatuses] = useState<{ userId: string; hasRoadmap: boolean; milestonesTotal: number; milestonesCompleted: number }[]>([]);
  const [certificateUserIds, setCertificateUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPlanOpen, setBulkPlanOpen] = useState(false);

  // Analytics
  const [analytics, setAnalytics] = useState<{ totalAssessments: number; topCareers: { title: string; count: number }[] } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Tickets
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [composeModal, setComposeModal] = useState<ComposeModal | null>(null);

  useEffect(() => {
    if (!ADMIN_EMAILS.includes(user?.email ?? '')) return;
    loadData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'analytics' && !analytics) {
      loadAnalytics();
    }
    if (activeTab === 'tickets') {
      loadTickets();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, tasksRes, assessRes, roadmapRes, certRes] = await Promise.allSettled([
        adminApi.getUsers(),
        adminApi.getTaskStats(),
        adminApi.getAssessmentStats(),
        adminApi.getRoadmapUserStatus(),
        adminApi.getCertificateStatus(),
      ]);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value?.users ?? []);
      else throw new Error(usersRes.reason?.message || 'Failed to load users');
      if (tasksRes.status === 'fulfilled') setTaskStats(tasksRes.value?.stats ?? []);
      if (assessRes.status === 'fulfilled') setAssessmentUserIds(assessRes.value?.userIdsWithAssessment ?? []);
      if (roadmapRes.status === 'fulfilled') setRoadmapStatuses(roadmapRes.value?.statuses ?? []);
      if (certRes.status === 'fulfilled') setCertificateUserIds(certRes.value?.userIds ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await adminApi.getAnalytics();
      setAnalytics(res);
    } catch {
      setAnalytics({ totalAssessments: 0, topCareers: [] });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await adminApi.getTickets();
      setTicketsList(res?.tickets ?? []);
    } catch {}
    finally { setTicketsLoading(false); }
  };

  const handleTicketStatusChange = async (ticketId: string, status: string) => {
    try {
      await adminApi.updateTicket(ticketId, status);
      setTicketsList(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update ticket status.');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await adminApi.deleteTicket(ticketId);
      setTicketsList(prev => prev.filter(t => t.id !== ticketId));
      if (expandedTicket === ticketId) setExpandedTicket(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete ticket.');
    }
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    open: { bg: '#fee2e2', color: '#dc2626' },
    in_progress: { bg: '#fef3c7', color: '#d97706' },
    closed: { bg: '#dcfce7', color: '#16a34a' },
  };

  const taskStatsMap = useMemo(() => {
    const map: Record<string, TaskStat> = {};
    (taskStats ?? []).forEach(s => { if (s?.userId) map[s.userId] = s; });
    return map;
  }, [taskStats]);

  const assessmentSet = useMemo(() => new Set(assessmentUserIds ?? []), [assessmentUserIds]);

  const roadmapStatusMap = useMemo(() => {
    const map: Record<string, { hasRoadmap: boolean; milestonesTotal: number; milestonesCompleted: number }> = {};
    (roadmapStatuses ?? []).forEach(s => { if (s?.userId) map[s.userId] = s; });
    return map;
  }, [roadmapStatuses]);

  const certificateSet = useMemo(() => new Set(certificateUserIds ?? []), [certificateUserIds]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredUsers = useMemo(() => {
    let list = users ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'email': cmp = a.email.localeCompare(b.email); break;
        case 'plan': cmp = a.plan.localeCompare(b.plan); break;
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
        case 'assessment': cmp = (assessmentSet.has(a.id) ? 1 : 0) - (assessmentSet.has(b.id) ? 1 : 0); break;
        case 'tasks': {
          const ta = taskStatsMap[a.id]?.completedTaskCount ?? 0;
          const tb = taskStatsMap[b.id]?.completedTaskCount ?? 0;
          cmp = ta - tb;
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [users, search, sortKey, sortDir, assessmentSet, taskStatsMap]);

  const handleDelete = async (u: AdminUser) => {
    if (ADMIN_EMAILS.includes(u.email)) return;
    if (!window.confirm(`Delete user ${u.name} (${u.email})? This removes all their data permanently.`)) return;
    try {
      await adminApi.deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(u.id); return n; });
      if (selectedUser?.id === u.id) setSelectedUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds].filter(id => {
      const u = users.find(x => x.id === id);
      return u && !ADMIN_EMAILS.includes(u.email);
    });
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} user${ids.length > 1 ? 's' : ''}? This is permanent.`)) return;
    try {
      await Promise.all(ids.map(id => adminApi.deleteUser(id)));
      setUsers(prev => prev.filter(x => !ids.includes(x.id)));
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk delete failed.');
      loadData();
    }
  };

  const handleBulkPlanChange = async (plan: string) => {
    const ids = [...selectedIds].filter(id => {
      const u = users.find(x => x.id === id);
      return u && !ADMIN_EMAILS.includes(u.email);
    });
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map(id => adminApi.updatePlan(id, plan)));
      setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, plan } : u));
      setSelectedIds(new Set());
      setBulkPlanOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk plan change failed.');
    }
  };

  const handlePlanChange = async (userId: string, plan: string) => {
    try {
      await adminApi.updatePlan(userId, plan);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u));
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, plan } : null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Plan change failed.');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Plan', 'Joined', 'Has Assessment', 'Tasks Done', 'Tasks Total', 'Roadmap', 'Milestones Completed', 'Milestones Total', 'Certificate', 'Last Active'];
    const rows = filteredUsers.map(u => {
      const rs = roadmapStatusMap[u.id];
      return [
        u.name, u.email, u.plan, u.createdAt,
        assessmentSet.has(u.id) ? 'Yes' : 'No',
        taskStatsMap[u.id]?.completedTaskCount ?? 0,
        taskStatsMap[u.id]?.taskCount ?? 0,
        rs ? 'Active' : 'None',
        rs?.milestonesCompleted ?? 0,
        rs?.milestonesTotal ?? 0,
        certificateSet.has(u.id) ? 'Yes' : 'No',
        u.lastLoginAt ?? 'Never',
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pathwise-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Stats
  const totalUsers = users?.length ?? 0;
  const withAssessment = assessmentUserIds?.length ?? 0;
  const totalTasks = (taskStats ?? []).reduce((s, t) => s + (t?.taskCount ?? 0), 0);
  const completedTasks = (taskStats ?? []).reduce((s, t) => s + (t?.completedTaskCount ?? 0), 0);

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  // Access guard
  if (!ADMIN_EMAILS.includes(user?.email ?? '')) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Shield size={48} color="var(--on-surface-muted)" />
          <h2 style={{ marginTop: '1rem', fontFamily: 'var(--font-display)' }}>Access Denied</h2>
          <p style={{ color: 'var(--on-surface-variant)' }}>Admin access required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(98,69,164,0.2)', borderTopColor: '#6245a4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle size={48} color="#ef4444" />
          <h2 style={{ marginTop: '1rem', fontFamily: 'var(--font-display)' }}>Error</h2>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{error}</p>
          <button className="btn-page-action" onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  const sortArrow = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : '';

  const thStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--on-surface-variant)',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '1px solid var(--outline-variant)',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    color: 'var(--on-surface)',
    borderBottom: '1px solid var(--outline-variant)',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1.25rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    background: active ? 'var(--copper)' : 'var(--surface-container)',
    color: active ? '#fff' : 'var(--on-surface-variant)',
    transition: 'all 0.15s',
  });

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={28} color="var(--primary)" />
          <h1 className="page-title">Admin Dashboard</h1>
        </div>
        {activeTab === 'users' && (
          <button
            onClick={exportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem',
              borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
              background: 'var(--surface-container)', border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface)', cursor: 'pointer',
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>
          <Users size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />Users
        </button>
        <button style={tabStyle(activeTab === 'analytics')} onClick={() => setActiveTab('analytics')}>
          <BarChart3 size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />Analytics
        </button>
        <button style={tabStyle(activeTab === 'system')} onClick={() => setActiveTab('system')}>
          <Monitor size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />System
        </button>
        <button style={tabStyle(activeTab === 'tickets')} onClick={() => setActiveTab('tickets')}>
          <MessageSquare size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />Tickets{ticketsList.length > 0 ? ` (${ticketsList.length})` : ''}
        </button>
      </div>

      {/* ─── Users Tab ─── */}
      {activeTab === 'users' && (
        <>
          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Users', value: totalUsers, icon: Users, color: 'var(--primary)' },
              { label: 'With Assessment', value: withAssessment, icon: CheckCircle2, color: '#22c55e' },
              { label: 'Total Tasks', value: totalTasks, icon: BarChart3, color: '#3b82f6' },
              { label: 'Completed Tasks', value: completedTasks, icon: CheckCircle2, color: '#8b5cf6' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="panel" style={{ borderRadius: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={color} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>{label}</span>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Search + bulk toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', maxWidth: 400, flex: 1 }}>
              <Search size={16} color="var(--on-surface-variant)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.5rem',
                  borderRadius: '999px',
                  border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container)',
                  color: 'var(--on-surface)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Bulk actions toolbar */}
            {selectedIds.size > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '0.4rem 1rem',
                background: 'var(--surface-container)', borderRadius: '999px',
                border: '1px solid var(--outline-variant)',
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px',
                    borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                    background: 'none', border: '1px solid #ef444444', color: '#ef4444', cursor: 'pointer',
                  }}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setBulkPlanOpen(!bulkPlanOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px',
                      borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                      background: 'none', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)', cursor: 'pointer',
                    }}
                  >
                    Change Plan
                    <ChevronDown size={12} />
                  </button>
                  {bulkPlanOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
                      background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--outline-variant)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: 120,
                    }}>
                      <button onClick={() => handleBulkPlanChange('free')} style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', border: 'none', background: 'none', textAlign: 'left', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--on-surface)' }}>Free</button>
                      <button onClick={() => handleBulkPlanChange('premium')} style={{ display: 'block', width: '100%', padding: '0.5rem 1rem', border: 'none', background: 'none', textAlign: 'left', fontSize: '0.8rem', cursor: 'pointer', color: '#b8860b' }}>Premium</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Users table */}
          <div className="panel" style={{ borderRadius: '2rem', padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, cursor: 'default', width: 40 }}>
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                  </th>
                  <th style={thStyle} onClick={() => handleSort('name')}>Name{sortArrow('name')}</th>
                  <th style={thStyle} onClick={() => handleSort('email')}>Email{sortArrow('email')}</th>
                  <th style={thStyle} onClick={() => handleSort('plan')}>Plan{sortArrow('plan')}</th>
                  <th style={thStyle} onClick={() => handleSort('createdAt')}>Joined{sortArrow('createdAt')}</th>
                  <th style={thStyle} onClick={() => handleSort('assessment')}>Assessment{sortArrow('assessment')}</th>
                  <th style={thStyle} onClick={() => handleSort('tasks')}>Tasks{sortArrow('tasks')}</th>
                  <th style={{ ...thStyle, cursor: 'default' }}>Roadmap</th>
                  <th style={{ ...thStyle, cursor: 'default' }}>Milestones</th>
                  <th style={{ ...thStyle, cursor: 'default' }}>Certificate</th>
                  <th style={{ ...thStyle, cursor: 'default' }}>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => {
                  const isAdmin = ADMIN_EMAILS.includes(u.email);
                  const ts = taskStatsMap[u.id];
                  const hasAssessment = assessmentSet.has(u.id);
                  const rs = roadmapStatusMap[u.id];
                  const hasCert = certificateSet.has(u.id);
                  const isSelected = selectedIds.has(u.id);
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      style={{
                        background: isSelected
                          ? 'rgba(98,69,164,0.08)'
                          : isAdmin
                            ? 'rgba(98,69,164,0.06)'
                            : idx % 2 === 0
                              ? 'transparent'
                              : 'var(--surface-container)',
                        transition: 'background 0.15s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { if (!isAdmin && !isSelected) (e.currentTarget.style.background = 'var(--surface-container-high)'); }}
                      onMouseLeave={e => {
                        if (!isAdmin && !isSelected) (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'var(--surface-container)');
                        if (isSelected) (e.currentTarget.style.background = 'rgba(98,69,164,0.08)');
                      }}
                    >
                      <td style={{ ...tdStyle, width: 40 }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(u.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                        {isAdmin && <span style={{ marginLeft: 8, fontSize: '0.65rem', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>Admin</span>}
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--on-surface-variant)' }}>{u.email}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: u.plan === 'premium' ? '#fbbf2418' : 'var(--surface-container)',
                          color: u.plan === 'premium' ? '#b8860b' : 'var(--on-surface-variant)',
                          border: u.plan === 'premium' ? '1px solid #fbbf2444' : '1px solid var(--outline-variant)',
                        }}>
                          {u.plan === 'premium' ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>{formatDate(u.createdAt)}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: '999px',
                          fontSize: '0.72rem', fontWeight: 700,
                          background: hasAssessment ? '#22c55e18' : 'var(--surface-container)',
                          color: hasAssessment ? '#16a34a' : 'var(--on-surface-variant)',
                          border: hasAssessment ? '1px solid #22c55e44' : '1px solid var(--outline-variant)',
                        }}>
                          {hasAssessment ? 'Done' : 'Not yet'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: '0.8rem', color: 'var(--primary)' }}>
                        {ts ? `${ts.completedTaskCount}/${ts.taskCount} done` : '0/0 done'}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: '999px',
                          fontSize: '0.72rem', fontWeight: 700,
                          background: rs ? '#22c55e18' : 'var(--surface-container)',
                          color: rs ? '#16a34a' : 'var(--on-surface-variant)',
                          border: rs ? '1px solid #22c55e44' : '1px solid var(--outline-variant)',
                        }}>
                          {rs ? 'Active' : 'None'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: '0.8rem', color: 'var(--primary)' }}>
                        {rs ? `${rs.milestonesCompleted}/${rs.milestonesTotal}` : <span style={{ color: 'var(--on-surface-variant)' }}>&mdash;</span>}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: '999px',
                          fontSize: '0.72rem', fontWeight: 700,
                          background: hasCert ? '#22c55e18' : 'var(--surface-container)',
                          color: hasCert ? '#16a34a' : 'var(--on-surface-variant)',
                          border: hasCert ? '1px solid #22c55e44' : '1px solid var(--outline-variant)',
                        }}>
                          {hasCert ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                        {u.lastLoginAt
                          ? (() => {
                              const d = new Date(u.lastLoginAt);
                              const now = new Date();
                              const diffMs = now.getTime() - d.getTime();
                              const diffDays = Math.floor(diffMs / 86400000);
                              const diffHours = Math.floor(diffMs / 3600000);
                              const diffMins = Math.floor(diffMs / 60000);
                              if (diffMins < 5) return 'Just now';
                              if (diffHours < 1) return `${diffMins}m ago`;
                              if (diffHours < 24) return `${diffHours}h ago`;
                              if (diffDays === 1) return 'Yesterday';
                              if (diffDays < 7) return `${diffDays}d ago`;
                              return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            })()
                          : <span style={{ color: 'var(--on-surface-muted)' }}>Never</span>
                        }
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ ...tdStyle, textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                      {search ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── Analytics Tab ─── */}
      {activeTab === 'analytics' && (
        <div>
          {analyticsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div style={{ width: 32, height: 32, border: '3px solid rgba(98,69,164,0.2)', borderTopColor: '#6245a4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <>
              {/* Total assessments card */}
              <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', marginBottom: '1.5rem', maxWidth: 300 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#22c55e18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} color="#22c55e" />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>Total Assessments</span>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
                  {analytics?.totalAssessments ?? withAssessment}
                </p>
              </div>

              {/* Top careers bar chart */}
              <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--on-surface)' }}>
                  Top 10 Career Matches
                </h3>
                {(!analytics?.topCareers || analytics.topCareers.length === 0) ? (
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>No career data available yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {analytics.topCareers.slice(0, 10).map((career, i) => {
                      const max = analytics.topCareers[0].count;
                      const pct = max > 0 ? (career.count / max) * 100 : 0;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface)', minWidth: 200, flexShrink: 0 }}>
                            {career.title}
                          </span>
                          <div style={{ flex: 1, height: 24, background: 'var(--surface-container)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`, height: '100%', borderRadius: '999px',
                              background: 'linear-gradient(90deg, var(--primary), #8b5cf6)',
                              transition: 'width 0.5s ease',
                              minWidth: pct > 0 ? 24 : 0,
                            }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--on-surface-variant)', minWidth: 32, textAlign: 'right' }}>
                            {career.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── System Tab ─── */}
      {activeTab === 'system' && (
        <div>
          {/* System stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Users', value: totalUsers },
              { label: 'Total Assessments', value: withAssessment },
              { label: 'Total Tasks', value: totalTasks },
              { label: 'Completed Tasks', value: completedTasks },
            ].map(({ label, value }) => (
              <div key={label} className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--on-surface)', letterSpacing: '-0.02em', margin: '0 0 0.25rem' }}>{value}</p>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Platform info */}
          <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem', color: 'var(--on-surface)' }}>
              Platform
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Backend', value: 'Encore.dev', color: '#3b82f6' },
                { label: 'Frontend', value: 'Vercel', color: '#000' },
                { label: 'Database', value: 'PostgreSQL', color: '#336791' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  background: 'var(--surface-container)', borderRadius: '1rem', padding: '1rem',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>{label}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '1rem', color: 'var(--on-surface)' }}>
              Quick Links
            </h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'Encore Dashboard', url: 'https://app.encore.dev' },
                { label: 'Vercel Dashboard', url: 'https://vercel.com/dashboard' },
                { label: 'GitHub Repo', url: 'https://github.com' },
              ].map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem',
                    borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                    background: 'var(--surface-container)', border: '1px solid var(--outline-variant)',
                    color: 'var(--primary)', textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={14} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tickets Tab ─── */}
      {activeTab === 'tickets' && (
        <TicketsPanel
          tickets={ticketsList}
          loading={ticketsLoading}
          expandedTicket={expandedTicket}
          setExpandedTicket={setExpandedTicket}
          statusColors={statusColors}
          formatDate={formatDate}
          onStatusChange={handleTicketStatusChange}
          onDelete={handleDeleteTicket}
          onReply={(t: any) => setComposeModal({ initialMode: 'reply', reply: { ticketId: t.id, recipientName: t.name, recipientEmail: t.email, originalSubject: t.subject }, users })}
          onBroadcast={() => setComposeModal({ initialMode: 'broadcast', users })}
        />
      )}

      {/* Email Compose Modal */}
      {composeModal && (
        <EmailComposeModal target={composeModal} onClose={() => setComposeModal(null)} />
      )}

      {/* User Detail Panel */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          taskStat={taskStatsMap[selectedUser.id]}
          hasAssessment={assessmentSet.has(selectedUser.id)}
          onClose={() => setSelectedUser(null)}
          onPlanChange={handlePlanChange}
          onDelete={handleDelete}
        />
      )}

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
