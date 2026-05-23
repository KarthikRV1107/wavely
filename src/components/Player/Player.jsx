// src/components/Player/Player.jsx
import { usePlayer }        from '../../context/PlayerContext';
import { useYouTubePlayer } from '../../hooks/usePlayer';
import SeekBar              from './SeekBar';
import PlayerControls       from './PlayerControls';
import VolumeControl        from './VolumeControl';

const Player = () => {
  const { currentSong, isPlaying, currentTime, togglePlay, nextSong, prevSong } = usePlayer();
  const { containerRef, seekTo } = useYouTubePlayer();

  const hidden = (
    <div ref={containerRef}
         style={{ position:'absolute', width:0, height:0, overflow:'hidden', pointerEvents:'none' }}
         aria-hidden="true" />
  );

  if (!currentSong) return (
    <div style={{ height: 90, background: '#181818', borderTop: '1px solid #282828' }}>
      {hidden}
    </div>
  );

  return (
    <div style={{
      height: 90, background: '#181818',
      borderTop: '1px solid #282828',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      alignItems: 'center',
      padding: '0 16px',
      flexShrink: 0,
      zIndex: 100,
    }}>
      {hidden}

      {/* Left — song info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <img src={currentSong.thumbnailUrl} alt={currentSong.title}
             style={{ width: 56, height: 56, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
             onError={e => e.target.style.display = 'none'} />
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: 400, color: '#fff', margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{currentSong.title}</p>
          <p style={{
            fontSize: 11, color: '#b3b3b3', margin: '2px 0 0',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{currentSong.channelName}</p>
        </div>
        {/* Heart */}
        <button style={{ background:'none', border:'none', cursor:'pointer',
                         color:'#b3b3b3', padding:8, flexShrink:0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.5">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0
                     0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
        </button>
      </div>

      {/* Center — controls + seekbar */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
        <PlayerControls isPlaying={isPlaying} onPlay={togglePlay} onPrev={prevSong} onNext={nextSong} />
        <SeekBar currentTime={currentTime} duration={currentSong.durationSeconds} onSeek={seekTo} />
      </div>

      {/* Right — volume */}
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <VolumeControl />
      </div>
    </div>
  );
};

export default Player;
