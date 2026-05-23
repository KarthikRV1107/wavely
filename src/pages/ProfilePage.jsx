// src/pages/ProfilePage.jsx
import { useAuth }   from '../context/AuthContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { cache }     from '../utils/cache';
import LOGO          from '../utils/logoBase64';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { isDesktop }    = useBreakpoint();

  const handleClearCache = () => {
    cache.clear();
    alert('Cache cleared! The app will fetch fresh data on next load.');
  };

  const firstName = user?.displayName?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'User';

  return (
    <div style={{ maxWidth:600, padding: isDesktop ? '28px 0' : '20px' }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:isDesktop?32:26, fontWeight:800,
                   letterSpacing:'-0.02em', color:'var(--text1)', margin:'0 0 24px' }}>Profile</h1>

      {/* User card */}
      <div style={{
        display:'flex', alignItems:'center', gap:16, padding:20,
        background:'var(--bg2)', border:'1px solid var(--border)',
        borderRadius:20, marginBottom:20,
        animation:'fadeUp 0.3s var(--ease-out) both',
      }}>
        {user?.photoURL
          ? <img src={user.photoURL} alt="Avatar"
              style={{ width:64, height:64, borderRadius:'50%',
                       border:'2px solid var(--border2)', flexShrink:0 }}/>
          : <div style={{
              width:64, height:64, borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg, var(--accent), var(--pink))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:26, fontWeight:700, color:'#fff',
              boxShadow:'0 0 24px rgba(124,106,247,0.4)',
            }}>
              {(user?.displayName?.[0]||user?.email?.[0]||'?').toUpperCase()}
            </div>
        }
        <div>
          <p style={{ fontSize:20, fontWeight:700, color:'var(--text1)', margin:0,
                      fontFamily:'var(--font-display)' }}>
            {user?.displayName || firstName}
          </p>
          <p style={{ fontSize:13, color:'var(--text3)', margin:'2px 0 0' }}>{user?.email}</p>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)',
                          boxShadow:'0 0 8px var(--green)' }}/>
            <span style={{ fontSize:12, color:'var(--green)', fontWeight:500 }}>Active</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:40 }}>
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', color:'var(--text3)',
                    textTransform:'uppercase', margin:'0 0 6px' }}>Settings</p>
        <SettingsRow icon="🗑️" label="Clear cache"
          sub="Force fresh data from YouTube API"
          onClick={handleClearCache} />
        <SettingsRow icon="🚪" label="Sign out"
          sub="See you next time!"
          onClick={logout} danger />
      </div>

      {/* About */}
      <div style={{
        padding:'16px 20px', background:'var(--bg2)',
        border:'1px solid var(--border)', borderRadius:16,
        marginBottom:32,
      }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', color:'var(--text3)',
                    textTransform:'uppercase', margin:'0 0 12px' }}>About</p>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <img src={LOGO} alt="Wavely" style={{ width:32, height:32, objectFit:'contain' }}/>
          <div>
            <p style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700,
                        color:'var(--text1)', margin:0 }}>Wavely</p>
            <p style={{ fontSize:12, color:'var(--text3)', margin:'1px 0 0' }}>Music streaming app</p>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[
            ['Powered by', 'YouTube Data API v3'],
            ['Database',   'Firebase Firestore'],
            ['Framework',  'React 18'],
            ['Version',    '2.0.0'],
          ].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between',
                                   fontSize:12, padding:'4px 0',
                                   borderBottom:'1px solid var(--border)' }}>
              <span style={{ color:'var(--text3)' }}>{k}</span>
              <span style={{ color:'var(--text2)', fontWeight:500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer — "Wavely | Built by Karthik R V" */}
      <div style={{ textAlign:'center', paddingBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:6 }}>
          <img src={LOGO} alt="Wavely" style={{ width:18, height:18, objectFit:'contain', opacity:0.6 }}/>
          <span style={{
            fontSize:13, fontWeight:600, letterSpacing:'0.02em',
            background:'linear-gradient(135deg, var(--text2), var(--accent3))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>
            Wavely
          </span>
          <span style={{ color:'var(--text3)', fontSize:13 }}>|</span>
          <span style={{ fontSize:13, color:'var(--text2)' }}>
            Built by <span style={{ fontWeight:600, color:'var(--accent3)' }}>Karthik R V</span>
          </span>
        </div>
        <p style={{ fontSize:11, color:'var(--text3)', margin:0, letterSpacing:'0.03em' }}>
          Made with ❤️ · React + Firebase + YouTube API
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
    <span style={{ fontSize:22 }}>{icon}</span>
    <div>
      <p style={{ fontSize:14, fontWeight:500, margin:0,
                  color:danger?'var(--red)':'var(--text1)' }}>{label}</p>
      <p style={{ fontSize:12, color:'var(--text3)', margin:'2px 0 0' }}>{sub}</p>
    </div>
  </button>
);
