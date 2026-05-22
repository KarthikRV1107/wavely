// src/pages/LibraryPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../context/AuthContext';
import { getUserPlaylists, createPlaylist } from '../services/firestore';
import BottomNav               from '../components/BottomNav';

const LibraryPage = () => {
  const { user }                    = useAuth();
  const navigate                    = useNavigate();
  const [playlists, setPlaylists]   = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [name,      setName]        = useState('');
  const [saving,    setSaving]      = useState(false);

  useEffect(() => {
    getUserPlaylists(user.uid)
      .then(setPlaylists)
      .finally(() => setLoading(false));
  }, [user.uid]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const id = await createPlaylist(user.uid, { name: name.trim() });
      setPlaylists(prev => [{ id, name: name.trim(), songCount: 0 }, ...prev]);
      setName(''); setShowModal(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 16px 8px', background: '#fff',
                    borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>Library</span>
        <button onClick={() => setShowModal(true)} style={{
          padding: '6px 14px', background: '#1a1a1a', color: '#fff', border: 'none',
          borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
        }}>+ New</button>
      </div>

      <div style={{ padding: 16 }}>
        {loading && <div style={{ color: '#999', fontSize: 13 }}>Loading…</div>}
        {!loading && playlists.length === 0 && (
          <p style={{ color: '#999', fontSize: 13 }}>No playlists yet. Create one!</p>
        )}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {playlists.map(pl => (
              <div key={pl.id} onClick={() => navigate(`/playlist/${pl.id}`)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, cursor: 'pointer',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 6, background: '#f0f0f0',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{pl.name}</p>
                  <p style={{ fontSize: 12, color: '#999', margin: 0 }}>{pl.songCount} songs</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
             onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '24px', width: 320 }}
               onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 16px' }}>Create playlist</h2>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
                   placeholder="Playlist name" autoFocus maxLength={60}
                   style={{ width: '100%', padding: '9px 12px', background: '#f5f5f5',
                            border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14,
                            outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '9px', background: 'transparent', border: '1px solid #e0e0e0',
                borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#555',
              }}>Cancel</button>
              <button onClick={handleCreate} disabled={!name.trim() || saving} style={{
                flex: 2, padding: '9px', background: name.trim() ? '#1a1a1a' : '#e0e0e0',
                color: name.trim() ? '#fff' : '#aaa', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 500, cursor: name.trim() ? 'pointer' : 'not-allowed',
              }}>{saving ? 'Creating…' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="library" />
    </div>
  );
};

export default LibraryPage;
