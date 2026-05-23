// src/components/Playlist/PlaylistForm.jsx
import { useState } from 'react';
import { useAuth }  from '../../context/AuthContext';
import { createPlaylist, addSongToPlaylist } from '../../services/firestore';

const PlaylistForm = ({ song, playlists, onClose, onCreated }) => {
  const { user }              = useAuth();
  const [view,    setView]    = useState('pick');
  const [name,    setName]    = useState('');
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(null);
  const [error,   setError]   = useState(null);

  const handlePick = async (pl) => {
    setSaving(true); setError(null);
    try {
      await addSongToPlaylist(pl.id, song);
      setSuccess(pl.name);
      setTimeout(onClose, 1200);
    } catch { setError('Failed to add song.'); }
    finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true); setError(null);
    try {
      const id = await createPlaylist(user.uid, { name: name.trim() });
      await addSongToPlaylist(id, song);
      onCreated?.({ id, name: name.trim(), songCount: 1 });
      setSuccess(name.trim());
      setTimeout(onClose, 1200);
    } catch { setError('Failed to create playlist.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:300,
    }} onClick={onClose}>
      <div style={{
        background:'#282828', borderRadius:8, padding:32,
        width:440, maxWidth:'90vw',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#fff', margin:0 }}>
            {view === 'pick' ? 'Add to playlist' : 'Create playlist'}
          </h2>
          <button onClick={onClose} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'#b3b3b3', fontSize:22, lineHeight:1, padding:4,
          }}>×</button>
        </div>

        {/* Song preview */}
        <div style={{
          display:'flex', gap:12, alignItems:'center',
          padding:'12px', marginBottom:20,
          background:'rgba(255,255,255,0.05)', borderRadius:4,
        }}>
          <img src={song.thumbnailUrl} alt={song.title}
               style={{ width:40, height:40, borderRadius:2, objectFit:'cover', flexShrink:0 }}/>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#fff', margin:0,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {song.title}
            </p>
            <p style={{ fontSize:12, color:'#b3b3b3', margin:0 }}>{song.channelName}</p>
          </div>
        </div>

        {success && (
          <div style={{ padding:'12px', marginBottom:16, background:'rgba(29,185,84,0.15)',
                        borderRadius:4, fontSize:13, color:'#1db954', textAlign:'center' }}>
            ✓ Added to <strong>{success}</strong>
          </div>
        )}
        {error && (
          <div style={{ padding:'12px', marginBottom:16, background:'rgba(255,0,0,0.1)',
                        borderRadius:4, fontSize:13, color:'#f87171', textAlign:'center' }}>
            {error}
          </div>
        )}

        {view === 'pick' && (
          <>
            <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:240, overflowY:'auto' }}>
              {playlists.map(pl => (
                <button key={pl.id} onClick={() => handlePick(pl)} disabled={saving} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'10px 12px', background:'none',
                  border:'none', borderRadius:4, cursor:'pointer',
                  textAlign:'left', transition:'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >
                  <div style={{ width:40, height:40, background:'#3e3e3e', borderRadius:2,
                                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#b3b3b3">
                      <path d="M15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zm6 0a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1z"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'#fff', margin:0 }}>{pl.name}</p>
                    <p style={{ fontSize:12, color:'#b3b3b3', margin:0 }}>{pl.songCount} songs</p>
                  </div>
                </button>
              ))}
              {playlists.length === 0 && (
                <p style={{ fontSize:13, color:'#b3b3b3', textAlign:'center', padding:'16px 0' }}>
                  No playlists yet
                </p>
              )}
            </div>
            <button onClick={() => setView('create')} style={{
              width:'100%', marginTop:16, padding:'12px',
              background:'transparent', border:'1px solid #727272',
              borderRadius:20, color:'#fff', fontSize:14, fontWeight:700,
              cursor:'pointer', fontFamily:'inherit',
              transition:'border-color 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#fff'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#727272'}
            >Create new playlist</button>
          </>
        )}

        {view === 'create' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleCreate()}
                   placeholder="My playlist" autoFocus maxLength={60}
                   style={{
                     width:'100%', padding:'12px 14px',
                     background:'#3e3e3e', border:'2px solid transparent',
                     borderRadius:4, fontSize:15, color:'#fff',
                     outline:'none', boxSizing:'border-box', fontFamily:'inherit',
                   }}
                   onFocus={e => e.target.style.borderColor='#fff'}
                   onBlur={e => e.target.style.borderColor='transparent'}
            />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setView('pick')} style={{
                flex:1, padding:'12px', background:'transparent',
                border:'1px solid #727272', borderRadius:20,
                color:'#fff', fontSize:14, fontWeight:700,
                cursor:'pointer', fontFamily:'inherit',
              }}>Back</button>
              <button onClick={handleCreate} disabled={!name.trim()||saving} style={{
                flex:2, padding:'12px',
                background: name.trim() ? '#1db954' : '#1a6636',
                color:'#000', border:'none', borderRadius:20,
                fontSize:14, fontWeight:700,
                cursor: name.trim()&&!saving ? 'pointer' : 'not-allowed',
                fontFamily:'inherit',
              }}>{saving ? 'Creating…' : 'Create & add'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistForm;
