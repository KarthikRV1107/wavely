// src/components/Layout.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

const NavIcon = ({ path, active, children, label, onClick }) => {
  const navigate = useNavigate();
  return (
    <button onClick={onClick || (() => navigate(path))} style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 4, padding: '8px 4px 10px', background: 'none', border: 'none',
      position: 'relative', transition: 'all 0.2s',
    }}>
      <div style={{
        width: 40, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 10, transition: 'all 0.2s',
        background: active ? 'rgba(124,106,247,0.15)' : 'transparent',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={active ? 'var(--accent2)' : 'var(--text3)'} strokeWidth="1.8"
          style={{ transition: 'stroke 0.2s' }}>
          {children}
        </svg>
      </div>
      <span style={{
        fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: '0.03em',
        color: active ? 'var(--accent3)' : 'var(--text3)', transition: 'color 0.2s',
      }}>{label}</span>
      {active && (
        <div style={{
          position: 'absolute', top: 6, width: 4, height: 4,
          borderRadius: '50%', background: 'var(--accent)',
          boxShadow: '0 0 8px var(--accent)',
        }}/>
      )}
    </button>
  );
};

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const { currentSong } = usePlayer();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      background: 'var(--bg)',
    }}>
      <main style={{
        flex: 1,
        paddingBottom: currentSong
          ? `calc(var(--player-h) + var(--nav-h) + 8px)`
          : 'var(--nav-h)',
        overflowX: 'hidden',
      }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border)',
        height: 'var(--nav-h)',
        display: 'flex', alignItems: 'stretch',
        maxWidth: '100vw',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <NavIcon path="/"        label="Home"    active={pathname === '/'}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </NavIcon>
        <NavIcon path="/search"  label="Search"  active={pathname === '/search'}>
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </NavIcon>
        <NavIcon path="/library" label="Library" active={pathname === '/library'}>
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </NavIcon>
        <NavIcon path="/profile" label="Profile" active={pathname === '/profile'}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </NavIcon>
      </div>
    </div>
  );
}
