// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LOGO from '../utils/logoBase64';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const onSuccess = () => navigate('/', { replace: true });

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    try { await loginWithGoogle(); onSuccess(); }
    catch (e) {
      setError(
        e.code === 'auth/unauthorized-domain'
          ? 'Add your domain to Firebase → Auth → Authorized Domains.'
          : 'Google sign-in failed. Try again.'
      );
    }
    finally { setLoading(false); }
  };

  const handleEmail = async () => {
    if (!email.trim() || !password) return;
    setLoading(true); setError(null);
    try {
      mode === 'login'
        ? await loginWithEmail(email, password)
        : await registerWithEmail(email, password);
      onSuccess();
    } catch (e) {
      const map = {
        'auth/user-not-found':       'No account found with that email.',
        'auth/wrong-password':       'Incorrect password.',
        'auth/invalid-credential':   'Incorrect email or password.',
        'auth/email-already-in-use': 'Email already registered.',
        'auth/weak-password':        'Password must be at least 6 characters.',
        'auth/invalid-email':        'Please enter a valid email.',
        'auth/too-many-requests':    'Too many attempts. Please wait.',
      };
      setError(map[e.code] ?? `Error: ${e.code}`);
    }
    finally { setLoading(false); }
  };

  const inp = {
    width:'100%', padding:'13px 16px',
    background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:12, fontSize:14, color:'var(--text1)',
    outline:'none', boxSizing:'border-box', transition:'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', background:'var(--bg)',
      position:'relative', overflow:'hidden',
    }}>
      {/* ── Animated ambient blobs ── */}
      {[
        { top:'-15%', left:'5%',   size:700, color:'rgba(124,106,247,0.12)', delay:'0s'  },
        { top:'50%',  right:'-5%', size:500, color:'rgba(244,114,182,0.08)', delay:'2s'  },
        { top:'30%',  left:'40%',  size:400, color:'rgba(45,212,191,0.06)',  delay:'4s'  },
      ].map((b,i) => (
        <div key={i} style={{
          position:'absolute', borderRadius:'50%', pointerEvents:'none',
          top:b.top, left:b.left, right:b.right,
          width:b.size, height:b.size,
          background:`radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
          animation:`float 10s ease-in-out ${b.delay} infinite alternate`,
        }}/>
      ))}

      {/* ── Left panel — branding (hidden on small screens via media-like logic) ── */}
      <div style={{
        flex:'1', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'48px', position:'relative', zIndex:1,
        // Hide on narrow screens
        minWidth:0,
      }}>
        <div style={{ maxWidth:420, textAlign:'center' }}>
          {/* Big logo */}
          <img src={LOGO} alt="Wavely logo"
            style={{
              width:140, height:140, objectFit:'contain',
              marginBottom:28,
              filter:'drop-shadow(0 0 60px rgba(124,106,247,0.5))',
              animation:'float 6s ease-in-out infinite',
            }}
          />
          <h1 style={{
            fontFamily:'var(--font-display)', fontSize:52, fontWeight:800,
            letterSpacing:'-0.04em', margin:'0 0 16px', lineHeight:1,
            background:'linear-gradient(135deg, var(--text1) 0%, var(--accent3) 50%, var(--pink) 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>Wavely</h1>
          <p style={{ fontSize:17, color:'var(--text2)', lineHeight:1.6, margin:0 }}>
            Your music universe.<br/>
            Stream anything, anywhere.
          </p>

          {/* Feature pills */}
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginTop:28 }}>
            {['🎵 YouTube powered','❤️ Like & save','📋 Playlists','🎛️ Smart player'].map(f => (
              <span key={f} style={{
                padding:'6px 14px', borderRadius:20,
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)',
                fontSize:12, color:'var(--text3)',
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — auth form ── */}
      <div style={{
        width:'100%', maxWidth:440,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'32px 24px', position:'relative', zIndex:1,
        background:'rgba(10,10,15,0.6)',
        backdropFilter:'blur(40px)',
        WebkitBackdropFilter:'blur(40px)',
        borderLeft:'1px solid var(--border)',
      }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          {/* Small logo + name at top of form */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}>
            <img src={LOGO} alt="Wavely"
              style={{
                width:44, height:44, objectFit:'contain',
                filter:'drop-shadow(0 0 16px rgba(124,106,247,0.6))',
              }}
            />
            <div>
              <h2 style={{
                fontFamily:'var(--font-display)', fontSize:22, fontWeight:800,
                letterSpacing:'-0.02em', margin:0,
                background:'linear-gradient(135deg, var(--text1), var(--accent3))',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>Wavely</h2>
              <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>
                {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding:'11px 14px', marginBottom:18,
              background:'rgba(248,113,113,0.1)',
              border:'1px solid rgba(248,113,113,0.25)',
              borderRadius:10, fontSize:13, color:'var(--red)',
              animation:'fadeIn 0.2s ease',
            }}>{error}</div>
          )}

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} style={{
            width:'100%', padding:'13px',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            background:'rgba(255,255,255,0.05)',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:12, fontSize:14, fontWeight:500,
            color:'var(--text1)', cursor:loading?'not-allowed':'pointer',
            transition:'all 0.18s', marginBottom:20,
          }}
            onMouseEnter={e => { if(!loading) e.currentTarget.style.background='rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }}/>
            <span style={{ fontSize:12, color:'var(--text3)', letterSpacing:'0.06em' }}>OR</span>
            <div style={{ flex:1, height:1, background:'var(--border)' }}/>
          </div>

          {/* Email + password */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
            <input type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleEmail()}
              disabled={loading} style={inp}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
            />
            <input type="password" placeholder="Password (min 6 characters)" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleEmail()}
              disabled={loading} style={inp}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
            />
          </div>

          <button onClick={handleEmail} disabled={!email.trim()||!password||loading} style={{
            width:'100%', padding:'13px', marginBottom:20,
            background: email&&password&&!loading
              ? 'linear-gradient(135deg, var(--accent), #5b4fcf)'
              : 'var(--bg4)',
            border:'none', borderRadius:12, fontSize:14, fontWeight:600,
            color: email&&password&&!loading ? '#fff' : 'var(--text3)',
            cursor: email&&password&&!loading ? 'pointer' : 'not-allowed',
            transition:'all 0.18s',
            boxShadow: email&&password&&!loading ? '0 4px 24px rgba(124,106,247,0.35)' : 'none',
          }}>
            {loading ? 'Please wait…' : mode==='login' ? 'Sign in' : 'Create account'}
          </button>

          {/* Toggle */}
          <p style={{ textAlign:'center', fontSize:13, color:'var(--text3)', margin:0 }}>
            {mode==='login' ? "New here? " : 'Have an account? '}
            <button onClick={() => { setMode(m=>m==='login'?'register':'login'); setError(null); }}
              style={{
                background:'none', border:'none', cursor:'pointer',
                color:'var(--accent3)', fontSize:13, fontWeight:600, padding:0,
              }}>
              {mode==='login' ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
