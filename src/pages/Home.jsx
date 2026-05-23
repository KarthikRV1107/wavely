// src/pages/Home.jsx — responsive grid layout
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../context/AuthContext';
import { usePlayer }           from '../context/PlayerContext';
import { useBreakpoint }       from '../hooks/useBreakpoint';
import { getTrendingSongs }    from '../services/youtube';
import { getUserPlaylists }    from '../services/firestore';
import SongCard                from '../components/SongCard/SongCard';
import PlaylistForm            from '../components/Playlist/PlaylistForm';

const getGreeting = () =>
  ['Good morning','Good afternoon','Good evening'][Math.min(2, Math.floor(new Date().getHours()/8))];

export default function Home() {
  const { user, logout }   = useAuth();
  const { playSong }       = usePlayer();
  const navigate           = useNavigate();
  const { isDesktop, isTablet, isMobile } = useBreakpoint();
  const [trending,  setTrending]  = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [modalSong, setModalSong] = useState(null);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const [songs, lists] = await Promise.all([getTrendingSongs(), getUserPlaylists(user.uid)]);
        if (!dead) { setTrending(songs); setPlaylists(lists); }
      } catch(e) { if(!dead) setError(e.message); }
      finally    { if(!dead) setLoading(false); }
    })();
    return () => { dead = true; };
  }, [user.uid]);

  const name        = user?.displayName?.split(' ')[0] || 'there';
  const featuredSong = trending[0];
  // On desktop show 2-col grid for trending; on mobile single col
  const trendingCols = isDesktop ? 2 : 1;

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* Header — only on mobile (desktop uses sidebar) */}
      {!isDesktop && (
        <div style={{
          padding: '20px 20px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize:12, color:'var(--text3)', marginBottom:2, letterSpacing:'0.05em' }}>
              {getGreeting()},
            </p>
            <h1 style={{
              fontFamily:'var(--font-display)', fontSize:26, fontWeight:800,
              letterSpacing:'-0.02em', color:'var(--text1)', margin:0,
            }}>{name} 👋</h1>
          </div>
          <button onClick={logout} style={{
            padding:'7px 14px', background:'var(--bg3)',
            border:'1px solid var(--border)', borderRadius:20,
            fontSize:12, color:'var(--text2)', cursor:'pointer',
          }}>Sign out</button>
        </div>
      )}

      {/* Desktop greeting (inside content area, no sign-out — that's in sidebar) */}
      {isDesktop && (
        <div style={{ padding:'28px 0 0' }}>
          <p style={{ fontSize:13, color:'var(--text3)', marginBottom:4, letterSpacing:'0.04em' }}>
            {getGreeting()},
          </p>
          <h1 style={{
            fontFamily:'var(--font-display)', fontSize:32, fontWeight:800,
            letterSpacing:'-0.03em', color:'var(--text1)', margin:0,
          }}>Welcome back, {name} 👋</h1>
        </div>
      )}

      <div style={{ padding: isDesktop ? '24px 0' : '20px' }}>
        {error && (
          <div style={{
            padding:'14px 16px', marginBottom:20,
            background:'rgba(248,113,113,0.08)',
            border:'1px solid rgba(248,113,113,0.2)',
            borderRadius:12, fontSize:13, color:'var(--red)',
          }}>⚠ {error}</div>
        )}

        {/* Hero featured card */}
        {loading
          ? <div className="skeleton" style={{ height: isDesktop ? 260 : 200, borderRadius:24, marginBottom:28 }}/>
          : featuredSong && (
          <div style={{
            position:'relative', borderRadius:24, overflow:'hidden',
            marginBottom:28, cursor:'pointer',
            animation:'fadeUp 0.5s var(--ease-out) both',
            // Wider on desktop
            height: isDesktop ? 260 : 200,
          }} onClick={() => playSong(featuredSong, trending, 0)}>
            <img src={featuredSong.thumbnailUrl} alt={featuredSong.title}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            <div style={{
              position:'absolute', inset:0,
              background:'linear-gradient(to top, rgba(10,10,15,0.97) 0%, rgba(10,10,15,0.2) 60%, transparent 100%)',
            }}/>
            <div style={{
              position:'absolute', inset:0,
              background:'linear-gradient(135deg, rgba(124,106,247,0.25) 0%, transparent 60%)',
            }}/>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding: isDesktop?'28px':'20px' }}>
              <p style={{ fontSize:10, color:'var(--accent3)', letterSpacing:'0.12em', fontWeight:700, marginBottom:6 }}>
                🔥 TRENDING #1
              </p>
              <h2 style={{
                fontFamily:'var(--font-display)',
                fontSize: isDesktop ? 26 : 20,
                fontWeight:700, color:'#fff', margin:'0 0 4px',
                letterSpacing:'-0.01em',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>{featuredSong.title}</h2>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', margin:0 }}>
                {featuredSong.channelName}
              </p>
              <div style={{
                marginTop:16, display:'inline-flex', alignItems:'center', gap:8,
                background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)',
                borderRadius:50, padding:'8px 20px',
                border:'1px solid rgba(255,255,255,0.2)',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white" style={{marginLeft:2}}>
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
                <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>Play Now</span>
              </div>
            </div>
          </div>
        )}

        {/* Playlists */}
        <section style={{ marginBottom:28 }}>
          <SectionHeader title="Your Playlists" action="+ New"
            onAction={() => setModalSong('new')}/>
          {loading
            ? <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:4 }}>
                {[...Array(4)].map((_,i) => (
                  <div key={i} className="skeleton" style={{ width:130, height:150, flexShrink:0 }}/>
                ))}
              </div>
            : playlists.length === 0
              ? <EmptyState icon="🎵" text="No playlists yet" sub="Create one to get started"/>
              : (
                <div style={{
                  display: isDesktop ? 'grid' : 'flex',
                  gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(140px, 1fr))' : undefined,
                  flexDirection: isDesktop ? undefined : 'row',
                  gap:12, overflowX: isDesktop ? 'visible' : 'auto',
                  paddingBottom:4, scrollbarWidth:'none',
                }}>
                  {playlists.map((pl, i) => (
                    <PlaylistCard key={pl.id} pl={pl} i={i} isDesktop={isDesktop}
                      onClick={() => navigate(`/playlist/${pl.id}`)}/>
                  ))}
                </div>
              )
          }
        </section>

        {/* Trending — 2 col on desktop */}
        <section>
          <SectionHeader title="Trending Now"/>
          {loading
            ? <div style={{
                display:'grid',
                gridTemplateColumns:`repeat(${trendingCols}, 1fr)`, gap:6,
              }}>
                {[...Array(6)].map((_,i) => (
                  <div key={i} className="skeleton" style={{ height:68, borderRadius:12 }}/>
                ))}
              </div>
            : <div style={{
                display:'grid',
                gridTemplateColumns:`repeat(${trendingCols}, 1fr)`,
                gap:6,
              }}>
                {trending.slice(1).map((song, i) => (
                  <SongCard key={song.videoId} song={song}
                    queue={trending} queueIndex={i+1}
                    onAddToPlaylist={setModalSong}
                    style={{ animationDelay:`${i*0.04}s` }}
                  />
                ))}
              </div>
          }
        </section>
      </div>

      {modalSong && modalSong !== 'new' && (
        <PlaylistForm song={modalSong} playlists={playlists}
          onClose={() => setModalSong(null)}
          onCreated={pl => setPlaylists(p => [pl, ...p])}/>
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
        fontSize:12, color:'var(--accent2)',
        background:'rgba(124,106,247,0.12)',
        border:'1px solid rgba(124,106,247,0.2)',
        borderRadius:20, padding:'5px 12px', fontWeight:500, cursor:'pointer',
      }}>{action}</button>
    )}
  </div>
);

