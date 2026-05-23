// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../context/AuthContext';

const LoginPage = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate                = useNavigate();
  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const onSuccess = () => navigate('/', { replace: true });

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    try { await loginWithGoogle(); onSuccess(); }
    catch { setError('Google sign-in failed. Try again.'); }
    finally { setLoading(false); }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password) return;
    setLoading(true); setError(null);
    try {
      if (mode === 'login') await loginWithEmail(email, password);
      else await registerWithEmail(email, password);
      onSuccess();
    } catch (err) {
      const msgs = {
        'auth/user-not-found':       'No account found with that email.',
        'auth/wrong-password':       'Incorrect password.',
        'auth/invalid-credential':   'Incorrect email or password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password':        'Password must be at least 6 characters.',
        'auth/invalid-email':        'Please enter a valid email address.',
        'auth/too-many-requests':    'Too many attempts. Please try again later.',
      };
      setError(msgs[err.code] ?? 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight:'100vh', background:'#000',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'"Circular","DM Sans",system-ui,sans-serif',
    }}>
      <div style={{ width:'100%', maxWidth:480, padding:'0 32px' }}>
        {/* Spotify logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <svg width="48" height="48" viewBox="0 0 168 168">
            <path fill="#1DB954" d="M84 0C37.6 0 0 37.6 0 84s37.6 84 84 84 84-37.6 84-84S130.4 0 84 0zm38.6 121.2c-1.5 2.5-4.8 3.3-7.3 1.8-20-12.2-45.2-15-74.9-8.2-2.9.7-5.7-1.1-6.4-4-.7-2.9 1.1-5.7 4-6.4 32.5-7.4 60.4-4.2 82.9 9.5 2.5 1.5 3.3 4.8 1.7 7.3zm10.3-22.9c-1.9 3.1-6 4-9.1 2.1-22.9-14.1-57.8-18.1-84.9-9.9-3.5 1.1-7.2-.9-8.3-4.4-1.1-3.5.9-7.2 4.4-8.3 30.9-9.4 69.3-4.9 95.7 11.4 3.1 1.9 4 6 1.7 9.1l.5-.0zm.9-23.9C108.4 57.5 63.3 56 38.1 63.9c-4.1 1.3-8.5-1-9.8-5.1-1.3-4.1 1-8.5 5.1-9.8 29-8.9 77.2-7.2 107.6 11.3 3.7 2.2 4.9 7 2.7 10.7-2.2 3.7-7 4.9-10.7 2.7l-.2-.3z"/>
          </svg>
        </div>

        <div style={{
          background:'#121212', borderRadius:8,
          padding:'48px 40px', border:'1px solid #282828',
        }}>
          <h1 style={{ fontSize:28, fontWeight:700, color:'#fff',
                       textAlign:'center', margin:'0 0 32px' }}>
            {mode === 'login' ? 'Log in to Wavely' : 'Sign up for Wavely'}
          </h1>

          {/* Error */}
          {error && (
            <div style={{
              padding:'12px 16px', marginBottom:20,
              background:'rgba(255,0,0,0.1)', borderRadius:4,
              border:'1px solid rgba(255,0,0,0.3)',
              fontSize:13, color:'#f87171', textAlign:'center',
            }}>{error}</div>
          )}

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} style={{
            width:'100%', padding:'14px',
            display:'flex', alignItems:'center', justifyContent:'center', gap:12,
            background:'transparent', border:'1px solid #727272', borderRadius:50,
            color:'#fff', fontSize:14, fontWeight:700,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom:12, fontFamily:'inherit',
            transition:'border-color 0.1s',
          }}
            onMouseEnter={e => { if(!loading) e.currentTarget.style.borderColor='#fff'; }}
            onMouseLeave={e => e.currentTarget.style.borderColor='#727272'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
            <div style={{ flex:1, height:1, background:'#282828' }}/>
            <span style={{ fontSize:13, color:'#727272' }}>or</span>
            <div style={{ flex:1, height:1, background:'#282828' }}/>
          </div>

          {/* Email fields */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:700, color:'#fff',
                               display:'block', marginBottom:6 }}>
                Email address
              </label>
              <input type="email" value={email}
                     onChange={e => setEmail(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                     placeholder="name@domain.com"
                     style={{
                       width:'100%', padding:'12px 14px',
                       background:'#3e3e3e', border:'2px solid transparent',
                       borderRadius:4, fontSize:15, color:'#fff',
                       outline:'none', boxSizing:'border-box',
                       fontFamily:'inherit',
                       transition:'border-color 0.1s',
                     }}
                     onFocus={e => e.target.style.borderColor='#fff'}
                     onBlur={e => e.target.style.borderColor='transparent'}
              />
            </div>

            <div>
              <label style={{ fontSize:13, fontWeight:700, color:'#fff',
                               display:'block', marginBottom:6 }}>
                Password
              </label>
              <input type="password" value={password}
                     onChange={e => setPassword(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                     placeholder="Password"
                     style={{
                       width:'100%', padding:'12px 14px',
                       background:'#3e3e3e', border:'2px solid transparent',
                       borderRadius:4, fontSize:15, color:'#fff',
                       outline:'none', boxSizing:'border-box',
                       fontFamily:'inherit',
                       transition:'border-color 0.1s',
                     }}
                     onFocus={e => e.target.style.borderColor='#fff'}
                     onBlur={e => e.target.style.borderColor='transparent'}
              />
            </div>

            <button onClick={handleEmailAuth}
                    disabled={!email.trim() || !password || loading} style={{
              width:'100%', padding:'14px',
              background: email && password && !loading ? '#1db954' : '#1a6636',
              color:'#000', border:'none', borderRadius:50,
              fontSize:15, fontWeight:700,
              cursor: email && password && !loading ? 'pointer' : 'not-allowed',
              marginTop:8, fontFamily:'inherit',
              transition:'background 0.1s, transform 0.1s',
            }}
              onMouseEnter={e => { if(email && password && !loading) e.currentTarget.style.background='#1ed760'; }}
              onMouseLeave={e => { if(email && password && !loading) e.currentTarget.style.background='#1db954'; }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          </div>

          {/* Toggle */}
          <p style={{ textAlign:'center', fontSize:14, color:'#b3b3b3',
                      marginTop:24, marginBottom:0 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(m => m==='login'?'register':'login'); setError(null); }}
                    style={{
                      background:'none', border:'none', cursor:'pointer',
                      color:'#fff', fontSize:14, fontWeight:700, padding:0,
                      textDecoration:'underline', fontFamily:'inherit',
                    }}>
              {mode === 'login' ? 'Sign up for Wavely' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
