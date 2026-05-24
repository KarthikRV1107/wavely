// src/components/Playlist/PlaylistForm.jsx
import { useState } from 'react';
import { useAuth }  from '../../context/AuthContext';
import { createPlaylist, addSongToPlaylist } from '../../services/firestore';

export default function PlaylistForm({ song, playlists, onClose, onCreated }) {
  const { user }              = useAuth();
  const [view,    setView]    = useState('pick');
  const [name,    setName]    = useState('');
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(null);
  const [error,   setError]   = useState(null);

  const handlePick = async (pl) => {
    setSaving(true); setError(null);
    try {
      await addSongToPlaylist(pl.id, song, user?.uid);
      setSuccess(pl.name);
      setTimeout(onClose, 1000);
    } catch (e) {
      console.error('addSongToPlaylist failed:', e);
      setError('Failed to add song. Check Firestore rules.');
    }
    finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    setSaving(true); setError(null);
    try {
      const id = await createPlaylist(user.uid, { name: name.trim() });
      await addSongToPlaylist(id, song, user.uid);
      onCreated?.({ id, name: name.trim(), songCount: 1 });
      setSuccess(name.trim());
      setTimeout(onClose, 1000);
    } catch (e) {
      console.error('createPlaylist failed:', e);
      setError('Failed to create playlist. Check Firestore rules.');
    }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: '#282828', borderRadius: 8,
        padding: '28px 24px', width: '100%', maxWidth: 420,
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
            {view === 'pick' ? 'Add to playlist' : 'New playlist'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#aaa',
            fontSize: 22, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
          }}>×</button>
        </div>

        {/* Song being added */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          padding: '10px 12px', marginBottom: 16,
          background: 'rgba(255,255,255,0.05)', borderRadius: 4,
        }}>
          <img src={song.thumbnailUrl} alt={song.title}
            style={{ width: 40, height: 40, borderRadius: 2,
                     objectFit: 'cover', flexShrink: 0 }}
            onError={e => { e.target.style.display='none'; }}
          />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {song.title}
            </p>
            <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>{song.channelName}</p>
          </div>
        </div>

        {/* Feedback */}
        {success && (
          <div style={{ padding: '10px', marginBottom: 12, background: 'rgba(29,185,84,0.15)',
                        borderRadius: 4, fontSize: 13, color: '#1db954', textAlign: 'center' }}>
            ✓ Added to <strong>{success}</strong>
          </div>
        )}
        {error && (
          <div style={{ padding: '10px', marginBottom: 12, background: 'rgba(248,113,113,0.12)',
                        borderRadius: 4, fontSize: 13, color: '#f87171', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Pick view */}
        {view === 'pick' && (
          <>
            <div style={{ maxHeight: 220, overflowY: 'auto',
                          display: 'flex', flexDirection: 'column', gap: 2 }}>
              {playlists.length === 0 && (
                <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center', padding: '16px 0' }}>
                  No playlists yet — create one below
                </p>
              )}
              {playlists.map(pl => (
                <button key={pl.id} onClick={() => !saving && handlePick(pl)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: 'none', border: 'none',
                  borderRadius: 4, cursor: saving ? 'wait' : 'pointer',
                  textAlign: 'left', width: '100%', transition: 'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >
                  <div style={{
                    width: 40, height: 40, background: '#3e3e3e',
                    borderRadius: 2, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="#aaa" strokeWidth="1.5">
                      <path d="M9 18V5l12-2v13"/>
                      <circle cx="6" cy="18" r="3"/>
                      <circle cx="18" cy="16" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>{pl.name}</p>
                    <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>{pl.songCount ?? 0} songs</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setView('create')} style={{
              width: '100%', marginTop: 14, padding: '11px',
              background: 'transparent', border: '1px solid #555',
              borderRadius: 20, color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#fff'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#555'}
            >+ Create new playlist</button>
          </>
        )}

        {/* Create view */}
        {view === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="My playlist #1" autoFocus maxLength={60}
              style={{
                width: '100%', padding: '12px 14px',
                background: '#3e3e3e', border: '2px solid transparent',
                borderRadius: 4, fontSize: 15, color: '#fff',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor='#7c6af7'}
              onBlur={e => e.target.style.borderColor='transparent'}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setView('pick')} style={{
                flex: 1, padding: '11px', background: 'transparent',
                border: '1px solid #555', borderRadius: 20,
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Back</button>
              <button onClick={handleCreate} disabled={!name.trim() || saving} style={{
                flex: 2, padding: '11px',
                background: name.trim() && !saving ? '#7c6af7' : '#3e3e3e',
                border: 'none', borderRadius: 20,
                color: name.trim() && !saving ? '#fff' : '#666',
                fontSize: 14, fontWeight: 700,
                cursor: name.trim() && !saving ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
              }}>
                {saving ? 'Creating…' : 'Create & add song'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
