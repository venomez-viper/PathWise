import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Loader2 } from 'lucide-react';
import Logo from '../../components/ui/Logo';
import { publicApi } from '../../lib/api';
import ShareButton from '../../components/ShareButton';

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    publicApi.getProfile(slug)
      .then((res: any) => setProfile(res.profile))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const initials = profile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #09090b 0%, #18181b 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', marginBottom: '2.5rem' }}>
        <Logo variant="white" size={28} />
      </Link>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Loader2 size={32} color="#a1a1aa" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Not Found */}
      {!loading && notFound && (
        <div style={{
          textAlign: 'center',
          color: '#a1a1aa',
          marginTop: '6rem',
        }}>
          <p style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>404</p>
          <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>This profile doesn't exist or isn't public.</p>
          <Link to="/" style={{ color: '#6ee7b7', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to PathWise
          </Link>
        </div>
      )}

      {/* Profile Card */}
      {!loading && !notFound && profile && (
        <div style={{
          width: '100%',
          maxWidth: 520,
          background: '#ffffff',
          borderRadius: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}>
          {/* Top accent bar */}
          <div style={{
            height: 6,
            background: 'linear-gradient(90deg, #334042, #6ee7b7, #ff9f76)',
          }} />

          <div style={{ padding: '2.5rem 2rem 2rem' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #334042 0%, #6ee7b7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: 800,
                overflow: 'hidden',
                border: '4px solid #eefcfe',
              }}>
                {profile.avatarUrl?.trim()
                  ? <img src={profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  : initials
                }
              </div>
            </div>

            {/* Name */}
            <h1 style={{
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#09090b',
              letterSpacing: '-0.02em',
              margin: 0,
              fontFamily: 'var(--font-display, system-ui)',
            }}>
              {profile.name}
            </h1>

            {/* Headline */}
            {profile.headline && (
              <p style={{
                textAlign: 'center',
                fontSize: '0.95rem',
                color: '#52525b',
                marginTop: '0.35rem',
              }}>
                {profile.headline}
              </p>
            )}

            {/* Plan Badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
              <span style={{
                display: 'inline-block',
                padding: '3px 12px',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: profile.plan === 'premium' ? '#334042' : '#eefcfe',
                color: profile.plan === 'premium' ? '#fff' : '#334042',
              }}>
                {profile.plan === 'premium' ? 'Pro' : 'Free'}
              </span>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p style={{
                textAlign: 'center',
                fontSize: '0.9rem',
                color: '#3f3f46',
                lineHeight: 1.6,
                marginTop: '1.25rem',
                padding: '0 0.5rem',
              }}>
                {profile.bio}
              </p>
            )}

            {/* Member Since */}
            {memberSince && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: '1.25rem',
                color: '#a1a1aa',
                fontSize: '0.8rem',
              }}>
                <Calendar size={14} />
                <span>Member since {memberSince}</span>
              </div>
            )}

            {/* Share */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
              <ShareButton
                url={`https://pathwise.fit/u/${slug}`}
                title={`${profile.name} on PathWise`}
                text={`Check out ${profile.name}'s career profile on PathWise!`}
                variant="primary"
              />
            </div>

            {/* Divider */}
            <div style={{
              height: 1,
              background: '#f4f4f5',
              margin: '1.75rem 0',
            }} />

            {/* CTA */}
            <Link
              to="/signup"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.75rem 1.5rem',
                borderRadius: '999px',
                background: '#334042',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Join PathWise
            </Link>
          </div>
        </div>
      )}

      {/* Spin keyframes for loader */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
