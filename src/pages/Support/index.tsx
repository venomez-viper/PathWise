import { useState } from 'react';
import { Mail, Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tickets as ticketsApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Panda } from '../../components/panda';

export default function SupportPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim() || form.message.length < 10) {
      setError('Please write at least 10 characters.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await ticketsApi.submit({
        name: user?.name ?? 'User',
        email: user?.email ?? '',
        subject: form.subject || undefined,
        message: form.message,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/app/help" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--on-surface-variant)', textDecoration: 'none', fontWeight: 600, marginBottom: '0.75rem' }}>
          <ArrowLeft size={14} /> Back to Help
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="page-title">Contact Support</h1>
          <Panda mood="curious" size={80} animate />
        </div>
        <p className="page-subtitle">We typically respond within 24 hours.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Form */}
        <div className="panel" style={{ borderRadius: '2rem', padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Send size={36} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--on-surface)' }}>
                Message sent
              </h2>
              <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                We've received your message and will get back to you at {user?.email} within 24 hours.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ subject: '', message: '' }); }}
                style={{ marginTop: '1.5rem', background: 'none', border: '1px solid var(--surface-container-high)', borderRadius: 'var(--radius-full)', padding: '8px 20px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)', cursor: 'pointer' }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 4, display: 'block' }}>
                  From
                </label>
                <div style={{ padding: '0.65rem 1rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--on-surface-variant)' }}>
                  {user?.name} ({user?.email})
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 4, display: 'block' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="What do you need help with?"
                  className="settings-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 4, display: 'block' }}>
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your issue or question in detail..."
                  rows={6}
                  required
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    background: 'var(--surface-container-low)',
                    border: '1px solid var(--surface-container-high)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem', color: 'var(--on-surface)',
                    fontFamily: 'var(--font-body)', resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>

              {error && <p style={{ fontSize: '0.82rem', color: '#ef4444' }}>{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="btn-page-action"
                style={{ alignSelf: 'flex-start', background: '#8b4f2c', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {sending ? 'Sending...' : <><Send size={14} /> Send Message</>}
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(98,69,164,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={16} color="var(--primary)" />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>Email</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>support@pathwise.fit</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(98,69,164,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={16} color="var(--primary)" />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>Response Time</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Within 24 hours</p>
              </div>
            </div>
          </div>

          <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem 2rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>
              Common topics
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Account issues', 'Assessment questions', 'Roadmap help', 'Billing and plans', 'Bug reports', 'Feature requests'].map(topic => (
                <li key={topic} style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', padding: '4px 0' }}>
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
