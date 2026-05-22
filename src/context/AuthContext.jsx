import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut,
         createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          uid: firebaseUser.uid, email: firebaseUser.email,
          displayName: firebaseUser.displayName, photoURL: firebaseUser.photoURL,
          lastLoginAt: serverTimestamp(),
        }, { merge: true });
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle    = ()           => signInWithPopup(auth, googleProvider);
  const loginWithEmail     = (e, p)       => signInWithEmailAndPassword(auth, e, p);
  const registerWithEmail  = (e, p)       => createUserWithEmailAndPassword(auth, e, p);
  const logout             = ()           => signOut(auth);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading…</div>;

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
