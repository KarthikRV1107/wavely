// src/components/Player/Player.jsx
import { useState } from 'react';
import { usePlayer }        from '../../context/PlayerContext';
import { useYouTubePlayer } from '../../hooks/usePlayer';
import { formatTime }       from '../../utils/formatTime';

export default function Player() {
  const {
    currentSong, isPlaying, currentTime,
    togglePlay, nextSong, prevSong, volume, setVolume, queue, queueIndex,
  } = usePlayer();
  const { containerRef, seekTo } = useYouTubePlayer();
  const [expanded, setExpanded] = useState(false);

  const hidden = (
    <div ref={containerRef} style={{ position:'absolute', width:0, height:0, overflow:'hidden', pointerEvents:'none' }} aria-hidden />
  );

  if (!currentSong) return hidden;

  const progress = currentSong.durationSeconds > 0
    ? (currentTime / currentSong.durationSeconds) * 100 : 0;

  const hasPrev = queueIndex > 0;
  const hasNext = queueIndex < queue.length - 1;

  return (
    <>
      {hidden}
      <div style={{
        position: 'fixed', bottom: 'var(--nav-h)', left: 0, right: 0,
        zIndex: 80, padding: '0 12px 8px',
      }}>
        <div style={{
          background: 'rgba(18,18,26,0.96)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: 20,
          border: '1px solid var(--border2)',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          transition: 'all 0.3s var(--ease-out)',
        }}>
          {/* Progress bar — thin line at top */}
          <div style={{ height: 2, background: 'var(--bg4)', cursor: 'pointer', position: 'relative' }}
            onClick={e => {
              const r = e.currentTarget.getBoundingClientRect();
              seekTo(Math.floor(((e.clientX - r.left) / r.width) * currentSong.durationSeconds));
            }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--pink))',
              transition: 'width 0.8s linear',
            }}/>
          </div>

          {/* Main row */}
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px 12px' }}>
            {/* Thumbnail */}
            <div style={{ position:'relative', flexShrink:0 }} onClick={() => setExpanded(e => !e)}>
              <img src={currentSong.thumbnailUrl} alt={currentSong.title}
                style={{
                  width: 46, height: 46, borderRadius: 12,
                  objectFit: 'cover', cursor: 'pointer',
                  boxShadow: isPlaying ? '0 0 16px rgba(124,106,247,0.4)' : 'none',
                  transition: 'box-shadow 0.3s',
                  animation: isPlaying ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                }}/>
            </div>

            {/* Song info */}
            <div style={{ flex:1, minWidth:0, cursor:'pointer' }} onClick={() => setExpanded(e => !e)}>
              <p style={{
                fontSize: 14, fontWeight: 600, margin: 0,
                color: 'var(--text1)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{currentSong.title}</p>
              <p style={{ fontSize: 12, margin:'1px 0 0', color:'var(--text3)',
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {currentSong.channelName}
              </p>
            </div>

            {/* Controls */}
            <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
              <CtrlBtn onClick={prevSong} disabled={!hasPrev} size={32}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="2" height="16"/>
                </svg>
              </CtrlBtn>
              <CtrlBtn onClick={togglePlay} size={44} primary>
                {isPlaying
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{marginLeft:2}}><polygon points="5,3 19,12 5,21"/></svg>
                }
              </CtrlBtn>
              <CtrlBtn onClick={nextSong} disabled={!hasNext} size={32}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,4 15,12 5,20"/><rect x="17" y="4" width="2" height="16"/>
                </svg>
              </CtrlBtn>
            </div>
          </div>

          {/* Time stamps */}
          <div style={{
            display:'flex', justifyContent:'space-between',
            padding: '0 14px 8px', fontSize: 10, color: 'var(--text3)',
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentSong.durationSeconds)}</span>
          </div>
        </div>
      </div>
    </>
  );
}

const CtrlBtn = ({ onClick, children, disabled, size=36, primary }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: size, height: size, borderRadius: '50%',
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: primary ? 'linear-gradient(135deg, var(--accent), #5b4fcf)' : 'transparent',
    color: disabled ? 'var(--text3)' : 'var(--text1)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    boxShadow: primary ? '0 4px 16px rgba(124,106,247,0.35)' : 'none',
    flexShrink: 0,
  }}
    onMouseEnter={e => !primary && !disabled && (e.currentTarget.style.background = 'var(--bg4)')}
    onMouseLeave={e => !primary && (e.currentTarget.style.background = 'transparent')}
  >{children}</button>
);
