// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const onSuccess = () => navigate('/', { replace: true });

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    try { await loginWithGoogle(); onSuccess(); }
    catch (e) { setError('Google sign-in failed. Check Firebase authorized domains.'); }
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
        'auth/user-not-found': 'No account found with that email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/email-already-in-use': 'Email already registered.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
      };
      setError(map[e.code] ?? `Error: ${e.code}`);
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient background blobs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
        }}/>
        <div style={{
          position: 'absolute', bottom: '-10%', right: '5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite reverse',
        }}/>
        <div style={{
          position: 'absolute', top: '40%', right: '20%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)',
        }}/>
      </div>

      <div style={{
        width: '100%', maxWidth: 400, position: 'relative', zIndex: 1,
        animation: 'fadeUp 0.5s var(--ease-out) both',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent), var(--pink))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(124,106,247,0.4)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
            letterSpacing: '-0.02em', color: 'var(--text1)',
            background: 'linear-gradient(135deg, var(--text1), var(--accent3))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Wavely</h1>
          <p style={{ fontSize: 14, color: 'var(--text3)', marginTop: 4, letterSpacing: '0.02em' }}>
            Your music universe
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)', borderRadius: 24,
          border: '1px solid var(--border2)',
          padding: '32px 28px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}>
          {error && (
            <div style={{
              padding: '12px 14px', marginBottom: 20,
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 10, fontSize: 13, color: 'var(--red)',
              animation: 'fadeIn 0.2s ease',
            }}>{error}</div>
          )}

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} style={{
            width: '100%', padding: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: 'var(--bg3)', border: '1px solid var(--border2)',
            borderRadius: 12, fontSize: 14, fontWeight: 500,
            color: 'var(--text1)', transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
            <span style={{ fontSize: 12, color: 'var(--text3)', letterSpacing: '0.05em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { type: 'email', val: email, set: setEmail, ph: 'Email address' },
              { type: 'password', val: password, set: setPassword, ph: 'Password' },
            ].map(({ type, val, set, ph }) => (
              <input key={type} type={type} placeholder={ph} value={val}
                onChange={e => set(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmail()}
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 12, fontSize: 14, color: 'var(--text1)',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            ))}

            <button onClick={handleEmail} disabled={!email || !password || loading} style={{
              padding: '13px', marginTop: 4,
              background: email && password
                ? 'linear-gradient(135deg, var(--accent), #5b4fcf)'
                : 'var(--bg3)',
              border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 600,
              color: email && password ? '#fff' : 'var(--text3)',
              transition: 'all 0.2s',
              boxShadow: email && password ? '0 4px 20px rgba(124,106,247,0.3)' : 'none',
            }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 20 }}>
            {mode === 'login' ? "New here? " : 'Have an account? '}
            <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null); }}
              style={{ background: 'none', border: 'none', color: 'var(--accent3)', fontSize: 13, fontWeight: 500 }}>
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
