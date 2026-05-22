// src/components/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#fff' : '#b3b3b3'}>
    <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33z"/>
  </svg>
);
const SearchIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#fff' : '#b3b3b3'}>
    <path d="M10.533 1.279c-5.18 0-9.407 4.927-9.407 9.808 0 4.798 3.898 8.673 9.407 8.673 1.88 0 3.619-.56 5.081-1.554l4.637 5.47 1.54-1.361-4.638-5.48a8.979 8.979 0 0 0 2.188-5.748c0-4.881-4.227-9.808-8.808-9.808zm-7.407 9.808c0-4.07 3.427-7.808 7.407-7.808s7.407 3.738 7.407 7.808c0 4.007-3.427 7.208-7.407 7.208-3.98 0-7.407-3.201-7.407-7.208z"/>
  </svg>
);
const LibraryIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#fff' : '#b3b3b3'}>
    <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
    <path d="M11.75 8a.75.75 0 0 1-.75.75H8.75V11a.75.75 0 0 1-1.5 0V8.75H5a.75.75 0 0 1 0-1.5h2.25V5a.75.75 0 0 1 1.5 0v2.25H11a.75.75 0 0 1 .75.75z"/>
  </svg>
);

const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout } = useAuth();
  const path      = location.pathname;

  const navItem = (to, label, Icon) => {
    const active = path === to;
    return (
      <button onClick={() => navigate(to)} style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '8px 12px', width: '100%', background: 'none',
        border: 'none', cursor: 'pointer', borderRadius: 4,
        transition: 'background 0.1s',
        color: active ? '#fff' : '#b3b3b3',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <Icon active={active} />
        <span style={{ fontSize: 14, fontWeight: active ? 700 : 400 }}>{label}</span>
      </button>
    );
  };

  return (
    <div style={{
      width: 240, flexShrink: 0, display: 'flex',
      flexDirection: 'column', gap: 8, height: '100%',
    }}>
      {/* Logo + nav */}
      <div style={{ background: '#121212', borderRadius: 8, padding: '16px 12px' }}>
        {/* Spotify-style wordmark */}
        <div onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 20, cursor: 'pointer', padding: '0 12px',
        }}>
          <svg width="32" height="32" viewBox="0 0 168 168">
            <path fill="#1DB954" d="M84 0C37.6 0 0 37.6 0 84s37.6 84 84 84 84-37.6 84-84S130.4 0 84 0zm38.6 121.2c-1.5 2.5-4.8 3.3-7.3 1.8-20-12.2-45.2-15-74.9-8.2-2.9.7-5.7-1.1-6.4-4-.7-2.9 1.1-5.7 4-6.4 32.5-7.4 60.4-4.2 82.9 9.5 2.5 1.5 3.3 4.8 1.7 7.3zm10.3-22.9c-1.9 3.1-6 4-9.1 2.1-22.9-14.1-57.8-18.1-84.9-9.9-3.5 1.1-7.2-.9-8.3-4.4-1.1-3.5.9-7.2 4.4-8.3 30.9-9.4 69.3-4.9 95.7 11.4 3.1 1.9 4 6 1.7 9.1l.5-.0zm.9-23.9C108.4 57.5 63.3 56 38.1 63.9c-4.1 1.3-8.5-1-9.8-5.1-1.3-4.1 1-8.5 5.1-9.8 29-8.9 77.2-7.2 107.6 11.3 3.7 2.2 4.9 7 2.7 10.7-2.2 3.7-7 4.9-10.7 2.7l-.2-.3z"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Wavely</span>
        </div>

        {navItem('/',        'Home',    HomeIcon)}
        {navItem('/search',  'Search',  SearchIcon)}
      </div>

      {/* Library */}
      <div style={{
        background: '#121212', borderRadius: 8,
        flex: 1, padding: '8px 12px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', padding: '8px 12px 12px' }}>
          <button onClick={() => navigate('/library')} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'none', border: 'none', cursor: 'pointer', color: '#b3b3b3',
            padding: 0,
          }}>
            <LibraryIcon active={path === '/library'} />
            <span style={{ fontSize: 14, fontWeight: 700,
                           color: path === '/library' ? '#fff' : '#b3b3b3' }}>
              Your Library
            </span>
          </button>
          <button onClick={() => navigate('/library')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#b3b3b3', padding: 4, borderRadius: '50%',
            display: 'flex', alignItems: 'center',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
          >
            <PlusIcon />
          </button>
        </div>

        {/* Create playlist prompt */}
        <div style={{
          background: '#242424', borderRadius: 8, padding: '16px',
          margin: '0 4px',
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
            Create your first playlist
          </p>
          <p style={{ fontSize: 12, color: '#b3b3b3', margin: '0 0 12px' }}>
            It's easy, we'll help you
          </p>
          <button onClick={() => navigate('/library')} style={{
            padding: '8px 16px', background: '#fff', color: '#000',
            border: 'none', borderRadius: 20, fontSize: 13,
            fontWeight: 700, cursor: 'pointer',
          }}>Create playlist</button>
        </div>

        {/* Sign out */}
        <button onClick={logout} style={{
          marginTop: 'auto', padding: '8px 12px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#b3b3b3', fontSize: 13, textAlign: 'left',
          borderRadius: 4,
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
