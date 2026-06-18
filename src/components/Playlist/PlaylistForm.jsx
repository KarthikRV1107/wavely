import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { addSongToPlaylist } from '../../services/firestore';

export default function PlaylistForm({ song, playlists, onClose, onCreated }) {
  const { user } = useAuth();
  const { adjustPlaylistSongCount, createPlaylistEntry } = useLibrary();
  const [view, setView] = useState('pick');
  const [name, setName] = useState('');
  const [done, setDone] = useState(null);
  const [err, setErr] = useState(null);

  const handlePick = (pl) => {
    setDone(pl.name);
    adjustPlaylistSongCount(pl.id, 1);
    addSongToPlaylist(pl.id, song, user?.uid).catch((e) => {
      console.error(e);
      adjustPlaylistSongCount(pl.id, -1);
      setDone(null);
      setErr('Failed to add. Check Firestore rules.');
    });
    setTimeout(onClose, 250);
  };

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    const trimmed = name.trim();
    setDone(trimmed);

    try {
      const playlist = await createPlaylistEntry(trimmed);
      adjustPlaylistSongCount(playlist.id, 1);
      addSongToPlaylist(playlist.id, song, user.uid).catch((e) => {
        console.error(e);
        adjustPlaylistSongCount(playlist.id, -1);
      });
      onCreated?.({ ...playlist, songCount: 1 });
      setTimeout(onClose, 250);
    } catch (e) {
      console.error(e);
      setDone(null);
      setErr('Failed to create. Check Firestore rules.');
    }
  };

  if (done) {
    return (
      <div style={overlayStyle}>
        <div style={successCardStyle}>
          <div style={successIconWrapStyle}>
            <CheckIcon />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)', margin: '0 0 4px' }}>
            Added to
          </p>
          <p style={{ fontSize: 13, color: 'var(--accent2)', margin: 0 }}>{done}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text1)', margin: 0 }}>
              {view === 'pick' ? 'Add To Playlist' : 'New Playlist'}
            </h2>
            <p style={{ fontSize: 11, color: 'var(--text3)', margin: '4px 0 0' }}>
              Save songs without waiting on the network.
            </p>
          </div>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close">
            x
          </button>
        </div>

        <div style={songPreviewStyle}>
          <img
            src={song.thumbnailUrl}
            alt=""
            style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {song.title}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>
              {song.channelName}
            </p>
          </div>
        </div>

        {err && (
          <div style={{
            padding: '8px 10px',
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--red)',
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.18)',
            borderRadius: 10,
          }}>
            {err}
          </div>
        )}

        {view === 'pick' && (
          <>
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {playlists.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '14px 0' }}>
                  No playlists yet
                </p>
              )}
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handlePick(pl)}
                  style={playlistRowStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={playlistGlyphWrapStyle}>
                    <MusicListIcon />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)', margin: 0 }}>{pl.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>{pl.songCount ?? 0} songs</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setView('create')} style={secondaryButtonStyle}>
              + Create New Playlist
            </button>
          </>
        )}

        {view === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Playlist name"
              autoFocus
              maxLength={60}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'transparent'; }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setView('pick')} style={{ ...secondaryButtonStyle, flex: 1 }}>
                Back
              </button>
              <button onClick={handleCreate} disabled={!name.trim()} style={{ ...primaryButtonStyle, flex: 2, opacity: name.trim() ? 1 : 0.55 }}>
                Create And Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.62)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 300,
  padding: 20,
};

const cardStyle = {
  background: 'linear-gradient(180deg, var(--bg2), var(--bg3))',
  border: '1px solid var(--border)',
  borderRadius: 18,
  padding: '24px 20px',
  width: '100%',
  maxWidth: 420,
  boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
};

const successCardStyle = {
  background: 'linear-gradient(180deg, var(--bg2), var(--bg3))',
  border: '1px solid var(--border)',
  borderRadius: 18,
  padding: '28px 32px',
  textAlign: 'center',
  boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
};

const successIconWrapStyle = {
  width: 54,
  height: 54,
  borderRadius: '50%',
  margin: '0 auto 14px',
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(var(--accent-rgb),0.12)',
  color: 'var(--accent2)',
};

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text3)',
  fontSize: 20,
  lineHeight: 1,
  padding: '0 2px',
};

const songPreviewStyle = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  padding: '10px 12px',
  marginBottom: 16,
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: 12,
};

const playlistRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 12,
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
};

const playlistGlyphWrapStyle = {
  width: 38,
  height: 38,
  background: 'var(--bg4)',
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: 'var(--text3)',
};

const secondaryButtonStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'transparent',
  border: '1px solid var(--border2)',
  borderRadius: 999,
  color: 'var(--text1)',
  fontSize: 13,
  fontWeight: 700,
};

const primaryButtonStyle = {
  padding: '10px 12px',
  background: 'linear-gradient(135deg, var(--accent), var(--gold))',
  border: 'none',
  borderRadius: 999,
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
  boxShadow: '0 10px 24px rgba(var(--accent-rgb),0.22)',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--bg3)',
  border: '2px solid transparent',
  borderRadius: 12,
  fontSize: 14,
  color: 'var(--text1)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="m5 13 4 4L19 7"/>
  </svg>
);

const MusicListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 18V5l11-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);
