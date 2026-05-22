// src/components/SongCard/SongCard.jsx
import { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth }   from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';
import { addLikedSong, removeLikedSong } from '../../services/firestore';

const PlayIcon  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>;
const PauseIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24"
       fill={filled ? '#e53e3e' : 'none'} stroke={filled ? '#e53e3e' : 'currentColor'} strokeWidth="1.5">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>
  </svg>
);
const AddIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const SongCard = ({ song, queue = [], queueIndex = 0, isLiked = false, onAddToPlaylist, showIndex = false }) => {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const { user } = useAuth();
  const [liked, setLiked]           = useState(isLiked);
  const [likeLoading, setLikeLoading] = useState(false);

  const isThisSongActive  = currentSong?.videoId === song.videoId;
  const isThisSongPlaying = isThisSongActive && isPlaying;

  const handlePlay = () => {
    if (isThisSongActive) { togglePlay(); }
    else { playSong(song, queue.length > 0 ? queue : [song], queueIndex); }
  };

  const handleLike = async () => {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    try {
      if (liked) { await removeLikedSong(user.uid, song.videoId); setLiked(false); }
      else       { await addLikedSong(user.uid, song);             setLiked(true);  }
    } catch (err) { console.error('Like failed:', err); }
    finally { setLikeLoading(false); }
  };

  return (
    <div onClick={handlePlay} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px',
      background: isThisSongActive ? '#eff6ff' : '#ffffff',
      borderRadius: 8,
      border: `1px solid ${isThisSongActive ? '#bfdbfe' : '#e5e5e5'}`,
      transition: 'background 0.15s', cursor: 'pointer',
    }}>
      {showIndex ? (
        <span style={{ fontSize: 12, color: isThisSongActive ? '#3b82f6' : '#999',
                       minWidth: 20, textAlign: 'center' }}>
          {isThisSongPlaying ? <PauseIcon /> : queueIndex + 1}
        </span>
      ) : (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={song.thumbnailUrl} alt={song.title}
               style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', display: 'block' }}
               onError={(e) => { e.target.style.background = '#eee'; e.target.src = ''; }} />
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: isThisSongActive ? 1 : 0, transition: 'opacity 0.15s', color: '#fff',
          }}>
            {isThisSongPlaying ? <PauseIcon /> : <PlayIcon />}
          </div>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: 0,
                    color: isThisSongActive ? '#1d4ed8' : '#1a1a1a',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {song.title}
        </p>
        <p style={{ fontSize: 11, margin: 0, color: isThisSongActive ? '#3b82f6' : '#999' }}>
          {song.channelName}
        </p>
      </div>

      <span style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>{formatTime(song.durationSeconds)}</span>

      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
        <button onClick={handleLike} disabled={likeLoading} aria-label={liked ? 'Unlike' : 'Like'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                         color: '#888', opacity: likeLoading ? 0.5 : 1 }}>
          <HeartIcon filled={liked} />
        </button>
        {onAddToPlaylist && (
          <button onClick={() => onAddToPlaylist(song)} aria-label="Add to playlist"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#888' }}>
            <AddIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default SongCard;
