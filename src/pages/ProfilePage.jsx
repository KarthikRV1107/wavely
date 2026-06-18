// src/pages/ProfilePage.jsx
import { useAuth }       from '../context/AuthContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import LOGO              from '../utils/logoBase64';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { isDesktop }    = useBreakpoint();
  const firstName = (user?.displayName||user?.email||'').split(/[\s@]/)[0] || 'User';

  return (
    <div style={{ maxWidth:480, padding: isDesktop?'28px 0':'20px' }}>
      <h1 style={{
        fontFamily:'var(--font-display)', fontSize:isDesktop?30:24,
        fontWeight:800, letterSpacing:'-0.02em', color:'var(--text1)', margin:'0 0 20px',
      }}>Profile</h1>

      {/* User card */}
      <div style={{
        display:'flex', alignItems:'center', gap:14,
        padding:18, background:'var(--bg2)',
        border:'1px solid var(--border)', borderRadius:14,
        marginBottom:14,
      }}>
        {user?.photoURL
          ? <img src={user.photoURL} alt="avatar"
              style={{ width:56, height:56, borderRadius:'50%',
                       border:'2px solid var(--border2)', flexShrink:0 }}/>
          : <div style={{
              width:56, height:56, borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,var(--accent),var(--gold))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, fontWeight:700, color:'#fff',
            }}>
              {(user?.displayName?.[0]||user?.email?.[0]||'?').toUpperCase()}
            </div>
        }
        <div style={{ minWidth:0 }}>
          <p style={{ fontSize:17, fontWeight:700, color:'var(--text1)',
                      margin:0, fontFamily:'var(--font-display)',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {user?.displayName || firstName}
          </p>
          <p style={{ fontSize:12, color:'var(--text3)', margin:'3px 0 0',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {user?.email}
          </p>
        </div>
      </div>

      {/* Sign out */}
      <button onClick={logout} style={{
        display:'flex', alignItems:'center', gap:12, width:'100%',
        padding:'13px 16px', background:'var(--bg2)',
        border:'1px solid var(--border)', borderRadius:12,
        cursor:'pointer', textAlign:'left', marginBottom:48,
        transition:'background 0.15s', fontFamily:'inherit',
      }}
        onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'}
        onMouseLeave={e=>e.currentTarget.style.background='var(--bg2)'}
      >
        <div>
          <p style={{ fontSize:14, fontWeight:500, margin:0, color:'var(--red)' }}>Sign out</p>
          <p style={{ fontSize:11, color:'var(--text3)', margin:'1px 0 0' }}>See you next time</p>
        </div>
      </button>

      {/* Footer */}
      <div style={{ textAlign:'center', display:'flex', flexDirection:'column',
                    alignItems:'center', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <img src={LOGO} alt="Wavely"
            style={{ width:22, height:22, objectFit:'contain',
                     filter:'drop-shadow(0 0 8px rgba(var(--accent-rgb),0.38))' }}/>
          <span style={{ fontSize:14, fontWeight:700, color:'var(--text2)',
                         fontFamily:'var(--font-display)' }}>Wavely</span>
          <span style={{ color:'var(--text3)', fontSize:14 }}>|</span>
          <span style={{ fontSize:13, color:'var(--text3)' }}>
            Built by <strong style={{ color:'var(--accent3)', fontWeight:600 }}>Karthik R V</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
