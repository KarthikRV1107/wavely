// src/components/SongCard/SongCard.jsx — fixed like button + optimistic UI
import { useState, useCallback } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth }   from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';
import { addLikedSong, removeLikedSong } from '../../services/firestore';

export default function SongCard({
  song, queue=[], queueIndex=0,
  isLiked:initLiked=false,
  onAddToPlaylist, showIndex=false, style={},
}) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const { user } = useAuth();
  const [liked,   setLiked]   = useState(initLiked);
  const [liking,  setLiking]  = useState(false);
  const [hovered, setHovered] = useState(false);

  const isActive = currentSong?.videoId === song.videoId;
  const isPlays  = isActive && isPlaying;

  const handlePlay = useCallback(() => {
    if (isActive) togglePlay();
    else playSong(song, queue.length ? queue : [song], queueIndex);
  }, [isActive, song, queue, queueIndex]);

  // Optimistic like — update UI immediately, then sync to Firestore
  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
    if (!user) return;
    if (liking) return;

    const prev = liked;
    setLiked(!prev);   // optimistic
    setLiking(true);

    try {
      if (prev) {
        await removeLikedSong(user.uid, song.videoId);
      } else {
        await addLikedSong(user.uid, {
          videoId:         song.videoId,
          title:           song.title,
          channelName:     song.channelName,
          thumbnailUrl:    song.thumbnailUrl,
          durationSeconds: song.durationSeconds ?? 0,
        });
      }
    } catch (err) {
      console.error('Like failed:', err);
      setLiked(prev); // revert on error
    } finally {
      setLiking(false);
    }
  }, [user, liked, liking, song]);

  const handleAddPlaylist = useCallback((e) => {
    e.stopPropagation();
    onAddToPlaylist?.(song);
  }, [song, onAddToPlaylist]);

  return (
    <div
      onClick={handlePlay}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:'flex', alignItems:'center', gap:12,
        padding:'10px 12px', borderRadius:12,
        background: isActive ? 'rgba(124,106,247,0.12)' : hovered ? 'var(--bg3)' : 'transparent',
        border:`1px solid ${isActive ? 'rgba(124,106,247,0.25)' : 'transparent'}`,
        cursor:'pointer', transition:'background 0.15s, border-color 0.15s',
        animation:'fadeUp 0.3s var(--ease-out) both',
        ...style,
      }}
    >
      {/* Thumbnail / index number */}
      <div style={{ flexShrink:0, position:'relative' }}>
        {showIndex ? (
          <div style={{
            width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center',
            color: isActive ? 'var(--accent2)' : 'var(--text3)',
            fontSize:13, fontWeight:500,
          }}>
            {isPlays ? <Equalizer/> : queueIndex + 1}
          </div>
        ) : (
          <>
            <img src={song.thumbnailUrl} alt={song.title}
              style={{
                width:48, height:48, borderRadius:10,
                objectFit:'cover', display:'block',
                filter: isActive ? 'brightness(0.8)' : 'none',
                transition:'filter 0.2s',
              }}
              onError={e => { e.target.style.background='var(--bg4)'; e.target.src=''; }}
            />
            <div style={{
              position:'absolute', inset:0, borderRadius:10,
              background:'rgba(0,0,0,0.45)',
              display:'flex', alignItems:'center', justifyContent:'center',
              opacity: hovered || isActive ? 1 : 0,
              transition:'opacity 0.15s', color:'#fff',
            }}>
              {isPlays ? <PauseIcon/> : <PlayIcon/>}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{
          fontSize:14, fontWeight:500, margin:0,
          color: isActive ? 'var(--accent3)' : 'var(--text1)',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          transition:'color 0.15s',
        }}>{song.title}</p>
        <p style={{
          fontSize:12, margin:'2px 0 0',
          color: isActive ? 'var(--accent)' : 'var(--text3)',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>{song.channelName}</p>
      </div>

      {/* Duration */}
      <span style={{ fontSize:12, color:'var(--text3)', flexShrink:0, marginRight:2 }}>
        {song.durationSeconds ? formatTime(song.durationSeconds) : ''}
      </span>

      {/* Actions */}
      <div style={{
        display:'flex', gap:2, flexShrink:0,
        opacity: hovered || isActive || liked ? 1 : 0,
        transition:'opacity 0.15s',
      }}>
        {/* Heart button — always accessible via keyboard too */}
        <button
          onClick={handleLike}
          aria-label={liked ? 'Unlike' : 'Like'}
          aria-pressed={liked}
          disabled={liking}
          style={{
            width:32, height:32, borderRadius:8,
            background:'none', border:'none',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor: liking ? 'wait' : 'pointer',
            transition:'transform 0.15s',
            transform: liking ? 'scale(0.85)' : 'scale(1)',
          }}
          onMouseEnter={e => e.currentTarget.style.background='var(--bg4)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={liked ? 'var(--pink)' : 'none'}
            stroke={liked ? 'var(--pink)' : 'var(--text2)'}
            strokeWidth="1.8"
            style={{ transition:'fill 0.2s, stroke 0.2s' }}>
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
        </button>

        {onAddToPlaylist && (
          <button
            onClick={handleAddPlaylist}
            aria-label="Add to playlist"
            style={{
              width:32, height:32, borderRadius:8,
              background:'none', border:'none',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background='var(--bg4)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="var(--text2)" strokeWidth="1.8">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

const PlayIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>;
const PauseIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const Equalizer = () => (
  <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:16 }}>
    {[1,2,3].map(i => (
      <div key={i} style={{
        width:3, height:16, borderRadius:2, background:'var(--accent2)',
        animation:`equalizer 0.8s ease-in-out infinite`,
        animationDelay:`${i*0.15}s`, transformOrigin:'bottom',
      }}/>
    ))}
  </div>
);
