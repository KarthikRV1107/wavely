// src/pages/Home.jsx — stale-while-revalidate: show cached data instantly,
// fetch fresh data in background without blocking the UI.
import { useState, useEffect, useRef } from 'react';
import { useNavigate }      from 'react-router-dom';
import { useAuth }          from '../context/AuthContext';
import { useLibrary }       from '../context/LibraryContext';
import { usePlayerActions } from '../context/PlayerContext';
import { useBreakpoint }    from '../hooks/useBreakpoint';
import { getTrendingSongs } from '../services/youtube';
import SongCard             from '../components/SongCard/SongCard';
import PlaylistForm         from '../components/Playlist/PlaylistForm';
import HeroCarousel         from '../components/HeroCarousel';

const greet = () =>
  ['Good morning','Good afternoon','Good evening'][Math.min(2,Math.floor(new Date().getHours()/8))];

// Module cache — survives React re-renders and route changes
// This is the fastest possible storage: a plain JS variable
let _songs = null;

export default function Home() {
  const { user, logout }   = useAuth();
  const { playlists, loading: libraryLoading } = useLibrary();
  const { playSong }       = usePlayerActions();
  const navigate           = useNavigate();
  const { isDesktop }      = useBreakpoint();
  const uid                = user?.uid;

  // Seed state from module cache — if data exists, renders instantly with NO loading flash
  const [trending,  setTrending]  = useState(_songs ?? []);
  const [loading,   setLoading]   = useState(!_songs);  // false if cache hit
  const [error,     setError]     = useState(null);
  const [modal,     setModal]     = useState(null);
  const alive = useRef(true);

  useEffect(() => {
    if (!uid) return;
    alive.current = true;

    // If we already have data in module cache, DON'T show loading spinner.
    // Just revalidate silently in background.
    const hasCache = !!_songs;

    const fetch = async () => {
      try {
        const songs = await getTrendingSongs();
        if (!alive.current) return;
        // Update module cache
        _songs = songs;
        setTrending(songs);
      } catch (e) {
        if (alive.current && !hasCache) setError(e.message);
      } finally {
        if (alive.current) setLoading(false);
      }
    };

    fetch();
    return () => { alive.current = false; };
  }, [uid]);

  const bannerSongs = trending.slice(0, 12);

  const firstName = (user?.displayName || user?.email || '').split(/[\s@]/)[0] || 'Friend';
  const showPlaylistsLoading = libraryLoading && playlists.length === 0;

  return (
    <div>
      {/* Header */}
      {!isDesktop && (
        <div style={{ padding:'14px 16px 0', display:'flex',
                      justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontSize:11, color:'var(--text3)', margin:'0 0 1px', letterSpacing:'0.04em' }}>
              {greet()},
            </p>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800,
                         letterSpacing:'-0.02em', color:'var(--text1)', margin:0 }}>
              {firstName} 👋
            </h1>
          </div>
          <button onClick={logout} style={{
            padding:'5px 12px', background:'var(--bg3)',
            border:'1px solid var(--border)', borderRadius:20,
            fontSize:11, color:'var(--text2)', cursor:'pointer',
          }}>Sign out</button>
        </div>
      )}
      {isDesktop && (
        <div style={{ padding:'18px 0 0' }}>
          <p style={{ fontSize:12, color:'var(--text3)', margin:'0 0 1px' }}>{greet()},</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800,
                       letterSpacing:'-0.03em', color:'var(--text1)', margin:0 }}>
            {firstName} 👋
          </h1>
        </div>
      )}

      <div style={{ padding: isDesktop ? '14px 0' : '12px 16px' }}>
        {error && (
          <div style={{ padding:'10px', marginBottom:12, background:'rgba(248,113,113,0.08)',
                        border:'1px solid rgba(248,113,113,0.2)', borderRadius:8,
                        fontSize:12, color:'var(--red)' }}>⚠ {error}</div>
        )}

        {/* ── Hero ── */}
        {loading && !bannerSongs.length
          ? <SK h={isDesktop?220:190} r={18} mb={18}/>
          : bannerSongs.length > 0 && <HeroCarousel songs={bannerSongs} queue={trending} playSong={playSong} isDesktop={isDesktop}/>}

        {/* ── Playlists ── */}
        <section style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between',
                        alignItems:'center', marginBottom:8 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700,
                         color:'var(--text1)', margin:0 }}>Your Playlists</h2>
            <button onClick={() => setModal('new')} style={{
              fontSize:11, color:'var(--accent2)', background:'rgba(var(--accent-rgb),.1)',
              border:'1px solid rgba(var(--accent-rgb),.2)', borderRadius:20,
              padding:'3px 10px', cursor:'pointer', fontWeight:500,
            }}>+ New</button>
          </div>

          {showPlaylistsLoading
            ? <div style={{ display:'flex', gap:8 }}>
                {[0,1,2].map(i => <SK key={i} w={96} h={110} r={10}/>)}
              </div>
            : playlists.length === 0
              ? <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>
                  No playlists yet — create one!
                </p>
              : <div style={{
                  display:'flex', gap:8,
                  overflowX:'auto', paddingBottom:4, scrollbarWidth:'none',
                }}>
                  {playlists.map((pl,i) => (
                    <PL key={pl.id} pl={pl} i={i}
                      onClick={() => navigate(`/playlist/${pl.id}`)}/>
                  ))}
                </div>
          }
        </section>

        {/* ── Trending music ── */}
        <section>
          <div style={{ display:'flex', alignItems:'end', justifyContent:'space-between',
                        gap:10, marginBottom:10 }}>
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800,
                           color:'var(--text1)', margin:0 }}>Trending right now</h2>
            </div>
          </div>
          {loading && !trending.length
            ? <div className="song-grid">
                {[0,1,2,3,4,5].map(i => <SK key={i} h={220} r={12}/>)}
              </div>
            : <div className="song-grid">
                {trending.map((s) => (
                  <SongCard key={s.videoId} song={s}
                    queue={trending} queueIndex={trending.findIndex(item => item.videoId === s.videoId)}
                    variant="grid"
                    onAddToPlaylist={setModal}
                  />
                ))}
              </div>
          }
        </section>
      </div>

      {modal && modal !== 'new' && (
        <PlaylistForm song={modal} playlists={playlists}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// Skeleton
const SK = ({ h, w, r=8, mb=0 }) => (
  <div className="skeleton" style={{
    height:h, minWidth:w, borderRadius:r, marginBottom:mb, flexShrink:w?0:undefined,
  }}/>
);

// Playlist card
const PL = ({ pl, i, onClick }) => (
  <div onClick={onClick} style={{ flexShrink:0, width:96, cursor:'pointer' }}>
    <div style={{
      width:96, height:96, borderRadius:10, marginBottom:5,
      background:`linear-gradient(135deg,hsl(${(i*24+18)%360},60%,34%),hsl(${(i*24+42)%360},65%,22%))`,
      display:'flex', alignItems:'center', justifyContent:'center',
      border:'1px solid var(--border)', transition:'transform .15s',
    }}
      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={`hsl(${(i*24+28)%360},85%,76%)`} strokeWidth="1.5">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    </div>
    <p style={{ fontSize:11, fontWeight:600, color:'var(--text1)', margin:0,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
      {pl.name}
    </p>
    <p style={{ fontSize:10, color:'var(--text3)', margin:'1px 0 0' }}>
      {pl.songCount??0} songs
    </p>
  </div>
);
