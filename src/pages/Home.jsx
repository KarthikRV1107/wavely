// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../context/AuthContext';
import { getTrendingSongs }    from '../services/youtube';
import { getUserPlaylists }    from '../services/firestore';
import SongCard                from '../components/SongCard/SongCard';
import PlaylistForm            from '../components/Playlist/PlaylistForm';

const GREETINGS = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const Home = () => {
  const { user }            = useAuth();
  const navigate            = useNavigate();
  const [trending,  setTrending]  = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [modalSong, setModalSong] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [songs, lists] = await Promise.all([
          getTrendingSongs(),
          getUserPlaylists(user.uid),
        ]);
        setTrending(songs);
        setPlaylists(lists);
      } catch (err) {
        console.error('Home load error:', err);
        setError(err.message || 'Failed to load.');
      } finally { setLoading(false); }
    };
    load();
  }, [user.uid]);

  return (
    <div style={{ padding: '0 0 32px' }}>
      {/* Gradient header */}
      <div style={{
        background: 'linear-gradient(180deg, #1a3a2a 0%, #121212 100%)',
        padding: '64px 32px 24px',
      }}>
        <h1 style={{ fontSize:28, fontWeight:700, color:'#fff', margin:'0 0 24px' }}>
          {GREETINGS()}
        </h1>

        {/* Playlist quick-access grid */}
        {playlists.length > 0 && (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',
            gap:8,
          }}>
            {playlists.slice(0,6).map(pl => (
              <div key={pl.id} onClick={() => navigate(`/playlist/${pl.id}`)} style={{
                display:'flex', alignItems:'center', gap:12,
                background:'rgba(255,255,255,0.12)',
                borderRadius:4, overflow:'hidden', cursor:'pointer',
                transition:'background 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
              >
                <div style={{
                  width:48, height:48, background:'#333',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#b3b3b3">
                    <path d="M15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zm6 0a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1z"/>
                  </svg>
                </div>
                <span style={{
                  fontSize:13, fontWeight:700, color:'#fff',
                  paddingRight:8,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                }}>{pl.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding:'32px 32px 0' }}>
        {/* Error */}
        {error && (
          <div style={{
            padding:'12px 16px', marginBottom:24,
            background:'#3e1f1f', borderRadius:4,
            fontSize:13, color:'#f87171', border:'1px solid #7f1d1d',
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Trending section */}
        <section>
          <div style={{ display:'flex', justifyContent:'space-between',
                        alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#fff', margin:0 }}>
              Trending right now
            </h2>
            <button onClick={() => navigate('/search')} style={{
              fontSize:12, fontWeight:700, color:'#b3b3b3', background:'none',
              border:'none', cursor:'pointer', letterSpacing:'0.1em',
              textTransform:'uppercase',
            }}
              onMouseEnter={e => e.currentTarget.style.color='#fff'}
              onMouseLeave={e => e.currentTarget.style.color='#b3b3b3'}
            >Show all</button>
          </div>

          {/* Column headers */}
          {!loading && trending.length > 0 && (
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

          {loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  height:56, borderRadius:4,
                  background:'rgba(255,255,255,0.05)',
                }}/>
              ))}
            </div>
          )}

          {!loading && (
            <div>
              {trending.map((song, i) => (
                <SongCard
                  key={song.videoId}
                  song={song}
                  queue={trending}
                  queueIndex={i}
                  index={i}
                  onAddToPlaylist={setModalSong}
                />
              ))}
            </div>
          )}
        </section>

        {/* Your playlists section */}
        {!loading && playlists.length > 0 && (
          <section style={{ marginTop:48 }}>
            <div style={{ display:'flex', justifyContent:'space-between',
                          alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontSize:22, fontWeight:700, color:'#fff', margin:0 }}>
                Your playlists
              </h2>
              <button onClick={() => navigate('/library')} style={{
                fontSize:12, fontWeight:700, color:'#b3b3b3', background:'none',
                border:'none', cursor:'pointer', letterSpacing:'0.1em',
                textTransform:'uppercase',
              }}
                onMouseEnter={e => e.currentTarget.style.color='#fff'}
                onMouseLeave={e => e.currentTarget.style.color='#b3b3b3'}
              >Show all</button>
            </div>
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
              gap:24,
            }}>
              {playlists.map(pl => (
                <div key={pl.id} onClick={() => navigate(`/playlist/${pl.id}`)} style={{
                  background:'#181818', borderRadius:6,
                  padding:16, cursor:'pointer',
                  transition:'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='#282828'}
                  onMouseLeave={e => e.currentTarget.style.background='#181818'}
                >
                  <div style={{
                    width:'100%', aspectRatio:'1', background:'#282828',
                    borderRadius:4, marginBottom:16,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:'0 8px 24px rgba(0,0,0,0.5)',
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#b3b3b3">
                      <path d="M15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zm6 0a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1z"/>
                    </svg>
                  </div>
                  <p style={{ fontSize:14, fontWeight:700, color:'#fff',
                               margin:'0 0 4px', whiteSpace:'nowrap',
                               overflow:'hidden', textOverflow:'ellipsis' }}>
                    {pl.name}
                  </p>
                  <p style={{ fontSize:12, color:'#b3b3b3', margin:0 }}>
                    Playlist • {pl.songCount} songs
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {modalSong && (
        <PlaylistForm
          song={modalSong}
          playlists={playlists}
          onClose={() => setModalSong(null)}
          onCreated={newPl => setPlaylists(prev => [newPl, ...prev])}
        />
      )}
    </div>
  );
};

export default Home;
