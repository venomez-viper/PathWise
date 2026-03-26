interface AppHeaderProps {
  userName?: string;
  avatarUrl?: string;
}

export default function AppHeader({ avatarUrl }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <img src="/logo.png" alt="PathWise Logo" />
        <span>PathWise</span>
      </div>
      <div className="avatar">
        <img
          src={avatarUrl ?? 'https://i.pravatar.cc/150?u=pathwise'}
          alt="User Avatar"
        />
      </div>
    </header>
  );
}
