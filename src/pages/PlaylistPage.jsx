// src/pages/PlaylistPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth }   from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { usePlayerActions } from '../context/PlayerContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  getCachedPlaylist, getCachedPlaylistSongs, getPlaylist, getPlaylistSongs,
  removeSongFromPlaylist, deletePlaylist,
} from '../services/firestore';
import SongCard from '../components/SongCard/SongCard';

export default function PlaylistPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const { adjustPlaylistSongCount, removePlaylistEntry } = useLibrary();
  const { playSong } = usePlayerActions();
  const { isDesktop } = useBreakpoint();

  const [playlist, setPlaylist] = useState(() => (id ? getCachedPlaylist(id) : null));
  const [songs,    setSongs]    = useState(() => (id ? getCachedPlaylistSongs(id) : []));
  const [loading,  setLoading]  = useState(() => !(id && getCachedPlaylist(id)));
  const [menu,     setMenu]     = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    if (!id) return;
    alive.current = true;

    (async () => {
      try {
        // Both read from localStorage/memory first — instant
        const [pl, sl] = await Promise.all([
          getPlaylist(id),
          getPlaylistSongs(id),
        ]);
        if (!alive.current) return;
        setPlaylist(pl);
        setSongs(sl);
      } catch (e) {
        console.error(e);
        navigate('/library', { replace: true });
      } finally {
        if (alive.current) setLoading(false);
      }
    })();

    return () => { alive.current = false; };
  }, [id]);

  const totalMin = Math.floor(
    songs.reduce((a, s) => a + (s.durationSeconds ?? 0), 0) / 60
  );

  const handlePlayAll = () => {
    if (songs.length) playSong(songs[0], songs, 0);
  };

  const handleShuffle = () => {
    if (!songs.length) return;
    const s = [...songs].sort(() => Math.random() - 0.5);
    playSong(s[0], s, 0);
  };

  const handleRemove = (song) => {
    // Optimistic: remove from UI instantly
    setSongs(p => p.filter(s => s.id !== song.id));
    setPlaylist(p => p ? { ...p, songCount: Math.max(0,(p.songCount??1)-1) } : p);
    adjustPlaylistSongCount(id, -1);
    removeSongFromPlaylist(song.id, id, user?.uid).catch(console.error);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${playlist?.name}"?`)) return;
    removePlaylistEntry(id);
    deletePlaylist(id, user?.uid).catch(console.error);
    navigate('/library', { replace: true });
  };

  if (loading) return (
    <div style={{ padding: isDesktop ? '28px 0' : '16px' }}>
      <div className="skeleton" style={{ height:180, borderRadius:16, marginBottom:20 }}/>
      {[0,1,2,3].map(i => (
        <div key={i} className="skeleton"
          style={{ height:54, borderRadius:10, marginBottom:8 }}/>
      ))}
    </div>
  );

  return (
    <div>
      {/* Hero header */}
      <div style={{
        padding: isDesktop ? '28px 0 20px' : '16px 16px 16px',
        background:'linear-gradient(to bottom,var(--bg3),var(--bg))',
        position:'relative',
      }}>
        {/* Back + menu */}
        <div style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', marginBottom:20 }}>
          <button onClick={() => navigate(-1)} style={{
            display:'flex', alignItems:'center', gap:6,
            background:'none', border:'none', color:'var(--text2)',
            cursor:'pointer', fontSize:13, padding:0, fontFamily:'inherit',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            Back
          </button>
          <div style={{ position:'relative' }}>
            <button onClick={() => setMenu(m => !m)} style={{
              width:32, height:32, borderRadius:'50%',
              background:'var(--bg3)', border:'1px solid var(--border)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', color:'var(--text1)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5"/>
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="19" cy="12" r="1.5"/>
              </svg>
            </button>
            {menu && (
              <div style={{
                position:'absolute', right:0, top:'calc(100% + 6px)',
                background:'var(--bg2)', border:'1px solid var(--border2)',
                borderRadius:10, padding:'4px 0', minWidth:150,
                boxShadow:'0 8px 28px rgba(0,0,0,0.5)', zIndex:20,
              }}>
                <button onClick={() => { setMenu(false); handleDelete(); }} style={{
                  display:'block', width:'100%', padding:'10px 14px',
                  background:'none', border:'none', textAlign:'left',
                  fontSize:13, color:'var(--red)', cursor:'pointer',
                  fontFamily:'inherit',
                }}>Delete playlist</button>
              </div>
            )}
          </div>
        </div>

        {/* Playlist info */}
        <div style={{ display:'flex', gap:16, alignItems:'flex-end' }}>
          <div style={{
            width:88, height:88, borderRadius:14, flexShrink:0,
            background:'linear-gradient(135deg,var(--accent),#5b4fcf,var(--pink))',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 28px rgba(124,106,247,0.35)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.9)" strokeWidth="1.4">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:10, color:'var(--accent3)', letterSpacing:'0.1em',
                        fontWeight:700, margin:'0 0 4px' }}>PLAYLIST</p>
            <h1 style={{
              fontFamily:'var(--font-display)',
              fontSize: isDesktop ? 22 : 18,
              fontWeight:800, letterSpacing:'-0.02em',
              color:'var(--text1)', margin:'0 0 4px',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>{playlist?.name}</h1>
            <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>
              {songs.length} songs{totalMin > 0 ? ` · ${totalMin} min` : ''}
            </p>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button onClick={handlePlayAll} disabled={!songs.length} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'8px 18px',
                background:'linear-gradient(135deg,var(--accent),#5b4fcf)',
                border:'none', borderRadius:50, fontSize:12, fontWeight:700,
                color:'#fff', cursor:songs.length?'pointer':'not-allowed',
                opacity:songs.length?1:0.5,
                boxShadow:'0 4px 16px rgba(124,106,247,0.4)',
                fontFamily:'inherit',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
                Play all
              </button>
              <button onClick={handleShuffle} disabled={!songs.length} style={{
                padding:'8px 16px',
                background:'var(--bg3)', border:'1px solid var(--border2)',
                borderRadius:50, fontSize:12, fontWeight:500,
                color:'var(--text2)', cursor:songs.length?'pointer':'not-allowed',
                opacity:songs.length?1:0.5, fontFamily:'inherit',
              }}>⇌ Shuffle</button>
            </div>
          </div>
        </div>
      </div>

      {/* Songs */}
      <div style={{ padding: isDesktop ? '8px 0' : '8px 16px' }}>
        {songs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <p style={{ fontSize:32, marginBottom:10 }}>🎵</p>
            <p style={{ fontSize:14, fontWeight:500, color:'var(--text2)', margin:0 }}>
              Empty playlist
            </p>
            <p style={{ fontSize:12, color:'var(--text3)', margin:'5px 0 0' }}>
              Search for songs and add them here
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
            {songs.map((song, i) => (
              <div key={song.id} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <SongCard song={song} queue={songs}
                    queueIndex={i} showIndex/>
                </div>
                <button
                  onClick={() => handleRemove(song)}
                  style={{
                    background:'none', border:'none', cursor:'pointer',
                    color:'var(--text3)', fontSize:18, padding:'4px 8px',
                    flexShrink:0, lineHeight:1, transition:'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
