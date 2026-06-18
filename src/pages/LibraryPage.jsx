// src/pages/LibraryPage.jsx — loads from localStorage instantly, then revalidates
import { useState } from 'react';
import { useNavigate }   from 'react-router-dom';
import { useAuth }       from '../context/AuthContext';
import { useLibrary }    from '../context/LibraryContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import SongCard from '../components/SongCard/SongCard';

const TABS = ['Playlists', 'Liked Songs'];

export default function LibraryPage() {
  const { user }    = useAuth();
  const {
    playlists,
    likedSongs: liked,
    loading,
    createPlaylistEntry,
  } = useLibrary();
  const navigate    = useNavigate();
  const { isDesktop } = useBreakpoint();
  const uid         = user?.uid;

  const [tab,       setTab]       = useState(0);
  const [modal,     setModal]     = useState(false);
  const [name,      setName]      = useState('');
  const [saving,    setSaving]    = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !uid) return;
    setSaving(true);
    try {
      await createPlaylistEntry(name.trim());
      setName('');
      setModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div>
      <div style={{ padding: isDesktop ? '28px 0 0' : '16px 16px 0' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', marginBottom:16 }}>
          <h1 style={{ fontFamily:'var(--font-display)',
                       fontSize: isDesktop ? 28 : 22, fontWeight:800,
                       letterSpacing:'-0.02em', color:'var(--text1)', margin:0 }}>
            Library
          </h1>
          <button onClick={() => setModal(true)} style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'7px 16px',
            background:'linear-gradient(135deg,var(--accent),var(--gold))',
            border:'none', borderRadius:20, fontSize:12, fontWeight:700,
            color:'#fff', cursor:'pointer',
            boxShadow:'0 4px 14px rgba(var(--accent-rgb),0.28)',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Playlist
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:16,
                      background:'var(--bg3)', borderRadius:10,
                      padding:3, width: isDesktop ? 300 : '100%' }}>
          {TABS.map((t,i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              flex:1, padding:'7px', borderRadius:8, border:'none',
              background: tab===i ? 'var(--bg)' : 'transparent',
              color: tab===i ? 'var(--text1)' : 'var(--text3)',
              fontSize:12, fontWeight: tab===i ? 700 : 400,
              cursor:'pointer', transition:'all 0.15s',
              boxShadow: tab===i ? '0 1px 6px rgba(0,0,0,0.3)' : 'none',
              fontFamily:'inherit',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: isDesktop ? '0' : '0 16px' }}>
        {/* Loading skeletons */}
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[0,1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height:62, borderRadius:12 }}/>
            ))}
          </div>
        )}

        {/* Playlists tab */}
        {!loading && tab === 0 && (
          playlists.length === 0
            ? <Empty icon="🎶" text="No playlists yet"
                     sub='Tap "New Playlist" to create one'/>
            : <div style={{
                display: isDesktop ? 'grid' : 'flex',
                gridTemplateColumns: isDesktop
                  ? 'repeat(auto-fill,minmax(260px,1fr))' : undefined,
                flexDirection: isDesktop ? undefined : 'column',
                gap: 8,
              }}>
                {playlists.map((pl,i) => (
                  <PlRow key={pl.id} pl={pl} i={i}
                    onClick={() => navigate(`/playlist/${pl.id}`)}/>
                ))}
              </div>
        )}

        {/* Liked Songs tab */}
        {!loading && tab === 1 && (
          liked.length === 0
            ? <Empty icon="❤️" text="No liked songs yet"
                     sub="Tap ♥ on any song to save it"/>
            : <div style={{
                display:'grid',
                gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
                gap:2,
              }}>
                {liked.map((song,i) => (
                  <SongCard key={song.id ?? song.videoId}
                    song={song} queue={liked} queueIndex={i} isLiked/>
                ))}
              </div>
        )}
      </div>

      {/* Create playlist modal */}
      {modal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
          backdropFilter:'blur(8px)', display:'flex',
          alignItems:'center', justifyContent:'center',
          zIndex:200, padding:20,
        }} onClick={() => { setModal(false); setName(''); }}>
          <div style={{
            background:'var(--bg2)', borderRadius:16,
            border:'1px solid var(--border2)',
            padding:'24px 20px', width:'100%', maxWidth:340,
            boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:18,
                         fontWeight:700, color:'var(--text1)', margin:'0 0 16px' }}>
              New Playlist
            </h3>
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleCreate()}
              placeholder="Playlist name…" autoFocus maxLength={60}
              style={{
                width:'100%', padding:'11px 14px',
                background:'var(--bg3)', border:'1px solid var(--border)',
                borderRadius:10, fontSize:14, color:'var(--text1)',
                outline:'none', boxSizing:'border-box',
                fontFamily:'inherit', marginBottom:14,
                transition:'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => { setModal(false); setName(''); }} style={{
                flex:1, padding:'10px', background:'var(--bg3)',
                border:'1px solid var(--border)', borderRadius:10,
                fontSize:13, color:'var(--text2)', cursor:'pointer',
                fontFamily:'inherit',
              }}>Cancel</button>
              <button onClick={handleCreate}
                disabled={!name.trim() || saving} style={{
                  flex:2, padding:'10px',
                  background: name.trim()
                    ? 'linear-gradient(135deg,var(--accent),var(--gold))'
                    : 'var(--bg4)',
                  border:'none', borderRadius:10,
                  fontSize:13, fontWeight:700,
                  color: name.trim() ? '#fff' : 'var(--text3)',
                  cursor: name.trim() && !saving ? 'pointer' : 'not-allowed',
                  fontFamily:'inherit',
                  boxShadow: name.trim()
                    ? '0 4px 14px rgba(var(--accent-rgb),0.24)' : 'none',
                }}>
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PlRow = ({ pl, i, onClick }) => (
  <div onClick={onClick} style={{
    display:'flex', alignItems:'center', gap:12,
    padding:'10px 12px', background:'var(--bg2)',
    border:'1px solid var(--border)', borderRadius:12,
    cursor:'pointer', transition:'background 0.15s',
    animation:`fadeUp 0.3s var(--ease-out) ${i*0.04}s both`,
  }}
    onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
    onMouseLeave={e => e.currentTarget.style.background='var(--bg2)'}
  >
    <div style={{
      width:46, height:46, borderRadius:10, flexShrink:0,
      background:`linear-gradient(135deg,
        hsl(${(i*24+18)%360},60%,34%),
        hsl(${(i*24+42)%360},65%,22%))`,
      display:'flex', alignItems:'center', justifyContent:'center',
      border:'1px solid var(--border)',
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={`hsl(${(i*24+28)%360},85%,76%)`} strokeWidth="1.5">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ fontSize:14, fontWeight:600, color:'var(--text1)', margin:0,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {pl.name}
      </p>
      <p style={{ fontSize:11, color:'var(--text3)', margin:'2px 0 0' }}>
        {pl.songCount ?? 0} songs
      </p>
    </div>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="var(--text3)" strokeWidth="2">
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  </div>
);

const Empty = ({ icon, text, sub }) => (
  <div style={{ textAlign:'center', padding:'48px 0' }}>
    <div style={{ fontSize:36, marginBottom:10 }}>{icon}</div>
    <p style={{ fontSize:14, fontWeight:500, color:'var(--text2)', margin:0 }}>{text}</p>
    <p style={{ fontSize:12, color:'var(--text3)', margin:'5px 0 0' }}>{sub}</p>
  </div>
);
