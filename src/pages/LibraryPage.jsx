// src/pages/LibraryPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../context/AuthContext';
import { getUserPlaylists, createPlaylist } from '../services/firestore';

const LibraryPage = () => {
  const { user }                  = useAuth();
  const navigate                  = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name,      setName]      = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    getUserPlaylists(user.uid).then(setPlaylists).finally(() => setLoading(false));
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
    <div style={{ padding:'32px' }}>
      <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', marginBottom:32 }}>
        <h1 style={{ fontSize:28, fontWeight:700, color:'#fff', margin:0 }}>
          Your Library
        </h1>
        <button onClick={() => setShowModal(true)} style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'8px 16px', background:'transparent',
          border:'1px solid #727272', borderRadius:20,
          color:'#fff', fontSize:13, fontWeight:700,
          cursor:'pointer', transition:'border-color 0.1s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor='#fff'}
          onMouseLeave={e => e.currentTarget.style.borderColor='#727272'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-3.25a.75.75 0 0 1 .75.75v1.75h1.75a.75.75 0 0 1 0 1.5H8.75V10.5a.75.75 0 0 1-1.5 0V8.75H5.5a.75.75 0 0 1 0-1.5h1.75V5.5A.75.75 0 0 1 8 4.75z"/>
          </svg>
          Create playlist
        </button>
      </div>

      {loading && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:24 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ background:'#181818', borderRadius:6,
                                   padding:16, aspectRatio:'0.85' }}/>
          ))}
        </div>
      )}

      {!loading && playlists.length === 0 && (
        <div style={{
          background:'#181818', borderRadius:8, padding:40,
          textAlign:'center', maxWidth:400,
        }}>
          <p style={{ fontSize:20, fontWeight:700, color:'#fff', marginBottom:8 }}>
            Create your first playlist
          </p>
          <p style={{ fontSize:14, color:'#b3b3b3', marginBottom:24 }}>
            It's easy, we'll help you
          </p>
          <button onClick={() => setShowModal(true)} style={{
            padding:'12px 32px', background:'#fff', color:'#000',
            border:'none', borderRadius:20, fontSize:14,
            fontWeight:700, cursor:'pointer',
          }}>Create playlist</button>
        </div>
      )}

      {!loading && playlists.length > 0 && (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
          gap:24,
        }}>
          {playlists.map(pl => (
            <div key={pl.id} onClick={() => navigate(`/playlist/${pl.id}`)} style={{
              background:'#181818', borderRadius:6,
              padding:16, cursor:'pointer',
              transition:'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background='#282828'}
              onMouseLeave={e => e.currentTarget.style.background='#181818'}
            >
              <div style={{
                width:'100%', aspectRatio:'1', background:'#282828',
                borderRadius:4, marginBottom:16,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 8px 24px rgba(0,0,0,0.5)',
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="#b3b3b3">
                  <path d="M15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zm6 0a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1z"/>
                </svg>
              </div>
              <p style={{ fontSize:14, fontWeight:700, color:'#fff',
                           margin:'0 0 4px', whiteSpace:'nowrap',
                           overflow:'hidden', textOverflow:'ellipsis' }}>
                {pl.name}
              </p>
              <p style={{ fontSize:12, color:'#b3b3b3', margin:0 }}>
                Playlist • {pl.songCount} songs
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showModal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:300,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background:'#282828', borderRadius:8, padding:32,
            width:480, maxWidth:'90vw',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#fff', margin:'0 0 24px' }}>
              Create playlist
            </h2>
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="My playlist #1"
              autoFocus maxLength={60}
              style={{
                width:'100%', padding:'12px 16px',
                background:'#3e3e3e', border:'none', borderRadius:4,
                fontSize:15, color:'#fff', outline:'none',
                boxSizing:'border-box', fontFamily:'inherit',
              }}
            />
            <div style={{ display:'flex', justifyContent:'flex-end',
                          gap:8, marginTop:24 }}>
              <button onClick={() => setShowModal(false)} style={{
                padding:'12px 24px', background:'transparent',
                border:'none', color:'#fff', borderRadius:20,
                fontSize:14, fontWeight:700, cursor:'pointer',
              }}>Cancel</button>
              <button onClick={handleCreate} disabled={!name.trim() || saving} style={{
                padding:'12px 32px',
                background: name.trim() ? '#fff' : '#4d4d4d',
                color: name.trim() ? '#000' : '#888',
                border:'none', borderRadius:20, fontSize:14,
                fontWeight:700,
                cursor: name.trim() && !saving ? 'pointer' : 'not-allowed',
              }}>{saving ? 'Creating…' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
