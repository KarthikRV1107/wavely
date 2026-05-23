// src/pages/Home.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate }      from 'react-router-dom';
import { useAuth }          from '../context/AuthContext';
import { usePlayer }        from '../context/PlayerContext';
import { getTrendingSongs } from '../services/youtube';
import { getUserPlaylists } from '../services/firestore';
import SongCard             from '../components/SongCard/SongCard';
import PlaylistForm         from '../components/Playlist/PlaylistForm';

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening'];
const getGreeting = () => GREETINGS[Math.min(2, Math.floor(new Date().getHours() / 8))];

export default function Home() {
  const { user, logout }   = useAuth();
  const { playSong }       = usePlayer();
  const navigate           = useNavigate();
  const [trending, setTrending]   = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [modalSong, setModalSong] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [songs, lists] = await Promise.all([
          getTrendingSongs(),
          getUserPlaylists(user.uid),
        ]);
        if (!cancelled) { setTrending(songs); setPlaylists(lists); }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.uid]);

  const name = user?.displayName?.split(' ')[0] || 'there';
  const featuredSong = trending[0];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 0 8px' }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2, letterSpacing: '0.05em' }}>
            {getGreeting()},
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
            letterSpacing: '-0.02em', color: 'var(--text1)', margin: 0,
          }}>{name} 👋</h1>
        </div>
        <button onClick={logout} style={{
          padding: '7px 14px', background: 'var(--bg3)',
          border: '1px solid var(--border)', borderRadius: 20,
          fontSize: 12, color: 'var(--text2)', cursor: 'pointer',
        }}>Sign out</button>
      </div>

      <div style={{ padding: '20px' }}>
        {error && (
          <div style={{
            padding: '14px 16px', marginBottom: 20,
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 12, fontSize: 13, color: 'var(--red)',
          }}>⚠ {error}</div>
        )}

        {/* Featured hero song */}
        {!loading && featuredSong && (
          <div style={{
            position: 'relative', borderRadius: 24, overflow: 'hidden',
            marginBottom: 28, cursor: 'pointer',
            animation: 'fadeUp 0.5s var(--ease-out) both',
          }} onClick={() => playSong(featuredSong, trending, 0)}>
            <img src={featuredSong.thumbnailUrl} alt={featuredSong.title}
              style={{ width:'100%', height: 200, objectFit:'cover', display:'block' }}/>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.3) 60%, transparent 100%)',
            }}/>
            {/* Accent glow */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(124,106,247,0.2) 0%, transparent 60%)',
            }}/>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px' }}>
              <p style={{ fontSize:10, color:'var(--accent3)', letterSpacing:'0.1em',
                          fontWeight:600, marginBottom:4 }}>🔥 TRENDING #1</p>
              <h2 style={{
                fontFamily:'var(--font-display)', fontSize:20, fontWeight:700,
                color:'#fff', margin:'0 0 4px', letterSpacing:'-0.01em',
                textShadow:'0 2px 8px rgba(0,0,0,0.5)',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>{featuredSong.title}</h2>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', margin:0 }}>
                {featuredSong.channelName}
              </p>
              <div style={{
                marginTop:14, display:'inline-flex', alignItems:'center', gap:8,
                background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)',
                borderRadius:50, padding:'8px 18px',
                border:'1px solid rgba(255,255,255,0.2)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{marginLeft:2}}>
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
                <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>Play Now</span>
              </div>
            </div>
          </div>
        )}

        {loading && <HeroSkeleton />}

        {/* Playlists */}
        <section style={{ marginBottom: 28 }}>
          <SectionHeader title="Your Playlists" action="+ New"
            onAction={() => setModalSong('new')} />
          {loading ? (
            <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:4 }}>
              {[...Array(3)].map((_,i) => (
                <div key={i} className="skeleton" style={{ width:130, height:150, flexShrink:0 }}/>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <EmptyState icon="🎵" text="No playlists yet" sub="Create one to get started" />
          ) : (
            <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:4,
                          scrollbarWidth:'none', msOverflowStyle:'none' }}>
              {playlists.map((pl, i) => (
                <PlaylistCard key={pl.id} pl={pl} i={i} onClick={() => navigate(`/playlist/${pl.id}`)} />
              ))}
            </div>
          )}
        </section>

        {/* Trending */}
        <section>
          <SectionHeader title="Trending Now" />
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[...Array(6)].map((_,i) => (
                <div key={i} className="skeleton" style={{ height:68 }}
                  style={{ animationDelay:`${i*0.05}s`, height:68, borderRadius:12 }}/>
              ))}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {trending.slice(1).map((song, i) => (
                <SongCard key={song.videoId} song={song}
                  queue={trending} queueIndex={i+1}
                  onAddToPlaylist={setModalSong}
                  style={{ animationDelay:`${i*0.04}s` }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {modalSong && modalSong !== 'new' && (
        <PlaylistForm song={modalSong} playlists={playlists}
          onClose={() => setModalSong(null)}
          onCreated={pl => setPlaylists(p => [pl,...p])} />
      )}
    </div>
  );
}

const SectionHeader = ({ title, action, onAction }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
    <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700,
                 color:'var(--text1)', margin:0, letterSpacing:'-0.01em' }}>{title}</h2>
    {action && (
      <button onClick={onAction} style={{
        fontSize:12, color:'var(--accent2)', background:'rgba(124,106,247,0.12)',
        border:'1px solid rgba(124,106,247,0.2)', borderRadius:20,
        padding:'5px 12px', fontWeight:500, cursor:'pointer',
      }}>{action}</button>
    )}
  </div>
);

const PlaylistCard = ({ pl, i, onClick }) => (
  <div onClick={onClick} style={{
    flexShrink:0, width:130, cursor:'pointer',
    animation:`fadeUp 0.4s var(--ease-out) ${i*0.06}s both`,
  }}>
    <div style={{
      width:130, height:130, borderRadius:16, marginBottom:10,
      background:`linear-gradient(135deg, hsl(${(i*60+240)%360},40%,20%) 0%, hsl(${(i*60+270)%360},50%,15%) 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      border:'1px solid var(--border)', transition:'transform 0.2s',
      boxShadow:'0 4px 16px rgba(0,0,0,0.3)',
    }}
      onMouseEnter={e => e.currentTarget.style.transform='scale(1.04)'}
      onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
        stroke={`hsl(${(i*60+240)%360},70%,65%)`} strokeWidth="1.5">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    </div>
    <p style={{ fontSize:13, fontWeight:600, color:'var(--text1)', margin:0,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{pl.name}</p>
    <p style={{ fontSize:11, color:'var(--text3)', margin:'2px 0 0' }}>{pl.songCount} songs</p>
  </div>
);

const HeroSkeleton = () => (
  <div className="skeleton" style={{ height:200, borderRadius:24, marginBottom:28 }}/>
);

const EmptyState = ({ icon, text, sub }) => (
  <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text3)' }}>
    <div style={{ fontSize:32, marginBottom:8 }}>{icon}</div>
    <p style={{ fontSize:14, fontWeight:500, color:'var(--text2)', margin:0 }}>{text}</p>
    <p style={{ fontSize:12, margin:'4px 0 0' }}>{sub}</p>
  </div>
);
