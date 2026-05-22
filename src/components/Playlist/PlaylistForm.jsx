// src/components/Playlist/PlaylistForm.jsx
import { useState } from 'react';
import { useAuth }  from '../../context/AuthContext';
import { createPlaylist, addSongToPlaylist } from '../../services/firestore';

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const PlaylistForm = ({ song, playlists, onClose, onCreated }) => {
  const { user }                  = useAuth();
  const [view,    setView]        = useState('pick');
  const [name,    setName]        = useState('');
  const [desc,    setDesc]        = useState('');
  const [saving,  setSaving]      = useState(false);
  const [success, setSuccess]     = useState(null);
  const [error,   setError]       = useState(null);

  const handlePickPlaylist = async (playlist) => {
    setSaving(true); setError(null);
    try {
      await addSongToPlaylist(playlist.id, song);
      setSuccess(playlist.name);
      setTimeout(onClose, 1200);
    } catch { setError('Failed to add song. Try again.'); }
    finally { setSaving(false); }
  };

  const handleCreatePlaylist = async () => {
    if (!name.trim()) return;
    setSaving(true); setError(null);
    try {
      const newId = await createPlaylist(user.uid, { name: name.trim(), description: desc.trim() });
      const newPlaylist = { id: newId, name: name.trim(), songCount: 0 };
      await addSongToPlaylist(newId, song);
      onCreated?.(newPlaylist);
      setSuccess(name.trim());
      setTimeout(onClose, 1200);
    } catch { setError('Failed to create playlist. Try again.'); }
    finally { setSaving(false); }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: '#f5f5f5', border: '1px solid #e0e0e0',
    borderRadius: 8, fontSize: 14, color: '#1a1a1a',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                  display: 'flex', alignItems: 'flex-end', zIndex: 200 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto',
                    background: '#fff', borderRadius: '16px 16px 0 0',
                    padding: '20px 20px 32px', maxHeight: '80vh', overflowY: 'auto' }}
           onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>
            {view === 'pick' ? 'Add to playlist' : 'New playlist'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}>
            <CloseIcon />
          </button>
        </div>

        {/* Song preview */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px',
                      marginBottom: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <img src={song.thumbnailUrl} alt={song.title}
               style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0, whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</p>
            <p style={{ fontSize: 11, margin: 0, color: '#999' }}>{song.channelName}</p>
          </div>
        </div>

        {success && <div style={{ padding: '10px 14px', marginBottom: 12, background: '#f0fdf4',
                                   borderRadius: 8, fontSize: 13, color: '#16a34a' }}>✓ Added to <strong>{success}</strong></div>}
        {error   && <div style={{ padding: '10px 14px', marginBottom: 12, background: '#fef2f2',
                                   borderRadius: 8, fontSize: 13, color: '#dc2626' }}>{error}</div>}

        {view === 'pick' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {playlists.map(pl => (
                <button key={pl.id} onClick={() => handlePickPlaylist(pl)} disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                 width: '100%', textAlign: 'left', background: '#f5f5f5',
                                 border: '1px solid #e0e0e0', borderRadius: 8,
                                 cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: '#e0e0e0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
                      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{pl.name}</p>
                    <p style={{ fontSize: 11, margin: 0, color: '#999' }}>{pl.songCount} songs</p>
                  </div>
                </button>
              ))}
              {playlists.length === 0 && <p style={{ fontSize: 13, color: '#999', textAlign: 'center', padding: '12px 0' }}>No playlists yet</p>}
            </div>
            <button onClick={() => setView('create')} style={{
              marginTop: 12, width: '100%', padding: '10px',
              background: '#1a1a1a', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>+ Create new playlist</button>
          </>
        )}

        {view === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 4 }}>Playlist name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                     placeholder="My awesome playlist" maxLength={60} autoFocus style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 4 }}>Description (optional)</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)}
                        placeholder="What's this playlist about?" rows={3} maxLength={200}
                        style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setView('pick')} style={{
                flex: 1, padding: '10px', background: 'transparent',
                border: '1px solid #e0e0e0', borderRadius: 8,
                fontSize: 13, cursor: 'pointer', color: '#555',
              }}>Back</button>
              <button onClick={handleCreatePlaylist} disabled={!name.trim() || saving} style={{
                flex: 2, padding: '10px',
                background: name.trim() ? '#1a1a1a' : '#e0e0e0',
                color: name.trim() ? '#fff' : '#999',
                border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 500,
                cursor: name.trim() && !saving ? 'pointer' : 'not-allowed',
              }}>{saving ? 'Creating…' : 'Create & add song'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistForm;
