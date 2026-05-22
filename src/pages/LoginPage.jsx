// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth }  from '../context/AuthContext';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LoginPage = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [mode,     setMode]     = useState('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    try { await loginWithGoogle(); }
    catch { setError('Google sign-in failed. Try again.'); }
    finally { setLoading(false); }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password) return;
    setLoading(true); setError(null);
    try {
      if (mode === 'login') await loginWithEmail(email, password);
      else                  await registerWithEmail(email, password);
    } catch (err) {
      const msg = {
        'auth/user-not-found':       'No account with that email.',
        'auth/wrong-password':       'Incorrect password.',
        'auth/email-already-in-use': 'Email already registered.',
        'auth/weak-password':        'Password must be at least 6 characters.',
        'auth/invalid-email':        'Invalid email address.',
      }[err.code] ?? 'Something went wrong. Try again.';
      setError(msg);
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: '#f5f5f5', border: '1px solid #e0e0e0',
    borderRadius: 8, fontSize: 14, color: '#1a1a1a',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: '#f5f5f5', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#fff',
                    borderRadius: 16, border: '1px solid #e5e5e5', padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🎵</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Wavely</h1>
          <p style={{ fontSize: 13, color: '#999', margin: '4px 0 0' }}>Your music, your way</p>
        </div>

        {error && (
          <div style={{ padding: '10px 12px', marginBottom: 14, background: '#fef2f2',
                        borderRadius: 8, fontSize: 13, color: '#dc2626' }}>{error}</div>
        )}

        <button onClick={handleGoogle} disabled={loading} style={{
          width: '100%', padding: '10px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, background: '#f5f5f5',
          border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14,
          cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16,
        }}>
          <GoogleIcon /> Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: '#e5e5e5' }} />
          <span style={{ fontSize: 12, color: '#aaa' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#e5e5e5' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="email" placeholder="Email" value={email}
                 onChange={e => setEmail(e.target.value)} style={inputStyle}
                 onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />
          <input type="password" placeholder="Password (min 6 chars)" value={password}
                 onChange={e => setPassword(e.target.value)} style={inputStyle}
                 onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />
          <button onClick={handleEmailAuth} disabled={!email.trim() || !password || loading} style={{
            padding: '10px',
            background: email && password ? '#1a1a1a' : '#e0e0e0',
            color:      email && password ? '#fff'    : '#aaa',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500,
            cursor: email && password && !loading ? 'pointer' : 'not-allowed',
          }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#999', marginTop: 16 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                           color: '#3b82f6', fontSize: 13, padding: 0 }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
