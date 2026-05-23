// src/pages/ProfilePage.jsx
import { useAuth }   from '../context/AuthContext';
import { cache }     from '../utils/cache';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const handleClearCache = () => {
    cache.clear();
    alert('Cache cleared! Reload to fetch fresh data.');
  };

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'20px' }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800,
                   letterSpacing:'-0.02em', color:'var(--text1)', margin:'0 0 24px' }}>Profile</h1>

      {/* User card */}
      <div style={{
        display:'flex', alignItems:'center', gap:16, padding:20,
        background:'var(--bg2)', border:'1px solid var(--border)',
        borderRadius:20, marginBottom:20,
        animation:'fadeUp 0.3s var(--ease-out) both',
      }}>
        {user?.photoURL ? (
          <img src={user.photoURL} alt="Avatar"
            style={{ width:60, height:60, borderRadius:'50%', border:'2px solid var(--border2)' }}/>
        ) : (
          <div style={{
            width:60, height:60, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg, var(--accent), var(--pink))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:24, fontWeight:700, color:'#fff',
          }}>{(user?.displayName?.[0] || user?.email?.[0] || '?').toUpperCase()}</div>
        )}
        <div>
          <p style={{ fontSize:18, fontWeight:700, color:'var(--text1)', margin:0,
                      fontFamily:'var(--font-display)' }}>
            {user?.displayName || 'Music Lover'}
          </p>
          <p style={{ fontSize:13, color:'var(--text3)', margin:'2px 0 0' }}>{user?.email}</p>
        </div>
      </div>

      {/* Settings */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <SettingsRow icon="🗑️" label="Clear cache" sub="Force fresh data from YouTube"
          onClick={handleClearCache} />
        <SettingsRow icon="🚪" label="Sign out" sub="See you next time"
          onClick={logout} danger />
      </div>

      <div style={{ marginTop:40, textAlign:'center' }}>
        <p style={{ fontSize:11, color:'var(--text3)', letterSpacing:'0.05em' }}>
          WAVELY · BUILT WITH ❤️ AND REACT
        </p>
      </div>
    </div>
  );
}

const SettingsRow = ({ icon, label, sub, onClick, danger }) => (
  <button onClick={onClick} style={{
    display:'flex', alignItems:'center', gap:14, width:'100%',
    padding:'14px 18px', background:'var(--bg2)',
    border:'1px solid var(--border)', borderRadius:14,
    cursor:'pointer', textAlign:'left', transition:'all 0.18s',
  }}
    onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
    onMouseLeave={e => e.currentTarget.style.background='var(--bg2)'}
  >
    <span style={{ fontSize:20 }}>{icon}</span>
    <div>
      <p style={{ fontSize:14, fontWeight:500, margin:0,
                  color: danger ? 'var(--red)' : 'var(--text1)' }}>{label}</p>
      <p style={{ fontSize:12, color:'var(--text3)', margin:'2px 0 0' }}>{sub}</p>
    </div>
  </button>
);
