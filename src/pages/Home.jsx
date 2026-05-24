// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate }      from 'react-router-dom';
import { useAuth }          from '../context/AuthContext';
import { usePlayer }        from '../context/PlayerContext';
import { useBreakpoint }    from '../hooks/useBreakpoint';
import { getTrendingSongs } from '../services/youtube';
import { getUserPlaylists } from '../services/firestore';
import SongCard             from '../components/SongCard/SongCard';
import PlaylistForm         from '../components/Playlist/PlaylistForm';

const greeting = () =>
  ['Good morning','Good afternoon','Good evening'][Math.min(2,Math.floor(new Date().getHours()/8))];

// Module-level cache: survives re-renders and route changes
let _T = null; // trending
let _P = {};   // playlists per uid

export default function Home() {
  const { user, logout }   = useAuth();
  const { playSong }       = usePlayer();
  const navigate           = useNavigate();
  const { isDesktop }      = useBreakpoint();

  const [trending,  setTrending]  = useState(_T ?? []);
  const [playlists, setPlaylists] = useState(_P[user?.uid] ?? []);
  const [loading,   setLoading]   = useState(!_T);
  const [error,     setError]     = useState(null);
  const [modal,     setModal]     = useState(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    if (!user?.uid) return;
    const uid = user.uid;

    (async () => {
      try {
        const [songs, lists] = await Promise.all([
          getTrendingSongs(),
          getUserPlaylists(uid),
        ]);
        if (!alive.current) return;
        _T = songs; _P[uid] = lists;
        setTrending(songs);
        setPlaylists(lists);
      } catch (e) {
        if (alive.current && !_T) setError(e.message);
      } finally {
        if (alive.current) setLoading(false);
      }
    })();

    return () => { alive.current = false; };
  }, [user?.uid]);

  const firstName = (user?.displayName || user?.email || '').split(/[\s@]/)[0] || 'Friend';
  const featured  = trending[0];
  const rest      = trending.slice(1);

  return (
    <div>
      {/* Mobile header */}
      {!isDesktop && (
        <div style={{ padding:'16px 16px 0', display:'flex',
                      justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontSize:11, color:'var(--text3)', margin:'0 0 1px', letterSpacing:'0.04em' }}>
              {greeting()},
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
        <div style={{ padding:'20px 0 0' }}>
          <p style={{ fontSize:12, color:'var(--text3)', margin:'0 0 2px' }}>{greeting()},</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800,
                       letterSpacing:'-0.03em', color:'var(--text1)', margin:0 }}>
            {firstName} 👋
          </h1>
        </div>
      )}

      <div style={{ padding: isDesktop ? '16px 0' : '12px 16px' }}>
        {error && (
          <div style={{ padding:'10px 14px', marginBottom:14,
                        background:'rgba(248,113,113,0.08)',
                        border:'1px solid rgba(248,113,113,0.2)',
                        borderRadius:8, fontSize:12, color:'var(--red)' }}>
            ⚠ {error}
          </div>
        )}

        {/* Hero */}
        {loading && !featured
          ? <Skel h={isDesktop ? 220 : 160} r={16} mb={20}/>
          : featured && (
          <div onClick={() => playSong(featured, trending, 0)} style={{
            position:'relative', borderRadius:16, overflow:'hidden',
            marginBottom:20, cursor:'pointer',
            height: isDesktop ? 220 : 160,
            flexShrink: 0,
          }}>
            <img src={featured.thumbnailUrl} alt={featured.title} loading="eager"
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            <div style={{ position:'absolute', inset:0,
              background:'linear-gradient(to top,rgba(10,10,15,0.95) 0%,transparent 65%)' }}/>
            <div style={{ position:'absolute', bottom:0, left:0, right:0,
                          padding: isDesktop ? '20px' : '14px' }}>
              <p style={{ fontSize:9, color:'var(--accent3)', letterSpacing:'0.12em',
                          fontWeight:700, margin:'0 0 3px' }}>🔥 TRENDING #1</p>
              <h2 style={{ fontFamily:'var(--font-display)',
                           fontSize: isDesktop ? 20 : 16, fontWeight:700,
                           color:'#fff', margin:'0 0 2px',
                           overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {featured.title}
              </h2>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.6)', margin:0 }}>
                {featured.channelName}
              </p>
              <div style={{
                marginTop:10, display:'inline-flex', alignItems:'center', gap:6,
                background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)',
                borderRadius:50, padding:'5px 14px',
                border:'1px solid rgba(255,255,255,0.2)',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white" style={{marginLeft:1}}>
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
                <span style={{ fontSize:11, fontWeight:600, color:'#fff' }}>Play Now</span>
              </div>
            </div>
          </div>
        )}

        {/* Playlists */}
        <section style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between',
                        alignItems:'center', marginBottom:10 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700,
                         color:'var(--text1)', margin:0 }}>Your Playlists</h2>
            <button onClick={() => setModal('new')} style={{
              fontSize:11, color:'var(--accent2)', background:'rgba(124,106,247,0.1)',
              border:'1px solid rgba(124,106,247,0.2)', borderRadius:20,
              padding:'3px 10px', cursor:'pointer', fontWeight:500,
            }}>+ New</button>
          </div>

          {loading && !playlists.length
            ? <div style={{ display:'flex', gap:10 }}>
                {[0,1,2].map(i=><Skel key={i} w={100} h={120} r={12}/>)}
              </div>
            : playlists.length === 0
              ? <p style={{ fontSize:13, color:'var(--text3)', margin:0 }}>
                  No playlists yet — create one!
                </p>
              : <div style={{
                  display: isDesktop ? 'grid' : 'flex',
                  gridTemplateColumns: isDesktop
                    ? 'repeat(auto-fill,minmax(110px,1fr))' : undefined,
                  gap:10,
                  overflowX: isDesktop ? 'visible' : 'auto',
                  paddingBottom:4, scrollbarWidth:'none',
                }}>
                  {playlists.map((pl,i) => (
                    <PlCard key={pl.id} pl={pl} i={i}
                      onClick={() => navigate(`/playlist/${pl.id}`)}/>
                  ))}
                </div>
          }
        </section>

        {/* Trending — compact grid, no overflow */}
        <section>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700,
                       color:'var(--text1)', margin:'0 0 10px' }}>Trending Now</h2>
          {loading && !rest.length
            ? <div style={{ display:'grid',
                            gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap:4 }}>
                {[0,1,2,3].map(i => <Skel key={i} h={52} r={8}/>)}
              </div>
            : <div style={{
                display: 'grid',
                gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
                gap: 2,                          // tight gap — compact list
              }}>
                {rest.map((s,i) => (
                  <SongCard key={s.videoId} song={s}
                    queue={trending} queueIndex={i+1}
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
          onCreated={pl => setPlaylists(p => [pl,...p])}/>
      )}
    </div>
  );
}

// Skeleton loader
const Skel = ({ h, w, r=8, mb=0 }) => (
  <div className="skeleton" style={{
    height:h, minWidth:w, borderRadius:r, marginBottom:mb,
    flexShrink: w ? 0 : undefined,
  }}/>
);

// Playlist card — compact square
const PlCard = ({ pl, i, onClick }) => (
  <div onClick={onClick} style={{
    flexShrink:0, width:110, cursor:'pointer',
  }}>
    <div style={{
      width:110, height:110, borderRadius:12, marginBottom:6,
      background:`linear-gradient(135deg,
        hsl(${(i*55+240)%360},40%,20%),
        hsl(${(i*55+280)%360},50%,15%))`,
      display:'flex', alignItems:'center', justifyContent:'center',
      border:'1px solid var(--border)', transition:'transform 0.15s',
    }}
      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'}
      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke={`hsl(${(i*55+240)%360},65%,65%)`} strokeWidth="1.5">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    </div>
    <p style={{ fontSize:12, fontWeight:600, color:'var(--text1)', margin:0,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
      {pl.name}
    </p>
    <p style={{ fontSize:10, color:'var(--text3)', margin:'1px 0 0' }}>
      {pl.songCount ?? 0} songs
    </p>
  </div>
);
