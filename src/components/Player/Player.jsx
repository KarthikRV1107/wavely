// src/components/Player/Player.jsx
import { usePlayer }         from '../../context/PlayerContext';
import { useYouTubePlayer }  from '../../hooks/usePlayer';
import SeekBar               from './SeekBar';
import PlayerControls        from './PlayerControls';
import VolumeControl         from './VolumeControl';

const Player = () => {
  const { currentSong, isPlaying, currentTime, togglePlay, nextSong, prevSong } = usePlayer();
  const { containerRef, seekTo } = useYouTubePlayer();

  const hiddenContainer = (
    <div
      ref={containerRef}
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );

  if (!currentSong) return hiddenContainer;

  return (
    <>
      {hiddenContainer}
      <div style={{
        position: 'sticky', bottom: 0,
        background: '#ffffff',
        borderTop: '1px solid #e5e5e5',
        padding: '10px 16px 14px',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <img
            src={currentSong.thumbnailUrl}
            alt={currentSong.title}
            style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
              {currentSong.title}
            </p>
            <p style={{ fontSize: 11, color: '#999', margin: 0 }}>{currentSong.channelName}</p>
          </div>
          <VolumeControl />
        </div>
        <PlayerControls isPlaying={isPlaying} onPlay={togglePlay} onPrev={prevSong} onNext={nextSong} />
        <div style={{ marginTop: 8 }}>
          <SeekBar currentTime={currentTime} duration={currentSong.durationSeconds} onSeek={seekTo} />
        </div>
      </div>
    </>
  );
};

export default Player;
