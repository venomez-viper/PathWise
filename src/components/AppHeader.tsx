interface AppHeaderProps {
  userName?: string;
  avatarUrl?: string;
}

export default function AppHeader({ userName, avatarUrl }: AppHeaderProps) {
  const initials = userName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <header className="app-header">
      <div className="brand">
        <img src="/logo.svg" alt="PathWise Logo" />
        <span>PathWise</span>
      </div>
      <div className="avatar">
        {avatarUrl?.trim() ? (
          <img
            src={avatarUrl}
            alt="User Avatar"
            onError={(e) => {
              const img = e.currentTarget;
              const fallback = document.createElement('div');
              Object.assign(fallback.style, {
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: '700', fontSize: '0.75rem',
              });
              fallback.textContent = initials;
              img.replaceWith(fallback);
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.75rem',
          }}>
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
