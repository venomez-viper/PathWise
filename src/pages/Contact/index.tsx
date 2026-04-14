import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, Send, ArrowLeft } from 'lucide-react';
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
      <section style={{ padding: '0', background: 'var(--surface)' }}>
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', paddingTop: 'calc(72px + 2rem)', paddingBottom: '4rem' }}>

          {/* Back link */}
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)',
              textDecoration: 'none', marginBottom: '2rem',
            }}
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>

            {/* Left — Info */}
            <div style={{ flex: '1 1 320px', maxWidth: 420 }}>
              <div style={{
                display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)',
                background: 'var(--primary-fixed)', padding: '4px 14px',
                borderRadius: 'var(--radius-full)', marginBottom: 'var(--spacing-4)',
              }}>
                Get in Touch
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 5vw, 3rem)',
                fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.03em',
                lineHeight: 1.1, marginBottom: '1rem',
              }}>
                Contact Us
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
                Have a question, feedback, or partnership opportunity? We'd love to hear from you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <ContactDetail icon={Mail} label="Email" value="support@pathwise.fit" href="mailto:support@pathwise.fit" />
                <ContactDetail icon={Globe} label="Website" value="pathwise.fit" href="https://pathwise.fit" />
              </div>

              {/* Response time badge */}
              <div style={{
                marginTop: '2rem', padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, rgba(98, 69, 164, 0.04) 0%, rgba(0, 106, 98, 0.03) 100%)',
                borderRadius: 'var(--radius-lg)', fontSize: '0.85rem',
                color: 'var(--on-surface-variant)', lineHeight: 1.6,
              }}>
                We typically respond within <strong style={{ color: 'var(--on-surface)' }}>24 hours</strong>. For urgent matters, include "Urgent" in your subject line.
              </div>
            </div>

            {/* Right — Form */}
            <div style={{
              flex: '1 1 440px', maxWidth: 560,
              background: 'var(--surface-container-lowest)',
              borderRadius: 'var(--radius-2xl)', padding: '2.5rem',
              boxShadow: 'var(--shadow-md)',
            }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'var(--primary-fixed)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
                  }}>
                    <Send size={24} color="var(--primary)" />
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>
                    Message Sent
                  </h2>
                  <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem', lineHeight: 1.6 }}>
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
                    color: '#fff', border: 'none', borderRadius: 'var(--radius-full)',
                    fontSize: '0.95rem', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s',
                    opacity: sending ? 0.7 : 1,
                    boxShadow: 'var(--shadow-sm)',
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
  fontSize: '0.72rem', fontWeight: 700, color: 'var(--on-surface-variant)',
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
        width: 44, height: 44, borderRadius: '50%',
        background: 'var(--primary-fixed)',
        color: 'var(--primary)',
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-muted)' }}>{label}</div>
        <a href={href} style={{ fontSize: '0.95rem', color: 'var(--on-surface)', fontWeight: 600, textDecoration: 'none' }}>{value}</a>
      </div>
    </div>
  );
}
