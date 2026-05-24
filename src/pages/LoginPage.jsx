// src/pages/LoginPage.jsx — simple, clean
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      setError(e.code === 'auth/unauthorized-domain'
        ? 'Add your domain to Firebase → Auth → Authorized Domains.'
        : 'Google sign-in failed. Try again.');
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
        'auth/user-not-found':       'No account with that email.',
        'auth/wrong-password':       'Incorrect password.',
        'auth/invalid-credential':   'Incorrect email or password.',
        'auth/email-already-in-use': 'Email already registered.',
        'auth/weak-password':        'Password must be 6+ characters.',
        'auth/invalid-email':        'Invalid email address.',
        'auth/too-many-requests':    'Too many attempts. Try later.',
      };
      setError(map[e.code] ?? 'Something went wrong. Try again.');
    }
    finally { setLoading(false); }
  };

  const inp = {
    width: '100%', padding: '11px 14px',
    background: '#121212', border: '1px solid #333',
    borderRadius: 4, fontSize: 14, color: '#fff',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#000', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #7c6af7, #f472b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(124,106,247,0.4)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff',
                       margin: 0, letterSpacing: '-0.02em' }}>Wavely</h1>
          <p style={{ fontSize: 14, color: '#aaa', margin: '6px 0 0' }}>
            {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '11px 14px', marginBottom: 16,
            background: 'rgba(248,113,113,0.12)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 4, fontSize: 13, color: '#f87171',
          }}>{error}</div>
        )}

        {/* Google */}
        <button onClick={handleGoogle} disabled={loading} style={{
          width: '100%', padding: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: '#fff', border: 'none', borderRadius: 4,
          fontSize: 14, fontWeight: 600, color: '#000',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 20, transition: 'opacity 0.15s',
          opacity: loading ? 0.7 : 1,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#333' }}/>
          <span style={{ fontSize: 12, color: '#666' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#333' }}/>
        </div>

        {/* Email + password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          <input type="email" placeholder="Email address" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmail()}
            disabled={loading} style={inp}
            onFocus={e => e.target.style.borderColor = '#7c6af7'}
            onBlur={e => e.target.style.borderColor = '#333'}
          />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmail()}
            disabled={loading} style={inp}
            onFocus={e => e.target.style.borderColor = '#7c6af7'}
            onBlur={e => e.target.style.borderColor = '#333'}
          />
        </div>

        <button onClick={handleEmail} disabled={!email.trim() || !password || loading} style={{
          width: '100%', padding: '12px', marginBottom: 20,
          background: email && password ? '#7c6af7' : '#333',
          border: 'none', borderRadius: 4,
          fontSize: 14, fontWeight: 700,
          color: email && password ? '#fff' : '#666',
          cursor: email && password && !loading ? 'pointer' : 'not-allowed',
          transition: 'background 0.15s',
        }}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#888', margin: 0 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null); }}
            style={{ background: 'none', border: 'none', color: '#a78bfa',
                     fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
