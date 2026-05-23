// src/pages/LibraryPage.jsx — responsive
import { useState, useEffect } from 'react';
import { useNavigate }  from 'react-router-dom';
import { useAuth }      from '../context/AuthContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { getUserPlaylists, getLikedSongs, createPlaylist } from '../services/firestore';
import SongCard         from '../components/SongCard/SongCard';

const TABS = ['Playlists','Liked Songs'];

export default function LibraryPage() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const { isDesktop } = useBreakpoint();
  const [tab,       setTab]       = useState(0);
  const [playlists, setPlaylists] = useState([]);
  const [liked,     setLiked]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [name,      setName]      = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    Promise.all([getUserPlaylists(user.uid), getLikedSongs(user.uid)])
      .then(([pl, lk]) => { setPlaylists(pl); setLiked(lk); })
      .finally(() => setLoading(false));
  }, [user.uid]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const id = await createPlaylist(user.uid, { name: name.trim() });
      setPlaylists(p => [{ id, name: name.trim(), songCount:0 }, ...p]);
      setName(''); setModal(false);
    } catch {}
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ padding: isDesktop ? '28px 0 0' : '20px 20px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h1 style={{
            fontFamily:'var(--font-display)', fontSize: isDesktop ? 32 : 26, fontWeight:800,
            letterSpacing:'-0.02em', color:'var(--text1)', margin:0,
          }}>Library</h1>
          <button onClick={() => setModal(true)} style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'9px 18px',
            background:'linear-gradient(135deg, var(--accent), #5b4fcf)',
            border:'none', borderRadius:20, fontSize:13, fontWeight:600,
            color:'#fff', cursor:'pointer',
            boxShadow:'0 4px 16px rgba(124,106,247,0.35)',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Playlist
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display:'flex', gap:4, marginBottom:20,
          background:'var(--bg3)', borderRadius:12, padding:4,
          width: isDesktop ? 320 : '100%',
        }}>
          {TABS.map((t,i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              flex:1, padding:'8px', borderRadius:9, border:'none',
              background: tab===i ? 'var(--bg)' : 'transparent',
              color: tab===i ? 'var(--text1)' : 'var(--text3)',
              fontSize:13, fontWeight: tab===i ? 600 : 400,
              cursor:'pointer', transition:'all 0.18s',
              boxShadow: tab===i ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: isDesktop ? '0' : '0 20px' }}>
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[...Array(4)].map((_,i) => (
              <div key={i} className="skeleton" style={{ height:70, borderRadius:14 }}/>
            ))}
          </div>
        )}

        {!loading && tab === 0 && (
          playlists.length === 0
            ? <Empty icon="🎶" text="No playlists yet" sub='Tap "New Playlist" to create one'/>
            : <div style={{
                display: isDesktop ? 'grid' : 'flex',
                gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
                flexDirection: isDesktop ? undefined : 'column',
                gap:10,
              }}>
                {playlists.map((pl,i) => (
                  <PlaylistRow key={pl.id} pl={pl} i={i} onClick={() => navigate(`/playlist/${pl.id}`)}/>
                ))}
              </div>
        )}

        {!loading && tab === 1 && (
          liked.length === 0
            ? <Empty icon="❤️" text="No liked songs" sub="Tap ♥ on any song"/>
            : <div style={{
                display: isDesktop ? 'grid' : 'flex',
                gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined,
                flexDirection: isDesktop ? undefined : 'column',
                gap:4,
              }}>
                {liked.map((song, i) => (
                  <SongCard key={song.id} song={song}
                    queue={liked} queueIndex={i} isLiked
                    style={{ animationDelay:`${i*0.04}s` }}
                  />
                ))}
              </div>
        )}
      </div>

      {modal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
          backdropFilter:'blur(10px)', display:'flex',
          alignItems:'center', justifyContent:'center',
          zIndex:200, padding:20, animation:'fadeIn 0.15s ease',
        }} onClick={() => setModal(false)}>
          <div style={{
            background:'var(--bg2)', borderRadius:24,
            border:'1px solid var(--border2)',
            padding:28, width:'100%', maxWidth:360,
            boxShadow:'0 24px 80px rgba(0,0,0,0.6)',
            animation:'fadeUp 0.25s var(--ease-out) both',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700,
                         color:'var(--text1)', margin:'0 0 20px' }}>New Playlist</h3>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Playlist name…" autoFocus maxLength={60}
              onKeyDown={e => e.key==='Enter' && handleCreate()}
              style={{
                width:'100%', padding:'13px 16px',
                background:'var(--bg3)', border:'1px solid var(--border)',
                borderRadius:12, fontSize:14, color:'var(--text1)',
                outline:'none', marginBottom:16, boxSizing:'border-box',
              }}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setModal(false)} style={{
                flex:1, padding:'12px', background:'var(--bg3)',
                border:'1px solid var(--border)', borderRadius:12,
                fontSize:13, color:'var(--text2)', cursor:'pointer',
              }}>Cancel</button>
              <button onClick={handleCreate} disabled={!name.trim()||saving} style={{
                flex:2, padding:'12px',
                background: name.trim() ? 'linear-gradient(135deg, var(--accent), #5b4fcf)' : 'var(--bg4)',
                border:'none', borderRadius:12, fontSize:13, fontWeight:600,
                color: name.trim() ? '#fff' : 'var(--text3)',
                cursor: name.trim()&&!saving ? 'pointer' : 'not-allowed',
                boxShadow: name.trim() ? '0 4px 16px rgba(124,106,247,0.3)' : 'none',
              }}>{saving ? 'Creating…' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PlaylistRow = ({ pl, i, onClick }) => (
  <div onClick={onClick} style={{
    display:'flex', alignItems:'center', gap:14,
    padding:'12px 14px', background:'var(--bg2)',
    border:'1px solid var(--border)', borderRadius:14,
    cursor:'pointer', transition:'all 0.18s',
    animation:`fadeUp 0.3s var(--ease-out) ${i*0.05}s both`,
  }}
    onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
    onMouseLeave={e => e.currentTarget.style.background='var(--bg2)'}
  >
    <div style={{
      width:52, height:52, borderRadius:12, flexShrink:0,
      background:`linear-gradient(135deg,hsl(${(i*60+240)%360},40%,20%),hsl(${(i*60+270)%360},50%,15%))`,
      display:'flex', alignItems:'center', justifyContent:'center',
      border:'1px solid var(--border)',
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={`hsl(${(i*60+240)%360},70%,65%)`} strokeWidth="1.5">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ fontSize:15, fontWeight:600, color:'var(--text1)', margin:0,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pl.name}</p>
      <p style={{ fontSize:12, color:'var(--text3)', margin:'2px 0 0' }}>{pl.songCount} songs</p>
    </div>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="var(--text3)" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
  </div>
);

const Empty = ({ icon, text, sub }) => (
  <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text3)' }}>
    <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
    <p style={{ fontSize:15, fontWeight:500, color:'var(--text2)', margin:0 }}>{text}</p>
    <p style={{ fontSize:13, margin:'6px 0 0' }}>{sub}</p>
  </div>
);
