// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { warmLikedSongs } from '../services/firestore';

const Ctx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (fu) {
        // Fire-and-forget Firestore user doc write + liked songs warm
        setDoc(doc(db, 'users', fu.uid), {
          uid: fu.uid, email: fu.email,
          displayName: fu.displayName, photoURL: fu.photoURL,
          lastLoginAt: serverTimestamp(),
        }, { merge: true }).catch(() => {});
        warmLikedSongs(fu.uid); // pre-warm liked songs in background
        setUser(fu);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle   = ()       => signInWithPopup(auth, googleProvider);
  const loginWithEmail    = (e, p)   => signInWithEmailAndPassword(auth, e, p);
  const registerWithEmail = (e, p)   => createUserWithEmailAndPassword(auth, e, p);
  const logout            = ()       => signOut(auth);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  minHeight:'100vh', background:'#0a0a0f' }}>
      <div style={{ width:32, height:32, borderRadius:'50%',
                    border:'3px solid rgba(124,106,247,0.2)',
                    borderTopColor:'#7c6af7',
                    animation:'spin 0.7s linear infinite' }}/>
    </div>
  );

  return (
    <Ctx.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be inside AuthProvider');
  return c;
};
