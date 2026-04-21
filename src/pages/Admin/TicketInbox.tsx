import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { admin as adminApi, type AdminTicket, type Snippet, getMySignature, updateMySignature, getMyAccess } from '../../lib/api';
import { Send, Trash2, Search, Inbox, Eye, EyeOff, Pencil, Check, PenSquare, X, Bookmark, Plus, ChevronDown, Activity, RefreshCw } from 'lucide-react';
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
  const [replyEditedHtml, setReplyEditedHtml] = useState<string | null>(null);
  const [replyEditMode, setReplyEditMode] = useState(false);
  const [composeEditedHtml, setComposeEditedHtml] = useState<string | null>(null);
  const [composeEditMode, setComposeEditMode] = useState(false);
  const [senders, setSenders] = useState<Array<{ key: string; address: string; label: string }>>([]);
  const [composeFrom, setComposeFrom] = useState<string>('support');
  const [replyFrom, setReplyFrom] = useState<string>('support');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const replySnippetsAnchorRef = useRef<HTMLButtonElement | null>(null);
  const composeSnippetsAnchorRef = useRef<HTMLButtonElement | null>(null);
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
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugEntries, setDebugEntries] = useState<Array<{
    id: string; receivedAt: string; decision: string;
    fromEmail: string | null; toAddresses: string[];
    subject: string | null; reason: string | null;
    hasSvixHeaders: boolean; resendEmailId: string | null;
  }>>([]);
  const [debugLoading, setDebugLoading] = useState(false);

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

  const loadDebugLog = async () => {
    setDebugLoading(true);
    try {
      const res = await adminApi.listInboundLog();
      setDebugEntries(res.entries ?? []);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load inbound log.');
    } finally {
      setDebugLoading(false);
    }
  };

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
        rawHtml: composeEditedHtml ?? undefined,
      });
      if (res.failures && res.failures.length > 0) {
        const lines = res.failures.map(f => `  • ${f.to}: ${f.error}`).join('\n');
        alert(
          `Sent to ${res.sent} of ${composeTo.length} recipients.\n\n` +
          `${res.failures.length} failed:\n${lines}\n\n` +
          `If the error mentions "domain" or "from address", check the Resend dashboard — ` +
          `the ${composeFrom}@pathwise.fit sender may not be verified yet.`,
        );
      } else {
        alert(`Sent to ${res.sent} of ${composeTo.length} recipients.`);
      }
      setComposeOpen(false);
      setComposeTo([]);
      setComposeCc([]);
      setComposeSubject('');
      setComposeMessage('');
      setComposePreviewHtml('');
      setComposePreviewOpen(false);
      setComposeEditedHtml(null);
      setComposeEditMode(false);
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
        rawHtml: replyEditedHtml ?? undefined,
      });
      setDraft('');
      setReplyAdditionalTo([]);
      setReplyCc([]);
      setReplyRecipientsOpen(false);
      setReplyEditedHtml(null);
      setReplyEditMode(false);
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
    setReplyEditedHtml(null);
    setReplyEditMode(false);
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset compose edit state when message/subject changes so the send
  // payload stays in sync with what the agent is actually editing.
  useEffect(() => {
    setComposeEditedHtml(null);
    setComposeEditMode(false);
  }, [composeMessage, composeSubject]);

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
  const filterCounts: Record<Filter, number> = {
    all: tickets.length,
    unread: unreadCount,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.25rem',
      height: 'calc(100vh - 180px)', minHeight: 640,
    }}>
      {/* Left: ticket list */}
      <div className="panel" style={{
        borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '0.95rem 1rem 0.8rem', borderBottom: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                Inbox
              </span>
              {unreadCount > 0 && (
                <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                onClick={async () => {
                  await loadList();
                  if (selectedId) await loadThread(selectedId);
                }}
                disabled={loading || threadLoading}
                aria-label="Refresh inbox"
                title="Refresh inbox"
                style={{
                  flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 10, border: '1px solid transparent',
                  background: 'transparent', color: 'var(--on-surface-variant)',
                  cursor: (loading || threadLoading) ? 'default' : 'pointer', padding: 0,
                  opacity: (loading || threadLoading) ? 0.5 : 0.85, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!loading && !threadLoading) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; } }}
                onMouseLeave={e => { e.currentTarget.style.opacity = loading || threadLoading ? '0.5' : '0.85'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <RefreshCw
                  size={14}
                  style={{ animation: (loading || threadLoading) ? 'spin 0.9s linear infinite' : 'none' }}
                />
              </button>
              <button
                onClick={() => { setDebugOpen(true); loadDebugLog(); }}
                aria-label="Inbound webhook activity"
                title="Inbound webhook activity"
                style={{
                  flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 10, border: '1px solid transparent',
                  background: 'transparent', color: 'var(--on-surface-variant)',
                  cursor: 'pointer', padding: 0, opacity: 0.85, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <Activity size={14} />
              </button>
              <div style={{ width: 1, height: 20, background: 'var(--outline-variant)', margin: '0 4px' }} />
              <button
                onClick={() => setComposeOpen(true)}
                aria-label="Compose new email"
                title="New email"
                style={{
                  flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  height: 32, padding: '0 14px', borderRadius: 10, border: 'none',
                  background: '#8b4f2c', color: '#fff',
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(139,79,44,0.25), 0 1px 3px rgba(139,79,44,0.18)',
                  transition: 'background 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#723f22'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(139,79,44,0.3), 0 2px 8px rgba(139,79,44,0.22)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#8b4f2c'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(139,79,44,0.25), 0 1px 3px rgba(139,79,44,0.18)'; }}
              >
                <PenSquare size={13} /> Compose
              </button>
            </div>
          </div>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={15} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--on-surface-variant)', opacity: 0.7, pointerEvents: 'none',
            }} />
            <input
              placeholder="Search by name, email, or subject"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#8b4f2c';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,79,44,0.12)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--outline-variant)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              style={{
                width: '100%', padding: '9px 36px 9px 36px', borderRadius: 12,
                border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low, var(--surface-container))',
                color: 'var(--on-surface)', fontSize: '0.85rem', outline: 'none',
                transition: 'border 0.15s, box-shadow 0.15s',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                title="Clear"
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  width: 18, height: 18, padding: 0, borderRadius: '50%', border: 'none',
                  background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={10} />
              </button>
            )}
          </div>
          <div
            role="tablist"
            aria-label="Ticket filter"
            style={{
              display: 'flex', padding: 4, borderRadius: 12,
              background: 'var(--surface-container-low, var(--surface-container))',
              border: '1px solid var(--outline-variant)',
              gap: 3,
            }}
          >
            {(['all', 'unread', 'open', 'in_progress', 'closed'] as Filter[]).map(f => {
              const active = filter === f;
              const count = filterCounts[f];
              const isUnreadHighlight = f === 'unread' && unreadCount > 0 && !active;
              return (
                <button
                  key={f}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f)}
                  style={{
                    flex: 1, minWidth: 0,
                    padding: '6px 4px',
                    borderRadius: 9, border: 'none',
                    cursor: 'pointer',
                    background: active ? '#fff' : 'transparent',
                    color: active ? '#8b4f2c' : 'var(--on-surface-variant)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                    transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                    boxShadow: active ? '0 1px 2px rgba(15,15,25,0.08), 0 0 0 1px rgba(139,79,44,0.12)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--surface)';
                      e.currentTarget.style.color = 'var(--on-surface)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--on-surface-variant)';
                    }
                  }}
                >
                  <span style={{
                    fontSize: '0.72rem', fontWeight: active ? 700 : 600,
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                  }}>
                    {f === 'in_progress' ? 'Active' : FILTER_LABEL[f]}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: isUnreadHighlight
                      ? '#8b4f2c'
                      : (active ? '#8b4f2c' : 'var(--on-surface-variant)'),
                    opacity: count === 0 && !active ? 0.45 : 1,
                  }}>
                    {count > 99 ? '99+' : count}
                  </span>
                </button>
              );
            })}
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
                    borderLeft: isActive ? '3px solid #8b4f2c' : '3px solid transparent',
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
                          width: 8, height: 8, borderRadius: '50%', background: '#8b4f2c', flexShrink: 0,
                        }} />
                      )}
                      {t.initiatedBy === 'agent' && (
                        <span
                          title="Outbound email — you started this thread"
                          style={{
                            display: 'inline-flex', alignItems: 'center',
                            width: 16, height: 16, flexShrink: 0,
                            borderRadius: 999, background: '#8b4f2c18', color: '#8b4f2c',
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
                <StatusPicker
                  value={selected.status as StatusKey}
                  onChange={next => handleStatusChange(selected.id, next)}
                />
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
                  borderRadius: 12, background: '#8b4f2c18', color: '#8b4f2c',
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
                        background: r.direction === 'admin' ? '#8b4f2c' : 'var(--surface-container)',
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
                  aria-expanded={replyRecipientsOpen}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 28, padding: '0 12px', borderRadius: 999,
                    border: '1px solid var(--outline-variant)',
                    background: replyAdditionalTo.length + replyCc.length > 0
                      ? '#8b4f2c18' : 'transparent',
                    color: replyAdditionalTo.length + replyCc.length > 0
                      ? '#8b4f2c' : 'var(--on-surface-variant)',
                    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (replyAdditionalTo.length + replyCc.length === 0) {
                      e.currentTarget.style.background = 'var(--surface-container)';
                      e.currentTarget.style.color = 'var(--on-surface)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (replyAdditionalTo.length + replyCc.length === 0) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--on-surface-variant)';
                    }
                  }}
                >
                  <ChevronDown
                    size={11}
                    style={{ transform: replyRecipientsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                  />
                  {replyAdditionalTo.length + replyCc.length > 0
                    ? <>Recipients · +{replyAdditionalTo.length} to, {replyCc.length} cc</>
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
              <SignatureBar
                scope="reply"
                signature={signature}
                editing={editingSignature}
                draft={signatureDraft}
                saving={savingSignature}
                onDraftChange={setSignatureDraft}
                onEdit={() => setEditingSignature(true)}
                onCancel={() => { setSignatureDraft(signature); setEditingSignature(false); }}
                onSave={handleSaveSignature}
              />
              {showPreview && previewHtml && (() => {
                const activeHtml = replyEditedHtml ?? previewHtml;
                return (
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
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                    }}>
                      <span>
                        {replyEditMode ? 'Editing HTML' : 'Preview · how '}
                        {!replyEditMode && (selected.name || selected.email)}
                        {!replyEditMode && ' will see it'}
                        {replyEditedHtml && !replyEditMode && (
                          <span style={{
                            marginLeft: 8, padding: '1px 8px', borderRadius: 999,
                            background: '#8b4f2c18', color: '#8b4f2c', fontSize: '0.65rem',
                          }}>edited</span>
                        )}
                      </span>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{
                          textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                          color: 'var(--on-surface-variant)',
                        }}>
                          {previewSubject}
                        </span>
                        <button
                          onClick={() => {
                            if (!replyEditMode) {
                              setReplyEditedHtml(replyEditedHtml ?? previewHtml);
                              setReplyEditMode(true);
                            } else {
                              setReplyEditMode(false);
                            }
                          }}
                          style={{
                            padding: '3px 10px', borderRadius: 999,
                            border: '1px solid var(--outline-variant)',
                            background: replyEditMode ? '#8b4f2c' : 'var(--surface)',
                            color: replyEditMode ? '#fff' : 'var(--on-surface)',
                            fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                            textTransform: 'none', letterSpacing: 0,
                          }}
                        >
                          {replyEditMode ? 'Back to preview' : 'Edit HTML'}
                        </button>
                        {replyEditedHtml && (
                          <button
                            onClick={() => { setReplyEditedHtml(null); setReplyEditMode(false); }}
                            style={{
                              padding: '3px 10px', borderRadius: 999,
                              border: '1px solid var(--outline-variant)',
                              background: 'var(--surface)', color: 'var(--on-surface-variant)',
                              fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                              textTransform: 'none', letterSpacing: 0,
                            }}
                            title="Discard HTML edits, regenerate from message"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                    {replyEditMode ? (
                      <textarea
                        value={replyEditedHtml ?? ''}
                        onChange={e => setReplyEditedHtml(e.target.value)}
                        spellCheck={false}
                        style={{
                          width: '100%', height: 320, border: 'none', outline: 'none',
                          padding: '12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          fontSize: '0.75rem', lineHeight: 1.5, resize: 'vertical', display: 'block',
                          background: '#1e1e1e', color: '#e6e6e6',
                        }}
                      />
                    ) : (
                      <iframe
                        title="Email preview"
                        srcDoc={activeHtml}
                        sandbox=""
                        style={{
                          width: '100%', height: 320, border: 'none', display: 'block',
                          background: '#f4f4f7',
                        }}
                      />
                    )}
                  </div>
                );
              })()}
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
                <>
                  <button
                    ref={replySnippetsAnchorRef}
                    onClick={() => setSnippetsPickerOpen(o => o === 'reply' ? null : 'reply')}
                    title="Insert snippet"
                    aria-label="Insert snippet"
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      height: 36, padding: '0 14px', borderRadius: 10,
                      border: '1px solid var(--outline-variant)',
                      background: snippetsPickerOpen === 'reply' ? 'var(--surface-container-high)' : 'transparent',
                      color: 'var(--on-surface)',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (snippetsPickerOpen !== 'reply') e.currentTarget.style.background = 'var(--surface-container)'; }}
                    onMouseLeave={e => { if (snippetsPickerOpen !== 'reply') e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Bookmark size={14} /> Snippets
                  </button>
                  {snippetsPickerOpen === 'reply' && (
                    <SnippetsPopover
                      anchor="reply"
                      anchorRef={replySnippetsAnchorRef}
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
                </>
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
                    background: '#8b4f2c', color: '#fff', fontSize: '0.82rem', fontWeight: 700,
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
          editedHtml={composeEditedHtml}
          editMode={composeEditMode}
          signature={signature}
          signatureDraft={signatureDraft}
          signatureEditing={editingSignature}
          signatureSaving={savingSignature}
          onEditedHtmlChange={setComposeEditedHtml}
          onEditModeChange={setComposeEditMode}
          onSignatureDraftChange={setSignatureDraft}
          onSignatureEdit={() => setEditingSignature(true)}
          onSignatureCancel={() => { setSignatureDraft(signature); setEditingSignature(false); }}
          onSignatureSave={handleSaveSignature}
          snippetsButton={
            <>
              <button
                ref={composeSnippetsAnchorRef}
                onClick={() => setSnippetsPickerOpen(o => o === 'compose' ? null : 'compose')}
                title="Insert snippet"
                aria-label="Insert snippet"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  height: 36, padding: '0 14px', borderRadius: 10,
                  border: '1px solid var(--outline-variant)',
                  background: snippetsPickerOpen === 'compose' ? 'var(--surface-container-high)' : 'transparent',
                  color: 'var(--on-surface)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (snippetsPickerOpen !== 'compose') e.currentTarget.style.background = 'var(--surface-container)'; }}
                onMouseLeave={e => { if (snippetsPickerOpen !== 'compose') e.currentTarget.style.background = 'transparent'; }}
              >
                <Bookmark size={14} /> Snippets
              </button>
              {snippetsPickerOpen === 'compose' && (
                <SnippetsPopover
                  anchor="compose"
                  anchorRef={composeSnippetsAnchorRef}
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
            </>
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

      {debugOpen && (
        <InboundDebugModal
          entries={debugEntries}
          loading={debugLoading}
          onRefresh={loadDebugLog}
          onClose={() => setDebugOpen(false)}
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
  anchorRef: React.RefObject<HTMLElement | null>;
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
  const [filterFocused, setFilterFocused] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  // Position the popover above the anchor using fixed coordinates so it can
  // escape any parent with overflow: hidden (e.g. the Compose modal).
  useLayoutEffect(() => {
    const anchor = props.anchorRef.current;
    if (!anchor) return;
    const update = () => {
      const r = anchor.getBoundingClientRect();
      setPos({
        top: r.top - 8,
        right: window.innerWidth - r.right,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [props.anchorRef]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const insidePopover = ref.current?.contains(target);
      const insideAnchor = props.anchorRef.current?.contains(target);
      if (!insidePopover && !insideAnchor) props.onClose();
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') props.onClose(); };
    // Defer registration to next tick so the click that opened the popover
    // doesn't immediately close it.
    const id = requestAnimationFrame(() => {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onEsc);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [props]);

  if (!pos) return null;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos.top,
        right: pos.right,
        transform: 'translateY(-100%)',
        width: 340,
        maxHeight: 400,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        border: '1px solid var(--outline-variant)',
        borderRadius: 14,
        boxShadow: '0 16px 40px rgba(15,15,25,0.18), 0 2px 6px rgba(15,15,25,0.08)',
        zIndex: 2000,
      }}
    >
      {/* Header */}
      <div style={{
        padding: '10px 12px', borderBottom: '1px solid var(--outline-variant)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface-container-low, var(--surface))',
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 7, flexShrink: 0,
          background: '#8b4f2c18', color: '#8b4f2c',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bookmark size={12} />
        </div>
        <span style={{
          fontSize: '0.78rem', fontWeight: 700, color: 'var(--on-surface)', flex: 1,
        }}>
          Your snippets
        </span>
        <button
          onClick={props.onManage}
          title="Manage snippets"
          style={{
            padding: '3px 10px', fontSize: '0.7rem', fontWeight: 600,
            borderRadius: 8, border: '1px solid var(--outline-variant)',
            background: 'transparent', color: 'var(--on-surface)',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-container)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Plus size={11} /> New
        </button>
      </div>

      {/* Filter */}
      {props.total > 0 && (
        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--outline-variant)' }}>
          <input
            autoFocus
            placeholder="Search by title or body"
            value={props.filter}
            onChange={e => props.onFilterChange(e.target.value)}
            onFocus={() => setFilterFocused(true)}
            onBlur={() => setFilterFocused(false)}
            style={{
              width: '100%', padding: '6px 12px', borderRadius: 9,
              border: `1px solid ${filterFocused ? '#8b4f2c' : 'var(--outline-variant)'}`,
              background: 'var(--surface-container)',
              color: 'var(--on-surface)', fontSize: '0.78rem', outline: 'none',
              boxShadow: filterFocused ? '0 0 0 3px rgba(139,79,44,0.12)' : 'none',
              transition: 'border 0.15s, box-shadow 0.15s',
            }}
          />
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {props.loading ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
            Loading snippets…
          </div>
        ) : props.total === 0 ? (
          <div style={{
            padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.8rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--surface-container)', color: 'var(--on-surface-variant)', opacity: 0.6,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bookmark size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: 2 }}>
                No snippets yet
              </div>
              <div style={{ fontSize: '0.72rem', lineHeight: 1.5 }}>
                Save canned replies to insert them here with one click.
              </div>
            </div>
            <button
              onClick={props.onManage}
              style={{
                height: 30, padding: '0 14px', borderRadius: 9, border: 'none',
                background: '#8b4f2c', color: '#fff',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(139,79,44,0.25)',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <Plus size={11} /> Create first snippet
            </button>
          </div>
        ) : props.snippets.length === 0 ? (
          <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
            No matches for &ldquo;{props.filter}&rdquo;.
          </div>
        ) : (
          <div style={{ padding: '4px 0' }}>
            {props.snippets.map(s => (
              <div
                key={s.id}
                style={{
                  padding: '8px 12px',
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-container)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <button
                  onClick={() => props.onPick(s)}
                  style={{
                    flex: 1, textAlign: 'left', background: 'none', border: 'none',
                    padding: 0, cursor: 'pointer', color: 'var(--on-surface)',
                  }}
                  title="Insert into message"
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 2, lineHeight: 1.3 }}>
                    {s.title}
                  </div>
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--on-surface-variant)', lineHeight: 1.4,
                    overflow: 'hidden',
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
                    flexShrink: 0, width: 26, height: 26, padding: 0,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 7, border: '1px solid transparent',
                    background: 'transparent', color: 'var(--on-surface-variant)',
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; e.currentTarget.style.color = '#8b4f2c'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--on-surface-variant)'; }}
                >
                  <Pencil size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
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
  editedHtml: string | null;
  editMode: boolean;
  signature: string;
  signatureDraft: string;
  signatureEditing: boolean;
  signatureSaving: boolean;
  snippetsButton: React.ReactNode;
  onToChange: (v: string[]) => void;
  onCcChange: (v: string[]) => void;
  onFromChange: (v: string) => void;
  onSubjectChange: (v: string) => void;
  onMessageChange: (v: string) => void;
  onEditedHtmlChange: (v: string | null) => void;
  onEditModeChange: (v: boolean) => void;
  onSignatureDraftChange: (v: string) => void;
  onSignatureEdit: () => void;
  onSignatureCancel: () => void;
  onSignatureSave: () => void;
  onTogglePreview: () => void;
  onSend: () => void;
  onClose: () => void;
};

const FIELD_LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: 'var(--on-surface-variant)',
};

function polishedInputStyle(focused: boolean): React.CSSProperties {
  return {
    padding: '10px 14px', borderRadius: 12,
    border: `1px solid ${focused ? '#8b4f2c' : 'var(--outline-variant)'}`,
    background: 'var(--surface-container-low, var(--surface-container))',
    color: 'var(--on-surface)', fontSize: '0.9rem', outline: 'none',
    boxShadow: focused ? '0 0 0 3px rgba(139,79,44,0.12)' : 'none',
    transition: 'border 0.15s, box-shadow 0.15s',
    fontFamily: 'inherit',
  };
}

function FromPicker({
  value, senders, onChange,
}: {
  value: string;
  senders: Array<{ key: string; address: string; label: string }>;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const current = senders.find(s => s.key === value);
  const currentLabel = current ? current.label : 'PathWise';
  const currentAddress = current ? current.address : 'hello@pathwise.fit';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left',
          padding: '10px 14px', borderRadius: 12,
          border: `1px solid ${open ? '#8b4f2c' : 'var(--outline-variant)'}`,
          background: 'var(--surface-container-low, var(--surface-container))',
          color: 'var(--on-surface)',
          display: 'inline-flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', outline: 'none',
          boxShadow: open ? '0 0 0 3px rgba(139,79,44,0.12)' : 'none',
          transition: 'border 0.15s, box-shadow 0.15s',
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: '#8b4f2c', flexShrink: 0,
        }} />
        <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.2 }}>
            {currentLabel}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', lineHeight: 1.2 }}>
            {currentAddress}
          </span>
        </span>
        <ChevronDown size={14} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'var(--surface)', border: '1px solid var(--outline-variant)',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 110,
        }}>
          {senders.length === 0 ? (
            <div style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>
              No senders configured.
            </div>
          ) : senders.map(s => {
            const active = s.key === value;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => { onChange(s.key); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  border: 'none', background: active ? 'var(--surface-container)' : 'transparent',
                  color: 'var(--on-surface)', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-container)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--surface-container)' : 'transparent'; }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#8b4f2c', flexShrink: 0, opacity: active ? 1 : 0.5,
                }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.25 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', lineHeight: 1.25 }}>
                    {s.address}
                  </div>
                </span>
                {active && <Check size={13} style={{ color: '#8b4f2c', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ComposeModal(p: ComposeProps) {
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [messageFocused, setMessageFocused] = useState(false);
  const canSend = !p.sending && p.to.length > 0 && !!p.subject.trim() && !!p.message.trim();
  const canPreview = !!p.subject.trim() && !!p.message.trim();

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
        width: '100%', maxWidth: 680, maxHeight: '92vh',
        background: 'var(--surface)', border: '1px solid var(--outline-variant)',
        borderRadius: 20, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(15,15,25,0.28)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem 0.9rem', borderBottom: '1px solid var(--outline-variant)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: '#8b4f2c18', color: '#8b4f2c',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <PenSquare size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.25 }}>
                New email
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--on-surface-variant)', lineHeight: 1.3, marginTop: 2 }}>
                Each recipient gets a tracked ticket so replies thread back here.
              </div>
            </div>
          </div>
          <button
            onClick={p.onClose}
            aria-label="Close compose"
            title="Close"
            style={{
              width: 32, height: 32, padding: 0, flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10, border: '1px solid transparent',
              background: 'transparent', color: 'var(--on-surface-variant)',
              cursor: 'pointer', opacity: 0.75, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1rem 1.25rem 0.5rem', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={FIELD_LABEL_STYLE}>From</span>
            <FromPicker
              value={p.fromKey}
              senders={p.senders}
              onChange={p.onFromChange}
            />
          </div>

          <EmailTagInput
            label="To"
            tags={p.to}
            onChange={p.onToChange}
            placeholder="name@example.com"
            helperText="Enter, comma, or Space to add. Max 10 recipients per send."
          />

          <EmailTagInput
            label="CC"
            tags={p.cc}
            onChange={p.onCcChange}
            placeholder="Add CC addresses…"
          />

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={FIELD_LABEL_STYLE}>Subject</span>
            <input
              value={p.subject}
              onChange={e => p.onSubjectChange(e.target.value)}
              onFocus={() => setSubjectFocused(true)}
              onBlur={() => setSubjectFocused(false)}
              placeholder="What's this about?"
              style={polishedInputStyle(subjectFocused)}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={FIELD_LABEL_STYLE}>Message</span>
            <textarea
              value={p.message}
              onChange={e => p.onMessageChange(e.target.value)}
              onFocus={() => setMessageFocused(true)}
              onBlur={() => setMessageFocused(false)}
              placeholder="Write your message…"
              rows={9}
              style={{
                ...polishedInputStyle(messageFocused),
                lineHeight: 1.6,
                resize: 'vertical',
                minHeight: 160,
              }}
            />
          </label>

          <SignatureBar
            scope="compose"
            signature={p.signature}
            editing={p.signatureEditing}
            draft={p.signatureDraft}
            saving={p.signatureSaving}
            onDraftChange={p.onSignatureDraftChange}
            onEdit={p.onSignatureEdit}
            onCancel={p.onSignatureCancel}
            onSave={p.onSignatureSave}
          />

          {p.previewOpen && p.previewHtml && (
            <div style={{
              border: '1px solid var(--outline-variant)', borderRadius: 14,
              overflow: 'hidden', background: '#f4f4f7',
            }}>
              <div style={{
                padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.04em',
                color: 'var(--on-surface)',
                background: 'var(--surface-container-low, var(--surface-container))',
                borderBottom: '1px solid var(--outline-variant)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {p.editMode ? (
                    <>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999,
                        background: '#8b4f2c', color: '#fff', fontSize: '0.65rem', letterSpacing: '0.06em',
                      }}>HTML</span>
                      <span style={{ color: 'var(--on-surface-variant)', textTransform: 'none', fontWeight: 600 }}>
                        Editing source
                      </span>
                    </>
                  ) : (
                    <>
                      <Eye size={13} style={{ color: 'var(--on-surface-variant)' }} />
                      <span style={{ textTransform: 'none', fontWeight: 600 }}>Preview</span>
                      {p.editedHtml && (
                        <span style={{
                          padding: '1px 8px', borderRadius: 999,
                          background: '#8b4f2c18', color: '#8b4f2c', fontSize: '0.65rem',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>edited</span>
                      )}
                    </>
                  )}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => {
                      if (!p.editMode) {
                        p.onEditedHtmlChange(p.editedHtml ?? p.previewHtml);
                        p.onEditModeChange(true);
                      } else {
                        p.onEditModeChange(false);
                      }
                    }}
                    style={{
                      padding: '4px 12px', borderRadius: 999,
                      border: p.editMode ? '1px solid transparent' : '1px solid var(--outline-variant)',
                      background: p.editMode ? '#8b4f2c' : 'var(--surface)',
                      color: p.editMode ? '#fff' : 'var(--on-surface)',
                      fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                      textTransform: 'none', letterSpacing: 0,
                    }}
                  >
                    {p.editMode ? 'Back to preview' : 'Edit HTML'}
                  </button>
                  {p.editedHtml && (
                    <button
                      onClick={() => { p.onEditedHtmlChange(null); p.onEditModeChange(false); }}
                      style={{
                        padding: '4px 12px', borderRadius: 999,
                        border: '1px solid var(--outline-variant)',
                        background: 'var(--surface)', color: 'var(--on-surface-variant)',
                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                        textTransform: 'none', letterSpacing: 0,
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              {p.editMode ? (
                <textarea
                  value={p.editedHtml ?? ''}
                  onChange={e => p.onEditedHtmlChange(e.target.value)}
                  spellCheck={false}
                  style={{
                    width: '100%', height: 280, border: 'none', outline: 'none',
                    padding: '14px 16px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: '0.76rem', lineHeight: 1.55, resize: 'vertical', display: 'block',
                    background: '#14141b', color: '#e6e6f0',
                  }}
                />
              ) : (
                <iframe
                  title="Compose preview"
                  srcDoc={p.editedHtml ?? p.previewHtml}
                  sandbox=""
                  style={{ width: '100%', height: 280, border: 'none', display: 'block', background: '#f4f4f7' }}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.9rem 1.25rem',
          borderTop: '1px solid var(--outline-variant)',
          background: 'var(--surface-container-low, var(--surface))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          flexWrap: 'wrap',
        }}>
          {p.snippetsButton}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={p.onTogglePreview}
              disabled={!canPreview}
              aria-label="Toggle preview"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 36, padding: '0 14px', borderRadius: 10,
                border: '1px solid var(--outline-variant)',
                background: p.previewOpen ? 'var(--surface-container-high)' : 'transparent',
                color: 'var(--on-surface)',
                fontSize: '0.82rem', fontWeight: 600,
                cursor: canPreview ? 'pointer' : 'not-allowed',
                opacity: canPreview ? 1 : 0.5,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (canPreview && !p.previewOpen) e.currentTarget.style.background = 'var(--surface-container)'; }}
              onMouseLeave={e => { if (canPreview && !p.previewOpen) e.currentTarget.style.background = 'transparent'; }}
            >
              {p.previewOpen ? <EyeOff size={14} /> : <Eye size={14} />}
              {p.previewOpen ? 'Hide' : 'Preview'}
            </button>
            <button
              onClick={p.onSend}
              disabled={!canSend}
              aria-label="Send email"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 36, padding: '0 18px', borderRadius: 10, border: 'none',
                background: '#8b4f2c', color: '#fff',
                fontSize: '0.82rem', fontWeight: 700,
                cursor: canSend ? 'pointer' : 'not-allowed',
                opacity: canSend ? 1 : 0.5,
                boxShadow: canSend ? '0 1px 2px rgba(139,79,44,0.28), 0 2px 6px rgba(139,79,44,0.2)' : 'none',
                transition: 'background 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { if (canSend) { e.currentTarget.style.background = '#723f22'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(139,79,44,0.3), 0 4px 10px rgba(139,79,44,0.24)'; } }}
              onMouseLeave={e => { if (canSend) { e.currentTarget.style.background = '#8b4f2c'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(139,79,44,0.28), 0 2px 6px rgba(139,79,44,0.2)'; } }}
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
  const [titleFocused, setTitleFocused] = useState(false);
  const [bodyFocused, setBodyFocused] = useState(false);
  const canSave = !p.saving && !!p.title.trim() && !!p.body.trim();

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
        width: '100%', maxWidth: 760, maxHeight: '88vh',
        background: 'var(--surface)', border: '1px solid var(--outline-variant)',
        borderRadius: 20, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(15,15,25,0.28)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem 0.9rem', borderBottom: '1px solid var(--outline-variant)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: '#8b4f2c18', color: '#8b4f2c',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bookmark size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.25 }}>
                Your snippets
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--on-surface-variant)', lineHeight: 1.3, marginTop: 2 }}>
                Canned replies only you can see. Pick from the inbox composer to insert instantly.
              </div>
            </div>
          </div>
          <button
            onClick={p.onClose}
            aria-label="Close snippets"
            title="Close"
            style={{
              width: 32, height: 32, padding: 0, flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10, border: '1px solid transparent',
              background: 'transparent', color: 'var(--on-surface-variant)',
              cursor: 'pointer', opacity: 0.75, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, overflow: 'hidden' }}>
          {/* Left: list */}
          <div style={{
            borderRight: '1px solid var(--outline-variant)',
            overflowY: 'auto',
            background: 'var(--surface-container-low, var(--surface))',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '0.75rem 0.9rem', borderBottom: '1px solid var(--outline-variant)' }}>
              <button
                onClick={p.onNew}
                style={{
                  width: '100%', height: 34, padding: '0 12px', borderRadius: 10, border: 'none',
                  background: '#8b4f2c', color: '#fff',
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: '0 1px 2px rgba(139,79,44,0.25), 0 1px 3px rgba(139,79,44,0.18)',
                  transition: 'background 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#723f22'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#8b4f2c'; }}
              >
                <Plus size={13} /> New snippet
              </button>
            </div>
            {p.snippets.length === 0 ? (
              <div style={{
                padding: '1.5rem 1rem', color: 'var(--on-surface-variant)',
                fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.5,
              }}>
                No snippets yet.
                <div style={{ marginTop: 4, fontSize: '0.75rem', opacity: 0.8 }}>
                  Create your first on the right.
                </div>
              </div>
            ) : (
              <div style={{ padding: '0.4rem 0', flex: 1 }}>
                {p.snippets.map(s => {
                  const active = p.editingId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => p.onEdit(s)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '0.65rem 0.9rem 0.65rem calc(0.9rem - 3px)',
                        cursor: 'pointer',
                        borderLeft: active ? '3px solid #8b4f2c' : '3px solid transparent',
                        background: active ? 'var(--surface-container-high)' : 'transparent',
                        borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-container)'; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{
                        fontSize: '0.82rem', fontWeight: 600,
                        color: active ? 'var(--on-surface)' : 'var(--on-surface)', marginBottom: 3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {s.title}
                      </div>
                      <div style={{
                        fontSize: '0.72rem', color: 'var(--on-surface-variant)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {s.body.replace(/\s+/g, ' ')}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: editor */}
          <div style={{ padding: '1.1rem 1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={FIELD_LABEL_STYLE}>Title</span>
              <input
                value={p.title}
                onChange={e => p.onTitleChange(e.target.value)}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                placeholder="e.g. Reset password instructions"
                maxLength={80}
                style={polishedInputStyle(titleFocused)}
              />
              <div style={{
                fontSize: '0.68rem', color: 'var(--on-surface-variant)', opacity: 0.7,
                textAlign: 'right',
              }}>
                {p.title.length}/80
              </div>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <span style={FIELD_LABEL_STYLE}>Body</span>
              <textarea
                value={p.body}
                onChange={e => p.onBodyChange(e.target.value)}
                onFocus={() => setBodyFocused(true)}
                onBlur={() => setBodyFocused(false)}
                placeholder="The text that gets inserted when you pick this snippet."
                rows={10}
                maxLength={4000}
                style={{
                  ...polishedInputStyle(bodyFocused),
                  lineHeight: 1.6, resize: 'vertical', minHeight: 200,
                }}
              />
              <div style={{
                fontSize: '0.68rem', color: 'var(--on-surface-variant)', opacity: 0.7,
                textAlign: 'right',
              }}>
                {p.body.length}/4000
              </div>
            </label>
            <div style={{
              display: 'flex', justifyContent: 'space-between', gap: 8,
              paddingTop: 4, borderTop: '1px solid var(--outline-variant)',
              marginTop: 'auto',
            }}>
              {p.editingId ? (
                <button
                  onClick={() => p.onDelete(p.editingId!)}
                  aria-label="Delete snippet"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 36, padding: '0 14px', borderRadius: 10,
                    border: '1px solid rgba(239,68,68,0.3)', background: 'transparent',
                    color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.15s, border 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              ) : <span />}
              <button
                onClick={p.onSave}
                disabled={!canSave}
                aria-label={p.editingId ? 'Save changes' : 'Create snippet'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  height: 36, padding: '0 18px', borderRadius: 10, border: 'none',
                  background: '#8b4f2c', color: '#fff',
                  fontSize: '0.82rem', fontWeight: 700,
                  cursor: canSave ? 'pointer' : 'not-allowed',
                  opacity: canSave ? 1 : 0.5,
                  boxShadow: canSave ? '0 1px 2px rgba(139,79,44,0.28), 0 2px 6px rgba(139,79,44,0.2)' : 'none',
                  transition: 'background 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { if (canSave) { e.currentTarget.style.background = '#723f22'; } }}
                onMouseLeave={e => { if (canSave) { e.currentTarget.style.background = '#8b4f2c'; } }}
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

type DebugEntry = {
  id: string; receivedAt: string; decision: string;
  fromEmail: string | null; toAddresses: string[];
  subject: string | null; reason: string | null;
  hasSvixHeaders: boolean; resendEmailId: string | null;
};

const DECISION_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  'ok':                { bg: '#dcfce7', color: '#166534', label: 'Threaded reply' },
  'ok-new':            { bg: '#dcfce7', color: '#166534', label: 'New ticket' },
  'no-match':          { bg: '#fef3c7', color: '#92400e', label: 'No match / dropped' },
  'duplicate':         { bg: '#e5e7eb', color: '#374151', label: 'Duplicate (ignored)' },
  'auth-failed':       { bg: '#fee2e2', color: '#991b1b', label: 'SPF/DKIM failed' },
  'suspicious':        { bg: '#fee2e2', color: '#991b1b', label: 'Suspicious content' },
  'empty-body':        { bg: '#fef3c7', color: '#92400e', label: 'Empty body' },
  'fetch-failed':      { bg: '#fee2e2', color: '#991b1b', label: 'Fetch failed' },
  'no-sender':         { bg: '#fef3c7', color: '#92400e', label: 'No sender' },
  'rate-limited':      { bg: '#fef3c7', color: '#92400e', label: 'Rate limited' },
  'ignored-non-event': { bg: '#e5e7eb', color: '#374151', label: 'Non-event payload' },
  'invalid-signature': { bg: '#fee2e2', color: '#991b1b', label: 'Invalid signature' },
  'missing-headers':   { bg: '#fee2e2', color: '#991b1b', label: 'Missing svix headers' },
  'secret-missing':    { bg: '#fee2e2', color: '#991b1b', label: 'Webhook secret missing' },
  'internal-error':    { bg: '#fee2e2', color: '#991b1b', label: 'Internal error (see reason)' },
};

function SignatureBar({
  scope, signature, editing, draft, saving,
  onDraftChange, onEdit, onCancel, onSave,
}: {
  scope: 'reply' | 'compose';
  signature: string;
  editing: boolean;
  draft: string;
  saving: boolean;
  onDraftChange: (v: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const preview = signature.trim();
  const firstLine = preview ? preview.split('\n')[0] : '';
  const helperText = scope === 'reply'
    ? 'Appended to every ticket reply you send.'
    : 'Appended to every compose email you send.';

  if (editing) {
    return (
      <div style={{
        marginBottom: 10, padding: '12px 14px', borderRadius: 14,
        border: '1px solid var(--outline-variant)', background: 'var(--surface-container-low, var(--surface-container))',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: 8, flexShrink: 0,
            background: '#8b4f2c18', color: '#8b4f2c',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Pencil size={12} />
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface)' }}>
            Your signature
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
            {helperText}
          </div>
        </div>
        <textarea
          value={draft}
          onChange={e => onDraftChange(e.target.value.slice(0, 1000))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={'e.g.\nAlex\nPathWise Support'}
          rows={3}
          style={{
            ...polishedInputStyle(focused),
            fontSize: '0.85rem', lineHeight: 1.55, resize: 'vertical',
          }}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 8,
        }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', opacity: 0.7 }}>
            {draft.length}/1000
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={onCancel}
              style={{
                height: 32, padding: '0 12px', borderRadius: 9,
                border: '1px solid var(--outline-variant)',
                background: 'transparent', color: 'var(--on-surface-variant)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-container)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              style={{
                height: 32, padding: '0 14px', borderRadius: 9, border: 'none',
                background: '#8b4f2c', color: '#fff',
                fontSize: '0.78rem', fontWeight: 700,
                cursor: saving ? 'default' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
                opacity: saving ? 0.6 : 1,
                boxShadow: saving ? 'none' : '0 1px 2px rgba(139,79,44,0.25)',
              }}
            >
              <Check size={12} /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <button
        onClick={onEdit}
        style={{
          marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 28, padding: '0 12px', borderRadius: 999,
          border: '1px dashed var(--outline-variant)',
          background: 'transparent', color: 'var(--on-surface-variant)',
          fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer',
          transition: 'background 0.15s, border 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.borderStyle = 'solid'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderStyle = 'dashed'; }}
      >
        <Plus size={11} /> Add your signature
      </button>
    );
  }

  return (
    <div style={{
      marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '5px 10px 5px 8px', borderRadius: 999,
        border: '1px solid var(--outline-variant)',
        background: 'var(--surface-container)',
        color: 'var(--on-surface)', fontSize: '0.74rem', fontWeight: 600,
        maxWidth: '100%', minWidth: 0,
      }}>
        <span style={{
          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
          background: '#8b4f2c18', color: '#8b4f2c',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Pencil size={9} />
        </span>
        <span style={{
          color: 'var(--on-surface-variant)', fontWeight: 500, fontSize: '0.68rem',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          Signature
        </span>
        <span style={{
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          maxWidth: 220,
        }}>
          {firstLine || '(empty)'}
          {preview.includes('\n') && <span style={{ opacity: 0.5 }}> · +{preview.split('\n').length - 1} line{preview.split('\n').length - 1 === 1 ? '' : 's'}</span>}
        </span>
      </div>
      <button
        onClick={onEdit}
        title="Edit signature"
        style={{
          height: 24, padding: '0 10px', borderRadius: 999,
          border: '1px solid transparent', background: 'transparent',
          color: 'var(--on-surface-variant)', fontSize: '0.7rem', fontWeight: 600,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#8b4f2c'; e.currentTarget.style.background = '#8b4f2c0f'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--on-surface-variant)'; e.currentTarget.style.background = 'transparent'; }}
      >
        Edit
      </button>
    </div>
  );
}

function StatusPicker({
  value, onChange,
}: {
  value: StatusKey;
  onChange: (next: StatusKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const current = STATUS_COLORS[value] ?? STATUS_COLORS.open;
  const options: StatusKey[] = ['open', 'in_progress', 'closed'];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px 4px 12px', borderRadius: 999,
          fontSize: '0.72rem', fontWeight: 700,
          border: '1px solid transparent',
          background: current.bg, color: current.color,
          cursor: 'pointer', outline: 'none',
          transition: 'filter 0.12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.96)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: current.color, opacity: 0.85,
        }} />
        {current.label}
        <ChevronDown size={11} style={{ opacity: 0.75, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 140,
          background: 'var(--surface)', border: '1px solid var(--outline-variant)',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 30,
        }}>
          {options.map(opt => {
            const sc = STATUS_COLORS[opt];
            const active = opt === value;
            return (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  border: 'none', background: active ? 'var(--surface-container)' : 'transparent',
                  color: 'var(--on-surface)', fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-container)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--surface-container)' : 'transparent'; }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: sc.color, flexShrink: 0,
                }} />
                <span style={{ flex: 1 }}>{sc.label}</span>
                {active && <Check size={12} style={{ color: '#8b4f2c' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InboundDebugModal({
  entries, loading, onRefresh, onClose,
}: {
  entries: DebugEntry[];
  loading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}) {
  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    const bucket = (e.decision === 'ok' || e.decision === 'ok-new') ? 'ok'
      : (e.decision === 'no-match' || e.decision === 'duplicate' || e.decision === 'ignored-non-event') ? 'dropped'
      : 'error';
    acc[bucket] = (acc[bucket] ?? 0) + 1;
    return acc;
  }, {});
  const ok = counts.ok ?? 0;
  const dropped = counts.dropped ?? 0;
  const errored = counts.error ?? 0;

  return (
    <div
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,15,25,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 105, padding: 16,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 820, maxHeight: '88vh',
        background: 'var(--surface)', border: '1px solid var(--outline-variant)',
        borderRadius: 20, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(15,15,25,0.28)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem 0.9rem', borderBottom: '1px solid var(--outline-variant)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: '#8b4f2c18', color: '#8b4f2c',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Activity size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.25 }}>
                Inbound webhook log
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--on-surface-variant)', lineHeight: 1.3, marginTop: 2 }}>
                Every call from Resend, newest first. Refresh after sending a test email.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refresh inbound log"
              title="Refresh"
              style={{
                width: 32, height: 32, padding: 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, border: '1px solid transparent',
                background: 'transparent', color: 'var(--on-surface-variant)',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.5 : 0.85, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; } }}
              onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.5' : '0.85'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <RefreshCw
                size={14}
                style={{ animation: loading ? 'spin 0.9s linear infinite' : 'none' }}
              />
            </button>
            <button
              onClick={onClose}
              aria-label="Close log"
              title="Close"
              style={{
                width: 32, height: 32, padding: 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, border: '1px solid transparent',
                background: 'transparent', color: 'var(--on-surface-variant)',
                cursor: 'pointer', opacity: 0.85, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--surface-container)'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Summary bar */}
        {entries.length > 0 && (
          <div style={{
            padding: '0.65rem 1.25rem', borderBottom: '1px solid var(--outline-variant)',
            background: 'var(--surface-container-low, var(--surface))',
            display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
            fontSize: '0.75rem',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ color: 'var(--on-surface)', fontWeight: 600 }}>{ok}</span>
              <span style={{ color: 'var(--on-surface-variant)' }}>accepted</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ color: 'var(--on-surface)', fontWeight: 600 }}>{dropped}</span>
              <span style={{ color: 'var(--on-surface-variant)' }}>dropped</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ color: 'var(--on-surface)', fontWeight: 600 }}>{errored}</span>
              <span style={{ color: 'var(--on-surface-variant)' }}>errored</span>
            </span>
            <span style={{ marginLeft: 'auto', color: 'var(--on-surface-variant)' }}>
              Last {entries.length} events
            </span>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
              Loading…
            </div>
          ) : entries.length === 0 ? (
            <div style={{
              padding: '3rem 1rem 2.5rem', textAlign: 'center', color: 'var(--on-surface-variant)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--surface-container)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--on-surface-variant)', opacity: 0.7,
              }}>
                <Activity size={24} />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                No webhook calls recorded yet.
              </div>
              <div style={{ fontSize: '0.82rem', maxWidth: 480, lineHeight: 1.55 }}>
                If you've sent a test email and nothing shows here, Resend isn't calling the webhook.
                Check the Resend dashboard → Inbound → Routes and confirm a route fires <code style={{
                  padding: '1px 5px', borderRadius: 4, background: 'var(--surface-container)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.78rem',
                }}>email.received</code> at <code style={{
                  padding: '1px 5px', borderRadius: 4, background: 'var(--surface-container)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.78rem',
                }}>/webhooks/resend/inbound</code>.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries.map(e => {
                const style = DECISION_STYLE[e.decision] ?? { bg: '#e5e7eb', color: '#374151', label: e.decision };
                return (
                  <div key={e.id} style={{
                    padding: '0.85rem 1rem', borderRadius: 14,
                    border: '1px solid var(--outline-variant)',
                    background: 'var(--surface-container-low, var(--surface-container))',
                    transition: 'border 0.12s, box-shadow 0.12s',
                  }}
                  onMouseEnter={el => { el.currentTarget.style.borderColor = 'rgba(139,79,44,0.25)'; }}
                  onMouseLeave={el => { el.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700,
                        background: style.bg, color: style.color,
                        letterSpacing: '0.03em',
                      }}>
                        {style.label}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                        {new Date(e.receivedAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.82rem', color: 'var(--on-surface)', marginBottom: 2,
                      display: 'flex', flexWrap: 'wrap', gap: 12,
                    }}>
                      <span>
                        <span style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>From </span>
                        <span style={{ fontWeight: 600 }}>{e.fromEmail ?? '—'}</span>
                      </span>
                      <span>
                        <span style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>To </span>
                        <span style={{ fontWeight: 600 }}>{e.toAddresses.length > 0 ? e.toAddresses.join(', ') : '—'}</span>
                      </span>
                    </div>
                    {e.subject && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>
                        <span style={{ fontWeight: 500 }}>Subject: </span>
                        <span style={{ color: 'var(--on-surface)' }}>{e.subject}</span>
                      </div>
                    )}
                    {e.reason && (
                      <div style={{
                        fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 6,
                        padding: '6px 10px', borderRadius: 8,
                        background: 'var(--surface-container)',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        lineHeight: 1.5, wordBreak: 'break-word',
                      }}>
                        {e.reason}
                      </div>
                    )}
                    {e.resendEmailId && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 6, opacity: 0.7 }}>
                        Resend id: <code style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{e.resendEmailId}</code>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
