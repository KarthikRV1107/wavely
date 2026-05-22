// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../context/AuthContext';
import { getTrendingSongs }    from '../services/youtube';
import { getUserPlaylists }    from '../services/firestore';
import SongCard                from '../components/SongCard/SongCard';
import PlaylistForm            from '../components/Playlist/PlaylistForm';
import BottomNav               from '../components/BottomNav';

const Home = () => {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const [trending,  setTrending]  = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [modalSong, setModalSong] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [songs, lists] = await Promise.all([getTrendingSongs(), getUserPlaylists(user.uid)]);
        setTrending(songs);
        setPlaylists(lists);
      } catch (err) {
        setError('Failed to load. Check your API key and internet connection.');
        console.error(err);
      } finally { setLoading(false); }
    };
    load();
  }, [user.uid]);

  const sectionLabel = {
    fontSize: 11, fontWeight: 500, color: '#999',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    marginBottom: 8, display: 'block',
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 16px 8px', background: '#fff',
                    borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>🎵 Wavely</span>
        <button onClick={logout} style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>
          Sign out
        </button>
      </div>

      <div style={{ padding: 16 }}>
        {error && (
          <div style={{ padding: '12px 14px', marginBottom: 16, background: '#fef2f2',
                        borderRadius: 8, fontSize: 13, color: '#dc2626' }}>{error}</div>
        )}

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 60, borderRadius: 8, background: '#f0f0f0' }} />
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Playlists */}
            <section style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={sectionLabel}>Your playlists</span>
                <button onClick={() => setModalSong('new-playlist')}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                                 color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                  + New
                </button>
              </div>

              {playlists.length === 0 ? (
                <p style={{ fontSize: 13, color: '#999' }}>No playlists yet — create your first one!</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                  {playlists.map(pl => (
                    <div key={pl.id} onClick={() => navigate(`/playlist/${pl.id}`)} style={{
                      background: '#fff', border: '1px solid #e5e5e5', borderRadius: 10,
                      padding: 10, cursor: 'pointer',
                    }}>
                      <div style={{ width: '100%', aspectRatio: '1', background: '#f0f0f0',
                                    borderRadius: 6, marginBottom: 8, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                        </svg>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 500, margin: 0, whiteSpace: 'nowrap',
                                  overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</p>
                      <p style={{ fontSize: 11, margin: '2px 0 0', color: '#999' }}>{pl.songCount} songs</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Trending */}
            <section>
              <span style={sectionLabel}>Trending now</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {trending.map((song, i) => (
                  <SongCard key={song.videoId} song={song} queue={trending} queueIndex={i}
                            onAddToPlaylist={setModalSong} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {modalSong && modalSong !== 'new-playlist' && (
        <PlaylistForm song={modalSong} playlists={playlists} onClose={() => setModalSong(null)}
                      onCreated={(newPl) => setPlaylists(prev => [newPl, ...prev])} />
      )}

      <BottomNav active="home" />
    </div>
  );
};

export default Home;
