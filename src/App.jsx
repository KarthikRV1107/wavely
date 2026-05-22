// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth }  from './context/AuthContext';
import { PlayerProvider }         from './context/PlayerContext';
import Player       from './components/Player/Player';
import Sidebar      from './components/Sidebar';
import Home         from './pages/Home';
import SearchPage   from './pages/SearchPage';
import PlaylistPage from './pages/PlaylistPage';
import LibraryPage  from './pages/LibraryPage';
import LoginPage    from './pages/LoginPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const Layout = ({ children }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    height: '100vh', background: '#000', color: '#fff',
    fontFamily: '"Circular", "DM Sans", system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
  }}>
    {/* Main area: sidebar + content */}
    <div style={{ display: 'flex', flex: 1, gap: 8, padding: '8px 8px 0', overflow: 'hidden', minHeight: 0 }}>
      <Sidebar />
      <main style={{
        flex: 1, background: '#121212', borderRadius: 8,
        overflowY: 'auto', minHeight: 0,
      }}>
        {children}
      </main>
    </div>
    {/* Player bar at bottom */}
    <Player />
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Layout><SearchPage /></Layout></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><Layout><LibraryPage /></Layout></ProtectedRoute>} />
      <Route path="/playlist/:id" element={<ProtectedRoute><Layout><PlaylistPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <PlayerProvider>
        <AppRoutes />
      </PlayerProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
