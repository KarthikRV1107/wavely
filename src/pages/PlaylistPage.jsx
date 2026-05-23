// src/pages/PlaylistPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { getPlaylist, getPlaylistSongs, removeSongFromPlaylist, deletePlaylist } from '../services/firestore';
import { formatTime } from '../utils/formatTime';
import SongCard from '../components/SongCard/SongCard';

const PlaylistPage = () => {
  const { id }                  = useParams();
  const navigate                = useNavigate();
  const { playSong }            = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [songs,    setSongs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [showMenu, setShowMenu] = useState(false);

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

  const totalMin = Math.floor(songs.reduce((a,s) => a + (s.durationSeconds ?? 0), 0) / 60);

  const handlePlayAll = () => { if (songs.length > 0) playSong(songs[0], songs, 0); };
  const handleShuffle = () => {
    if (!songs.length) return;
    const s = [...songs].sort(() => Math.random() - 0.5);
    playSong(s[0], s, 0);
  };
  const handleRemove = async (song) => {
    try {
      await removeSongFromPlaylist(song.id, id);
      setSongs(prev => prev.filter(s => s.id !== song.id));
      setPlaylist(prev => ({ ...prev, songCount: prev.songCount - 1 }));
    } catch (err) { console.error(err); }
  };
  const handleDelete = async () => {
    if (!window.confirm(`Delete "${playlist.name}"?`)) return;
    try { await deletePlaylist(id); navigate('/'); }
    catch (err) { console.error(err); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  height:300, color:'#b3b3b3', fontSize:14 }}>Loading…</div>
  );
  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  height:300, color:'#f87171', fontSize:14 }}>{error}</div>
  );

  return (
    <div>
      {/* Hero gradient header */}
      <div style={{
        background:'linear-gradient(180deg, #4a235a 0%, #121212 100%)',
        padding:'64px 32px 24px',
        display:'flex', alignItems:'flex-end', gap:24,
      }}>
        {/* Cover art */}
        <div style={{
          width:200, height:200, borderRadius:4, flexShrink:0,
          background:'#282828',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 16px 48px rgba(0,0,0,0.6)',
        }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="#7a7a7a">
            <path d="M15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zm6 0a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1z"/>
          </svg>
        </div>

        {/* Playlist info */}
        <div>
          <p style={{ fontSize:12, fontWeight:700, color:'#fff',
                      textTransform:'uppercase', margin:'0 0 8px' }}>Playlist</p>
          <h1 style={{ fontSize: playlist.name.length > 20 ? 36 : 56,
                       fontWeight:900, color:'#fff', margin:'0 0 16px',
                       lineHeight:1.1 }}>
            {playlist.name}
          </h1>
          {playlist.description && (
            <p style={{ fontSize:14, color:'#b3b3b3', margin:'0 0 8px' }}>
              {playlist.description}
            </p>
          )}
          <p style={{ fontSize:13, color:'#b3b3b3', margin:0 }}>
            {songs.length} songs
            {totalMin > 0 && `, about ${totalMin} min`}
          </p>
        </div>
      </div>

      {/* Controls bar */}
      <div style={{
        padding:'24px 32px',
        display:'flex', alignItems:'center', gap:24,
        background:'linear-gradient(180deg, rgba(74,35,90,0.3) 0%, transparent 100%)',
      }}>
        {/* Play button — Spotify green */}
        <button onClick={handlePlayAll} disabled={!songs.length} style={{
          width:56, height:56, borderRadius:'50%',
          background:'#1db954', border:'none', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'transform 0.1s',
          opacity: songs.length ? 1 : 0.5,
        }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.06)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        >
          <svg width="24" height="24" viewBox="0 0 16 16" fill="#000">
            <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/>
          </svg>
        </button>

        {/* Shuffle */}
        <button onClick={handleShuffle} disabled={!songs.length} style={{
          background:'none', border:'none', cursor:'pointer',
          color:'#b3b3b3', padding:4,
          opacity: songs.length ? 1 : 0.5,
        }}
          onMouseEnter={e => e.currentTarget.style.color='#fff'}
          onMouseLeave={e => e.currentTarget.style.color='#b3b3b3'}
        >
          <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356A2.25 2.25 0 0 1 11.16 4.5h1.949l-1.018 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"/>
            <path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.949l-1.018-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.937z"/>
          </svg>
        </button>

        {/* Three-dot menu */}
        <div style={{ position:'relative', marginLeft:'auto' }}>
          <button onClick={() => setShowMenu(m => !m)} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'#b3b3b3', padding:4,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </button>
          {showMenu && (
            <div style={{
              position:'absolute', right:0, top:'100%',
              background:'#282828', borderRadius:4,
              padding:'4px 0', minWidth:180, zIndex:50,
              boxShadow:'0 8px 24px rgba(0,0,0,0.5)',
            }}>
              <button onClick={() => { setShowMenu(false); handleDelete(); }} style={{
                display:'block', width:'100%', padding:'10px 16px',
                background:'none', border:'none', textAlign:'left',
                fontSize:14, cursor:'pointer', color:'#fff',
              }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background='none'}
              >Delete playlist</button>
            </div>
          )}
        </div>
      </div>

      {/* Song list */}
      <div style={{ padding:'0 32px 32px' }}>
        {/* Column headers */}
        {songs.length > 0 && (
          <div style={{
            display:'grid',
            gridTemplateColumns:'16px 40px 1fr auto auto',
            gap:16, padding:'0 16px 8px',
            borderBottom:'1px solid #282828',
            marginBottom:8,
          }}>
            <span style={{ fontSize:12, color:'#b3b3b3', textAlign:'center' }}>#</span>
            <span/>
            <span style={{ fontSize:12, color:'#b3b3b3' }}>Title</span>
            <span/>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#b3b3b3">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-3.25a.75.75 0 0 1 .75.75v3.25H9.5a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1-.75-.75V6.5A.75.75 0 0 1 8 4.75z"/>
            </svg>
          </div>
        )}

        {songs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'64px 0', color:'#b3b3b3' }}>
            <p style={{ fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>
              It's lonely in here
            </p>
            <p style={{ fontSize:14 }}>
              Search for songs and add them to this playlist.
            </p>
          </div>
        ) : (
          songs.map((song, i) => (
            <div key={song.id} style={{ position:'relative' }}>
              <SongCard song={song} queue={songs} queueIndex={i} index={i} showIndex />
              <button onClick={() => handleRemove(song)} style={{
                position:'absolute', right:48, top:'50%',
                transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer',
                color:'#b3b3b3', fontSize:18, lineHeight:1, padding:4,
              }}
                onMouseEnter={e => e.currentTarget.style.color='#fff'}
                onMouseLeave={e => e.currentTarget.style.color='#b3b3b3'}
              >×</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;
