import { useEffect, useMemo, useRef, useState } from 'react';
import { admin as adminApi, type AdminTicket, type Snippet, getMySignature, updateMySignature, getMyAccess } from '../../lib/api';
import { Send, Trash2, Search, Inbox, Eye, EyeOff, Pencil, Check, PenSquare, X, Bookmark, Plus, ChevronDown } from 'lucide-react';
import { EmailTagInput } from '../../components/EmailTagInput';

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

type Filter = 'all' | 'unread' | 'open' | 'in_progress' | 'closed';
const FILTER_LABEL: Record<Filter, string> = {
  all: 'All',
  unread: 'Unread',
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
};

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
  const [signature, setSignature] = useState<string>('');
  const [editingSignature, setEditingSignature] = useState(false);
  const [signatureDraft, setSignatureDraft] = useState<string>('');
  const [savingSignature, setSavingSignature] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState<string[]>([]);
  const [composeCc, setComposeCc] = useState<string[]>([]);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [composeSending, setComposeSending] = useState(false);
  const [composePreviewHtml, setComposePreviewHtml] = useState('');
  const [composePreviewOpen, setComposePreviewOpen] = useState(false);
  const [replyAdditionalTo, setReplyAdditionalTo] = useState<string[]>([]);
  const [replyCc, setReplyCc] = useState<string[]>([]);
  const [replyRecipientsOpen, setReplyRecipientsOpen] = useState(false);
  const [senders, setSenders] = useState<Array<{ key: string; address: string; label: string }>>([]);
  const [composeFrom, setComposeFrom] = useState<string>('support');
  const [replyFrom, setReplyFrom] = useState<string>('support');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [snippetsPickerOpen, setSnippetsPickerOpen] = useState<null | 'reply' | 'compose'>(null);
  const [snippetsManageOpen, setSnippetsManageOpen] = useState(false);
  const [snippetEditingId, setSnippetEditingId] = useState<string | null>(null);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetBody, setSnippetBody] = useState('');
  const [snippetSaving, setSnippetSaving] = useState(false);
  const [snippetsLoading, setSnippetsLoading] = useState(false);
  const [snippetFilter, setSnippetFilter] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const selected = useMemo(
    () => tickets.find(t => t.id === selectedId) ?? null,
    [tickets, selectedId],
  );

  const visibleTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter(t => {
      if (filter === 'unread' && !t.unread) return false;
      if (filter === 'open' && t.status !== 'open') return false;
      if (filter === 'in_progress' && t.status !== 'in_progress') return false;
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
    getMySignature()
      .then(res => { setSignature(res.signature ?? ''); setSignatureDraft(res.signature ?? ''); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getMyAccess().then(res => setIsAdmin(!!res.isAdmin)).catch(() => {});
  }, []);

  useEffect(() => {
    adminApi.listSenders()
      .then(res => {
        setSenders(res.senders ?? []);
        if (res.senders && !res.senders.find(s => s.key === 'support') && res.senders.length > 0) {
          const fallback = res.senders[0].key;
          setComposeFrom(fallback);
          setReplyFrom(fallback);
        }
      })
      .catch(() => {});
  }, []);

  const loadSnippets = async () => {
    setSnippetsLoading(true);
    try {
      const res = await adminApi.listSnippets();
      setSnippets(res.snippets ?? []);
    } catch {
      // support-access guard on server; stay silent for non-agents
    } finally {
      setSnippetsLoading(false);
    }
  };

  useEffect(() => { loadSnippets(); }, []);

  const insertSnippetInto = (
    target: 'reply' | 'compose',
    body: string,
  ) => {
    if (target === 'reply') {
      const el = draftRef.current;
      if (el) {
        const start = el.selectionStart ?? draft.length;
        const end = el.selectionEnd ?? draft.length;
        const next = draft.slice(0, start) + body + draft.slice(end);
        setDraft(next);
        requestAnimationFrame(() => {
          el.focus();
          const caret = start + body.length;
          el.setSelectionRange(caret, caret);
        });
      } else {
        setDraft(prev => prev ? `${prev}\n${body}` : body);
      }
    } else {
      setComposeMessage(prev => prev ? `${prev}\n${body}` : body);
    }
    setSnippetsPickerOpen(null);
    setSnippetFilter('');
  };

  const resetSnippetForm = () => {
    setSnippetEditingId(null);
    setSnippetTitle('');
    setSnippetBody('');
  };

  const openSnippetEditor = (s?: Snippet) => {
    if (s) {
      setSnippetEditingId(s.id);
      setSnippetTitle(s.title);
      setSnippetBody(s.body);
    } else {
      resetSnippetForm();
    }
    setSnippetsManageOpen(true);
    setSnippetsPickerOpen(null);
  };

  const handleSaveSnippet = async () => {
    const title = snippetTitle.trim();
    const body = snippetBody.trim();
    if (!title || !body) { alert('Title and body are required.'); return; }
    setSnippetSaving(true);
    try {
      if (snippetEditingId) {
        const updated = await adminApi.updateSnippet(snippetEditingId, { title, body });
        setSnippets(prev => prev.map(s => s.id === updated.id ? updated : s));
      } else {
        const created = await adminApi.createSnippet({ title, body });
        setSnippets(prev => [created, ...prev]);
      }
      resetSnippetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save snippet.');
    } finally {
      setSnippetSaving(false);
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    if (!window.confirm('Delete this snippet?')) return;
    try {
      await adminApi.deleteSnippet(id);
      setSnippets(prev => prev.filter(s => s.id !== id));
      if (snippetEditingId === id) resetSnippetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete snippet.');
    }
  };

  const filteredSnippets = useMemo(() => {
    const q = snippetFilter.trim().toLowerCase();
    if (!q) return snippets;
    return snippets.filter(s =>
      s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q),
    );
  }, [snippets, snippetFilter]);

  const handleSendCompose = async () => {
    if (composeTo.length === 0) { alert('Add at least one recipient.'); return; }
    if (!composeSubject.trim() || !composeMessage.trim()) { alert('Subject and message are required.'); return; }
    setComposeSending(true);
    try {
      const res = await adminApi.composeEmail({
        to: composeTo,
        cc: composeCc.length > 0 ? composeCc : undefined,
        subject: composeSubject.trim(),
        message: composeMessage.trim(),
        from: composeFrom,
      });
      alert(`Sent to ${res.sent} of ${composeTo.length} recipients.`);
      setComposeOpen(false);
      setComposeTo([]);
      setComposeCc([]);
      setComposeSubject('');
      setComposeMessage('');
      setComposePreviewHtml('');
      setComposePreviewOpen(false);
      await loadList();
      if (res.ticketIds.length > 0) setSelectedId(res.ticketIds[0]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send.');
    } finally {
      setComposeSending(false);
    }
  };

  const handleToggleComposePreview = async () => {
    if (composePreviewOpen) { setComposePreviewOpen(false); return; }
    if (!composeSubject.trim() || !composeMessage.trim()) return;
    try {
      const res = await adminApi.previewCompose({ subject: composeSubject.trim(), message: composeMessage.trim() });
      setComposePreviewHtml(res.html);
      setComposePreviewOpen(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to preview.');
    }
  };

  const handleSaveSignature = async () => {
    setSavingSignature(true);
    try {
      await updateMySignature(signatureDraft);
      setSignature(signatureDraft);
      setEditingSignature(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save signature.');
    } finally {
      setSavingSignature(false);
    }
  };

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
      await adminApi.replyToTicket(selectedId, {
        subject,
        message: draft.trim(),
        additionalTo: replyAdditionalTo.length > 0 ? replyAdditionalTo : undefined,
        cc: replyCc.length > 0 ? replyCc : undefined,
        from: replyFrom,
      });
      setDraft('');
      setReplyAdditionalTo([]);
      setReplyCc([]);
      setReplyRecipientsOpen(false);
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
    if (!isAdmin) {
      alert('Only admins can delete tickets. Please ask an admin on your team to remove this.');
      return;
    }
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
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
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
            <button
              onClick={() => setComposeOpen(true)}
              title="New email"
              style={{
                flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 999, border: 'none',
                background: '#6245a4', color: '#fff',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              <PenSquare size={13} /> Compose
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['all', 'unread', 'open', 'in_progress', 'closed'] as Filter[]).map(f => (
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
                  : FILTER_LABEL[f]}
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
                <span>All quiet. No tickets match this filter.</span>
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
                      {t.initiatedBy === 'agent' && (
                        <span
                          title="Outbound email — you started this thread"
                          style={{
                            display: 'inline-flex', alignItems: 'center',
                            width: 16, height: 16, flexShrink: 0,
                            borderRadius: 999, background: '#6245a418', color: '#6245a4',
                            justifyContent: 'center',
                          }}
                        >
                          <PenSquare size={9} />
                        </span>
                      )}
                      <span style={{
                        fontWeight: t.unread ? 700 : 600, fontSize: '0.88rem', color: 'var(--on-surface)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {t.initiatedBy === 'agent' ? `To: ${t.email}` : (t.name || t.email)}
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
              Pandas are standing by. Every reply ships as a branded PathWise email.
              Hit Preview to see it before sending.
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
                  {selected.initiatedBy === 'agent'
                    ? `To: ${selected.email}`
                    : <>{selected.name} &lt;{selected.email}&gt;</>}
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
                    opacity: isAdmin ? 1 : 0.6,
                  }}
                  title={isAdmin ? 'Delete ticket' : 'Only admins can delete. Click to learn more.'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {selected.initiatedBy === 'agent' ? (
                <div style={{
                  marginBottom: '1rem', padding: '8px 12px',
                  borderRadius: 12, background: '#6245a418', color: '#6245a4',
                  fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex',
                  alignItems: 'center', gap: 6,
                }}>
                  <PenSquare size={12} />
                  Outbound thread · you started this on {formatWhen(selected.createdAt)}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ maxWidth: '75%' }}>
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 4,
                    }}>
                      {selected.name || selected.email} · {formatWhen(selected.createdAt)}
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
              )}

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
                        {' '}· {formatWhen(r.createdAt)}
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
              <div style={{ marginBottom: 8 }}>
                <button
                  onClick={() => setReplyRecipientsOpen(o => !o)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 999,
                    border: '1px solid var(--outline-variant)',
                    background: replyAdditionalTo.length + replyCc.length > 0
                      ? 'var(--surface-container-high)' : 'var(--surface-container)',
                    color: 'var(--on-surface-variant)',
                    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <ChevronDown
                    size={11}
                    style={{ transform: replyRecipientsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                  />
                  {replyAdditionalTo.length + replyCc.length > 0
                    ? `Recipients · +${replyAdditionalTo.length} To, ${replyCc.length} CC`
                    : 'Add CC or more recipients'}
                </button>
                {replyRecipientsOpen && (
                  <div style={{
                    marginTop: 8, padding: '0.75rem 0.85rem',
                    borderRadius: 12, border: '1px solid var(--outline-variant)',
                    background: 'var(--surface-container)',
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.08em', color: 'var(--on-surface-variant)',
                      }}>From</span>
                      <select
                        value={replyFrom}
                        onChange={e => setReplyFrom(e.target.value)}
                        style={{
                          padding: '0.5rem 0.8rem', borderRadius: 10,
                          border: '1px solid var(--outline-variant)', background: 'var(--surface)',
                          color: 'var(--on-surface)', fontSize: '0.82rem', outline: 'none',
                        }}
                      >
                        {senders.length === 0 ? (
                          <option value="">PathWise &lt;hello@pathwise.fit&gt;</option>
                        ) : senders.map(s => (
                          <option key={s.key} value={s.key}>
                            {s.label} &lt;{s.address}&gt;
                          </option>
                        ))}
                      </select>
                    </label>
                    <EmailTagInput
                      label="Additional To"
                      tags={replyAdditionalTo}
                      onChange={setReplyAdditionalTo}
                      placeholder="Add more recipients…"
                    />
                    <EmailTagInput
                      label="CC"
                      tags={replyCc}
                      onChange={setReplyCc}
                      placeholder="Add CC addresses…"
                    />
                  </div>
                )}
              </div>
              {/* Signature chip + inline editor */}
              <div style={{ marginBottom: 8, fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>
                {editingSignature ? (
                  <div style={{
                    padding: '0.6rem 0.8rem', borderRadius: 12,
                    border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                  }}>
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 6,
                    }}>
                      Your signature (appended to every reply)
                    </div>
                    <textarea
                      value={signatureDraft}
                      onChange={e => setSignatureDraft(e.target.value.slice(0, 1000))}
                      placeholder={'e.g.\nAlex\nPathWise Support'}
                      rows={3}
                      style={{
                        width: '100%', padding: '0.5rem 0.7rem', borderRadius: 10,
                        border: '1px solid var(--outline-variant)', background: 'var(--surface)',
                        color: 'var(--on-surface)', fontSize: '0.85rem', lineHeight: 1.5,
                        resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
                      <button
                        onClick={() => { setSignatureDraft(signature); setEditingSignature(false); }}
                        style={{
                          padding: '0.4rem 0.8rem', borderRadius: 999, border: '1px solid var(--outline-variant)',
                          background: 'var(--surface)', color: 'var(--on-surface-variant)',
                          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSignature}
                        disabled={savingSignature}
                        style={{
                          padding: '0.4rem 0.9rem', borderRadius: 999, border: 'none',
                          background: '#6245a4', color: '#fff',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                          opacity: savingSignature ? 0.5 : 1,
                        }}
                      >
                        <Check size={12} /> {savingSignature ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingSignature(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 999,
                      border: '1px solid var(--outline-variant)',
                      background: signature ? 'var(--surface-container-high)' : 'var(--surface-container)',
                      color: 'var(--on-surface-variant)', fontSize: '0.72rem', fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Pencil size={11} />
                    {signature ? `Signature: ${signature.split('\n')[0].slice(0, 40)}${signature.length > 40 ? '…' : ''}` : 'Add your signature'}
                  </button>
                )}
              </div>
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
                    <span>Preview · how {selected.name || selected.email} will see it</span>
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
                  ref={draftRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    // Enter = send, Shift+Enter = newline (Slack-style)
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Write a reply… (Enter to send, Shift+Enter for new line)"
                  rows={2}
                  style={{
                    flex: 1, padding: '0.6rem 0.9rem', borderRadius: 14,
                    border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                    color: 'var(--on-surface)', fontSize: '0.88rem', lineHeight: 1.5,
                    resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setSnippetsPickerOpen(o => o === 'reply' ? null : 'reply')}
                    title="Insert snippet"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '0.55rem 0.9rem', borderRadius: 999,
                      border: '1px solid var(--outline-variant)',
                      background: snippetsPickerOpen === 'reply' ? 'var(--surface-container-high)' : 'var(--surface-container)',
                      color: 'var(--on-surface)',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <Bookmark size={14} /> Snippets
                  </button>
                  {snippetsPickerOpen === 'reply' && (
                    <SnippetsPopover
                      anchor="reply"
                      snippets={filteredSnippets}
                      total={snippets.length}
                      loading={snippetsLoading}
                      filter={snippetFilter}
                      onFilterChange={setSnippetFilter}
                      onPick={s => insertSnippetInto('reply', s.body)}
                      onManage={() => openSnippetEditor()}
                      onEdit={s => openSnippetEditor(s)}
                      onClose={() => { setSnippetsPickerOpen(null); setSnippetFilter(''); }}
                    />
                  )}
                </div>
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

      {composeOpen && (
        <ComposeModal
          to={composeTo}
          cc={composeCc}
          fromKey={composeFrom}
          senders={senders}
          subject={composeSubject}
          message={composeMessage}
          sending={composeSending}
          previewOpen={composePreviewOpen}
          previewHtml={composePreviewHtml}
          snippetsButton={
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setSnippetsPickerOpen(o => o === 'compose' ? null : 'compose')}
                title="Insert snippet"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '0.5rem 0.9rem', borderRadius: 999,
                  border: '1px solid var(--outline-variant)',
                  background: snippetsPickerOpen === 'compose' ? 'var(--surface-container-high)' : 'var(--surface-container)',
                  color: 'var(--on-surface)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Bookmark size={14} /> Snippets
              </button>
              {snippetsPickerOpen === 'compose' && (
                <SnippetsPopover
                  anchor="compose"
                  snippets={filteredSnippets}
                  total={snippets.length}
                  loading={snippetsLoading}
                  filter={snippetFilter}
                  onFilterChange={setSnippetFilter}
                  onPick={s => insertSnippetInto('compose', s.body)}
                  onManage={() => openSnippetEditor()}
                  onEdit={s => openSnippetEditor(s)}
                  onClose={() => { setSnippetsPickerOpen(null); setSnippetFilter(''); }}
                />
              )}
            </div>
          }
          onToChange={setComposeTo}
          onCcChange={setComposeCc}
          onFromChange={setComposeFrom}
          onSubjectChange={setComposeSubject}
          onMessageChange={setComposeMessage}
          onTogglePreview={handleToggleComposePreview}
          onSend={handleSendCompose}
          onClose={() => {
            setComposeOpen(false);
            setSnippetsPickerOpen(null);
            setComposePreviewOpen(false);
          }}
        />
      )}

      {snippetsManageOpen && (
        <SnippetsManageModal
          snippets={snippets}
          editingId={snippetEditingId}
          title={snippetTitle}
          body={snippetBody}
          saving={snippetSaving}
          onTitleChange={setSnippetTitle}
          onBodyChange={setSnippetBody}
          onEdit={s => { setSnippetEditingId(s.id); setSnippetTitle(s.title); setSnippetBody(s.body); }}
          onNew={resetSnippetForm}
          onSave={handleSaveSnippet}
          onDelete={handleDeleteSnippet}
          onClose={() => { setSnippetsManageOpen(false); resetSnippetForm(); }}
        />
      )}
    </div>
  );
}

type PopoverProps = {
  anchor: 'reply' | 'compose';
  snippets: Snippet[];
  total: number;
  loading: boolean;
  filter: string;
  onFilterChange: (v: string) => void;
  onPick: (s: Snippet) => void;
  onManage: () => void;
  onEdit: (s: Snippet) => void;
  onClose: () => void;
};

function SnippetsPopover(props: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) props.onClose();
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') props.onClose(); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [props]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 8px)',
        right: 0,
        width: 320,
        maxHeight: 380,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        border: '1px solid var(--outline-variant)',
        borderRadius: 14,
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        zIndex: 50,
      }}
    >
      <div style={{
        padding: '0.55rem 0.7rem', borderBottom: '1px solid var(--outline-variant)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Bookmark size={13} style={{ color: 'var(--on-surface-variant)' }} />
        <span style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--on-surface-variant)', flex: 1,
        }}>
          Your snippets
        </span>
        <button
          onClick={props.onManage}
          style={{
            padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600,
            borderRadius: 999, border: '1px solid var(--outline-variant)',
            background: 'var(--surface-container)', color: 'var(--on-surface)',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
          title="Manage snippets"
        >
          <Plus size={10} /> New
        </button>
      </div>
      {props.total > 0 && (
        <div style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid var(--outline-variant)' }}>
          <input
            autoFocus
            placeholder="Filter snippets"
            value={props.filter}
            onChange={e => props.onFilterChange(e.target.value)}
            style={{
              width: '100%', padding: '5px 10px', borderRadius: 999,
              border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
              color: 'var(--on-surface)', fontSize: '0.78rem', outline: 'none',
            }}
          />
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {props.loading ? (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
            Loading…
          </div>
        ) : props.total === 0 ? (
          <div style={{ padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
            No snippets yet.
            <div style={{ marginTop: 8 }}>
              <button
                onClick={props.onManage}
                style={{
                  padding: '5px 12px', borderRadius: 999, border: 'none',
                  background: '#6245a4', color: '#fff',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Create your first snippet
              </button>
            </div>
          </div>
        ) : props.snippets.length === 0 ? (
          <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
            No matches for "{props.filter}".
          </div>
        ) : (
          props.snippets.map(s => (
            <div
              key={s.id}
              style={{
                padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--outline-variant)',
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}
            >
              <button
                onClick={() => props.onPick(s)}
                style={{
                  flex: 1, textAlign: 'left', background: 'none', border: 'none',
                  padding: 0, cursor: 'pointer', color: 'var(--on-surface)',
                }}
                title="Insert into message"
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 2 }}>
                  {s.title}
                </div>
                <div style={{
                  fontSize: '0.72rem', color: 'var(--on-surface-variant)',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  whiteSpace: 'pre-wrap',
                }}>
                  {s.body}
                </div>
              </button>
              <button
                onClick={() => props.onEdit(s)}
                title="Edit snippet"
                style={{
                  flexShrink: 0, width: 24, height: 24, padding: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container)', color: 'var(--on-surface-variant)',
                  cursor: 'pointer',
                }}
              >
                <Pencil size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

type ComposeProps = {
  to: string[];
  cc: string[];
  fromKey: string;
  senders: Array<{ key: string; address: string; label: string }>;
  subject: string;
  message: string;
  sending: boolean;
  previewOpen: boolean;
  previewHtml: string;
  snippetsButton: React.ReactNode;
  onToChange: (v: string[]) => void;
  onCcChange: (v: string[]) => void;
  onFromChange: (v: string) => void;
  onSubjectChange: (v: string) => void;
  onMessageChange: (v: string) => void;
  onTogglePreview: () => void;
  onSend: () => void;
  onClose: () => void;
};

function ComposeModal(p: ComposeProps) {
  return (
    <div
      onMouseDown={e => { if (e.target === e.currentTarget) p.onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,15,25,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 16,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 640, maxHeight: '90vh',
        background: 'var(--surface)', border: '1px solid var(--outline-variant)',
        borderRadius: 18, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <div style={{
          padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--outline-variant)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PenSquare size={16} style={{ color: '#6245a4' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--on-surface)' }}>
              New email
            </span>
          </div>
          <button
            onClick={p.onClose}
            title="Close"
            style={{
              width: 28, height: 28, padding: 0, display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
              border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
              color: 'var(--on-surface-variant)', cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--on-surface-variant)',
            }}>From</span>
            <select
              value={p.fromKey}
              onChange={e => p.onFromChange(e.target.value)}
              style={{
                padding: '0.55rem 0.9rem', borderRadius: 12,
                border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                color: 'var(--on-surface)', fontSize: '0.88rem', outline: 'none',
              }}
            >
              {p.senders.length === 0 ? (
                <option value="">PathWise &lt;hello@pathwise.fit&gt;</option>
              ) : p.senders.map(s => (
                <option key={s.key} value={s.key}>
                  {s.label} &lt;{s.address}&gt;
                </option>
              ))}
            </select>
          </label>

          <EmailTagInput
            label="To"
            tags={p.to}
            onChange={p.onToChange}
            placeholder="name@example.com"
            helperText="Enter, comma, or Space adds an address. Max 10. A tracked open ticket is created per recipient so replies land back here."
          />

          <EmailTagInput
            label="CC"
            tags={p.cc}
            onChange={p.onCcChange}
            placeholder="Add CC addresses…"
          />

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--on-surface-variant)',
            }}>Subject</span>
            <input
              value={p.subject}
              onChange={e => p.onSubjectChange(e.target.value)}
              placeholder="What's this about?"
              style={{
                padding: '0.55rem 0.9rem', borderRadius: 12,
                border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                color: 'var(--on-surface)', fontSize: '0.88rem', outline: 'none',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--on-surface-variant)',
            }}>Message</span>
            <textarea
              value={p.message}
              onChange={e => p.onMessageChange(e.target.value)}
              placeholder="Write your message…"
              rows={8}
              style={{
                padding: '0.7rem 0.9rem', borderRadius: 12,
                border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                color: 'var(--on-surface)', fontSize: '0.88rem', lineHeight: 1.55,
                resize: 'vertical', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </label>

          {p.previewOpen && p.previewHtml && (
            <div style={{
              border: '1px solid var(--outline-variant)', borderRadius: 12,
              overflow: 'hidden', background: '#f4f4f7',
            }}>
              <div style={{
                padding: '6px 10px', fontSize: '0.7rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--on-surface-variant)',
                background: 'var(--surface-container)',
                borderBottom: '1px solid var(--outline-variant)',
              }}>
                Preview
              </div>
              <iframe
                title="Compose preview"
                srcDoc={p.previewHtml}
                sandbox=""
                style={{ width: '100%', height: 260, border: 'none', display: 'block', background: '#f4f4f7' }}
              />
            </div>
          )}
        </div>

        <div style={{
          padding: '0.85rem 1.25rem', borderTop: '1px solid var(--outline-variant)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          flexWrap: 'wrap',
        }}>
          {p.snippetsButton}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={p.onTogglePreview}
              disabled={!p.subject.trim() || !p.message.trim()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0.5rem 0.9rem', borderRadius: 999,
                border: '1px solid var(--outline-variant)',
                background: p.previewOpen ? 'var(--surface-container-high)' : 'var(--surface-container)',
                color: 'var(--on-surface)',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                opacity: !p.subject.trim() || !p.message.trim() ? 0.5 : 1,
              }}
            >
              {p.previewOpen ? <EyeOff size={14} /> : <Eye size={14} />}
              {p.previewOpen ? 'Hide' : 'Preview'}
            </button>
            <button
              onClick={p.onSend}
              disabled={p.sending || p.to.length === 0 || !p.subject.trim() || !p.message.trim()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0.5rem 1.1rem', borderRadius: 999, border: 'none',
                background: '#6245a4', color: '#fff',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                opacity: p.sending || p.to.length === 0 || !p.subject.trim() || !p.message.trim() ? 0.5 : 1,
              }}
            >
              <Send size={14} /> {p.sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type ManageProps = {
  snippets: Snippet[];
  editingId: string | null;
  title: string;
  body: string;
  saving: boolean;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onEdit: (s: Snippet) => void;
  onNew: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

function SnippetsManageModal(p: ManageProps) {
  return (
    <div
      onMouseDown={e => { if (e.target === e.currentTarget) p.onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,15,25,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 110, padding: 16,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 720, maxHeight: '85vh',
        background: 'var(--surface)', border: '1px solid var(--outline-variant)',
        borderRadius: 18, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <div style={{
          padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--outline-variant)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bookmark size={16} style={{ color: '#6245a4' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--on-surface)' }}>
              Your snippets
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>
              Only you can see or edit these.
            </span>
          </div>
          <button
            onClick={p.onClose}
            title="Close"
            style={{
              width: 28, height: 28, padding: 0, display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
              border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
              color: 'var(--on-surface-variant)', cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', flex: 1, overflow: 'hidden' }}>
          {/* Left: list */}
          <div style={{
            borderRight: '1px solid var(--outline-variant)',
            overflowY: 'auto',
            background: 'var(--surface-container-low, var(--surface))',
          }}>
            <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--outline-variant)' }}>
              <button
                onClick={p.onNew}
                style={{
                  width: '100%', padding: '6px 10px', borderRadius: 999, border: 'none',
                  background: '#6245a4', color: '#fff',
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Plus size={12} /> New snippet
              </button>
            </div>
            {p.snippets.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                No snippets yet. Create your first one on the right.
              </div>
            ) : (
              p.snippets.map(s => {
                const active = p.editingId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => p.onEdit(s)}
                    style={{
                      padding: '0.6rem 0.8rem', cursor: 'pointer',
                      borderLeft: active ? '3px solid #6245a4' : '3px solid transparent',
                      background: active ? 'var(--surface-container-high)' : 'transparent',
                      borderBottom: '1px solid var(--outline-variant)',
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 2 }}>
                      {s.title}
                    </div>
                    <div style={{
                      fontSize: '0.72rem', color: 'var(--on-surface-variant)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {s.body.replace(/\s+/g, ' ')}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: editor */}
          <div style={{ padding: '1rem 1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: 'var(--on-surface-variant)',
              }}>Title</span>
              <input
                value={p.title}
                onChange={e => p.onTitleChange(e.target.value)}
                placeholder="e.g. Reset password instructions"
                maxLength={80}
                style={{
                  padding: '0.55rem 0.9rem', borderRadius: 12,
                  border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                  color: 'var(--on-surface)', fontSize: '0.88rem', outline: 'none',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: 'var(--on-surface-variant)',
              }}>Body</span>
              <textarea
                value={p.body}
                onChange={e => p.onBodyChange(e.target.value)}
                placeholder="The text that gets inserted when you pick this snippet."
                rows={10}
                maxLength={4000}
                style={{
                  padding: '0.7rem 0.9rem', borderRadius: 12,
                  border: '1px solid var(--outline-variant)', background: 'var(--surface-container)',
                  color: 'var(--on-surface)', fontSize: '0.88rem', lineHeight: 1.55,
                  resize: 'vertical', outline: 'none', fontFamily: 'inherit', minHeight: 180,
                }}
              />
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              {p.editingId ? (
                <button
                  onClick={() => p.onDelete(p.editingId!)}
                  style={{
                    padding: '0.5rem 0.9rem', borderRadius: 999,
                    border: '1px solid #ef444444', background: 'none',
                    color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              ) : <span />}
              <button
                onClick={p.onSave}
                disabled={p.saving || !p.title.trim() || !p.body.trim()}
                style={{
                  padding: '0.5rem 1.1rem', borderRadius: 999, border: 'none',
                  background: '#6245a4', color: '#fff',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  opacity: p.saving || !p.title.trim() || !p.body.trim() ? 0.5 : 1,
                }}
              >
                <Check size={13} /> {p.saving ? 'Saving…' : (p.editingId ? 'Save changes' : 'Create snippet')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
