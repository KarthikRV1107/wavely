// src/components/SongCard/SongCard.jsx
import { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth }   from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';
import { addLikedSong, removeLikedSong } from '../../services/firestore';

export default function SongCard({ song, queue=[], queueIndex=0, isLiked=false, onAddToPlaylist, showIndex=false, style={} }) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const { user } = useAuth();
  const [liked, setLiked]     = useState(isLiked);
  const [liking, setLiking]   = useState(false);
  const [hovered, setHovered] = useState(false);

  const isActive  = currentSong?.videoId === song.videoId;
  const isPlays   = isActive && isPlaying;

  const handlePlay = () => {
    isActive ? togglePlay() : playSong(song, queue.length ? queue : [song], queueIndex);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user || liking) return;
    setLiking(true);
    try {
      liked ? await removeLikedSong(user.uid, song.videoId) : await addLikedSong(user.uid, song);
      setLiked(l => !l);
    } catch {}
    finally { setLiking(false); }
  };

  return (
    <div
      onClick={handlePlay}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px',
        background: isActive
          ? 'rgba(124,106,247,0.12)'
          : hovered ? 'var(--bg3)' : 'transparent',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${isActive ? 'rgba(124,106,247,0.25)' : 'transparent'}`,
        cursor: 'pointer', transition: 'all 0.18s',
        animation: 'fadeUp 0.3s var(--ease-out) both',
        ...style,
      }}
    >
      {/* Thumbnail / index */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {showIndex ? (
          <div style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isActive ? 'var(--accent2)' : 'var(--text3)', fontSize: 13, fontWeight: 500,
          }}>
            {isPlays ? <Equalizer /> : queueIndex + 1}
          </div>
        ) : (
          <>
            <img src={song.thumbnailUrl} alt={song.title}
              style={{
                width: 48, height: 48, borderRadius: 10,
                objectFit: 'cover', display: 'block',
                filter: isActive ? 'brightness(0.85)' : 'none',
                transition: 'filter 0.2s',
              }}
              onError={e => { e.target.style.background='var(--bg4)'; e.target.src=''; }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hovered || isActive ? 1 : 0,
              transition: 'opacity 0.18s',
              color: '#fff',
            }}>
              {isPlays ? <PauseIcon size={16}/> : <PlayIcon size={16}/>}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 500, margin: 0,
          color: isActive ? 'var(--accent3)' : 'var(--text1)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          transition: 'color 0.2s',
        }}>{song.title}</p>
        <p style={{
          fontSize: 12, margin: '2px 0 0',
          color: isActive ? 'var(--accent)' : 'var(--text3)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{song.channelName}</p>
      </div>

      {/* Duration */}
      <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0, marginRight: 4 }}>
        {formatTime(song.durationSeconds)}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 2, opacity: hovered || isActive ? 1 : 0, transition: 'opacity 0.18s' }}
        onClick={e => e.stopPropagation()}>
        <IconBtn onClick={handleLike} title={liked ? 'Unlike' : 'Like'}>
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill={liked ? 'var(--pink)' : 'none'}
            stroke={liked ? 'var(--pink)' : 'var(--text2)'} strokeWidth="1.8">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
        </IconBtn>
        {onAddToPlaylist && (
          <IconBtn onClick={() => onAddToPlaylist(song)} title="Add to playlist">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="1.8">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </IconBtn>
        )}
      </div>
    </div>
  );
}

const IconBtn = ({ onClick, title, children }) => (
  <button onClick={onClick} title={title} style={{
    width: 30, height: 30, borderRadius: 8, background: 'none',
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  }}
    onMouseEnter={e => e.currentTarget.style.background='var(--bg4)'}
    onMouseLeave={e => e.currentTarget.style.background='transparent'}
  >{children}</button>
);

const PlayIcon  = ({size=12}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>;
const PauseIcon = ({size=12}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;

const Equalizer = () => (
  <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:16 }}>
    {[1,2,3].map(i => (
      <div key={i} style={{
        width: 3, height: 16, borderRadius: 2,
        background: 'var(--accent2)',
        animation: `equalizer 0.8s ease-in-out infinite`,
        animationDelay: `${i * 0.15}s`,
        transformOrigin: 'bottom',
      }}/>
    ))}
  </div>
);
