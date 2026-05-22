// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth }  from './context/AuthContext';
import { PlayerProvider }         from './context/PlayerContext';
import Player       from './components/Player/Player';
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
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f5f5f5' }}>
    <div style={{ flex: 1, paddingBottom: 130 }}>{children}</div>
    <Player />
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Layout>
      <Routes>
        <Route path="/login"           element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/"                element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/search"          element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/library"         element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
        <Route path="/playlist/:id"    element={<ProtectedRoute><PlaylistPage /></ProtectedRoute>} />
        <Route path="*"                element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
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
