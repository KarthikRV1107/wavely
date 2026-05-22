// src/pages/PlaylistPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer }   from '../context/PlayerContext';
import { getPlaylist, getPlaylistSongs, removeSongFromPlaylist, deletePlaylist } from '../services/firestore';
import { formatTime }  from '../utils/formatTime';
import SongCard        from '../components/SongCard/SongCard';
import BottomNav       from '../components/BottomNav';

const PlaylistPage = () => {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const { playSong }              = usePlayer();
  const [playlist,  setPlaylist]  = useState(null);
  const [songs,     setSongs]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [showMenu,  setShowMenu]  = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pl, songList] = await Promise.all([getPlaylist(id), getPlaylistSongs(id)]);
        setPlaylist(pl); setSongs(songList);
      } catch { setError('Playlist not found.'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const totalMin = Math.floor(songs.reduce((a, s) => a + (s.durationSeconds ?? 0), 0) / 60);

  const handlePlayAll = () => { if (songs.length > 0) playSong(songs[0], songs, 0); };
  const handleShuffle = () => {
    if (songs.length === 0) return;
    const s = [...songs].sort(() => Math.random() - 0.5);
    playSong(s[0], s, 0);
  };
  const handleRemoveSong = async (song) => {
    try {
      await removeSongFromPlaylist(song.id, id);
      setSongs(prev => prev.filter(s => s.id !== song.id));
      setPlaylist(prev => ({ ...prev, songCount: prev.songCount - 1 }));
    } catch (err) { console.error('Remove failed:', err); }
  };
  const handleDeletePlaylist = async () => {
    if (!window.confirm(`Delete "${playlist.name}"? This can't be undone.`)) return;
    try { await deletePlaylist(id); navigate('/'); }
    catch (err) { console.error('Delete failed:', err); }
  };

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#999', fontSize: 13 }}>Loading playlist…</div>;
  if (error)   return <div style={{ padding: 32, textAlign: 'center', color: '#dc2626', fontSize: 13 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: '#fff', borderBottom: '1px solid #e5e5e5',
                    position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none',
                cursor: 'pointer', padding: 4, color: '#555', display: 'flex', alignItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 500 }}>{playlist.name}</span>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(m => !m)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#555' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
            </svg>
          </button>
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff',
                          border: '1px solid #e0e0e0', borderRadius: 8, padding: '4px 0',
                          minWidth: 160, zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <button onClick={() => { setShowMenu(false); handleDeletePlaylist(); }}
                      style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'none',
                               border: 'none', textAlign: 'left', fontSize: 13, cursor: 'pointer', color: '#dc2626' }}>
                Delete playlist
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Hero */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: 10, flexShrink: 0, background: '#f0f0f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 4px' }}>{playlist.name}</h1>
            {playlist.description && <p style={{ fontSize: 12, margin: '0 0 4px', color: '#999' }}>{playlist.description}</p>}
            <p style={{ fontSize: 12, margin: 0, color: '#999' }}>
              {songs.length} songs{totalMin > 0 && ` · ${totalMin} min`}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={handlePlayAll} disabled={songs.length === 0} style={{
                padding: '6px 16px', background: '#1a1a1a', color: '#fff', border: 'none',
                borderRadius: 8, fontSize: 12, fontWeight: 500,
                cursor: songs.length > 0 ? 'pointer' : 'not-allowed', opacity: songs.length > 0 ? 1 : 0.5,
              }}>▶ Play all</button>
              <button onClick={handleShuffle} disabled={songs.length === 0} style={{
                padding: '6px 14px', background: 'transparent', border: '1px solid #e0e0e0',
                borderRadius: 8, fontSize: 12, cursor: songs.length > 0 ? 'pointer' : 'not-allowed',
                color: '#555', opacity: songs.length > 0 ? 1 : 0.5,
              }}>⇌ Shuffle</button>
            </div>
          </div>
        </div>

        {/* Songs */}
        {songs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', fontSize: 13 }}>
            <p style={{ marginBottom: 8 }}>This playlist is empty.</p>
            <p>Search for songs and tap + to add them here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {songs.map((song, i) => (
              <div key={song.id} style={{ position: 'relative' }}>
                <SongCard song={song} queue={songs} queueIndex={i} showIndex={true} />
                <button onClick={() => handleRemoveSong(song)} title="Remove from playlist" style={{
                  position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 6,
                  color: '#ccc', fontSize: 18, lineHeight: 1,
                }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="library" />
    </div>
  );
};

export default PlaylistPage;
