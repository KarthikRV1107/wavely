// src/App.jsx — lazy-loaded routes, code-split per page
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider }        from './context/PlayerContext';
import Layout from './components/Layout';
import Player from './components/Player/Player';

// Lazy load every page — each becomes a separate JS chunk
// Initial bundle only loads Login + Layout + Player (~30KB instead of ~150KB)
const Home        = lazy(() => import('./pages/Home'));
const SearchPage  = lazy(() => import('./pages/SearchPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PlaylistPage= lazy(() => import('./pages/PlaylistPage'));
const LoginPage   = lazy(() => import('./pages/LoginPage'));

// Minimal fallback — matches app background, no flash
const PageFallback = () => (
  <div style={{ minHeight:'60vh', display:'flex', alignItems:'center',
                justifyContent:'center' }}>
    <div style={{ width:24, height:24, borderRadius:'50%',
                  border:'2px solid rgba(124,106,247,0.2)',
                  borderTopColor:'#7c6af7',
                  animation:'spin 0.6s linear infinite' }}/>
  </div>
);

const Guard = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const Wrap = ({ children }) => (
  <Guard><Layout><Suspense fallback={<PageFallback/>}>{children}</Suspense></Layout></Guard>
);

const AppShell = () => {
  const { user } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/login" element={
          <Suspense fallback={<PageFallback/>}>
            {user ? <Navigate to="/" replace /> : <LoginPage/>}
          </Suspense>
        }/>
        <Route path="/"            element={<Wrap><Home/></Wrap>}/>
        <Route path="/search"      element={<Wrap><SearchPage/></Wrap>}/>
        <Route path="/library"     element={<Wrap><LibraryPage/></Wrap>}/>
        <Route path="/profile"     element={<Wrap><ProfilePage/></Wrap>}/>
        <Route path="/playlist/:id"element={<Wrap><PlaylistPage/></Wrap>}/>
        <Route path="*"            element={<Navigate to="/" replace/>}/>
      </Routes>
      {user && <Player/>}
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <AppShell/>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
