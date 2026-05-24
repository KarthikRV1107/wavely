// src/pages/ProfilePage.jsx — clean, minimal
import { useAuth }      from '../context/AuthContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import LOGO             from '../utils/logoBase64';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { isDesktop }    = useBreakpoint();

  const firstName = user?.displayName?.split(' ')[0]
    || user?.email?.split('@')[0] || 'User';

  return (
    <div style={{ maxWidth: 500, padding: isDesktop ? '28px 0' : '20px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: isDesktop ? 32 : 26,
        fontWeight: 800, letterSpacing: '-0.02em',
        color: 'var(--text1)', margin: '0 0 24px',
      }}>Profile</h1>

      {/* User card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: 20, background: 'var(--bg2)',
        border: '1px solid var(--border)', borderRadius: 16,
        marginBottom: 16, animation: 'fadeUp 0.3s var(--ease-out) both',
      }}>
        {user?.photoURL
          ? <img src={user.photoURL} alt="avatar"
              style={{ width: 60, height: 60, borderRadius: '50%',
                       border: '2px solid var(--border2)', flexShrink: 0 }}/>
          : <div style={{
              width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--pink))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff',
            }}>
              {(user?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
        }
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text1)',
                      margin: 0, fontFamily: 'var(--font-display)' }}>
            {user?.displayName || firstName}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '3px 0 0' }}>
            {user?.email}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 48 }}>
        <Row icon="🚪" label="Sign out" sub="See you next time" onClick={logout} danger />
      </div>

      {/* Footer — only Wavely | Built by Karthik R V */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>
          Wavely{' '}
          <span style={{ color: 'var(--text3)', margin: '0 6px' }}>|</span>
          {' '}Built by{' '}
          <span style={{ color: 'var(--accent3)', fontWeight: 600 }}>Karthik R V</span>
        </p>
      </div>
    </div>
  );
}

const Row = ({ icon, label, sub, onClick, danger }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 14,
    width: '100%', padding: '14px 18px',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 12, cursor: 'pointer', textAlign: 'left',
    transition: 'background 0.15s',
  }}
    onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
    onMouseLeave={e => e.currentTarget.style.background='var(--bg2)'}
  >
    <span style={{ fontSize: 20 }}>{icon}</span>
    <div>
      <p style={{ fontSize: 14, fontWeight: 500, margin: 0,
                  color: danger ? 'var(--red)' : 'var(--text1)' }}>{label}</p>
      <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0' }}>{sub}</p>
    </div>
  </button>
);
