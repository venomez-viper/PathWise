import { useState } from 'react';
import { Mail, Globe, Send } from 'lucide-react';
import Footer from '../../components/Footer';
import { tickets as ticketsApi } from '../../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) return;
    setSending(true);
    try {
      await ticketsApi.submit({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        subject: form.subject || undefined,
        message: form.message,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section style={{ padding: '8rem 0 4rem', background: 'var(--surface)' }}>
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>

            {/* Left — Info */}
            <div style={{ flex: '1 1 320px', maxWidth: 400 }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.03em',
                lineHeight: 1.1, marginBottom: '1rem',
              }}>
                Contact Us
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', lineHeight: 1.7, marginBottom: '3rem' }}>
                Have a question, feedback, or partnership opportunity? We'd love to hear from you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <ContactDetail icon={Mail} label="Email" value="support@pathwise.fit" href="mailto:support@pathwise.fit" />
                <ContactDetail icon={Globe} label="Website" value="pathwise.fit" href="https://pathwise.fit" />
              </div>
            </div>

            {/* Right — Form */}
            <div style={{
              flex: '1 1 440px', maxWidth: 560,
              background: 'var(--surface-container-lowest)',
              borderRadius: '1.5rem', padding: '2.5rem',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--surface-container-high)',
            }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <Send size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>
                    Message Sent
                  </h2>
                  <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
                    Thanks for reaching out. We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <FormField label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="John" />
                    <FormField label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="Doe" />
                  </div>
                  <FormField label="Email" value={form.email} onChange={set('email')} placeholder="john@example.com" type="email" required />
                  <FormField label="Subject" value={form.subject} onChange={set('subject')} placeholder="How can we help?" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={labelStyle}>Message</label>
                    <textarea
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Tell us more..."
                      required
                      rows={5}
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: 120,
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>
                  {error && (
                    <div style={{
                      padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                      background: '#fee2e2', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600,
                    }}>
                      {error}
                    </div>
                  )}
                  <button type="submit" disabled={sending} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '0.9rem',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
                    color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)',
                    fontSize: '0.95rem', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.15s', opacity: sending ? 0.7 : 1,
                  }}>
                    {sending ? 'Sending...' : <><Send size={16} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 700, color: 'var(--on-surface-variant)',
  letterSpacing: '0.04em', textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem',
  background: 'var(--surface-container-low)',
  border: '1px solid var(--surface-container-high)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.9rem', color: 'var(--on-surface)',
  outline: 'none', fontFamily: 'var(--font-body)',
};

function FormField({ label, value, onChange, placeholder, type = 'text', required = false }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; type?: string; required?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  );
}

function ContactDetail({ icon: Icon, label, value, href }: {
  icon: typeof Mail; label: string; value: string; href: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 44, height: 44, borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-container-low)',
        color: 'var(--primary)',
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>{label}</div>
        <a href={href} style={{ fontSize: '0.95rem', color: 'var(--on-surface)', fontWeight: 600, textDecoration: 'none' }}>{value}</a>
      </div>
    </div>
  );
}
