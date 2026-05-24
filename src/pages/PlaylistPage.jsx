// src/pages/PlaylistPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { getPlaylist, getPlaylistSongs, removeSongFromPlaylist, deletePlaylist } from '../services/firestore';
import { formatTime } from '../utils/formatTime';
import SongCard from '../components/SongCard/SongCard';

export default function PlaylistPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { playSong } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [songs,    setSongs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [menu,     setMenu]     = useState(false);

  useEffect(() => {
    Promise.all([getPlaylist(id), getPlaylistSongs(id)])
      .then(([pl, sl]) => { setPlaylist(pl); setSongs(sl); })
      .catch(() => navigate('/library', { replace: true }))
      .finally(() => setLoading(false));
  }, [id]);

  const totalMin = Math.floor(songs.reduce((a,s) => a+(s.durationSeconds||0),0)/60);

  const handlePlayAll   = () => songs.length && playSong(songs[0], songs, 0);
  const handleShuffle   = () => { if (!songs.length) return; const s=[...songs].sort(()=>Math.random()-0.5); playSong(s[0],s,0); };
  const handleRemove    = async (song) => {
    await removeSongFromPlaylist(song.id, id);
    setSongs(p => p.filter(s => s.id !== song.id));
    setPlaylist(p => ({ ...p, songCount: p.songCount-1 }));
  };
  const handleDelete    = async () => {
    if (!window.confirm(`Delete "${playlist.name}"?`)) return;
    await deletePlaylist(id); navigate('/library', { replace: true });
  };

  if (loading) return (
    <div style={{ padding:20, maxWidth:680, margin:'0 auto' }}>
      <div className="skeleton" style={{ height:200, borderRadius:20, marginBottom:20 }}/>
      {[...Array(5)].map((_,i)=><div key={i} className="skeleton" style={{ height:68, borderRadius:12, marginBottom:8 }}/>)}
    </div>
  );

  return (
    <div style={{ maxWidth:680, margin:'0 auto', paddingBottom:8 }}>
      {/* Hero */}
      <div style={{
        position:'relative', padding:'60px 20px 24px',
        background:'linear-gradient(to bottom, var(--bg3) 0%, var(--bg) 100%)',
        overflow:'hidden',
      }}>
        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          position:'absolute', top:16, left:16, width:36, height:36,
          borderRadius:'50%', background:'rgba(255,255,255,0.08)',
          border:'1px solid var(--border)', display:'flex', alignItems:'center',
          justifyContent:'center', cursor:'pointer', color:'var(--text1)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </button>
        {/* More menu */}
        <div style={{ position:'absolute', top:16, right:16 }}>
          <button onClick={() => setMenu(m=>!m)} style={{
            width:36, height:36, borderRadius:'50%',
            background:'rgba(255,255,255,0.08)', border:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text1)">
              <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
            </svg>
          </button>
          {menu && (
            <div style={{
              position:'absolute', right:0, top:'calc(100% + 8px)',
              background:'var(--bg2)', border:'1px solid var(--border2)',
              borderRadius:12, padding:'4px 0', minWidth:160,
              boxShadow:'0 8px 32px rgba(0,0,0,0.5)', zIndex:10,
              animation:'fadeIn 0.15s ease',
            }}>
              <button onClick={handleDelete} style={{
                display:'block', width:'100%', padding:'10px 16px',
                background:'none', border:'none', textAlign:'left',
                fontSize:14, color:'var(--red)', cursor:'pointer',
              }}>Delete playlist</button>
            </div>
          )}
        </div>

        {/* Cover + info */}
        <div style={{ display:'flex', gap:18, alignItems:'flex-end' }}>
          <div style={{
            width:100, height:100, borderRadius:20, flexShrink:0,
            background:'linear-gradient(135deg, var(--accent) 0%, #5b4fcf 50%, var(--pink) 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 32px rgba(124,106,247,0.35)',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:11, color:'var(--accent3)', letterSpacing:'0.08em',
                        fontWeight:600, marginBottom:4 }}>PLAYLIST</p>
            <h1 style={{
              fontFamily:'var(--font-display)', fontSize:22, fontWeight:800,
              letterSpacing:'-0.02em', color:'var(--text1)', margin:'0 0 6px',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>{playlist.name}</h1>
            {playlist.description && (
              <p style={{ fontSize:13, color:'var(--text3)', margin:'0 0 6px' }}>
                {playlist.description}
              </p>
            )}
            <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>
              {songs.length} songs{totalMin>0&&` · ${totalMin} min`}
            </p>
          </div>
        </div>

        {/* Play buttons */}
        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button onClick={handlePlayAll} disabled={!songs.length} style={{
            display:'flex', alignItems:'center', gap:8, padding:'11px 24px',
            background:'linear-gradient(135deg, var(--accent), #5b4fcf)',
            border:'none', borderRadius:50, fontSize:14, fontWeight:600,
            color:'#fff', cursor:songs.length?'pointer':'not-allowed',
            opacity:songs.length?1:0.5,
            boxShadow:'0 4px 20px rgba(124,106,247,0.4)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
            Play all
          </button>
          <button onClick={handleShuffle} disabled={!songs.length} style={{
            display:'flex', alignItems:'center', gap:8, padding:'11px 20px',
            background:'var(--bg3)', border:'1px solid var(--border2)',
            borderRadius:50, fontSize:14, fontWeight:500,
            color:'var(--text2)', cursor:songs.length?'pointer':'not-allowed',
            opacity:songs.length?1:0.5,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16,3 21,3 21,8"/><line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21,16 21,21 16,21"/><line x1="15" y1="15" x2="21" y2="21"/>
            </svg>
            Shuffle
          </button>
        </div>
      </div>

      {/* Song list */}
      <div style={{ padding:'8px 20px' }}>
        {songs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text3)' }}>
            <p style={{ fontSize:36, marginBottom:12 }}>🎵</p>
            <p style={{ fontSize:14, color:'var(--text2)', fontWeight:500 }}>Playlist is empty</p>
            <p style={{ fontSize:13, marginTop:4 }}>Search for songs and add them here</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {songs.map((song, i) => (
              <div key={song.id} style={{ position:'relative', display:'flex', alignItems:'center' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <SongCard song={song} queue={songs} queueIndex={i} showIndex
                    style={{ animationDelay:`${i*0.03}s` }}/>
                </div>
                <button onClick={() => handleRemove(song)} style={{
                  width:28, height:28, borderRadius:8, flexShrink:0, marginLeft:4,
                  background:'none', border:'none', color:'var(--text3)',
                  cursor:'pointer', fontSize:18, display:'flex',
                  alignItems:'center', justifyContent:'center',
                  transition:'color 0.15s',
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
