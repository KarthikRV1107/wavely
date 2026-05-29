// src/components/Playlist/PlaylistForm.jsx — optimistic, instant feedback
import { useState } from 'react';
import { useAuth }  from '../../context/AuthContext';
import { createPlaylist, addSongToPlaylist } from '../../services/firestore';

export default function PlaylistForm({ song, playlists, onClose, onCreated }) {
  const { user }            = useAuth();
  const [view, setView]     = useState('pick');
  const [name, setName]     = useState('');
  const [done, setDone]     = useState(null);  // name of playlist added to
  const [err,  setErr]      = useState(null);

  // Pick existing playlist — optimistic, closes immediately
  const handlePick = (pl) => {
    setDone(pl.name);
    // Fire-and-forget — UI already shows success
    addSongToPlaylist(pl.id, song, user?.uid).catch(e => {
      console.error(e);
      setDone(null);
      setErr('Failed to add. Check Firestore rules.');
    });
    setTimeout(onClose, 800);
  };

  // Create new playlist — optimistic
  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    const n = name.trim();
    setDone(n);

    try {
      // createPlaylist updates local cache immediately
      const id = await createPlaylist(user.uid, { name: n });
      // addSongToPlaylist is also optimistic
      addSongToPlaylist(id, song, user.uid).catch(console.error);
      onCreated?.({ id, name: n, songCount: 1 });
      setTimeout(onClose, 800);
    } catch (e) {
      console.error(e);
      setDone(null);
      setErr('Failed to create. Check Firestore rules.');
    }
  };

  // If success, show check immediately
  if (done) {
    return (
      <div style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
        display:'flex', alignItems:'center', justifyContent:'center', zIndex:300,
      }}>
        <div style={{
          background:'#282828', borderRadius:12, padding:'28px 32px',
          textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,.6)',
        }}>
          <div style={{ fontSize:36, marginBottom:12 }}>✓</div>
          <p style={{ fontSize:15, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>
            Added to
          </p>
          <p style={{ fontSize:13, color:'#a78bfa', margin:0 }}>{done}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:300, padding:20,
    }} onClick={onClose}>
      <div style={{
        background:'#282828', borderRadius:10, padding:'24px 20px',
        width:'100%', maxWidth:400,
        boxShadow:'0 8px 40px rgba(0,0,0,.6)',
      }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', marginBottom:18 }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:'#fff', margin:0 }}>
            {view==='pick' ? 'Add to playlist' : 'New playlist'}
          </h2>
          <button onClick={onClose} style={{
            background:'none', border:'none', color:'#888',
            fontSize:22, cursor:'pointer', lineHeight:1, padding:'0 2px',
          }}>×</button>
        </div>

        {/* Song preview */}
        <div style={{ display:'flex', gap:10, alignItems:'center',
                      padding:'8px 10px', marginBottom:16,
                      background:'rgba(255,255,255,.05)', borderRadius:6 }}>
          <img src={song.thumbnailUrl} alt=""
            style={{ width:38, height:38, borderRadius:4, objectFit:'cover', flexShrink:0 }}
            onError={e=>{e.target.style.display='none';}}/>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'#fff', margin:0,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {song.title}
            </p>
            <p style={{ fontSize:11, color:'#888', margin:0 }}>{song.channelName}</p>
          </div>
        </div>

        {err && (
          <div style={{ padding:'8px 10px', marginBottom:12, fontSize:12,
                        color:'#f87171', background:'rgba(248,113,113,.1)',
                        borderRadius:6 }}>{err}</div>
        )}

        {/* Pick view */}
        {view==='pick' && (
          <>
            <div style={{ maxHeight:200, overflowY:'auto',
                          display:'flex', flexDirection:'column', gap:2, marginBottom:12 }}>
              {playlists.length===0 && (
                <p style={{ fontSize:13, color:'#666', textAlign:'center', padding:'14px 0' }}>
                  No playlists yet
                </p>
              )}
              {playlists.map(pl => (
                <button key={pl.id} onClick={()=>handlePick(pl)} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
                  background:'none', border:'none', borderRadius:6, cursor:'pointer',
                  textAlign:'left', width:'100%',
                }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}
                  onMouseLeave={e=>e.currentTarget.style.background='none'}
                >
                  <div style={{ width:36, height:36, background:'#3e3e3e', borderRadius:4,
                                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
                      <path d="M9 18V5l12-2v13"/>
                      <circle cx="6" cy="18" r="3"/>
                      <circle cx="18" cy="16" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:'#fff', margin:0 }}>{pl.name}</p>
                    <p style={{ fontSize:11, color:'#888', margin:0 }}>{pl.songCount??0} songs</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={()=>setView('create')} style={{
              width:'100%', padding:'10px',
              background:'transparent', border:'1px solid #444',
              borderRadius:20, color:'#fff', fontSize:13, fontWeight:600,
              cursor:'pointer', fontFamily:'inherit',
            }}>+ Create new playlist</button>
          </>
        )}

        {/* Create view */}
        {view==='create' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <input
              type="text" value={name} onChange={e=>setName(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleCreate()}
              placeholder="Playlist name" autoFocus maxLength={60}
              style={{
                width:'100%', padding:'11px 13px',
                background:'#3e3e3e', border:'2px solid transparent',
                borderRadius:6, fontSize:14, color:'#fff',
                outline:'none', boxSizing:'border-box', fontFamily:'inherit',
              }}
              onFocus={e=>e.target.style.borderColor='#7c6af7'}
              onBlur={e=>e.target.style.borderColor='transparent'}
            />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setView('pick')} style={{
                flex:1, padding:'10px', background:'transparent',
                border:'1px solid #444', borderRadius:20,
                color:'#aaa', fontSize:13, cursor:'pointer', fontFamily:'inherit',
              }}>Back</button>
              <button onClick={handleCreate} disabled={!name.trim()} style={{
                flex:2, padding:'10px',
                background: name.trim() ? '#7c6af7' : '#3e3e3e',
                border:'none', borderRadius:20,
                color: name.trim() ? '#fff' : '#555',
                fontSize:13, fontWeight:700,
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                fontFamily:'inherit',
              }}>Create & add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
