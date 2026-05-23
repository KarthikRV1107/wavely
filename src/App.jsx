// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider }        from './context/PlayerContext';
import Layout      from './components/Layout';
import Player      from './components/Player/Player';
import Home        from './pages/Home';
import SearchPage  from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import ProfilePage from './pages/ProfilePage';
import PlaylistPage from './pages/PlaylistPage';
import LoginPage   from './pages/LoginPage';

const Guard = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AppShell = () => {
  const { user } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={<Guard><Layout><Home /></Layout></Guard>} />
        <Route path="/search" element={<Guard><Layout><SearchPage /></Layout></Guard>} />
        <Route path="/library" element={<Guard><Layout><LibraryPage /></Layout></Guard>} />
        <Route path="/profile" element={<Guard><Layout><ProfilePage /></Layout></Guard>} />
        <Route path="/playlist/:id" element={<Guard><Layout><PlaylistPage /></Layout></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <Player />}
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <AppShell />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
