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
      setError(e.code==='auth/unauthorized-domain'
        ? 'Add your domain to Firebase → Auth → Authorized Domains.'
        : 'Google sign-in failed. Try again.');
    }
    finally { setLoading(false); }
  };

  const handleEmail = async () => {
    if (!email.trim() || !password) return;
    setLoading(true); setError(null);
    try {
      mode==='login'
        ? await loginWithEmail(email, password)
        : await registerWithEmail(email, password);
      onSuccess();
    } catch (e) {
      const m = {
        'auth/user-not-found':       'No account with that email.',
        'auth/wrong-password':       'Incorrect password.',
        'auth/invalid-credential':   'Incorrect email or password.',
        'auth/email-already-in-use': 'Email already registered.',
        'auth/weak-password':        'Password must be 6+ characters.',
        'auth/invalid-email':        'Invalid email address.',
        'auth/too-many-requests':    'Too many attempts. Try later.',
      };
      setError(m[e.code] ?? 'Something went wrong. Try again.');
    }
    finally { setLoading(false); }
  };

  const inp = {
    width:'100%', padding:'11px 14px',
    background:'#121212', border:'1px solid #2a2a2a',
    borderRadius:6, fontSize:14, color:'#fff',
    outline:'none', boxSizing:'border-box',
    transition:'border-color 0.15s', fontFamily:'inherit',
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#000', padding:20,
    }}>
      <div style={{ width:'100%', maxWidth:360 }}>

        {/* Logo + title */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <img
            src={LOGO}
            alt="Wavely"
            style={{
              width:72, height:72,
              objectFit:'contain',
              marginBottom:14,
              filter:'drop-shadow(0 0 24px rgba(var(--accent-rgb),0.35))',
            }}
          />
          <h1 style={{ fontSize:26, fontWeight:700, color:'#fff',
                       margin:'0 0 6px', letterSpacing:'-0.02em' }}>Wavely</h1>
          <p style={{ fontSize:13, color:'#666', margin:0 }}>
            {mode==='login' ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding:'10px 14px', marginBottom:16,
            background:'rgba(248,113,113,0.1)',
            border:'1px solid rgba(248,113,113,0.25)',
            borderRadius:6, fontSize:13, color:'#f87171',
          }}>{error}</div>
        )}

        {/* Google */}
        <button onClick={handleGoogle} disabled={loading} style={{
          width:'100%', padding:'12px',
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          background:'#fff', border:'none', borderRadius:6,
          fontSize:14, fontWeight:600, color:'#000',
          cursor:loading?'not-allowed':'pointer',
          marginBottom:18, opacity:loading?0.7:1,
          fontFamily:'inherit',
        }}>
          <GoogleIcon/>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ flex:1, height:1, background:'#222' }}/>
          <span style={{ fontSize:12, color:'#555' }}>or</span>
          <div style={{ flex:1, height:1, background:'#222' }}/>
        </div>

        {/* Email + password */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:12 }}>
          <input type="email" placeholder="Email address" value={email}
            onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleEmail()}
            disabled={loading} style={inp}
            onFocus={e=>e.target.style.borderColor='var(--accent)'}
            onBlur={e=>e.target.style.borderColor='#2a2a2a'}
          />
          <input type="password" placeholder="Password" value={password}
            onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleEmail()}
            disabled={loading} style={inp}
            onFocus={e=>e.target.style.borderColor='var(--accent)'}
            onBlur={e=>e.target.style.borderColor='#2a2a2a'}
          />
        </div>

        <button onClick={handleEmail}
          disabled={!email.trim()||!password||loading} style={{
            width:'100%', padding:'12px', marginBottom:18,
            background: email&&password&&!loading ? 'var(--accent)' : '#1a1a1a',
            border:'none', borderRadius:6,
            fontSize:14, fontWeight:700,
            color: email&&password&&!loading ? '#fff' : '#444',
            cursor: email&&password&&!loading ? 'pointer' : 'not-allowed',
            transition:'background 0.15s', fontFamily:'inherit',
          }}>
          {loading ? 'Please wait…' : mode==='login' ? 'Sign in' : 'Create account'}
        </button>

        <p style={{ textAlign:'center', fontSize:13, color:'#666', margin:0 }}>
          {mode==='login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={()=>{setMode(m=>m==='login'?'register':'login');setError(null);}} style={{
            background:'none', border:'none', color:'var(--accent2)',
            fontSize:13, fontWeight:600, cursor:'pointer', padding:0, fontFamily:'inherit',
          }}>
            {mode==='login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
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
