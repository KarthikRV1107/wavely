// src/components/Layout.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth }   from '../context/AuthContext';
import { useCurrentSong, useIsPlaying } from '../context/PlayerContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import LOGO from '../utils/logoBase64';

const NAV = [
  { path:'/',        label:'Home',    exact:true,
    icon:(a) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?'var(--accent2)':'var(--text3)'} strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> },
  { path:'/search',  label:'Search',
    icon:(a) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?'var(--accent2)':'var(--text3)'} strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { path:'/library', label:'Library',
    icon:(a) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?'var(--accent2)':'var(--text3)'} strokeWidth="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
  { path:'/profile', label:'Profile',
    icon:(a) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?'var(--accent2)':'var(--text3)'} strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

const active = (path, exact, pathname) => exact ? pathname===path : pathname.startsWith(path);

function Sidebar({ pathname }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentSong = useCurrentSong();
  const isPlaying   = useIsPlaying();

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src={LOGO} alt="Wavely"
            style={{ width:36, height:36, objectFit:'contain',
                     filter:"drop-shadow(0 0 12px rgba(124,106,247,0.5))" }}/>
          <span style={{
            fontFamily:'var(--font-display)', fontSize:20, fontWeight:800,
            letterSpacing:'-0.02em',
            background:'linear-gradient(135deg, var(--text1), var(--accent3))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>Wavely</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding:'12px', flex:1 }}>
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', color:'var(--text3)',
                    padding:'4px 10px 8px', textTransform:'uppercase' }}>Menu</p>
        {NAV.map(({ path, label, exact, icon }) => {
          const act = active(path, exact, pathname);
          return (
            <button key={path} onClick={() => navigate(path)} style={{
              display:'flex', alignItems:'center', gap:12, width:'100%',
              padding:'11px 14px', marginBottom:2,
              background: act ? 'rgba(124,106,247,0.12)' : 'transparent',
              border:`1px solid ${act ? 'rgba(124,106,247,0.2)' : 'transparent'}`,
              borderRadius:12, textAlign:'left', cursor:'pointer', transition:'all 0.18s',
            }}
              onMouseEnter={e => !act && (e.currentTarget.style.background='var(--bg3)')}
              onMouseLeave={e => !act && (e.currentTarget.style.background='transparent')}
            >
              {icon(act)}
              <span style={{ fontSize:14, fontWeight:act?600:400,
                             color:act?'var(--accent3)':'var(--text2)', transition:'color 0.18s' }}>
                {label}
              </span>
              {act && <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%',
                                    background:'var(--accent)', boxShadow:'0 0 8px var(--accent)' }}/>}
            </button>
          );
        })}
      </nav>

      {/* Now playing mini */}
      {currentSong && (
        <div style={{ margin:'0 12px 12px', padding:'12px 14px',
                      background:'rgba(124,106,247,0.08)',
                      border:'1px solid rgba(124,106,247,0.15)', borderRadius:14 }}>
          <p style={{ fontSize:10, color:'var(--accent3)', letterSpacing:'0.08em',
                      fontWeight:700, marginBottom:8 }}>NOW PLAYING</p>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src={currentSong.thumbnailUrl} alt={currentSong.title}
              style={{ width:38, height:38, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--text1)', margin:0,
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {currentSong.title}
              </p>
              <p style={{ fontSize:11, color:'var(--text3)', margin:'2px 0 0',
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {currentSong.channelName}
              </p>
            </div>
            {isPlaying && (
              <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:14, flexShrink:0 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    width:3, height:14, borderRadius:2, background:'var(--accent2)',
                    animation:`equalizer 0.8s ease-in-out infinite`,
                    animationDelay:`${i*0.15}s`, transformOrigin:'bottom',
                  }}/>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User */}
      <div style={{ padding:'12px', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                      borderRadius:12, background:'var(--bg3)', border:'1px solid var(--border)' }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="avatar"
                style={{ width:32, height:32, borderRadius:'50%', flexShrink:0 }}/>
            : <div style={{
                width:32, height:32, borderRadius:'50%', flexShrink:0,
                background:'linear-gradient(135deg, var(--accent), var(--pink))',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, fontWeight:700, color:'#fff',
              }}>{(user?.displayName?.[0]||user?.email?.[0]||'?').toUpperCase()}</div>
          }
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--text1)', margin:0,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {user?.displayName||user?.email?.split('@')[0]||'User'}
            </p>
          </div>
          <button onClick={logout} title="Sign out" style={{
            background:'none', border:'none', color:'var(--text3)',
            cursor:'pointer', padding:4, flexShrink:0, transition:'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color='var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ pathname }) {
  const navigate = useNavigate();
  return (
    <div className="bottom-nav" style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:90,
      background:'rgba(10,10,15,0.95)',
      backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
      borderTop:'1px solid var(--border)',
      height:'var(--nav-h)', display:'flex', alignItems:'stretch',
      paddingBottom:'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(({ path, label, exact, icon }) => {
        const act = active(path, exact, pathname);
        return (
          <button key={path} onClick={() => navigate(path)} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', gap:4, background:'none', border:'none',
            position:'relative', cursor:'pointer',
          }}>
            <div style={{
              width:44, height:28, display:'flex', alignItems:'center', justifyContent:'center',
              borderRadius:10, transition:'background 0.18s',
              background: act ? 'rgba(124,106,247,0.15)' : 'transparent',
            }}>{icon(act)}</div>
            <span style={{
              fontSize:10, fontWeight:act?600:400, letterSpacing:'0.02em',
              color:act?'var(--accent3)':'var(--text3)', transition:'color 0.18s',
            }}>{label}</span>
            {act && <div style={{
              position:'absolute', top:6, width:4, height:4, borderRadius:'50%',
              background:'var(--accent)', boxShadow:'0 0 8px var(--accent)',
            }}/>}
          </button>
        );
      })}
    </div>
  );
}

export default function Layout({ children }) {
  const { pathname }  = useLocation();
  const currentSong = useCurrentSong();
  const { isDesktop } = useBreakpoint();

  const bottomPad = currentSong
    ? isDesktop ? 'calc(var(--player-h) + 24px)' : 'calc(var(--player-h) + var(--nav-h) + 8px)'
    : isDesktop ? '24px' : 'var(--nav-h)';

  return (
    <div className="app-shell">
      <Sidebar pathname={pathname} />
      <main className="app-main" style={{ paddingBottom:bottomPad, minHeight:'100vh', transition:'padding-bottom 0.3s' }}>
        {isDesktop && (
          <div style={{
            position:'sticky', top:0, zIndex:30, height:52,
            background:'rgba(10,10,15,0.85)',
            backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            borderBottom:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0 32px',
          }}>
            <span style={{ fontSize:13, color:'var(--text3)' }}>
              {NAV.find(n => active(n.path, n.exact, pathname))?.label || ''}
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px',
                          borderRadius:20, background:'rgba(124,106,247,0.08)',
                          border:'1px solid rgba(124,106,247,0.15)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="var(--accent2)" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <span style={{ fontSize:11, color:'var(--accent2)', fontWeight:500 }}>Desktop</span>
            </div>
          </div>
        )}
        <div style={{
          maxWidth: isDesktop ? 'var(--content-max)' : '100%',
          margin: isDesktop ? '0 auto' : '0',
          padding: isDesktop ? '0 32px' : '0',
        }}>
          {children}
        </div>
      </main>
      <BottomNav pathname={pathname} />
    </div>
  );
}
