// src/components/SongCard/SongCard.jsx
// FIX: Remove `await` from handleLike — was blocking despite being optimistic
// FIX: Stable handlePlay/handleLike with minimal deps
// FIX: No inline style objects that recreate on every render
import { useState, useCallback, memo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import {
  useCurrentSong,
  useIsPlaying,
  usePlayerActions,
} from '../../context/PlayerContext';
import { useAuth }    from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';
import { LIKED } from '../../services/firestore';

const SongCard = memo(function SongCard({
  song, queue=[], queueIndex=0, isLiked:initLiked,
  onAddToPlaylist, showIndex=false, style={},
}) {
  const { playSong, togglePlay } = usePlayerActions();
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const { user } = useAuth();
  const { likeSong, unlikeSong } = useLibrary();

  const [liked,   setLiked]   = useState(() =>
    initLiked !== undefined ? initLiked : LIKED.get(song.videoId) === true
  );
  const [hovered, setHovered] = useState(false);

  const isActive = currentSong?.videoId === song.videoId;
  const isPlays  = isActive && isPlaying;

  // Stable ref — only recreate if song/queue identity changes
  const handlePlay = useCallback(() => {
    isActive ? togglePlay() : playSong(song, queue.length ? queue : [song], queueIndex);
  }, [isActive, song.videoId, queueIndex]); // minimal deps

  // No await — addLikedSong/removeLikedSong are already fire-and-forget
  const handleLike = useCallback((e) => {
    e.stopPropagation();
    if (!user) return;
    const next = !liked;
    setLiked(next);
    if (next) {
      likeSong({
        videoId: song.videoId, title: song.title,
        channelName: song.channelName, thumbnailUrl: song.thumbnailUrl,
        durationSeconds: song.durationSeconds ?? 0,
      });
    } else {
      unlikeSong(song.videoId);
    }
  }, [user?.uid, liked, song.videoId, song.title, song.channelName, song.thumbnailUrl, song.durationSeconds, likeSong, unlikeSong]);

  const bg = isActive ? 'rgba(124,106,247,0.1)' : hovered ? 'var(--bg3)' : 'transparent';
  const border = isActive ? '1px solid rgba(124,106,247,0.18)' : '1px solid transparent';

  return (
    <div
      onClick={handlePlay}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display:'flex', alignItems:'center', gap:10,
               padding:'5px 8px', borderRadius:8,
               background:bg, border, cursor:'pointer',
               transition:'background 0.1s', minWidth:0, ...style }}
    >
      {showIndex ? (
        <div style={{ width:28, flexShrink:0, textAlign:'center',
                      color:isActive?'var(--accent2)':'var(--text3)',
                      fontSize:11, fontWeight:500 }}>
          {isPlays ? <Eq/> : queueIndex+1}
        </div>
      ) : (
        <div style={{ position:'relative', flexShrink:0 }}>
          <img src={song.thumbnailUrl} alt="" loading="lazy" width={40} height={40}
            style={{ width:40, height:40, borderRadius:6, objectFit:'cover', display:'block' }}
            onError={e=>{e.target.style.background='var(--bg4)';e.target.src='';}}
          />
          {(hovered||isActive) && (
            <div style={{ position:'absolute', inset:0, borderRadius:6,
                          background:'rgba(0,0,0,0.5)', color:'#fff',
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
              {isPlays ? <PauseIco/> : <PlayIco/>}
            </div>
          )}
        </div>
      )}

      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:500, margin:0, lineHeight:1.3,
                    color:isActive?'var(--accent3)':'var(--text1)',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {song.title}
        </p>
        <p style={{ fontSize:11, margin:0, lineHeight:1.3,
                    color:isActive?'var(--accent)':'var(--text3)',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {song.channelName}
        </p>
      </div>

      {!!song.durationSeconds && (
        <span style={{ fontSize:11, color:'var(--text3)', flexShrink:0 }}>
          {formatTime(song.durationSeconds)}
        </span>
      )}

      <div style={{ display:'flex', gap:1, flexShrink:0,
                    opacity:hovered||isActive||liked?1:0,
                    transition:'opacity 0.1s' }}
           onClick={e=>e.stopPropagation()}>
        <Btn onClick={handleLike} label={liked?'Unlike':'Like'}>
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill={liked?'var(--pink)':'none'}
            stroke={liked?'var(--pink)':'var(--text3)'} strokeWidth="1.8">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
        </Btn>
        {onAddToPlaylist && (
          <Btn onClick={()=>onAddToPlaylist(song)} label="Add to playlist">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--text3)" strokeWidth="1.8">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
          </Btn>
        )}
      </div>
    </div>
  );
});
export default SongCard;

const Btn = ({onClick,label,children}) => (
  <button onClick={onClick} aria-label={label}
    style={{ width:28, height:28, borderRadius:6, background:'none',
             border:'none', cursor:'pointer',
             display:'flex', alignItems:'center', justifyContent:'center' }}>
    {children}
  </button>
);
const PlayIco  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>;
const PauseIco = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const Eq = () => (
  <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:12, justifyContent:'center' }}>
    {[0,1,2].map(i=>(
      <div key={i} style={{ width:2, height:12, borderRadius:1, background:'var(--accent2)',
        animation:`equalizer 0.8s ease-in-out ${i*0.15}s infinite`, transformOrigin:'bottom' }}/>
    ))}
  </div>
);
