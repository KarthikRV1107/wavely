// src/components/SongCard/SongCard.jsx
import { useState, useCallback } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth }   from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';
import { addLikedSong, removeLikedSong, isLiked } from '../../services/firestore';

export default function SongCard({
  song, queue=[], queueIndex=0,
  isLiked: initLiked,       // optional override
  onAddToPlaylist, showIndex=false, style={},
}) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const { user } = useAuth();

  // Use sync isLiked() from memory map — instant, no Firestore read
  const [liked,   setLiked]   = useState(() => initLiked ?? isLiked(song.videoId));
  const [liking,  setLiking]  = useState(false);
  const [hovered, setHovered] = useState(false);

  const isActive = currentSong?.videoId === song.videoId;
  const isPlays  = isActive && isPlaying;

  const handlePlay = useCallback(() => {
    if (isActive) togglePlay();
    else playSong(song, queue.length ? queue : [song], queueIndex);
  }, [isActive, song, queue, queueIndex, togglePlay, playSong]);

  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
    if (!user || liking) return;
    const prev = liked;
    setLiked(!prev);        // optimistic
    setLiking(true);
    try {
      if (prev) await removeLikedSong(user.uid, song.videoId);
      else      await addLikedSong(user.uid, {
        videoId: song.videoId, title: song.title,
        channelName: song.channelName, thumbnailUrl: song.thumbnailUrl,
        durationSeconds: song.durationSeconds ?? 0,
      });
    } catch (err) {
      console.error('Like error:', err);
      setLiked(prev);       // revert on error
    } finally { setLiking(false); }
  }, [user, liked, liking, song]);

  return (
    <div
      onClick={handlePlay}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 12px', borderRadius: 10,
        background: isActive
          ? 'rgba(124,106,247,0.12)'
          : hovered ? 'var(--bg3)' : 'transparent',
        border: `1px solid ${isActive ? 'rgba(124,106,247,0.25)' : 'transparent'}`,
        cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s',
        animation: 'fadeUp 0.25s var(--ease-out) both',
        ...style,
      }}
    >
      {/* Thumbnail / index */}
      <div style={{ flexShrink: 0, position: 'relative' }}>
        {showIndex ? (
          <div style={{
            width: 34, height: 34, display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            color: isActive ? 'var(--accent2)' : 'var(--text3)',
            fontSize: 13, fontWeight: 500,
          }}>
            {isPlays ? <Eq/> : queueIndex + 1}
          </div>
        ) : (
          <>
            <img src={song.thumbnailUrl} alt={song.title} style={{
              width: 46, height: 46, borderRadius: 8, objectFit: 'cover', display: 'block',
            }} onError={e => { e.target.style.background='var(--bg4)'; e.target.src=''; }}/>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 8,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hovered || isActive ? 1 : 0, transition: 'opacity 0.12s', color: '#fff',
            }}>
              {isPlays ? <PauseIco/> : <PlayIco/>}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: 500, margin: 0,
          color: isActive ? 'var(--accent3)' : 'var(--text1)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{song.title}</p>
        <p style={{
          fontSize: 11, margin: '1px 0 0',
          color: isActive ? 'var(--accent)' : 'var(--text3)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{song.channelName}</p>
      </div>

      {/* Duration */}
      {song.durationSeconds > 0 && (
        <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0, marginRight: 2 }}>
          {formatTime(song.durationSeconds)}
        </span>
      )}

      {/* Like + add buttons */}
      <div style={{
        display: 'flex', gap: 2, flexShrink: 0,
        opacity: hovered || isActive || liked ? 1 : 0,
        transition: 'opacity 0.12s',
      }} onClick={e => e.stopPropagation()}>
        <IcoBtn onClick={handleLike} label={liked ? 'Unlike' : 'Like'}>
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill={liked ? 'var(--pink)' : 'none'}
            stroke={liked ? 'var(--pink)' : 'var(--text2)'} strokeWidth="1.8"
            style={{ transition: 'fill 0.15s, stroke 0.15s' }}>
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
        </IcoBtn>
        {onAddToPlaylist && (
          <IcoBtn onClick={() => onAddToPlaylist(song)} label="Add to playlist">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="var(--text2)" strokeWidth="1.8">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
          </IcoBtn>
        )}
      </div>
    </div>
  );
}

const IcoBtn = ({ onClick, label, children }) => (
  <button onClick={onClick} aria-label={label} style={{
    width: 30, height: 30, borderRadius: 6,
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.12s',
  }}
    onMouseEnter={e => e.currentTarget.style.background='var(--bg4)'}
    onMouseLeave={e => e.currentTarget.style.background='none'}
  >{children}</button>
);

const PlayIco  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>;
const PauseIco = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const Eq = () => (
  <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:14 }}>
    {[1,2,3].map(i=>(
      <div key={i} style={{ width:3, height:14, borderRadius:2, background:'var(--accent2)',
        animation:`equalizer 0.8s ease-in-out infinite`, animationDelay:`${i*0.15}s`,
        transformOrigin:'bottom' }}/>
    ))}
  </div>
);
