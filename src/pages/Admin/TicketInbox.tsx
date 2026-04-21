import { useEffect, useMemo, useRef, useState } from 'react';
import { admin as adminApi, type AdminTicket } from '../../lib/api';
import { Send, Trash2, Search, Inbox, Eye, EyeOff } from 'lucide-react';

type ThreadReply = {
  id: string;
  direction: 'admin' | 'user';
  authorEmail: string;
  authorName: string | null;
  body: string;
  createdAt: string;
};

type StatusKey = 'open' | 'in_progress' | 'closed';
const STATUS_COLORS: Record<StatusKey, { bg: string; color: string; label: string }> = {
  open:        { bg: '#dcfce7', color: '#166534', label: 'Open' },
  in_progress: { bg: '#fef3c7', color: '#92400e', label: 'In Progress' },
  closed:      { bg: '#e5e7eb', color: '#374151', label: 'Closed' },
};

function formatWhen(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHr = diffMs / 3_600_000;
  if (diffHr < 1) return `${Math.max(1, Math.floor(diffMs / 60_000))}m ago`;
  if (diffHr < 24) return `${Math.floor(diffHr)}h ago`;
  if (diffHr < 24 * 7) return `${Math.floor(diffHr / 24)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

type Filter = 'all' | 'unread' | 'open' | 'closed';

export function TicketInbox() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadReply[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewSubject, setPreviewSubject] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => tickets.find(t => t.id === selectedId) ?? null,
    [tickets, selectedId],
  );

  const visibleTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter(t => {
      if (filter === 'unread' && !t.unread) return false;
      if (filter === 'open' && t.status === 'closed') return false;
      if (filter === 'closed' && t.status !== 'closed') return false;
      if (q) {
        const hay = `${t.name} ${t.email} ${t.subject} ${t.message}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, filter, search]);

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getTickets();
      setTickets(res?.tickets ?? []);
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (id: string) => {
    setThreadLoading(true);
    try {
      const res = await adminApi.getTicketThread(id);
      setThread(res.replies ?? []);
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => { loadList(); }, []);

  useEffect(() => {
    if (!selectedId && visibleTickets.length > 0) {
      setSelectedId(visibleTickets[0].id);
    }
  }, [visibleTickets, selectedId]);

  useEffect(() => {
    if (!selectedId) { setThread([]); return; }
    loadThread(selectedId);
    const current = tickets.find(t => t.id === selectedId);
    if (current?.unread) {
      adminApi.markTicketRead(selectedId).catch(() => {});
      setTickets(prev => prev.map(t => t.id === selectedId ? { ...t, unread: false } : t));
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread, selectedId]);

  const handleSend = async () => {
    if (!selectedId || !selected || !draft.trim()) return;
    setSending(true);
    try {
      const subject = selected.subject
        ? `Re: ${selected.subject.replace(/^Re:\s*/i, '')}`
        : 'Re: Your PathWise support request';
      await adminApi.replyToTicket(selectedId, { subject, message: draft.trim() });
      setDraft('');
      await loadThread(selectedId);
      setTickets(prev => prev.map(t => t.id === selectedId
        ? {
            ...t,
            status: t.status === 'open' ? 'in_progress' : t.status,
            lastActivityAt: new Date().toISOString(),
            replyCount: t.replyCount + 1,
          }
        : t,
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (id: string, status: StatusKey) => {
    try {
      await adminApi.updateTicket(id, status);
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const handleTogglePreview = async () => {
    if (showPreview) { setShowPreview(false); return; }
    if (!selectedId || !selected || !draft.trim()) return;
    setPreviewLoading(true);
    try {
      const subject = selected.subject
        ? `Re: ${selected.subject.replace(/^Re:\s*/i, '')}`
        : 'Re: Your PathWise support request';
      const res = await adminApi.previewTicketReply(selectedId, { subject, message: draft.trim() });
      setPreviewHtml(res.html);
      setPreviewSubject(res.subject);
      setShowPreview(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Close preview when draft changes (prevents showing stale preview)
  useEffect(() => {
    if (showPreview) setShowPreview(false);
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this ticket permanently? This cannot be undone.')) return;
    try {
      await adminApi.deleteTicket(id);
      setTickets(prev => prev.filter(t => t.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete.');
    }
  };

  const unreadCount = tickets.filter(t => t.unread).length;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1rem',
      height: 'calc(100vh - 220px)', minHeight: 520,
    }}>
      {/* Left: ticket list */}
      <div className="panel" style={{
        borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--outline-variant)' }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={14} style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--on-surface-variant)',
            }} />
            <input
              placeholder="Search tickets"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px 7px 30px', borderRadius: 999,
                border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                color: 'var(--on-surface)', fontSize: '0.82rem', outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['all', 'unread', 'open', 'closed'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                  border: '1px solid var(--outline-variant)', cursor: 'pointer',
                  background: filter === f ? '#6245a4' : 'var(--surface-container)',
                  color: filter === f ? '#fff' : 'var(--on-surface-variant)',
                }}
              >
                {f === 'unread' && unreadCount > 0
                  ? `Unread (${unreadCount})`
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
              Loading…
            </div>
          ) : visibleTickets.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
              <img
                src="/panda/panda-sleepy.png"
                alt=""
                style={{ width: 96, height: 96, opacity: 0.85, marginBottom: 8, display: 'inline-block' }}
              />
              <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Inbox size={14} />
                <span>All quiet — no tickets match this filter.</span>
              </div>
            </div>
          ) : (
            visibleTickets.map(t => {
              const isActive = t.id === selectedId;
              const sc = STATUS_COLORS[t.status as StatusKey] ?? STATUS_COLORS.open;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  style={{
                    padding: '0.85rem 1rem', cursor: 'pointer',
                    borderLeft: isActive ? '3px solid #6245a4' : '3px solid transparent',
                    background: isActive ? 'var(--surface-container-high)' : 'transparent',
                    borderBottom: '1px solid var(--outline-variant)',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-container)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      {t.unread && (
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%', background: '#6245a4', flexShrink: 0,
                        }} />
                      )}
                      <span style={{
                        fontWeight: t.unread ? 700 : 600, fontSize: '0.88rem', color: 'var(--on-surface)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {t.name || t.email}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', flexShrink: 0, marginLeft: 6 }}>
                      {formatWhen(t.lastActivityAt)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.8rem', color: 'var(--on-surface-variant)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6,
                  }}>
                    {t.subject || '(no subject)'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      display: 'inline-block', padding: '1px 8px', borderRadius: 999,
                      fontSize: '0.65rem', fontWeight: 700, background: sc.bg, color: sc.color,
                    }}>
                      {sc.label}
                    </span>
                    {t.replyCount > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                        {t.replyCount} {t.replyCount === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: conversation */}
      <div className="panel" style={{
        borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {!selected ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--on-surface-variant)', gap: 12, padding: '2rem',
          }}>
            <img
              src="/panda/panda-waving.png"
              alt=""
              style={{ width: 160, height: 160, objectFit: 'contain' }}
            />
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--on-surface)' }}>
              Pick a ticket to start chatting
            </div>
            <div style={{ fontSize: '0.82rem', maxWidth: 320, textAlign: 'center' }}>
              Pandas are standing by. Every reply ships as a branded PathWise email —
              hit Preview to see it before sending.
            </div>
          </div>
        ) : (
          <>
            <div style={{
              padding: '1rem 1.25rem', borderBottom: '1px solid var(--outline-variant)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 10, flexWrap: 'wrap',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.95rem', fontWeight: 700, color: 'var(--on-surface)',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {selected.subject || '(no subject)'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                  {selected.name} &lt;{selected.email}&gt;
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  value={selected.status}
                  onChange={e => handleStatusChange(selected.id, e.target.value as StatusKey)}
                  style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                    border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                    color: 'var(--on-surface)', cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  onClick={() => handleDelete(selected.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'none', border: '1px solid #ef444444', color: '#ef4444',
                    cursor: 'pointer', padding: 0,
                  }}
                  title="Delete ticket (admins only)"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ maxWidth: '75%' }}>
                  <div style={{
                    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 4,
                  }}>
                    {selected.name || selected.email} — {formatWhen(selected.createdAt)}
                  </div>
                  <div style={{
                    padding: '0.75rem 1rem', borderRadius: 14,
                    background: 'var(--surface-container)', color: 'var(--on-surface)',
                    fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {selected.message}
                  </div>
                </div>
              </div>

              {threadLoading ? (
                <div style={{ padding: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
                  Loading thread…
                </div>
              ) : (
                thread.map(r => (
                  <div key={r.id} style={{
                    display: 'flex',
                    justifyContent: r.direction === 'admin' ? 'flex-end' : 'flex-start',
                    marginBottom: '1rem',
                  }}>
                    <div style={{ maxWidth: '75%' }}>
                      <div style={{
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 4,
                        textAlign: r.direction === 'admin' ? 'right' : 'left',
                      }}>
                        {r.direction === 'admin' ? 'You' : (r.authorName || r.authorEmail)}
                        {' '}— {formatWhen(r.createdAt)}
                      </div>
                      <div style={{
                        padding: '0.75rem 1rem', borderRadius: 14,
                        background: r.direction === 'admin' ? '#6245a4' : 'var(--surface-container)',
                        color: r.direction === 'admin' ? '#fff' : 'var(--on-surface)',
                        fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {r.body}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid var(--outline-variant)' }}>
              {showPreview && previewHtml && (
                <div style={{
                  marginBottom: 10, border: '1px solid var(--outline-variant)', borderRadius: 14,
                  overflow: 'hidden', background: '#f4f4f7',
                }}>
                  <div style={{
                    padding: '8px 12px', fontSize: '0.72rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--on-surface-variant)',
                    background: 'var(--surface-container)',
                    borderBottom: '1px solid var(--outline-variant)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span>Preview — as {selected.name || selected.email} will see it</span>
                    <span style={{
                      textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                      color: 'var(--on-surface-variant)',
                    }}>
                      Subject: {previewSubject}
                    </span>
                  </div>
                  <iframe
                    title="Email preview"
                    srcDoc={previewHtml}
                    sandbox=""
                    style={{
                      width: '100%', height: 320, border: 'none', display: 'block',
                      background: '#f4f4f7',
                    }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Write a reply… (⌘/Ctrl+Enter to send)"
                  rows={2}
                  style={{
                    flex: 1, padding: '0.6rem 0.9rem', borderRadius: 14,
                    border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                    color: 'var(--on-surface)', fontSize: '0.88rem', lineHeight: 1.5,
                    resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={handleTogglePreview}
                  disabled={previewLoading || !draft.trim()}
                  title={showPreview ? 'Hide preview' : 'Preview as email'}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '0.55rem 0.9rem', borderRadius: 999,
                    border: '1px solid var(--outline-variant)',
                    background: showPreview ? 'var(--surface-container-high)' : 'var(--surface-container)',
                    color: 'var(--on-surface)',
                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    opacity: previewLoading || !draft.trim() ? 0.5 : 1,
                  }}
                >
                  {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  {previewLoading ? '…' : (showPreview ? 'Hide' : 'Preview')}
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '0.55rem 1.1rem', borderRadius: 999, border: 'none',
                    background: '#6245a4', color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                    cursor: 'pointer', opacity: sending || !draft.trim() ? 0.5 : 1,
                  }}
                >
                  <Send size={14} /> {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
