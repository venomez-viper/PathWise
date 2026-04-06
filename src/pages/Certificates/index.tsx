import { useState, useEffect } from 'react';
import { Award, Plus, ExternalLink, Share2, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { certificates as certApi } from '../../lib/api';
import './Certificates.css';

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
      const res: any = await certApi.add({
        userId: user.id,
        name: form.name.trim(),
        issuer: form.issuer.trim(),
        issuedDate: form.issuedDate || undefined,
        url: form.url || undefined,
      });
      setCerts(prev => [res.certificate, ...prev]);
      setForm({ name: '', issuer: '', issuedDate: '', url: '' });
      setAdding(false);
    } catch {} finally { setSaving(false); }
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Loader2 size={28} color="var(--secondary)" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="page certs">
      <div className="certs__header">
        <h1 className="certs__title">My Certificates</h1>
        <p className="certs__subtitle">Your verified achievements and professional milestones.</p>
      </div>

      {/* Add button */}
      <button className="certs__add-btn" onClick={() => setAdding(v => !v)}>
        <Plus size={18} /> Add Certificate
      </button>

      {/* Add form */}
      {adding && (
        <div className="certs__form">
          <div className="certs__form-fields">
            <input className="certs__input" placeholder="Certificate name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="certs__input" placeholder="Issuing organization" value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} />
            <input className="certs__input" placeholder="Issue date (e.g. Oct 2023)" value={form.issuedDate} onChange={e => setForm(f => ({ ...f, issuedDate: e.target.value }))} />
            <input className="certs__input" placeholder="Certificate URL (optional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <div className="certs__form-actions">
              <button className="certs__save-btn" disabled={saving || !form.name.trim() || !form.issuer.trim()} onClick={handleAdd}>
                {saving ? 'Saving...' : 'Save Certificate'}
              </button>
              <button className="certs__cancel-btn" onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate list */}
      {certs.length === 0 && !adding ? (
        <div className="certs__empty">
          <Award size={32} color="var(--on-surface-variant)" className="certs__empty-icon" />
          <p className="certs__empty-text">No certificates yet. Add your first one!</p>
        </div>
      ) : (
        <div className="certs__list">
          {certs.map(c => (
            <div key={c.id} className="certs__card">
              <div className="certs__issuer-badge">
                {c.issuer?.slice(0, 4)}
              </div>
              <div className="certs__card-body">
                <div className="certs__card-top">
                  <span className="certs__card-name">{c.name}</span>
                  <span className={`certs__badge ${c.verified ? 'certs__badge--verified' : 'certs__badge--pending'}`}>
                    {c.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <p className="certs__card-meta">
                  {c.issuedDate ? `Issued ${c.issuedDate} · ` : ''}{c.issuer}
                </p>
                <div className="certs__card-actions">
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noreferrer" className="certs__card-link">
                      <ExternalLink size={12} /> View Certificate
                    </a>
                  )}
                  <button className="certs__share-btn">
                    <Share2 size={12} /> Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Promo card */}
      <div className="certs__promo">
        <h3 className="certs__promo-title">Boost your career credibility</h3>
        <p className="certs__promo-text">
          Verified certificates increase your profile visibility to top mentors by 45%. Connect your LinkedIn to sync automatically.
        </p>
        <button className="certs__promo-btn">Connect Profiles</button>
      </div>
    </div>
  );
}