const PlaylistCard = ({ pl, i, isDesktop, onClick }) => (
  <div onClick={onClick} style={{
    flexShrink: isDesktop ? 0 : 0,
    width: isDesktop ? '100%' : 130,
    cursor:'pointer',
    animation:`fadeUp 0.4s var(--ease-out) ${i*0.06}s both`,
  }}>
    <div style={{
      width:'100%', aspectRatio:'1',
      maxWidth: isDesktop ? 'none' : 130,
      height: isDesktop ? 120 : 130,
      borderRadius:16, marginBottom:10,
      background:`linear-gradient(135deg,hsl(${(i*60+240)%360},40%,20%),hsl(${(i*60+270)%360},50%,15%))`,
      display:'flex', alignItems:'center', justifyContent:'center',
      border:'1px solid var(--border)', transition:'transform 0.2s',
      boxShadow:'0 4px 16px rgba(0,0,0,0.3)',
    }}
      onMouseEnter={e => e.currentTarget.style.transform='scale(1.04)'}
      onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
        stroke={`hsl(${(i*60+240)%360},70%,65%)`} strokeWidth="1.5">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    </div>
    <p style={{ fontSize:13, fontWeight:600, color:'var(--text1)', margin:0,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{pl.name}</p>
    <p style={{ fontSize:11, color:'var(--text3)', margin:'2px 0 0' }}>{pl.songCount} songs</p>
  </div>
);

const EmptyState = ({ icon, text, sub }) => (
  <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text3)' }}>
    <div style={{ fontSize:32, marginBottom:8 }}>{icon}</div>
    <p style={{ fontSize:14, fontWeight:500, color:'var(--text2)', margin:0 }}>{text}</p>
    <p style={{ fontSize:12, margin:'4px 0 0' }}>{sub}</p>
  </div>
);
