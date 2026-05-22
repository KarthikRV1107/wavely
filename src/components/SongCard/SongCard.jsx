// src/components/SongCard/SongCard.jsx
import { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth }   from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';
import { addLikedSong, removeLikedSong } from '../../services/firestore';

const PlayIcon  = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/></svg>;
const PauseIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>;
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24"
       fill={filled ? '#1db954' : 'none'}
       stroke={filled ? '#1db954' : 'currentColor'} strokeWidth="1.5">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>
  </svg>
);
const AddIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-3.25a.75.75 0 0 1 .75.75v1.75h1.75a.75.75 0 0 1 0 1.5H8.75V10.5a.75.75 0 0 1-1.5 0V8.75H5.5a.75.75 0 0 1 0-1.5h1.75V5.5A.75.75 0 0 1 8 4.75z"/>
  </svg>
);

const SongCard = ({ song, queue=[], queueIndex=0, isLiked=false, onAddToPlaylist, showIndex=false, index }) => {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const { user } = useAuth();
  const [liked,       setLiked]       = useState(isLiked);
  const [likeLoading, setLikeLoading] = useState(false);
  const [hovered,     setHovered]     = useState(false);

  const isActive  = currentSong?.videoId === song.videoId;
  const isPlayingThis = isActive && isPlaying;

  const handlePlay = () => {
    if (isActive) togglePlay();
    else playSong(song, queue.length > 0 ? queue : [song], queueIndex);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user || likeLoading) return;
    setLikeLoading(true);
    try {
      if (liked) { await removeLikedSong(user.uid, song.videoId); setLiked(false); }
      else       { await addLikedSong(user.uid, song);             setLiked(true);  }
    } catch (err) { console.error(err); }
    finally { setLikeLoading(false); }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handlePlay}
      style={{
        display: 'grid',
        gridTemplateColumns: '16px 40px 1fr auto auto',
        alignItems: 'center',
        gap: 16,
        padding: '6px 16px',
        borderRadius: 4,
        cursor: 'pointer',
        background: hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
        transition: 'background 0.1s',
        userSelect: 'none',
      }}
    >
      {/* Index / Play icon */}
      <div style={{ width:16, textAlign:'center', flexShrink:0 }}>
        {hovered || isActive ? (
          <span style={{ color: isActive ? '#1db954' : '#fff' }}>
            {isPlayingThis ? <PauseIcon /> : <PlayIcon />}
          </span>
        ) : (
          <span style={{ fontSize:14, color: isActive ? '#1db954' : '#b3b3b3' }}>
            {typeof index === 'number' ? index + 1 : queueIndex + 1}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <img src={song.thumbnailUrl} alt={song.title}
           style={{ width:40, height:40, borderRadius:2, objectFit:'cover' }}
           onError={e => { e.target.style.background='#333'; e.target.src=''; }} />

      {/* Title + channel */}
      <div style={{ minWidth:0 }}>
        <p style={{
          fontSize:14, margin:0, fontWeight:400,
          color: isActive ? '#1db954' : '#fff',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>{song.title}</p>
        <p style={{
          fontSize:12, margin:'2px 0 0', color:'#b3b3b3',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>{song.channelName}</p>
      </div>

      {/* Heart + add */}
      <div style={{
        display:'flex', gap:8, alignItems:'center',
        opacity: hovered || liked ? 1 : 0,
        transition:'opacity 0.1s',
      }} onClick={e => e.stopPropagation()}>
        <button onClick={handleLike} disabled={likeLoading} style={{
          background:'none', border:'none', cursor:'pointer',
          color: liked ? '#1db954' : '#b3b3b3', padding:4,
          display:'flex', alignItems:'center',
        }}>
          <HeartIcon filled={liked} />
        </button>
        {onAddToPlaylist && (
          <button onClick={e => { e.stopPropagation(); onAddToPlaylist(song); }} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'#b3b3b3', padding:4, display:'flex', alignItems:'center',
          }}>
            <AddIcon />
          </button>
        )}
      </div>

      {/* Duration */}
      <span style={{ fontSize:13, color:'#b3b3b3', flexShrink:0, minWidth:40, textAlign:'right' }}>
        {formatTime(song.durationSeconds)}
      </span>
    </div>
  );
};

export default SongCard;
