import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TicketInbox } from '../Admin/TicketInbox';
import { getMyAccess } from '../../lib/api';
import { Panda } from '../../components/panda';

type Access = { isAdmin: boolean; isSupportAgent: boolean; canAccessTickets: boolean };

export default function SupportInboxPage() {
  const [state, setState] = useState<'loading' | 'ok' | 'denied'>('loading');
  const [access, setAccess] = useState<Access | null>(null);

  useEffect(() => {
    let alive = true;
    getMyAccess()
      .then(res => {
        if (!alive) return;
        setAccess(res);
        setState(res.canAccessTickets ? 'ok' : 'denied');
      })
      .catch(() => { if (alive) setState('denied'); });
    return () => { alive = false; };
  }, []);

  if (state === 'loading') {
    return (
      <div className="page" style={{ padding: '2rem', color: 'var(--on-surface-variant)' }}>
        Checking access…
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="page" style={{
        padding: '3rem 2rem', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <Panda mood="confused" size={120} />
        <h2 style={{ color: 'var(--on-surface)', margin: 0 }}>No inbox access</h2>
        <p style={{ color: 'var(--on-surface-variant)', maxWidth: 420, margin: 0 }}>
          This page is for the PathWise support team. If you think you should have access,
          ask an admin to add you from the Admin Console → Team tab.
        </p>
        <Link to="/app" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Support Inbox</h1>
        {access?.isSupportAgent && !access.isAdmin && (
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', padding: '3px 10px', borderRadius: 999,
            background: '#dbeafe', color: '#1e3a8a',
          }}>
            Support Agent
          </span>
        )}
      </div>
      <TicketInbox />
    </div>
  );
}
