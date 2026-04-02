import { useState, useEffect } from 'react';
import { Award, Plus, ExternalLink, Share2, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { certificates as certApi } from '../../lib/api';

export default function Certificates() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certs, setCerts] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', issuer: '', issuedDate: '', url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    certApi.get(user.id).then((res: any) => { setCerts(res.certificates ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const handleAdd = async () => {
    if (!user || !form.name.trim() || !form.issuer.trim()) return;
    setSaving(true);
    try {
      const res: any = await certApi.add({ userId: user.id, name: form.name.trim(), issuer: form.issuer.trim(), issuedDate: form.issuedDate || undefined, url: form.url || undefined });
      setCerts(prev => [res.certificate, ...prev]);
      setForm({ name: '', issuer: '', issuedDate: '', url: '' });
      setAdding(false);
    } catch {} finally { setSaving(false); }
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Loader2 size={28} color="#8b4f2c" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <h1 className="page-title">My Certificates</h1>
      <p className="page-subtitle">Your verified achievements and professional milestones.</p>

      {/* Add button */}
      <button onClick={() => setAdding(v => !v)} style={{
        width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-full)',
        background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
        color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: '1.5rem', marginBottom: '1.5rem',
      }}>
        <Plus size={18} /> Add Certificate
      </button>

      {/* Add form */}
      {adding && (
        <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="settings-input" placeholder="Certificate name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="settings-input" placeholder="Issuing organization" value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} />
            <input className="settings-input" placeholder="Issue date (e.g. Oct 2023)" value={form.issuedDate} onChange={e => setForm(f => ({ ...f, issuedDate: e.target.value }))} />
            <input className="settings-input" placeholder="Certificate URL (optional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-page-action" style={{ background: '#8b4f2c' }} disabled={saving || !form.name.trim() || !form.issuer.trim()} onClick={handleAdd}>
                {saving ? 'Saving...' : 'Save Certificate'}
              </button>
              <button className="btn-page-secondary" onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate list */}
      {certs.length === 0 && !adding ? (
        <div className="panel" style={{ borderRadius: '2rem', textAlign: 'center', padding: '3rem' }}>
          <Award size={32} color="var(--on-surface-variant)" style={{ opacity: 0.4, margin: '0 auto 8px' }} />
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>No certificates yet. Add your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {certs.map(c => (
            <div key={c.id} className="panel" style={{ borderRadius: '2rem', padding: '1.25rem', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--on-surface-variant)', textAlign: 'center', lineHeight: 1.1 }}>
                {c.issuer?.slice(0, 4)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>{c.name}</p>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-full)', background: c.verified ? 'rgba(0,106,98,0.08)' : 'var(--surface-container-low)', color: c.verified ? 'var(--secondary)' : 'var(--on-surface-variant)' }}>
                    {c.verified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                  {c.issuedDate ? `Issued ${c.issuedDate} · ` : ''}{c.issuer}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ExternalLink size={12} /> View Certificate
                    </a>
                  )}
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Share2 size={12} /> Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boost card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
        borderRadius: '2rem', padding: '1.5rem', marginTop: '1.5rem', color: '#fff',
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 800 }}>Boost your career credibility</h3>
        <p style={{ fontSize: '0.82rem', opacity: 0.7, lineHeight: 1.5, marginTop: 4 }}>
          Verified certificates increase your profile visibility to top mentors by 45%. Connect your LinkedIn to sync automatically.
        </p>
        <button style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', background: '#fff', color: 'var(--primary)', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
          Connect Profiles
        </button>
      </div>
    </div>
  );
}
